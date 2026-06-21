CREATE TABLE public.file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  storage_path TEXT NOT NULL,      -- Path to this version's file in storage
  file_size BIGINT,
  saved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  change_summary TEXT,             -- Optional: "Edited paragraph 3"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(file_id, version_number)
);

CREATE INDEX idx_file_versions_file ON public.file_versions(file_id, version_number DESC);

-- Enable RLS
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;
