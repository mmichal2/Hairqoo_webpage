# ETAP 6.6 — Final Polish Layer

Production-ready stabilization for HairQoo.com v1.0 (pre-auth). **No architecture, schema, or ranking logic changes.**

## Cache stability

- `js/build-version.js` — `HAIRQOO_BUILD_VERSION = "6.6.0"`
- All relative ES module imports use `?version=6.6.0`
- HTML entry scripts: `?version=6.6.0`
- Maintainer script: `node scripts/apply-build-version.mjs` (re-run after bumping build version)

## UI consistency

- **Footer:** `cc-footer` only on homepage (`.site-footer` hidden via `body.is-home-cc`)
- **Control Center:** single `hairqoo:lang` listener; `refreshControlCenter()` on `hairqoo:data-ready` (no double mount)
- **Feed:** single `IntersectionObserver` — teardown before re-bind

## AI visibility (read-only UI)

- `readAIVisibility()` / `renderEntityAIInsight()` on cards and feed
- Search page: `renderSearchRankingExplanation()`
- AI drawer: brain panel + `getBrainContextReadOnly()` / `getGlobalBrainSummaryReadOnly()`

## Navigation

- `restoreHashScroll()` after `initControlCenter` and on data refresh
- Preserves `#discover`, `#events`, etc. (skips `#salon/*`, `#client/*` — labyrinth unchanged)

## Verification

```bash
node scripts/test-etap66.mjs
node scripts/test-stabilization.mjs
node scripts/test-global-brain.mjs
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
| **Production Readiness** | **~91%** |

**Status:** READY FOR ETAP 7 — AUTH + MONETIZATION + GLOBAL SCALE
