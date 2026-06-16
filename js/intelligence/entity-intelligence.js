/**
 * ETAP 4 — Entity intelligence contracts
 * Enriches entities for search (ETAP 3), data layer (ETAP 2), AI (ETAP 5).
 */

import { computeHairQooScore, getHairQooScoreValue, popularityComponent } from "./score-system.js";
import { getVerifiedStatus, computeTrustScore } from "./verified-trust.js";
import { computeAwardRankPotential } from "./awards-system.js";

/** @returns {number} 0–100 popularity index */
export function computePopularityIndex(entity, network = null) {
  return Math.round(popularityComponent(entity, network));
}

/**
 * Apply ETAP 4 intelligence contract to a single entity.
 * @returns {object} entity + intelligence block
 */
export function enrichEntityIntelligence(entity, network = null, options = {}) {
  if (!entity) return null;

  const hairQoo = computeHairQooScore(entity, network);
  const verifiedStatus = getVerifiedStatus(entity);
  const trustLevel = computeTrustScore(entity);
  const popularityIndex = computePopularityIndex(entity, network);
  const awardRankPotential = computeAwardRankPotential(entity, options.awardCategories);

  return {
    ...entity,
    score: hairQoo.score,
    hairqooScore: hairQoo.score,
    scoreTier: hairQoo.tier,
    intelligence: {
      hairQooScore: hairQoo,
      verifiedStatus,
      trustLevel,
      popularityIndex,
      awardRankPotential,
    },
  };
}

/** Batch enrich entity pool (lazy on data init). */
export function enrichEntityPool(entities, network = null) {
  const pool = network ?? entities;
  return entities.map((e) => enrichEntityIntelligence(e, pool));
}

/** Flat contract for ETAP 5 / search metadata. */
export function getEntityIntelligenceContract(entity, network = null) {
  const enriched = enrichEntityIntelligence(entity, network);
  return {
    hairQooScore: enriched.intelligence.hairQooScore,
    verifiedStatus: enriched.intelligence.verifiedStatus,
    trustLevel: enriched.intelligence.trustLevel,
    popularityIndex: enriched.intelligence.popularityIndex,
    awardRankPotential: enriched.intelligence.awardRankPotential,
    scoreValue: getHairQooScoreValue(entity, network),
  };
}
