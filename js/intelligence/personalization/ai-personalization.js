/**
 * ETAP 5 — AI assistant personalization (extends aiAsk context).
 */

import { getSessionContext } from "./session-memory.js?version=6.6.0";
import { buildUserVector, compareEntityToUserVector } from "./user-vector.js?version=6.6.0";
import { getRankingWeights } from "./learning-loop.js?version=6.6.0";
import { rankSearchResultsPersonalized } from "./personalized-search.js?version=6.6.0";
import { getEntityIntelligenceContract } from "../entity-intelligence.js?version=6.6.0";
import { getEntityPool } from "../../data/data-source.js?version=6.6.0";
import { getAIContext } from "../ai-learning.js?version=6.6.0";
import { getDataSessionId } from "../../data/interactions.js?version=6.6.0";

export function enhanceAIContext(userId, query) {
  const id = userId ?? getDataSessionId();
  const session = getSessionContext(id);
  const vector = buildUserVector(id);
  const weights = getRankingWeights(id);
  const ai = getAIContext();

  return {
    userId: id,
    query,
    session,
    userVector: vector,
    rankingWeights: weights,
    interactionHistory: ai.interactions,
    passport: ai.passport,
    recentSearches: session.recentSearches,
    preferredTypes: Object.entries(vector.entityTypeWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([k]) => k),
  };
}

/**
 * Re-rank AI entity picks using full personalization + intelligence contracts.
 */
export function personalizedAIResponse(query, userContext, entities) {
  const id = userContext?.userId ?? getDataSessionId();
  const pool = getEntityPool();
  const ranked = rankSearchResultsPersonalized(query, entities, id, {
    network: pool,
    lang: userContext?.session?.preferredLanguages?.[0],
  });

  return ranked.slice(0, 6).map((entity) => ({
    ...entity,
    intelligence: getEntityIntelligenceContract(entity, pool),
    aiMeta: {
      personalizedScore: entity.personalizedScore,
      affinity: entity.searchMeta?.personalization?.affinity,
    },
  }));
}
