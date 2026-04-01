-- Add test environment isolation flags
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_test_account BOOLEAN DEFAULT FALSE;
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_works_is_test ON public.works(is_test) WHERE is_test = TRUE;
CREATE INDEX IF NOT EXISTS idx_contributions_is_test ON public.contributions(is_test) WHERE is_test = TRUE;

-- Trigger function to auto-mark works as test if creator is a tester
CREATE OR REPLACE FUNCTION public.sync_work_test_status()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.created_by AND is_test_account = TRUE) THEN
    NEW.is_test := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sync_work_test_status ON public.works;
CREATE TRIGGER tr_sync_work_test_status
BEFORE INSERT ON public.works
FOR EACH ROW EXECUTE FUNCTION public.sync_work_test_status();

-- Trigger function to auto-mark contributions as test if contributor is a tester
CREATE OR REPLACE FUNCTION public.sync_contribution_test_status()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.user_id AND is_test_account = TRUE) THEN
    NEW.is_test := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sync_contribution_test_status ON public.contributions;
CREATE TRIGGER tr_sync_contribution_test_status
BEFORE INSERT ON public.contributions
FOR EACH ROW EXECUTE FUNCTION public.sync_contribution_test_status();

-- Mark the specific test account
UPDATE public.profiles SET is_test_account = TRUE WHERE id = 'd8fa7636-7267-42e0-a1eb-ac11ba34fca1';
