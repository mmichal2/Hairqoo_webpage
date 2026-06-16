/**
 * ETAP 6 — Cross-country intelligence (extends ETAP 3 regions).
 */

import { getHairQooScoreValue } from "../score-system.js";
import { GLOBAL_REGIONS, resolveGlobalRegion } from "./constants.js";

function regionEntityCounts(entities) {
  const counts = {};
  for (const e of entities) {
    const r = resolveGlobalRegion(e.country);
    counts[r] = (counts[r] ?? 0) + 1;
  }
  return counts;
}

export function normalizeGlobalScores(entities) {
  if (!entities.length) return [];
  const counts = regionEntityCounts(entities);
  const maxCount = Math.max(...Object.values(counts), 1);

  return entities.map((entity) => {
    const region = resolveGlobalRegion(entity.country);
    const density = (counts[region] ?? 1) / maxCount;
    const fairness = 1 - density * 0.12;
    const base = entity.globalIntelligenceScore ?? entity.finalScore ?? entity.score ?? 0;
    const normalized = typeof base === "number" && base <= 1 ? base * fairness : (base / 100) * fairness;
    return {
      ...entity,
      globalNormalizedScore: Math.min(1, Math.max(0, normalized)),
      regionMeta: { region, density, fairness },
    };
  });
}

export function getRegionalRanking(entity, region = null) {
  const r = region ?? resolveGlobalRegion(entity.country);
  const score = getHairQooScoreValue(entity) / 100;
  const regionalFit = resolveGlobalRegion(entity.country) === r ? 1 : 0.55;
  return Math.min(1, score * regionalFit);
}

export function applyCountryBiasBoost(entity, userCountry, baseScore) {
  if (!userCountry) return baseScore;
  let boost = 0;
  if (entity.country === userCountry) boost += 0.06;
  const userRegion = resolveGlobalRegion(userCountry);
  const entityRegion = resolveGlobalRegion(entity.country);
  if (userRegion && userRegion === entityRegion) boost += 0.03;
  return Math.min(1, baseScore + boost);
}

export function getRegionContext(entity, userCountry = null) {
  const entityRegion = resolveGlobalRegion(entity.country);
  const userRegion = userCountry ? resolveGlobalRegion(userCountry) : null;
  return {
    entityRegion,
    userRegion,
    regionMatch: userRegion && entityRegion === userRegion,
    countryMatch: userCountry && entity.country === userCountry,
    supportedRegions: Object.keys(GLOBAL_REGIONS),
  };
}

export { resolveGlobalRegion, GLOBAL_REGIONS };
