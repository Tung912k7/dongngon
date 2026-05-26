-- Migration: Add Performance Indexes for Contributions
-- Created at: 2026-05-28

-- 1. Enable the pg_trgm extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create composite index on public.contributions (work_id, created_at ASC)
CREATE INDEX IF NOT EXISTS idx_contributions_work_id_created_at 
  ON public.contributions (work_id, created_at ASC);

-- 3. Create GIN trigram index on public.contributions (content) using gin_trgm_ops
CREATE INDEX IF NOT EXISTS idx_contributions_content_trgm 
  ON public.contributions USING GIN (content gin_trgm_ops);
