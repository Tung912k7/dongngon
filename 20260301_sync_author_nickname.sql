-- Rename author_nickname when a profile changes name
CREATE OR REPLACE FUNCTION public.sync_contributions_author_nickname()
RETURNS trigger AS $$
BEGIN
  IF NEW.nickname IS DISTINCT FROM OLD.nickname THEN
    UPDATE public.contributions
    SET author_nickname = NEW.nickname
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_nickname_update ON public.profiles;

CREATE TRIGGER on_profile_nickname_update
AFTER UPDATE OF nickname ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_contributions_author_nickname();
