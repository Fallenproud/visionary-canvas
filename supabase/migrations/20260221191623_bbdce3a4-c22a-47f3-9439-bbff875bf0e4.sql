
-- Create project_snapshots table to store versioned snapshots of all files
CREATE TABLE public.project_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  label text NOT NULL DEFAULT '',
  files jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add unique constraint on project_id + version
ALTER TABLE public.project_snapshots ADD CONSTRAINT project_snapshots_project_version_unique UNIQUE (project_id, version);

-- Enable RLS
ALTER TABLE public.project_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own project snapshots"
ON public.project_snapshots FOR SELECT
USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_snapshots.project_id AND p.user_id = auth.uid()));

CREATE POLICY "Users can create own project snapshots"
ON public.project_snapshots FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_snapshots.project_id AND p.user_id = auth.uid()));

CREATE POLICY "Users can delete own project snapshots"
ON public.project_snapshots FOR DELETE
USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_snapshots.project_id AND p.user_id = auth.uid()));

-- Index for fast lookups
CREATE INDEX idx_project_snapshots_project_id ON public.project_snapshots(project_id, version DESC);
