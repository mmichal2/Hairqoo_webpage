/**
 * ETAP 6 — RAG retrieval engine (static-site, no LLM server).
 */

import { searchEntities, tokenize, haystack } from "../../data/search-engine.js?version=6.6.0";
import { rankSearchResultsPersonalized } from "../personalization/personalized-search.js?version=6.6.0";
import { getEntityPool } from "../../data/data-source.js?version=6.6.0";
import { getDataSessionId } from "../../data/interactions.js?version=6.6.0";
import { enhanceAIContext } from "../personalization/ai-personalization.js?version=6.6.0";
import { findRelatedEntities, getEntityConnections } from "./entity-graph.js?version=6.6.0";
import { mapSemanticMeaningAcrossLanguages, semanticMatchScore } from "./semantic-layer.js?version=6.6.0";
import { computeGlobalIntelligenceScore } from "./global-scoring.js?version=6.6.0";
import { getEntityIntelligenceContract } from "../entity-intelligence.js?version=6.6.0";

function entityToChunk(entity, query, userId, network) {
  const global = computeGlobalIntelligenceScore(entity, query, userId, { network });
  return {
    id: entity.id,
    type: entity.type,
    title: entity.title,
    text: [entity.title, entity.description, (entity.tags ?? []).join(" ")].filter(Boolean).join(" — "),
    score: global.globalIntelligenceScore,
    intelligence: getEntityIntelligenceContract(entity, network),
    scoreBreakdown: global.scoreBreakdown,
  };
}

export function rankKnowledgeChunks(query, candidates, userId = null, ctx = {}) {
  const id = userId ?? getDataSessionId();
  const semantic = mapSemanticMeaningAcrossLanguages(query);
  const network = ctx.network ?? getEntityPool();

  return candidates
    .map((entity) => {
      const semanticScore = semanticMatchScore(semantic, entity);
      const chunk = entityToChunk(entity, query, id, network);
      const finalScore = chunk.score * 0.7 + semanticScore * 0.3;
      return { ...chunk, semanticScore, finalScore };
    })
    .sort((a, b) => b.finalScore - a.finalScore);
}

export function retrieveContext(query, userId = null, options = {}) {
  const id = userId ?? getDataSessionId();
  const network = getEntityPool();
  const semantic = mapSemanticMeaningAcrossLanguages(query);
  const searchQuery = semantic.normalizedQuery || query;

  const base = searchEntities(searchQuery, options.filters ?? {}, {
    limit: options.limit ?? 24,
    network,
    lang: semantic.language,
  });

  const personalized = rankSearchResultsPersonalized(searchQuery, base, id, {
    network,
    lang: semantic.language,
  });

  const top = personalized.slice(0, 12);
  const relatedEntities = [];
  const graphContext = [];

  for (const entity of top.slice(0, 5)) {
    const related = findRelatedEntities(entity.id, options.graphDepth ?? 1, network);
    relatedEntities.push(...related.map((r) => r.entity));
    graphContext.push({
      entityId: entity.id,
      connections: getEntityConnections(entity.id),
      related: related.slice(0, 4),
    });
  }

  const uniqueRelated = [...new Map(relatedEntities.map((e) => [e.id, e])).values()];
  const userContext = enhanceAIContext(id, query);
  const rankedChunks = rankKnowledgeChunks(query, [...top, ...uniqueRelated], id, { network });

  return {
    query,
    querySemantic: semantic,
    entities: top,
    relatedEntities: uniqueRelated,
    graphContext,
    userContext,
    rankedChunks: rankedChunks.slice(0, options.chunkLimit ?? 16),
  };
}

export function buildContextWindow(userId, query, options = {}) {
  const rag = retrieveContext(query, userId, options);
  const tokens = tokenize(query);
  const windowSize = options.maxChunks ?? 8;

  return {
    ...rag,
    contextWindow: rag.rankedChunks.slice(0, windowSize).map((c) => ({
      chunkId: c.id,
      type: c.type,
      title: c.title,
      excerpt: c.text.slice(0, 280),
      score: c.finalScore,
      haystackMatch: tokens.some((t) => haystack({ title: c.title, description: c.text, tags: [] }).includes(t)),
    })),
  };
}
