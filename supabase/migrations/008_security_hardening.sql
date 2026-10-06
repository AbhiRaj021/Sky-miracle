-- =============================================================================
-- 008: Security hardening
--
-- Fixes:
--   * Privilege escalation at signup: the role was read from user-controlled
--     raw_user_meta_data, so anyone could sign up as 'admin'.
--   * Self-promotion: users could UPDATE their own profiles.role.
--   * Race in "first user becomes admin" (two concurrent signups).
--   * SECURITY DEFINER functions without a fixed search_path.
--   * Editors could overwrite any object in the documents bucket, and could
--     point file/version rows at objects they did not upload.
--   * Uploaders could not read their own files from storage.
--   * Missing updated_at maintenance and missing indexes used by RLS.
--
-- All writes to files / file_versions now go through the functions in
-- 009_file_functions.sql; clients get no direct INSERT/UPDATE on those tables.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Private schema for helper functions (not exposed through the Data API)
-- -----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(private.current_user_role() = 'admin', false)
$$;

-- Owner (uploader) of a file, or an admin. Owners manage sharing for their files.
CREATE OR REPLACE FUNCTION private.can_manage_file(p_file_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT private.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.files f
      WHERE f.id = p_file_id AND f.uploaded_by = auth.uid()
    )
$$;

CREATE OR REPLACE FUNCTION private.can_view_file(p_file_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT private.can_manage_file(p_file_id)
    OR EXISTS (
      SELECT 1 FROM public.file_permissions fp
      WHERE fp.file_id = p_file_id AND fp.user_id = auth.uid()
    )
$$;

-- Role is a ceiling: viewers can never edit, even with an 'edit' grant.
CREATE OR REPLACE FUNCTION private.can_edit_file(p_file_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT private.is_admin()
    OR (
      private.current_user_role() = 'editor'
      AND (
        EXISTS (
          SELECT 1 FROM public.files f
          WHERE f.id = p_file_id AND f.uploaded_by = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.file_permissions fp
          WHERE fp.file_id = p_file_id AND fp.user_id = auth.uid() AND fp.permission = 'edit'
        )
      )
    )
$$;

-- True when a storage path is referenced by any file version (bypasses RLS).
CREATE OR REPLACE FUNCTION private.is_registered_path(p_path TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.file_versions v WHERE v.storage_path = p_path)
$$;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA private FROM PUBLIC, anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA private TO authenticated;

-- -----------------------------------------------------------------------------
-- Signup trigger: never trust client metadata for the role
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  assigned_role TEXT := 'viewer';
BEGIN
  -- Serialize signups so two concurrent first users can't both become admin.
  PERFORM pg_advisory_xact_lock(hashtext('public.handle_new_user'));

  IF NOT EXISTS (SELECT 1 FROM public.profiles) THEN
    assigned_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''), split_part(NEW.email, '@', 1)),
    assigned_role
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Profile guard: only admins change roles/emails; never remove the last admin
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.guard_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Requests without a user (service role, SQL editor, migrations) are trusted.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Profile id and created_at cannot be changed' USING ERRCODE = '42501';
  END IF;

  IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.email IS DISTINCT FROM OLD.email)
     AND NOT private.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change roles or emails' USING ERRCODE = '42501';
  END IF;

  IF OLD.role = 'admin' AND NEW.role <> 'admin' AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE role = 'admin' AND id <> OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot remove the last admin' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_update ON public.profiles;
CREATE TRIGGER guard_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.guard_profile_update();

-- -----------------------------------------------------------------------------
-- updated_at maintenance
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

DROP TRIGGER IF EXISTS set_files_updated_at ON public.files;
CREATE TRIGGER set_files_updated_at
  BEFORE UPDATE ON public.files
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

-- -----------------------------------------------------------------------------
-- Indexes for foreign keys used by RLS and listings
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON public.files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_created ON public.files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_permissions_user ON public.file_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_storage_path ON public.file_versions(storage_path);

