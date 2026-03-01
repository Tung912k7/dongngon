-- Fix: Infinite recursion in profiles RLS policy (42P17)
-- Root cause: A policy on "profiles" references the "profiles" table itself,
-- creating an infinite evaluation loop.
-- Solution: Drop ALL policies and recreate only safe, non-recursive ones.

-- Step 1: Drop ALL existing policies on profiles (nuclear option to ensure no rogue policy remains)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Step 2: Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Recreate safe, non-recursive policies

-- SELECT: Anyone can read profiles (no subquery on profiles)
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

-- UPDATE: Users can only update their own profile (auth.uid() doesn't query profiles)
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- INSERT: Users can only insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- DELETE: Users can only delete their own profile  
CREATE POLICY "Users can delete own profile"
ON public.profiles FOR DELETE
USING (auth.uid() = id);
