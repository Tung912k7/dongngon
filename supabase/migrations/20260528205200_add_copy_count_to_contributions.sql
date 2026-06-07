-- Add copy_count to contributions
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS copy_count INTEGER DEFAULT 0 NOT NULL;

-- Function to safely increment copy count
CREATE OR REPLACE FUNCTION public.increment_contribution_copy(contrib_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.contributions
  SET copy_count = copy_count + 1
  WHERE id = contrib_id;
END;
$$;
