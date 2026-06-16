-- HairQoo.com — Supabase (PostgreSQL) production schema
-- ETAP 2: Data Layer — run in Supabase SQL Editor or via CLI

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- USERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('stylist', 'educator', 'brand', 'salon', 'student')),
  display_name TEXT,
  email TEXT UNIQUE,
  profile JSONB NOT NULL DEFAULT '{}',
  passport_data JSONB NOT NULL DEFAULT '{}',
  xp_points INTEGER NOT NULL DEFAULT 0,
  achievements JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_legacy_id ON users (legacy_id);

-- =============================================================================
-- ENTITIES (unified base model — all content types)
-- =============================================================================
CREATE TABLE IF NOT EXISTS entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'event', 'education', 'educator', 'product', 'brand', 'salon', 'user',
    'video', 'post', 'academy'
  )),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  country TEXT,
  city TEXT,
  language TEXT NOT NULL DEFAULT 'pl',
  tags TEXT[] NOT NULL DEFAULT '{}',
  media JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metrics JSONB NOT NULL DEFAULT '{"views":0,"clicks":0,"saves":0,"shares":0}',
  ranking JSONB NOT NULL DEFAULT '{"hairQooScore":0,"verified":false,"popularity":0,"recencyScore":0}',
  owner_id UUID REFERENCES users (id) ON DELETE SET NULL,
  owner_legacy_id TEXT,
  type_data JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_entities_type ON entities (type);
