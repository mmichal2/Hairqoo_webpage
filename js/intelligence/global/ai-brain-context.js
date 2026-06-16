/**
 * ETAP 6 — AI brain context + global output contract.
 */

import { enhanceAIContext, personalizedAIResponse } from "../personalization/ai-personalization.js";
import { buildContextWindow, retrieveContext } from "./rag-engine.js";
import { findRelatedEntities, getEntityConnections } from "./entity-graph.js";
import { rankByGlobalIntelligence } from "./global-scoring.js";
import { detectQueryLanguage } from "./semantic-layer.js";
import { getEntityPool } from "../../data/data-source.js";
import { getDataSessionId } from "../../data/interactions.js";

export function buildAIContext(query, userId = null) {
  const id = userId ?? getDataSessionId();
  const etap5 = enhanceAIContext(id, query);
  const rag = buildContextWindow(id, query);

  return {
    ...etap5,
    rag,
    graph: {
      nodeCount: Object.keys(rag.graphContext ?? {}).length,
      connections: rag.graphContext,
    },
    languageContext: rag.querySemantic,
    globalBrain: true,
  };
}

export function buildGlobalBrainResponse(entities, query, userId = null) {
  const id = userId ?? getDataSessionId();
  const pool = getEntityPool();
  const ranked = rankByGlobalIntelligence(entities, query, id, { network: pool });

  const relatedEntities = [];
  const graphConnections = [];

  for (const entity of ranked.slice(0, 5)) {
    relatedEntities.push(...findRelatedEntities(entity.id, 1, pool).map((r) => r.entity));
    graphConnections.push({
      entityId: entity.id,
      edges: getEntityConnections(entity.id),
    });
  }

  const uniqueRelated = [...new Map(relatedEntities.map((e) => [e.id, e])).values()];

  return {
    entities: ranked,
    relatedEntities: uniqueRelated,
    graphConnections,
    scoreBreakdown: ranked.map((e) => e.globalBrain?.scoreBreakdown).filter(Boolean),
    regionContext: ranked.map((e) => e.globalBrain?.regionContext).filter(Boolean),
    languageContext: {
      queryLanguage: detectQueryLanguage(query),
      entities: ranked.map((e) => e.globalBrain?.languageContext).filter(Boolean),
    },
  };
}

export function enhanceAIResponseWithGraph(query, userContext, entities) {
  const id = userContext?.userId ?? getDataSessionId();
  const personalized = personalizedAIResponse(query, userContext, entities);
  const global = buildGlobalBrainResponse(personalized, query, id);

  return global.entities.map((entity) => ({
    ...entity,
    globalBrainMeta: {
      globalIntelligenceScore: entity.globalIntelligenceScore,
      scoreBreakdown: entity.globalBrain?.scoreBreakdown,
      regionContext: entity.globalBrain?.regionContext,
    },
  }));
}
