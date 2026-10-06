-- =============================================================================
-- 009: File write functions
--
-- Clients upload the object to storage first (into "<their uuid>/..."), then
-- call one of these functions to register it. Each function checks
-- permissions, writes the file/version rows and the activity log in a single
-- transaction, and refuses storage paths outside the caller's own folder so a
-- row can never point at someone else's object.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_file(
  p_file_name TEXT,
  p_file_type TEXT,
  p_file_size BIGINT,
  p_storage_path TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_file_id UUID;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  IF private.current_user_role() NOT IN ('admin', 'editor') THEN
    RAISE EXCEPTION 'Only admins and editors can upload files' USING ERRCODE = '42501';
  END IF;

  IF p_file_type NOT IN ('pdf', 'docx', 'xlsx') THEN
    RAISE EXCEPTION 'Unsupported file type' USING ERRCODE = '22023';
  END IF;

  IF p_storage_path NOT LIKE v_uid::text || '/%' OR p_storage_path LIKE '%..%' THEN
    RAISE EXCEPTION 'Invalid storage path' USING ERRCODE = '42501';
  END IF;

  IF private.is_registered_path(p_storage_path) THEN
    RAISE EXCEPTION 'Storage path already registered' USING ERRCODE = '23505';
  END IF;

  IF LENGTH(TRIM(COALESCE(p_file_name, ''))) = 0 OR LENGTH(p_file_name) > 255 THEN
    RAISE EXCEPTION 'Invalid file name' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.files (file_name, file_type, file_size, storage_path, uploaded_by, current_version)
  VALUES (TRIM(p_file_name), p_file_type, p_file_size, p_storage_path, v_uid, 1)
  RETURNING id INTO v_file_id;

  INSERT INTO public.file_versions (file_id, version_number, storage_path, file_size, saved_by, change_summary)
  VALUES (v_file_id, 1, p_storage_path, p_file_size, v_uid, 'Initial upload');

  INSERT INTO public.activity_logs (user_id, file_id, action, details)
  VALUES (v_uid, v_file_id, 'upload', jsonb_build_object('file_name', TRIM(p_file_name), 'file_size', p_file_size));

  RETURN v_file_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_file_version(
  p_file_id UUID,
  p_storage_path TEXT,
  p_file_size BIGINT,
  p_change_summary TEXT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_file public.files%ROWTYPE;
  v_next INT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  IF NOT private.can_edit_file(p_file_id) THEN
    RAISE EXCEPTION 'You do not have permission to edit this file' USING ERRCODE = '42501';
  END IF;

  IF p_storage_path NOT LIKE v_uid::text || '/%' OR p_storage_path LIKE '%..%' THEN
    RAISE EXCEPTION 'Invalid storage path' USING ERRCODE = '42501';
  END IF;

  IF private.is_registered_path(p_storage_path) THEN
    RAISE EXCEPTION 'Storage path already registered' USING ERRCODE = '23505';
  END IF;

  -- Lock the file row so concurrent saves get sequential version numbers.
  SELECT * INTO v_file FROM public.files WHERE id = p_file_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'File not found' USING ERRCODE = 'P0002';
  END IF;

  v_next := COALESCE(v_file.current_version, 0) + 1;

  INSERT INTO public.file_versions (file_id, version_number, storage_path, file_size, saved_by, change_summary)
  VALUES (p_file_id, v_next, p_storage_path, p_file_size, v_uid, NULLIF(LEFT(TRIM(COALESCE(p_change_summary, '')), 500), ''));

  UPDATE public.files
  SET current_version = v_next, storage_path = p_storage_path, file_size = p_file_size
  WHERE id = p_file_id;

  INSERT INTO public.activity_logs (user_id, file_id, action, details)
  VALUES (v_uid, p_file_id, 'new_version', jsonb_build_object('version', v_next, 'file_name', v_file.file_name));

  RETURN v_next;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_file(TEXT, TEXT, BIGINT, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.add_file_version(UUID, TEXT, BIGINT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_file(TEXT, TEXT, BIGINT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_file_version(UUID, TEXT, BIGINT, TEXT) TO authenticated;
