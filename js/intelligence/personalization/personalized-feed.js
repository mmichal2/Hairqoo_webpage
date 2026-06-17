/**
 * ETAP 5 — Personalized Discover feed engine.
 */

import { getHairQooScoreValue, popularityComponent } from "../score-system.js?version=6.6.0";
import { getEntityPool } from "../../data/data-source.js?version=6.6.0";
import { getSessionContext } from "./session-memory.js?version=6.6.0";
import { buildUserVector, compareEntityToUserVector } from "./user-vector.js?version=6.6.0";
import { getRankingWeights } from "./learning-loop.js?version=6.6.0";
import { getDataSessionId } from "../../data/interactions.js?version=6.6.0";

export function filterFeedByPreferences(entities, userContext) {
  const ignored = new Set(userContext?.ignoredEntities ?? []);
  return entities.filter((e) => !ignored.has(e.id));
}

export function generateFeedRanking(userId, entities = null, network = null) {
  const id = userId ?? getDataSessionId();
  const pool = entities ?? getEntityPool();
  const net = network ?? pool;
  const session = getSessionContext(id);
  const vector = buildUserVector(id);
  const weights = getRankingWeights(id);

  const filtered = filterFeedByPreferences(pool, session);

  return filtered
    .map((entity) => {
      const global = (entity.engagement?.views ?? 0) / 5000 + getHairQooScoreValue(entity, net) / 200;
      const affinity = compareEntityToUserVector(entity, vector);
      const typeBoost = (vector.entityTypeWeights[entity.type] ?? 0) * weights.typeAffinity;
      const countryBoost = (vector.countryWeights[entity.country] ?? 0) * weights.countryAffinity;
      const langBoost = (vector.languageWeights[entity.language] ?? 0) * weights.languageAffinity;
      const trending = popularityComponent(entity, net) / 100;

      const feedScore =
        global * 0.45 + affinity * 0.3 + typeBoost + countryBoost + langBoost + trending * 0.1;

      return {
        ...entity,
        feedScore,
        feedMeta: { global, affinity, typeBoost, countryBoost, langBoost, trending },
      };
    })
    .sort((a, b) => b.feedScore - a.feedScore);
}

/**
 * @param {'trending_global'|'for_you'|'hybrid_mix'} mode
 */
export function getPersonalizedFeed(userId = null, { mode = "for_you", limit = 20 } = {}) {
  const id = userId ?? getDataSessionId();
  const pool = getEntityPool();
  const ranked = generateFeedRanking(id, pool);

  if (mode === "trending_global") {
    return [...pool]
      .sort(
        (a, b) =>
          (b.engagement?.views ?? 0) - (a.engagement?.views ?? 0) ||
          getHairQooScoreValue(b) - getHairQooScoreValue(a)
      )
      .slice(0, limit);
  }

  if (mode === "hybrid_mix") {
    const personal = ranked.slice(0, Math.ceil(limit * 0.65));
    const global = [...pool]
      .sort((a, b) => (b.engagement?.views ?? 0) - (a.engagement?.views ?? 0))
      .filter((e) => !personal.some((p) => p.id === e.id))
      .slice(0, Math.floor(limit * 0.35));
    return [...personal, ...global].slice(0, limit);
  }

  return ranked.slice(0, limit);
}
