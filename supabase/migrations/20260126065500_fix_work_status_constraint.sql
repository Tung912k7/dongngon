-- Update the status check constraint to match the application code
-- The application uses 'writing', 'finished', and 'pending'

-- Drop the existing constraint (tried both common names just in case)
ALTER TABLE public.works DROP CONSTRAINT IF EXISTS check_work_limit;
ALTER TABLE public.works DROP CONSTRAINT IF EXISTS works_status_check;

-- Add the corrected constraint
ALTER TABLE public.works ADD CONSTRAINT check_work_limit 
  CHECK (status IN ('active', 'completed', 'archived', 'writing', 'finished', 'pending'));

-- Also ensure the default value is 'writing' if that's what we want for new works
ALTER TABLE public.works ALTER COLUMN status SET DEFAULT 'writing';
