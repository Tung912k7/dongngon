-- Migration: Add explicit API grants for tables in the public schema
-- Ref: Supabase security update May 30, 2026

DO $$
BEGIN
    -- profiles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        GRANT SELECT ON public.profiles TO anon;
        GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
        GRANT ALL ON public.profiles TO service_role;
    END IF;

    -- works
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'works') THEN
        GRANT SELECT ON public.works TO anon;
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.works TO authenticated;
        GRANT ALL ON public.works TO service_role;
    END IF;

    -- contributions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contributions') THEN
        GRANT SELECT ON public.contributions TO anon;
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.contributions TO authenticated;
        GRANT ALL ON public.contributions TO service_role;
    END IF;

    -- votes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'votes') THEN
        GRANT SELECT ON public.votes TO anon;
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.votes TO authenticated;
        GRANT ALL ON public.votes TO service_role;
    END IF;

    -- finish_votes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'finish_votes') THEN
        GRANT SELECT ON public.finish_votes TO anon;
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.finish_votes TO authenticated;
        GRANT ALL ON public.finish_votes TO service_role;
    END IF;

    -- notifications
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
        GRANT ALL ON public.notifications TO service_role;
    END IF;

    -- saved_works
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'saved_works') THEN
        GRANT SELECT, INSERT, DELETE ON public.saved_works TO authenticated;
        GRANT ALL ON public.saved_works TO service_role;
    END IF;

    -- blacklist_words
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blacklist_words') THEN
        GRANT SELECT ON public.blacklist_words TO anon, authenticated;
        GRANT ALL ON public.blacklist_words TO service_role;
    END IF;

    -- quotes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotes') THEN
        GRANT SELECT ON public.quotes TO anon, authenticated;
        GRANT ALL ON public.quotes TO service_role;
    END IF;

    -- help_center_articles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'help_center_articles') THEN
        GRANT SELECT ON public.help_center_articles TO anon, authenticated;
        GRANT ALL ON public.help_center_articles TO service_role;
    END IF;

    -- user_private_data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_private_data') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_private_data TO authenticated;
        GRANT ALL ON public.user_private_data TO service_role;
    END IF;

    -- app_config
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'app_config') THEN
        GRANT SELECT ON public.app_config TO anon, authenticated;
        GRANT ALL ON public.app_config TO service_role;
    END IF;

    -- rate_limit_buckets
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rate_limit_buckets') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_limit_buckets TO anon, authenticated;
        GRANT ALL ON public.rate_limit_buckets TO service_role;
    END IF;
END $$;
