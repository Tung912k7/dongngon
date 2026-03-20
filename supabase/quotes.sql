-- Update profiles table for hashtags and public settings (2026-03-20)
-- 1) Add hashtags column (text array)
-- 2) Add public_fields column (jsonb)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS hashtags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS public_fields jsonb DEFAULT '{}';

-- Verify the new columns
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name IN ('hashtags', 'public_fields');
