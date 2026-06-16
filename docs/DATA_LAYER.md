# HairQoo.com — Data Layer (ETAP 2)

Production data model on **Supabase (PostgreSQL)**. Static frontend on GitHub Pages reads via REST (`fetch`) — no backend server required.

## Architecture

```
js/data/
  config.js           — provider toggle (mock | supabase)
  config.example.js   — copy → config.local.js (gitignored)
  supabase-client.js  — thin PostgREST client
  entity-mapper.js    — DB row ↔ frontend entity shape
  api.js              — getEntities, getEntityById, metrics, passport, XP
  interactions.js     — trackInteraction(userId, entityId, action)
  data-source.js      — in-memory cache + initDataLayer()
  entities.js         — mock seeds (fallback + migration source)
  queries.js          — sync query API (unchanged signature for UI)

supabase/
  schema.sql          — tables, indexes, RLS, search triggers
  seed.sql            — optional mock seed template
```

## Entity base model (all types)

Every row in `entities` shares:

| Field | Type | Notes |
|-------|------|-------|
| `legacy_id` | text | `event-1` — matches mock + URLs |
| `type` | enum | event, education, educator, product, brand, salon, user, video, post |
| `title`, `description` | text | |
| `country`, `city`, `language` | text | multi-region ready |
| `tags` | text[] | GIN index |
| `media` | jsonb | `[{ url, focalPoint }]` |
| `metrics` | jsonb | views, clicks, saves, shares |
| `ranking` | jsonb | hairQooScore, verified, popularity, recencyScore |
| `type_data` | jsonb | type-specific payload (see below) |

### Type-specific `type_data`

- **event** — `date`, `location`, `speakers`, `brandPartners`, `ticketInfo`
- **education** — `duration`, `level`, `certification`
- **educator** — `specialties`, `portfolio`, `socialLinks`, `rating`
- **product** — `brandId`, `category`, `launchDate`, `reviews`
- **brand** — `productIds`, `partnerships`
- **salon** — `team`, `services`, `ratings`

## Tables

| Table | Purpose |
|-------|---------|
| `users` | roles, profile, passport_data, xp, achievements |
| `entities` | unified content registry |
| `interactions` | view, click, save, vote, search |
| `award_votes` | category + season + entity votes |
| `passport_progress` | xp, level, completed events/education |
| `search_index` | tsvector + weighted_score (ETAP 3) |

## Indexing strategy

1. **Listings** — `entities(type)`, `entities(ranking->hairQooScore DESC)`
2. **Geo / i18n** — `entities(country)`, `entities(language)`
3. **Tags** — GIN on `entities.tags`
4. **Full-text** — GIN on `search_index.keyword_index` (trigger-maintained)
5. **Interactions** — `(entity_legacy_id, action_type)`, `(session_id, created_at)`
6. **Awards** — `(category, season, vote_weight DESC)`

Trigger `entities_search_index_sync` rebuilds `search_index` on entity insert/update.

## JavaScript API

```javascript
import { initDataLayer, getEntityPool } from "./js/data/data-source.js";
import {
  getEntities,
  getEntityById,
  updateEntityMetrics,
  getUserPassport,
  updateUserXP,
} from "./js/data/api.js";
import { trackInteraction } from "./js/data/interactions.js";

await initDataLayer();           // boot: Supabase → cache, else mock
getEntityPool();                 // sync reads for queries.js

await getEntities("event", { country: "Polska", limit: 8 });
await getEntityById("event-1", "event");
await updateEntityMetrics("event-1", { views: 1 });
await trackInteraction(null, "event-1", "view", { source: "entity-page" });
await getUserPassport(userId);
await updateUserXP(userId, 120, { completedEvents: [...] });
```

## Enable Supabase (production)

1. Create project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in SQL Editor
3. Copy `js/data/config.example.js` → `js/data/config.local.js`
4. Set `provider: "supabase"` and fill `url` + `anonKey`
5. Seed data (see Migration)
6. Deploy — `config.local.js` stays local; for CI use GitHub Actions secrets injecting `window.__HAIRQOO_DATA_CONFIG` (optional, no HTML change required if injected via build step later)

**Without config** — site runs on mock data (current behaviour).

## Migration plan: mock → Supabase

### Phase A — Schema
1. Apply `supabase/schema.sql`
2. Verify RLS policies (public read entities, anon insert interactions)

### Phase B — Seed mock entities
Option 1 — Browser console (one-time admin):
```javascript
import { MOCK_ENTITIES } from "./js/data/entities.js";
import { upsertEntities } from "./js/data/api.js";
await upsertEntities(MOCK_ENTITIES);
```

Option 2 — SQL seed: transform each mock row with `entityToRow()` logic (see `entity-mapper.js`)

Option 3 — `supabase/seed.sql` template for manual INSERT

After seed:
```sql
SELECT rebuild_entity_search_index();
```

### Phase C — Switch provider
Set `config.local.js`:
```javascript
export const DATA_CONFIG_LOCAL = {
  provider: "supabase",
  supabase: { url: "https://xxx.supabase.co", anonKey: "eyJ..." },
};
```

### Phase D — Verify
- `initDataLayer()` → `window.__HAIRQOO_DATA.provider === "supabase"`
- Listings/search unchanged (same entity shape)
- Interactions appear in `interactions` table

### Phase E — Deprecate mock (optional)
Keep `entities.js` as offline fallback and migration reference.

## Interaction tracking

| Action | Table | Metrics bump |
|--------|-------|--------------|
| view | interactions | views +1 |
| click | interactions | clicks +1 |
| save | interactions | saves +1 |
| vote | interactions + award_votes | — |
| search | interactions | metadata.query |

Wired from `js/intelligence/ai-learning.js` → `trackInteractionRemote()` (fire-and-forget).

Session ID: `localStorage.hairqoo_data_session` for anonymous users.

## Ranking fields (ETAP 3 ready)

Stored on every entity in `ranking` JSONB:
- `hairQooScore` — 0–100
- `verified` — trust boost flag
- `popularity` — synced from views
- `recencyScore` — computed at ingest or ETAP 3 cron

`search_index.weighted_score` precombines score + popularity + verified for fast sort.

## Multi-region

All entities require `country` + `language` at schema level. `search_index.country_boost` / `language_boost` support future cross-country ranking (ETAP 3).

## Constraints honoured

- No UI/HTML changes
- No AI logic in data layer
- Static GitHub Pages compatible
- Extends `js/data/*` — mock fallback preserved
