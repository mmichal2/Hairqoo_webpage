# PRE-ETAP 7 — Production Hardening Lock

Final stabilization before ETAP 7 (Auth + Monetization). **No ranking, AI, schema, or passport logic changes.**

## Changes

### Cache unification
- Single standard: `?version=6.6.0` for **all** HTML-linked JS and CSS
- Maintainer: `node scripts/unify-cache-version.mjs`

### DOM cleanliness
- Removed `.site-footer` from `index.html` (only `cc-footer` remains)
- Removed `body.is-home-cc` CSS hack
- Hard guards: `window.__CONTROL_CENTER_INIT__`, `window.__AI_INIT__`, `window.__FEED_OBSERVER__`

### AI visibility UX
- `renderAISystemStatus()` — always visible (homepage panel, drawer placeholder, desktop FAB hint)
- `renderWhyThisResult()` — collapsed by default, expand hover/tap
- `renderFeedRankingExplanation()` — discover, trending, search, listing
- `getCcDict()` merges EN `aiVisibility` fallback for ES/FR/PT

### Navigation
- `restoreHashScroll()` unchanged — `#discover`, `#events`, `#education`, `#products` preserved

## Verify

```bash
node scripts/test-etap66.mjs
node scripts/unify-cache-version.mjs   # should report 0 html updates when clean
```
