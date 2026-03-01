-- Add last_seen_changelog to profiles for changelog popup tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_changelog TEXT DEFAULT NULL;

COMMENT ON COLUMN profiles.last_seen_changelog IS 'Stores the last changelog version the user has seen (e.g. "1.1.0"). NULL means never seen.';
