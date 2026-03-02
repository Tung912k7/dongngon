-- Add description column to works table
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS description TEXT NULL;

COMMENT ON COLUMN public.works.description IS 'Optional description of the work to provide context for readers and collaborators.';
