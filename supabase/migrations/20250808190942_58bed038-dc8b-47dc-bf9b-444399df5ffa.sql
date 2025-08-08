-- Add project_id to tasks to support activities under a project
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS project_id uuid NULL REFERENCES public.tasks(id) ON DELETE SET NULL;

-- Index for quick lookup of activities by project
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
