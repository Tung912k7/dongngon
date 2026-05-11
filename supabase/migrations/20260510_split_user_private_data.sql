-- ============================================================
-- Migration: Split sensitive columns from profiles to user_private_data
-- This migration handles all dependent RLS policies and triggers
-- ============================================================

-- 1. Create table user_private_data
CREATE TABLE IF NOT EXISTS public.user_private_data (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  birthday DATE,
  role TEXT DEFAULT 'user'::text,
  is_test_account BOOLEAN DEFAULT false
);

-- 2. Migrate existing data
INSERT INTO public.user_private_data (id, birthday, role, is_test_account)
SELECT id, birthday, role, is_test_account 
FROM public.profiles
ON CONFLICT (id) DO NOTHING;

-- 3. Enable RLS
ALTER TABLE public.user_private_data ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for user_private_data
CREATE POLICY "Users can view own private data" 
ON public.user_private_data FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own private data" 
ON public.user_private_data FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own private data" 
ON public.user_private_data FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 5. Set up trigger to auto-create user_private_data on new profile
CREATE OR REPLACE FUNCTION public.handle_new_profile() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_private_data (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- ============================================================
-- 6. DROP all dependent RLS policies on OTHER tables
-- ============================================================

-- works
DROP POLICY IF EXISTS "Admins can delete any work" ON public.works;
DROP POLICY IF EXISTS "Mods can update work status" ON public.works;

-- blacklist_words
DROP POLICY IF EXISTS "Admins can do everything on blacklist" ON public.blacklist_words;

-- notifications
DROP POLICY IF EXISTS "Admins can insert notifications for all users" ON public.notifications;

-- quotes
DROP POLICY IF EXISTS "Quotes are readable by everyone" ON public.quotes;
DROP POLICY IF EXISTS "Admins can insert quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admins can update quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admins can delete quotes" ON public.quotes;

-- help_center_articles
DROP POLICY IF EXISTS "Authenticated users can read published help center articles" ON public.help_center_articles;
DROP POLICY IF EXISTS "Admins can insert help center articles" ON public.help_center_articles;
DROP POLICY IF EXISTS "Admins can update help center articles" ON public.help_center_articles;
DROP POLICY IF EXISTS "Admins can delete help center articles" ON public.help_center_articles;
DROP POLICY IF EXISTS "Allow insert for admins" ON public.help_center_articles;
DROP POLICY IF EXISTS "Allow update for admins" ON public.help_center_articles;
DROP POLICY IF EXISTS "Allow delete for admins" ON public.help_center_articles;
DROP POLICY IF EXISTS "Service role or admin write" ON public.help_center_articles;

-- ============================================================
-- 7. DROP dependent trigger functions that reference profiles.is_test_account
-- ============================================================
DROP TRIGGER IF EXISTS tr_sync_work_test_status ON public.works;
DROP TRIGGER IF EXISTS tr_sync_contribution_test_status ON public.contributions;

-- ============================================================
-- 8. NOW drop the columns from profiles (no more dependencies)
-- ============================================================
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS birthday,
  DROP COLUMN IF EXISTS role,
  DROP COLUMN IF EXISTS is_test_account;

-- ============================================================
-- 9. RECREATE all RLS policies pointing to user_private_data
-- ============================================================

-- works: Admins can delete any work
CREATE POLICY "Admins can delete any work" ON public.works
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_private_data p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- works: Mods can update work status
CREATE POLICY "Mods can update work status" ON public.works
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_private_data p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'mod')
  )
);

-- blacklist_words: Admins can do everything
CREATE POLICY "Admins can do everything on blacklist" ON public.blacklist_words
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_private_data p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- notifications: Admins can insert for all users
CREATE POLICY "Admins can insert notifications for all users" ON public.notifications
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_private_data p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- quotes: readable by everyone (recreate without role dependency)
CREATE POLICY "Quotes are readable by everyone" ON public.quotes
FOR SELECT USING (true);

-- quotes: admin write
CREATE POLICY "Admins can insert quotes" ON public.quotes
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_private_data p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

CREATE POLICY "Admins can update quotes" ON public.quotes
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_private_data p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

CREATE POLICY "Admins can delete quotes" ON public.quotes
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_private_data p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- help_center_articles: read for published
CREATE POLICY "Authenticated users can read published help center articles" ON public.help_center_articles
FOR SELECT USING (is_published = true);

-- help_center_articles: Service role or admin write (combined policy)
CREATE POLICY "Service role or admin write" ON public.help_center_articles
FOR ALL
USING (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1 FROM public.user_private_data p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
)
WITH CHECK (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1 FROM public.user_private_data p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- ============================================================
-- 10. RECREATE trigger functions pointing to user_private_data
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_work_test_status()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_private_data WHERE id = NEW.created_by AND is_test_account = TRUE) THEN
    NEW.is_test := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_sync_work_test_status
BEFORE INSERT ON public.works
FOR EACH ROW EXECUTE FUNCTION public.sync_work_test_status();

CREATE OR REPLACE FUNCTION public.sync_contribution_test_status()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_private_data WHERE id = NEW.user_id AND is_test_account = TRUE) THEN
    NEW.is_test := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_sync_contribution_test_status
BEFORE INSERT ON public.contributions
FOR EACH ROW EXECUTE FUNCTION public.sync_contribution_test_status();
