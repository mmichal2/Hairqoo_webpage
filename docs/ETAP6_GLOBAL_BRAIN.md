# ETAP 6 — Global Brain Layer (gap analysis + spec)

## Already implemented (DO NOT duplicate)

| Capability | Location |
|------------|----------|
| Global search ranking | `js/data/search-engine.js` (ETAP 3) |
| HairQoo Score + Verified + Awards | `js/intelligence/*` (ETAP 4) |
| Session memory + user vector + personalized search/feed | `js/intelligence/personalization/*` (ETAP 5) |
| `enhanceAIContext` / `personalizedAIResponse` | `personalization/ai-personalization.js` |
| Partial regions (EU, LATAM, NA, Asia) | `search-engine.js` `REGIONS` |
| Entity pool + interactions + passport | ETAP 2 data layer |

## Gaps closed in ETAP 6

1. **Entity Graph** — directional weighted graph (client-side, `brain.graph` in intelligence store)
2. **RAG engine** — retrieval over entities + graph + ETAP 5 context (no LLM server)
3. **Extended regions** — Middle East + Africa (extends, not replaces ETAP 3 regions)
4. **Multi-language semantic layer** — PL/EN/ES/FR/PT query normalization
5. **Graph centrality + influence** — ecosystem importance metrics
6. **Global intelligence score** — fuses ETAP 3–5 + graph + region + language
7. **AI brain context** — `buildAIContext` extends ETAP 5 with RAG + graph
8. **Global output contract** — metadata on search/AI responses (no UI changes)

## Modules

| File | Responsibility |
|------|----------------|
| `global/constants.js` | Regions (incl. Middle East, Africa), relation types, semantic tag map |
| `global/entity-graph.js` | Directional weighted graph + interaction strengthening |
| `global/semantic-layer.js` | PL/EN/ES/FR/PT query + tag normalization |
| `global/regional-intelligence.js` | Global score normalization + country bias boost |
| `global/graph-centrality.js` | Degree, interaction, influence metrics |
| `global/global-scoring.js` | Fused `globalIntelligenceScore` (ETAP 3–5 + graph) |
| `global/rag-engine.js` | `retrieveContext`, `buildContextWindow`, `rankKnowledgeChunks` |
| `global/ai-brain-context.js` | `buildAIContext`, global output contract |
| `global/index.js` | Public API + `initGlobalBrain()` |

## Integration

- `initIntelligence()` → `initGlobalBrain()` + rebuild on `hairqoo:data-ready`
- `initDataLayer()` → `initGlobalBrain(entityPool)` after Supabase/mock hydrate
- `queries.search()` → `rankByGlobalIntelligence` after ETAP 5 personalization
- `queries.aiAsk()` → `buildAIContext` + `globalBrain` metadata contract
- `ai-learning.logUserInteraction()` → `strengthenEdgeFromInteraction`
