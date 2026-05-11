-- Migration: Add unique constraint to contributions to prevent multi-post per day
-- Task: Phase 1, Task 1 of Technical Improvements Plan
-- Fixed: IMMUTABLE function error by specifying TIME ZONE 'UTC'

CREATE UNIQUE INDEX IF NOT EXISTS unique_user_work_per_day 
ON public.contributions (user_id, work_id, (CAST(created_at AT TIME ZONE 'UTC' AS DATE)));

COMMENT ON INDEX unique_user_work_per_day IS 'Prevents a user from contributing more than once to the same work on the same calendar day (UTC).';
