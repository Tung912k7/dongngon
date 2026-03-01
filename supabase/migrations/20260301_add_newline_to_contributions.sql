-- Add new_line column to contributions for "Thơ tự do" line break control
ALTER TABLE contributions ADD COLUMN IF NOT EXISTS new_line BOOLEAN DEFAULT false;

-- Comment for clarity
COMMENT ON COLUMN contributions.new_line IS 'When true, Feed renders a <br/> before this contribution. Used for Thơ tự do manual line breaks.';
