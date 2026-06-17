/**
 * ETAP 5 — Personalized search ranking (extends ETAP 3 + ETAP 4).
 */

import { rankSearchResults } from "../../data/search-engine.js?version=6.6.0";
import { getHairQooScoreValue } from "../score-system.js?version=6.6.0";
import { getVerifiedSearchBoost } from "../verified-trust.js?version=6.6.0";
import { getSessionContext } from "./session-memory.js?version=6.6.0";
import { buildUserVector, compareEntityToUserVector } from "./user-vector.js?version=6.6.0";
import { getRankingWeights } from "./learning-loop.js?version=6.6.0";
import { getEntityPool } from "../../data/data-source.js?version=6.6.0";
import { getDataSessionId } from "../../data/interactions.js?version=6.6.0";

export function computeUserAffinity(entity, userProfile, userVector = null) {
  const vector = userVector ?? buildUserVector(userProfile?.userId);
  let affinity = compareEntityToUserVector(entity, vector);

  const viewed = new Set(userProfile?.viewedEntities ?? []);
  const clicked = new Set(userProfile?.clickedEntities ?? []);
  const saved = new Set(userProfile?.savedEntities ?? []);
  const ignored = new Set(userProfile?.ignoredEntities ?? []);

  if (saved.has(entity.id)) affinity = Math.min(1, affinity + 0.25);
  if (clicked.has(entity.id)) affinity = Math.min(1, affinity + 0.15);
  if (viewed.has(entity.id)) affinity = Math.min(1, affinity + 0.08);
  if (ignored.has(entity.id)) affinity = Math.max(0, affinity - 0.2);

  if (userProfile?.preferredCountries?.includes(entity.country)) affinity = Math.min(1, affinity + 0.12);
  if (userProfile?.preferredLanguages?.includes(entity.language)) affinity = Math.min(1, affinity + 0.1);
  if (userProfile?.preferredCategories?.includes(entity.type)) affinity = Math.min(1, affinity + 0.14);

  const dwell = userProfile?.entityDwell?.[entity.id] ?? 0;
  if (dwell >= 10) affinity = Math.min(1, affinity + 0.08);

  return Math.round(affinity * 1000) / 1000;
}

/**
 * ETAP3 relevance + ETAP4 boosts + personalization layer.
 */
export function rankSearchResultsPersonalized(query, entities, userId = null, ctx = {}) {
  const id = userId ?? getDataSessionId();
  const network = ctx.network ?? getEntityPool();
  const session = getSessionContext(id);
  const vector = buildUserVector(id);
  const weights = getRankingWeights(id);

  const baseRanked = rankSearchResults(query, entities, { ...ctx, profile: session, network });

  return baseRanked
    .map((entity) => {
      const etap3Score = entity.finalScore ?? entity.relevanceScore ?? 0;
      const hairQooBoost = (getHairQooScoreValue(entity, network) / 100) * 0.05;
      const verifiedBoost = getVerifiedSearchBoost(entity) * 0.5;
      const popularity = (entity.searchMeta?.breakdown?.popularityScore ?? 0) * 0.03;
      const recency = (entity.searchMeta?.breakdown?.recencyScore ?? 0) * 0.03;
      const affinity = computeUserAffinity(entity, session, vector);
      const personalizationBoost = affinity * weights.personalization;

      const personalizedScore = Math.min(
        1,
        etap3Score + hairQooBoost + verifiedBoost + popularity + recency + personalizationBoost
      );

      return {
        ...entity,
        relevanceScore: etap3Score,
        finalScore: personalizedScore,
        personalizedScore,
        searchMeta: {
          ...(entity.searchMeta ?? {}),
          personalization: {
            affinity,
            personalizationBoost,
            rankingWeights: weights,
            etap3Score,
            hairQooBoost,
            verifiedBoost,
          },
        },
      };
    })
    .sort((a, b) => b.personalizedScore - a.personalizedScore || b.finalScore - a.finalScore);
}
