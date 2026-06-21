-- profiles policies
CREATE POLICY "Allow read profiles to authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow update own profile or if admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- files policies
CREATE POLICY "Allow select files for admin or if permitted" ON public.files
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR uploaded_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.file_permissions WHERE file_id = files.id AND user_id = auth.uid())
  );

CREATE POLICY "Allow insert files for admin and editor" ON public.files
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Allow update files for admin or editor with permission" ON public.files
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.file_permissions 
      WHERE file_id = files.id AND user_id = auth.uid() AND permission = 'edit'
    )
  );

CREATE POLICY "Allow delete files for admin only" ON public.files
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- file_versions policies
CREATE POLICY "Allow select file_versions if user can select parent file" ON public.file_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.files f
      WHERE f.id = file_id AND (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        OR f.uploaded_by = auth.uid()
        OR EXISTS (SELECT 1 FROM public.file_permissions WHERE file_id = f.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Allow insert file_versions if admin or editor with permission" ON public.file_versions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
      SELECT 1 FROM public.files f
      WHERE f.id = file_id AND (
        f.uploaded_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.file_permissions 
          WHERE file_id = f.id AND user_id = auth.uid() AND permission = 'edit'
        )
      )
    )
  );

-- file_permissions policies
CREATE POLICY "Allow select file_permissions for admin or own permissions" ON public.file_permissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR user_id = auth.uid()
  );

CREATE POLICY "Allow all modifications on file_permissions for admin only" ON public.file_permissions
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- activity_logs policies
CREATE POLICY "Allow select activity_logs for admin or own logs" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR user_id = auth.uid()
  );

CREATE POLICY "Allow insert activity_logs to authenticated users" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );
