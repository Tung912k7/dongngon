# Implementation Plan: Author Nickname Sync

## Goal Description
Implement an automated synchronization mechanism to update `author_nickname` in the `contributions` table whenever a user updates their `nickname` in the `profiles` table.

## User Review Required
No breaking changes. This simply ensures data consistency at the database level.

## Proposed Changes

### Database Sync Trigger
We will add a raw SQL migration script to the database.

#### [NEW] `supabase/migrations/20260301_sync_author_nickname.sql`
Create a PL/pgSQL function and trigger:
```sql
CREATE OR REPLACE FUNCTION public.sync_contributions_author_nickname()
RETURNS trigger AS $$
BEGIN
  IF NEW.nickname <> OLD.nickname THEN
    UPDATE public.contributions
    SET author_nickname = NEW.nickname
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_nickname_update
AFTER UPDATE OF nickname ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_contributions_author_nickname();
```

## Verification Plan
### Automated Tests
1. No automated test file exists for database triggers, but we can verify it by executing directly in Supabase.

### Manual Verification
1. Log into the application as a user with an existing contribution.
2. Go to the profile settings and change the nickname.
3. Check the `contributions` feed or the specific work page to ensure the author's name on the existing contribution is matching the new nickname.
