/**
 * Backward-compatible re-exports — ETAP 3 search engine is canonical.
 * Intelligence layer delegates here (no duplicate ranking logic).
 */

export {
  tokenize,
  haystack,
  computeRelevanceScore,
  computeScoreBreakdown,
  rankSearchResults,
  searchEntities,
  groupSearchResults,
  normalizeScores,
  applyTypeBalance,
  matchesQuery,
  SEARCHABLE_TYPES,
  RANK_WEIGHTS,
  REGIONS,
} from "../data/search-engine.js?version=6.6.0";

import { rankSearchResults as rankCore } from "../data/search-engine.js?version=6.6.0";
import { improveRankingFromFeedback } from "./ai-learning.js?version=6.6.0";

/**
 * Legacy wrapper: optional behavioral boost (ETAP 4/5 prep) after core ranking.
 * @deprecated Prefer searchEntities() for global search pipeline.
 */
export function rankSearchResultsWithFeedback(query, results, ctx = {}) {
  const ranked = rankCore(query, results, ctx);
  return improveRankingFromFeedback(ranked, ctx).sort(
    (a, b) => b.finalScore - a.finalScore || b.relevanceScore - a.relevanceScore
  );
}
