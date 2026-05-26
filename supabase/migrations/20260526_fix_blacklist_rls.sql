-- Fix RLS policy on blacklist_words so that checkBlacklist server action can read patterns for normal users
DROP POLICY IF EXISTS "Blacklist words are readable by everyone" ON public.blacklist_words;

CREATE POLICY "Blacklist words are readable by everyone" ON public.blacklist_words
FOR SELECT USING (true);
