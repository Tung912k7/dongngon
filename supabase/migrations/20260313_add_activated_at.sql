-- Migration: Add activated_at column to profiles table
-- Purpose: Track the exact timestamp when a user submits their first contribution.
--          This is the "activation milestone" — the single best predictor of long-term retention.
--          NULL means "not yet activated" (user registered but never contributed).
-- Run: Supabase SQL editor or psql

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN public.profiles.activated_at IS
  'Timestamp of the user''s first contribution submission (activation milestone). NULL = not yet activated.';
