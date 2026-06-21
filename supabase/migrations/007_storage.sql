-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage RLS policies
CREATE POLICY "Admin full access" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'documents' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can read permitted files" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM public.file_permissions fp
      JOIN public.files f ON fp.file_id = f.id
      WHERE fp.user_id = auth.uid()
      AND f.storage_path = name
    ));

-- Allow editors/admins to upload/update files
CREATE POLICY "Editors/Admins can upload files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')));

CREATE POLICY "Editors/Admins can update files" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'documents' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')));
