/** ETAP 6 — Global Brain Layer public API. */

export {
  createEntityGraph,
  addEntityRelation,
  getEntityConnections,
  findRelatedEntities,
  getEntityGraph,
  strengthenEdgeFromInteraction,
} from "./entity-graph.js?version=6.6.0";

export { retrieveContext, buildContextWindow, rankKnowledgeChunks } from "./rag-engine.js?version=6.6.0";

export {
  getRegionalRanking,
  normalizeGlobalScores,
  applyCountryBiasBoost,
  getRegionContext,
  resolveGlobalRegion,
  GLOBAL_REGIONS,
} from "./regional-intelligence.js?version=6.6.0";

export {
  detectQueryLanguage,
  mapSemanticMeaningAcrossLanguages,
  unifyEntityTagsAcrossLanguages,
  semanticMatchScore,
} from "./semantic-layer.js?version=6.6.0";

export {
  computeGlobalIntelligenceScore,
  rankByGlobalIntelligence,
  FUSION_WEIGHTS,
} from "./global-scoring.js?version=6.6.0";

export { computeGraphCentrality, computeInfluenceScore, warmupCentralityCache } from "./graph-centrality.js?version=6.6.0";

export { buildAIContext, enhanceAIResponseWithGraph, buildGlobalBrainResponse } from "./ai-brain-context.js?version=6.6.0";

export { TAG_SEMANTIC_MAP, RELATION_TYPES } from "./constants.js?version=6.6.0";

import { createEntityGraph, getEntityGraph } from "./entity-graph.js?version=6.6.0";
import { warmupCentralityCache } from "./graph-centrality.js?version=6.6.0";
import { getEntityPool } from "../../data/data-source.js?version=6.6.0";

let brainReady = false;

export function initGlobalBrain(entities = null, options = {}) {
  const force = options.force ?? Boolean(entities);
  if (brainReady && !force) {
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
