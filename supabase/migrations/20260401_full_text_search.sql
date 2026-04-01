-- Migration: Add Full-Text Search and Content Search RPC
-- Applied to: works, contributions

-- 1. Add FTS column to works for title and author search with weights
ALTER TABLE "public"."works" ADD COLUMN IF NOT EXISTS "fts" tsvector 
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(author_nickname,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(description,'')), 'C')
  ) STORED;

-- 2. Create GIN index for fast searching
CREATE INDEX IF NOT EXISTS "works_fts_idx" ON "public"."works" USING GIN ("fts");

-- 3. Create a unified search function that ranks by relevance and includes content matches
CREATE OR REPLACE FUNCTION "public"."search_works"(
  query_text TEXT,
  category_filter TEXT DEFAULT '',
  status_filter TEXT DEFAULT '',
  privacy_filter TEXT DEFAULT 'Public',
  user_id_filter UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category_type TEXT,
  sub_category TEXT,
  limit_type TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  author_nickname TEXT,
  privacy TEXT,
  created_by UUID,
  age_rating TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  WITH work_rankings AS (
    -- Rank matches in works table (title, nickname, description)
    SELECT 
      w.id,
      ts_rank(w.fts, plainto_tsquery('simple', query_text)) as search_rank
    FROM works w
    WHERE w.fts @@ plainto_tsquery('simple', query_text)
  ),
  content_matches AS (
    -- Find matches in contributions and give them a lower base rank
    SELECT 
      c.work_id as id,
      0.1 as search_rank -- Base rank for content matches
    FROM contributions c
    WHERE c.content ILIKE '%' || query_text || '%'
    GROUP BY c.work_id
  ),
  combined_results AS (
    -- Combine ranking signals
    SELECT r.id, MAX(r.search_rank) as final_rank
    FROM (
      SELECT * FROM work_rankings
      UNION ALL
      SELECT * FROM content_matches
    ) r
    GROUP BY r.id
  )
  SELECT 
    w.id,
    w.title,
    w.category_type,
    w.sub_category,
    w.limit_type,
    w.status,
    w.created_at,
    w.author_nickname,
    w.privacy,
    w.created_by,
    w.age_rating,
    COALESCE(cr.final_rank, 0) as rank
  FROM works w
  LEFT JOIN combined_results cr ON w.id = cr.id
  WHERE 
    (query_text = '' OR cr.id IS NOT NULL)
    AND (category_filter = '' OR w.category_type = category_filter)
    AND (status_filter = '' OR w.status = status_filter)
    AND (
      w.privacy = 'Public' 
      OR (user_id_filter IS NOT NULL AND w.created_by = user_id_filter)
    )
  ORDER BY 
    CASE WHEN query_text = '' THEN 0 ELSE 1 END DESC, -- Rank first if searching
    rank DESC,
    w.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