-- -----------------------------------------------------------------------------
-- Table RLS policies (replace everything from 006)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow read profiles to authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Allow update own profile or if admin" ON public.profiles;
DROP POLICY IF EXISTS "Allow select files for admin or if permitted" ON public.files;
DROP POLICY IF EXISTS "Allow insert files for admin and editor" ON public.files;
DROP POLICY IF EXISTS "Allow update files for admin or editor with permission" ON public.files;
DROP POLICY IF EXISTS "Allow delete files for admin only" ON public.files;
DROP POLICY IF EXISTS "Allow select file_versions if user can select parent file" ON public.file_versions;
DROP POLICY IF EXISTS "Allow insert file_versions if admin or editor with permission" ON public.file_versions;
DROP POLICY IF EXISTS "Allow select file_permissions for admin or own permissions" ON public.file_permissions;
DROP POLICY IF EXISTS "Allow all modifications on file_permissions for admin only" ON public.file_permissions;
DROP POLICY IF EXISTS "Allow select activity_logs for admin or own logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow insert activity_logs to authenticated users" ON public.activity_logs;

-- profiles
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- Column-level rules (role/email) are enforced by guard_profile_update.
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()) OR (SELECT private.is_admin()))
  WITH CHECK (id = (SELECT auth.uid()) OR (SELECT private.is_admin()));

-- files: read if permitted; delete admin only; writes go through functions
CREATE POLICY "files_select_permitted" ON public.files
  FOR SELECT TO authenticated
  USING (private.can_view_file(id));

CREATE POLICY "files_delete_admin" ON public.files
  FOR DELETE TO authenticated
  USING ((SELECT private.is_admin()));

-- file_versions: read if the parent file is readable
CREATE POLICY "file_versions_select_permitted" ON public.file_versions
  FOR SELECT TO authenticated
  USING (private.can_view_file(file_id));

-- file_permissions: admins and file owners manage; users see their own grants
CREATE POLICY "file_permissions_select" ON public.file_permissions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR private.can_manage_file(file_id));

CREATE POLICY "file_permissions_insert" ON public.file_permissions
  FOR INSERT TO authenticated
  WITH CHECK (private.can_manage_file(file_id) AND granted_by = (SELECT auth.uid()));

CREATE POLICY "file_permissions_update" ON public.file_permissions
  FOR UPDATE TO authenticated
  USING (private.can_manage_file(file_id))
  WITH CHECK (private.can_manage_file(file_id) AND granted_by = (SELECT auth.uid()));

CREATE POLICY "file_permissions_delete" ON public.file_permissions
  FOR DELETE TO authenticated
  USING (private.can_manage_file(file_id));

-- activity_logs: admins see all, users see their own and logs of files they own
CREATE POLICY "activity_logs_select" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (
    (SELECT private.is_admin())
    OR user_id = (SELECT auth.uid())
    OR (file_id IS NOT NULL AND private.can_manage_file(file_id))
  );

CREATE POLICY "activity_logs_insert_own" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- -----------------------------------------------------------------------------
-- Storage: bucket limits and object policies (replace everything from 007)
-- -----------------------------------------------------------------------------
UPDATE storage.buckets
SET
  file_size_limit = 26214400, -- 25 MB
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
WHERE id = 'documents';

DROP POLICY IF EXISTS "Admin full access" ON storage.objects;
DROP POLICY IF EXISTS "Users can read permitted files" ON storage.objects;
DROP POLICY IF EXISTS "Editors/Admins can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Editors/Admins can update files" ON storage.objects;

CREATE POLICY "documents_admin_all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'documents' AND (SELECT private.is_admin()))
  WITH CHECK (bucket_id = 'documents' AND (SELECT private.is_admin()));

-- Objects live under "<uploader uuid>/...". Uploaders can read their own objects.
CREATE POLICY "documents_select_own_folder" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Anyone who can see a version row (RLS on file_versions) can read its object.
CREATE POLICY "documents_select_permitted" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (SELECT 1 FROM public.file_versions v WHERE v.storage_path = objects.name)
  );

-- Admins and editors upload into their own folder only. No UPDATE policy:
-- versions are always new objects, so existing objects can't be overwritten.
CREATE POLICY "documents_insert_own_folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND (SELECT private.current_user_role()) IN ('admin', 'editor')
  );

-- Uploaders may delete their own objects that were never registered
-- (cleanup after a failed registration).
CREATE POLICY "documents_delete_own_unregistered" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND NOT private.is_registered_path(name)
  );
