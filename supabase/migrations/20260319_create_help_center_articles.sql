-- Migration: Create help_center_articles table for wiki category completion
CREATE TABLE IF NOT EXISTS help_center_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  section_slug text NOT NULL,
  section_title text NOT NULL,
  title text NOT NULL,
  summary text,
  content_markdown text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for section_slug for efficient category queries
CREATE INDEX IF NOT EXISTS idx_help_center_articles_section_slug ON help_center_articles(section_slug);

-- Row Level Security (RLS): Allow read for all, restrict write to service role
ALTER TABLE help_center_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for all" ON help_center_articles FOR SELECT USING (true);
CREATE POLICY "Service role write only" ON help_center_articles FOR ALL USING (auth.role() = 'service_role');
