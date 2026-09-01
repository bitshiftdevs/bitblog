-- Add tsvector column for full-text search
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;

-- GIN index for fast tsvector lookups
CREATE INDEX IF NOT EXISTS "posts_search_vector_idx" ON "posts" USING GIN ("search_vector");

-- Trigger function: recomputes search_vector on title/excerpt/content change
CREATE OR REPLACE FUNCTION posts_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_search_vector_trigger ON "posts";
CREATE TRIGGER posts_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, excerpt, content
  ON "posts"
  FOR EACH ROW EXECUTE FUNCTION posts_search_vector_update();

-- Back-fill existing rows
UPDATE "posts" SET
  search_vector =
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'C');
