-- Optional seed: run AFTER schema.sql
-- Full seed: use browser upsertEntities(MOCK_ENTITIES) or scripts/seed-supabase.mjs

-- Example single entity (repeat pattern for all mock rows)
INSERT INTO entities (
  legacy_id, type, title, description, country, city, language, tags, media, metrics, ranking, type_data, owner_legacy_id
) VALUES (
  'event-1',
  'event',
  'Hairqoo World Summit 2026',
  'Największy zjazd branży fryzjerskiej — pokazy na żywo, premiery i networking z najlepszymi edukatorami.',
  'Polska',
  'Warszawa',
  'pl',
  ARRAY['summit','pokazy','networking'],
  '[]'::jsonb,
  '{"views":36260,"clicks":4116,"saves":1568,"shares":882}'::jsonb,
  '{"hairQooScore":96,"verified":true,"popularity":36260,"recencyScore":85}'::jsonb,
  '{"date":"2026-09-18","location":"Warszawa, PL","speakers":[],"brandPartners":[]}'::jsonb,
  'owner-1'
) ON CONFLICT (legacy_id) DO NOTHING;

-- Rebuild search index after bulk seed
SELECT rebuild_entity_search_index();
