/**
 * Smoke test ETAP 6 Global Brain (Node, no browser).
 */
import { MOCK_ENTITIES } from "../js/data/entities.js";
import { enrichEntityPool } from "../js/intelligence/entity-intelligence.js";
import {
  initGlobalBrain,
  createEntityGraph,
  findRelatedEntities,
  retrieveContext,
  buildAIContext,
  computeGraphCentrality,
  rankByGlobalIntelligence,
  detectQueryLanguage,
  mapSemanticMeaningAcrossLanguages,
} from "../js/intelligence/global/index.js";

const pool = enrichEntityPool(MOCK_ENTITIES);
const boot = initGlobalBrain(pool);
const graph = createEntityGraph(pool);

console.log("boot", boot);
console.log("graph edges", graph.edges.length, "nodes", Object.keys(graph.nodes).length);

const sample = pool[0];
const related = findRelatedEntities(sample.id, 2, pool);
console.log("related to", sample.title, related.length);

const semantic = mapSemanticMeaningAcrossLanguages("kurs balayage warsztat");
console.log("semantic", semantic.language, semantic.expandedTokens.slice(0, 5));

const rag = retrieveContext("balayage educator", "test-user", { network: pool });
console.log("rag entities", rag.entities.length, "chunks", rag.rankedChunks.length);

const ai = buildAIContext("produkt do koloryzacji", "test-user");
console.log("ai context keys", Object.keys(ai), "rag chunks", ai.rag?.contextWindow?.length);

const ranked = rankByGlobalIntelligence(pool.slice(0, 8), "balayage", "test-user", { network: pool });
console.log("top global score", ranked[0]?.globalIntelligenceScore);

const centrality = computeGraphCentrality(sample.id);
console.log("centrality", centrality.graphCentralityScore);

console.log("detect lang PL:", detectQueryLanguage("szkolenie fryzjerskie"));
console.log("OK — ETAP 6 smoke test passed");
