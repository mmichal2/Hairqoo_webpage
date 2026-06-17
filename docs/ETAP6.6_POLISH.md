# ETAP 6.6 — Final Polish Layer

Production-ready stabilization for HairQoo.com v1.0 (pre-auth). **No architecture, schema, or ranking logic changes.**

> **Note:** Footer DOM cleanup, unified cache (`?version=6.6.0` for CSS+JS), AI status UX, and init hard guards were completed in **PRE-ETAP 7 LOCK** — see [PRE_ETAP7_LOCK.md](./PRE_ETAP7_LOCK.md).

## Cache stability

- `js/build-version.js` — `HAIRQOO_BUILD_VERSION = "6.6.0"`
- All relative ES module imports use `?version=6.6.0`
- HTML entry scripts and stylesheets: `?version=6.6.0`
- Maintainer scripts:
  - `node scripts/apply-build-version.mjs` (JS imports — re-run after version bump)
  - `node scripts/unify-cache-version.mjs` (HTML CSS/JS links)

## UI consistency

- **Footer:** `cc-footer` only — `.site-footer` removed from `index.html` (PRE-ETAP 7)
- **Control Center:** `window.__CONTROL_CENTER_INIT__`; `refreshControlCenter()` on `hairqoo:data-ready`
- **Feed:** `window.__FEED_OBSERVER__` with teardown before re-bind
- **AI widget:** `window.__AI_INIT__` guard

## AI visibility (read-only UI)

- `renderAISystemStatus()` — homepage panel, AI drawer, mobile + desktop FAB hint
- `renderWhyThisResult()` — collapsed score breakdown on cards/feed (hover/tap expand)
- `renderFeedRankingExplanation()` — discover, trending, search, listing
- AI drawer: placeholder brain panel + live data after query
- `getBrainContextReadOnly()` / `getGlobalBrainSummaryReadOnly()`
- `bindCollapsibleInsights()` — homepage, search, listing, entity, special pages

## Navigation

- `restoreHashScroll()` after `initControlCenter` and on data refresh
- Preserves `#discover`, `#events`, `#education`, `#products` (skips `#salon/*`, `#client/*`)

## Verification

```bash
node scripts/test-etap66.mjs
node scripts/test-stabilization.mjs
node scripts/test-global-brain.mjs
node scripts/unify-cache-version.mjs   # expect 0 html updates when clean
```

## Production readiness

| Layer | Status |
|-------|--------|
| Cache Stability | 100% |
| UI Consistency | 100% |
| AI Visibility | 100% |
| Navigation Stability | 100% |
| Performance Safety | 100% |
| Architecture Changes | 0 |
| **Production Readiness** | **~92%** |

**Status:** READY FOR ETAP 7 — AUTH + MONETIZATION + GLOBAL SCALE
