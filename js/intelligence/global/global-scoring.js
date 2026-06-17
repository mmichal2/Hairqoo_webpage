/**
 * ETAP 6 — Global intelligence score fusion (ETAP 3–5 + graph + region + language).
 */

import { computeRelevanceScore } from "../../data/search-engine.js?version=6.6.0";
import { getHairQooScoreValue } from "../score-system.js?version=6.6.0";
import { computeTrustScore, getVerifiedSearchBoost } from "../verified-trust.js?version=6.6.0";
import { popularityComponent } from "../score-system.js?version=6.6.0";
import { computeUserAffinity } from "../personalization/personalized-search.js?version=6.6.0";
import { getSessionContext } from "../personalization/session-memory.js?version=6.6.0";
import { buildUserVector } from "../personalization/user-vector.js?version=6.6.0";
import { computeGraphCentrality, computeInfluenceScore } from "./graph-centrality.js?version=6.6.0";
import { applyCountryBiasBoost, getRegionContext } from "./regional-intelligence.js?version=6.6.0";
import { semanticMatchScore, detectQueryLanguage } from "./semantic-layer.js?version=6.6.0";
import { getEntityPool } from "../../data/data-source.js?version=6.6.0";
import { getDataSessionId } from "../../data/interactions.js?version=6.6.0";

const FUSION_WEIGHTS = {
  searchRelevance: 0.28,
  hairQooScore: 0.18,
  verifiedTrust: 0.1,
  engagement: 0.1,
  personalization: 0.12,
  graphCentrality: 0.1,
  regional: 0.06,
  language: 0.06,
};

export function computeGlobalIntelligenceScore(entity, query, userId = null, ctx = {}) {
  const id = userId ?? getDataSessionId();
  const network = ctx.network ?? getEntityPool();
  const session = getSessionContext(id);
  const vector = buildUserVector(id);
  const querySemantic = ctx.querySemantic ?? { expandedTokens: [], language: detectQueryLanguage(query) };

  const searchRelevanceScore = computeRelevanceScore(query ?? "", entity, {
    ...ctx,
    network,
    lang: querySemantic.language,
    profile: session,
  });
  const hairQooScore = getHairQooScoreValue(entity, network) / 100;
  const verifiedTrust = getVerifiedSearchBoost(entity) + computeTrustScore(entity) * 0.15;
  const engagementScore = popularityComponent(entity, network) / 100;
  const personalizationBoost = computeUserAffinity(entity, session, vector);
  const graphCentralityScore = computeGraphCentrality(entity.id).graphCentralityScore;
  const influenceScore = computeInfluenceScore(entity.id, entity);

  let fused =
    searchRelevanceScore * FUSION_WEIGHTS.searchRelevance +
    hairQooScore * FUSION_WEIGHTS.hairQooScore +
    verifiedTrust * FUSION_WEIGHTS.verifiedTrust +
    engagementScore * FUSION_WEIGHTS.engagement +
    personalizationBoost * FUSION_WEIGHTS.personalization +
    graphCentralityScore * FUSION_WEIGHTS.graphCentrality;

  const languageBoost = semanticMatchScore(querySemantic, entity) * FUSION_WEIGHTS.language;
  fused += languageBoost;

  const userCountry = session.preferredCountries?.[0] ?? ctx.userCountry ?? null;
  fused = applyCountryBiasBoost(entity, userCountry, fused);
  const regionalBoost = getRegionContext(entity, userCountry).regionMatch ? FUSION_WEIGHTS.regional : 0;
  fused += regionalBoost;

  const scoreBreakdown = {
    searchRelevanceScore,
    hairQooScore,
    verifiedTrust,
    engagementScore,
    personalizationBoost,
    graphCentralityScore,
    influenceScore,
    regionalBoost,
    languageBoost,
    fused: Math.min(1, fused),
  };

  return {
    globalIntelligenceScore: Math.min(1, Math.round(fused * 1000) / 1000),
    scoreBreakdown,
    regionContext: getRegionContext(entity, userCountry),
    languageContext: { queryLanguage: querySemantic.language, entityLanguage: entity.language },
  };
}

export function rankByGlobalIntelligence(entities, query, userId = null, ctx = {}) {
  return entities
    .map((entity) => {
      const g = computeGlobalIntelligenceScore(entity, query, userId, ctx);
      return {
        ...entity,
        globalIntelligenceScore: g.globalIntelligenceScore,
        globalBrain: g,
      };
    })
    .sort((a, b) => b.globalIntelligenceScore - a.globalIntelligenceScore);
}

export { FUSION_WEIGHTS };
