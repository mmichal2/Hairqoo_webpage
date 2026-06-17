# ETAP 6.5 — Stabilization & Integration Layer

Closes production-readiness gaps before Monetization, Auth, and Growth.

## P1 — MUST FIX

| Item | Solution |
|------|----------|
| Passport UI ↔ Engine | `hub-passport.js` + `getPassportSummary()` on homepage & `passport.html` |
| Single Passport Store | `passport-store.js` — Supabase `passport_progress` when `provider=supabase`, else `localStorage` only |
| Users Integration | `users-store.js` — `ensureSessionUser()`, runtime `user` entity in pool |
| Award Votes | `submitAwardVote()` → `award_votes` table (+ local cache for UI state) |
| Hash Routing | `labyrinth.js` preserves `#discover`, `#events`, etc. |

## P2 — SHOULD FIX

| Item | Solution |
|------|----------|
| Mock fallback consistency | `provider-state.js` — remote writes only when `provider === "supabase"` |
| search_index | `fetchSearchIndexScores()` merged into entity pool + ranking boost |
| Single logUserInteraction | `personalization/index.js` re-exports `ai-learning.logUserInteraction` |
| Single GlobalBrain init | Only `data-source.js` after pool hydrate (`force: true`) |
| Cache alignment | All HTML assets `?v=45` |

## Architecture

```
initDataLayer()
  → setRuntimeProvider()
  → entity pool (+ user entity)
  → initPassportStore()
  → fetchSearchIndexScores()
  → hydrateAllAwardVotes()
  → initGlobalBrainOnce()
```

## Store selection

- **Supabase live:** passport_progress, award_votes, users, interactions
- **mock / mock-fallback:** localStorage intelligence store only (no remote writes)