CREATE INDEX IF NOT EXISTS idx_entities_country ON entities (country);
CREATE INDEX IF NOT EXISTS idx_entities_language ON entities (language);
CREATE INDEX IF NOT EXISTS idx_entities_legacy_id ON entities (legacy_id);
CREATE INDEX IF NOT EXISTS idx_entities_tags ON entities USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_entities_ranking_score ON entities ((ranking->>'hairQooScore') DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_entities_created_at ON entities (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entities_type_data ON entities USING GIN (type_data);

-- =============================================================================
-- INTERACTIONS (views, clicks, saves, votes, search)
-- =============================================================================
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users (id) ON DELETE SET NULL,
  session_id TEXT,
  entity_id UUID REFERENCES entities (id) ON DELETE SET NULL,
  entity_legacy_id TEXT,
  action_type TEXT NOT NULL CHECK (action_type IN ('view', 'click', 'save', 'vote', 'search')),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interactions_user ON interactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_entity ON interactions (entity_legacy_id, action_type);
CREATE INDEX IF NOT EXISTS idx_interactions_session ON interactions (session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_action ON interactions (action_type, created_at DESC);

-- =============================================================================
-- AWARDS (seasonal voting)
-- =============================================================================
CREATE TABLE IF NOT EXISTS award_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('educator_of_year', 'event_of_year', 'product_of_year')),
  season TEXT NOT NULL,
  entity_id UUID REFERENCES entities (id) ON DELETE CASCADE,
  entity_legacy_id TEXT NOT NULL,
  user_id UUID REFERENCES users (id) ON DELETE SET NULL,
  session_id TEXT,
  vote_weight INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category, season, entity_legacy_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_award_votes_category_season ON award_votes (category, season, vote_weight DESC);
CREATE INDEX IF NOT EXISTS idx_award_votes_entity ON award_votes (entity_legacy_id);

-- =============================================================================
-- PASSPORT PROGRESSION
-- =============================================================================
CREATE TABLE IF NOT EXISTS passport_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  session_id TEXT UNIQUE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 100),
  completed_events JSONB NOT NULL DEFAULT '[]',
  completed_education JSONB NOT NULL DEFAULT '[]',
  achievements JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_passport_user ON passport_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_passport_session ON passport_progress (session_id);

-- =============================================================================
-- SEARCH INDEX (precomputed ranking — ETAP 3 ready)
-- =============================================================================
CREATE TABLE IF NOT EXISTS search_index (
  entity_id UUID PRIMARY KEY REFERENCES entities (id) ON DELETE CASCADE,
  entity_legacy_id TEXT UNIQUE NOT NULL,
  keyword_index TSVECTOR,
  weighted_score NUMERIC NOT NULL DEFAULT 0,
  country_boost NUMERIC NOT NULL DEFAULT 1,
  language_boost NUMERIC NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_keyword ON search_index USING GIN (keyword_index);
CREATE INDEX IF NOT EXISTS idx_search_weighted ON search_index (weighted_score DESC);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION increment_entity_metrics(
  p_legacy_id TEXT,
  p_views INTEGER DEFAULT 0,
  p_clicks INTEGER DEFAULT 0,
  p_saves INTEGER DEFAULT 0,
  p_shares INTEGER DEFAULT 0
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE entities
  SET
    metrics = jsonb_build_object(
      'views', COALESCE((metrics->>'views')::INTEGER, 0) + p_views,
      'clicks', COALESCE((metrics->>'clicks')::INTEGER, 0) + p_clicks,
      'saves', COALESCE((metrics->>'saves')::INTEGER, 0) + p_saves,
      'shares', COALESCE((metrics->>'shares')::INTEGER, 0) + p_shares
    ),
    ranking = jsonb_set(
      ranking,
      '{popularity}',
      to_jsonb(COALESCE((metrics->>'views')::INTEGER, 0) + p_views)
    ),
    updated_at = now()
  WHERE legacy_id = p_legacy_id;
END;
$$;

CREATE OR REPLACE FUNCTION rebuild_entity_search_index(p_legacy_id TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO search_index (entity_id, entity_legacy_id, keyword_index, weighted_score, country_boost, language_boost, updated_at)
  SELECT
    e.id,
    e.legacy_id,
    setweight(to_tsvector('simple', coalesce(e.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(e.description, '')), 'B') ||
    setweight(to_tsvector('simple', array_to_string(e.tags, ' ')), 'C'),
    COALESCE((e.ranking->>'hairQooScore')::NUMERIC, 0) +
      COALESCE((e.metrics->>'views')::NUMERIC, 0) * 0.01 +
      CASE WHEN (e.ranking->>'verified')::BOOLEAN THEN 5 ELSE 0 END,
    CASE WHEN e.country IS NOT NULL THEN 1.1 ELSE 1.0 END,
    CASE WHEN e.language IS NOT NULL THEN 1.05 ELSE 1.0 END,
    now()
  FROM entities e
  WHERE p_legacy_id IS NULL OR e.legacy_id = p_legacy_id
  ON CONFLICT (entity_id) DO UPDATE SET
    keyword_index = EXCLUDED.keyword_index,
    weighted_score = EXCLUDED.weighted_score,
    country_boost = EXCLUDED.country_boost,
    language_boost = EXCLUDED.language_boost,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION trg_entities_search_index()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM rebuild_entity_search_index(NEW.legacy_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS entities_search_index_sync ON entities;
CREATE TRIGGER entities_search_index_sync
  AFTER INSERT OR UPDATE OF title, description, tags, ranking, metrics, country, language
  ON entities
  FOR EACH ROW
  EXECUTE FUNCTION trg_entities_search_index();

-- =============================================================================
-- ROW LEVEL SECURITY (public read, anon write interactions)
-- =============================================================================
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE award_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY entities_public_read ON entities FOR SELECT USING (true);
CREATE POLICY entities_anon_insert ON entities FOR INSERT WITH CHECK (true);
CREATE POLICY entities_anon_update ON entities FOR UPDATE USING (true);
CREATE POLICY search_index_public_read ON search_index FOR SELECT USING (true);

CREATE POLICY interactions_anon_insert ON interactions FOR INSERT WITH CHECK (true);
CREATE POLICY interactions_public_read ON interactions FOR SELECT USING (true);

CREATE POLICY award_votes_anon_insert ON award_votes FOR INSERT WITH CHECK (true);
CREATE POLICY award_votes_public_read ON award_votes FOR SELECT USING (true);

CREATE POLICY passport_anon_upsert ON passport_progress FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY users_self_read ON users FOR SELECT USING (true);

-- Grant RPC to anon
GRANT EXECUTE ON FUNCTION increment_entity_metrics TO anon, authenticated;
GRANT EXECUTE ON FUNCTION rebuild_entity_search_index TO anon, authenticated;
