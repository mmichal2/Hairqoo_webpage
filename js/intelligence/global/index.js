/** ETAP 6 — Global Brain Layer public API. */

export {
  createEntityGraph,
  addEntityRelation,
  getEntityConnections,
  findRelatedEntities,
  getEntityGraph,
  strengthenEdgeFromInteraction,
} from "./entity-graph.js";

export { retrieveContext, buildContextWindow, rankKnowledgeChunks } from "./rag-engine.js";

export {
  getRegionalRanking,
  normalizeGlobalScores,
  applyCountryBiasBoost,
  getRegionContext,
  resolveGlobalRegion,
  GLOBAL_REGIONS,
} from "./regional-intelligence.js";

export {
  detectQueryLanguage,
  mapSemanticMeaningAcrossLanguages,
  unifyEntityTagsAcrossLanguages,
  semanticMatchScore,
} from "./semantic-layer.js";

export {
  computeGlobalIntelligenceScore,
  rankByGlobalIntelligence,
  FUSION_WEIGHTS,
} from "./global-scoring.js";

export { computeGraphCentrality, computeInfluenceScore, warmupCentralityCache } from "./graph-centrality.js";

export { buildAIContext, enhanceAIResponseWithGraph, buildGlobalBrainResponse } from "./ai-brain-context.js";

export { TAG_SEMANTIC_MAP, RELATION_TYPES } from "./constants.js";

import { createEntityGraph, getEntityGraph } from "./entity-graph.js";
import { warmupCentralityCache } from "./graph-centrality.js";
import { getEntityPool } from "../../data/data-source.js";

let brainReady = false;

export function initGlobalBrain(entities = null) {
  if (brainReady && !entities) {
    const g = getEntityGraph();
    return { ready: true, nodes: Object.keys(g.nodes ?? {}).length, edges: g.edges?.length ?? 0 };
  }
  const pool = entities ?? getEntityPool();
  const graph = createEntityGraph(pool);
  warmupCentralityCache(pool);
  brainReady = true;
  if (typeof window !== "undefined") {
    window.__HAIRQOO_BRAIN = {
      ready: true,
      edges: graph.edges.length,
      nodes: Object.keys(graph.nodes).length,
    };
    window.dispatchEvent(new CustomEvent("hairqoo:brain-ready", { detail: window.__HAIRQOO_BRAIN }));
  }
  return { ready: true, nodes: Object.keys(graph.nodes).length, edges: graph.edges.length };
}
