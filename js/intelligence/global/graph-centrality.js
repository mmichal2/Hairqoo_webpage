/**
 * ETAP 6 — Graph centrality + influence metrics.
 */

import { readStore, writeStore } from "../session-store.js";
import { getEntityGraph, getEntityConnections } from "./entity-graph.js";
import { getHairQooScoreValue, interactionVelocity } from "../score-system.js";
import { getVerifiedStatus } from "../verified-trust.js";
import { getEntityPool } from "../../data/data-source.js";

function cacheCentrality(entityId, metrics) {
  writeStore((store) => {
    store.brain = store.brain ?? {};
    store.brain.centralityCache = store.brain.centralityCache ?? {};
    store.brain.centralityCache[entityId] = metrics;
    return store;
  });
}

export function computeGraphCentrality(entityId) {
  const cached = readStore().brain?.centralityCache?.[entityId];
  if (cached) return cached;

  const graph = getEntityGraph();
  const nodeCount = Object.keys(graph.nodes).length || 1;
  const connections = getEntityConnections(entityId);

  const degree = connections.length / Math.max(nodeCount - 1, 1);
  const inDegree = connections.filter((e) => e.to === entityId).length;
  const outDegree = connections.filter((e) => e.from === entityId).length;
  const weightSum = connections.reduce((s, e) => s + (e.weight ?? 1), 0);
  const connectivityWeight = Math.min(1, weightSum / 10);

  const interactionCentrality = Math.min(1, interactionVelocity(entityId));
  const verifiedBoost = getVerifiedStatus({ id: entityId, verified: graph.nodes[entityId]?.verified }).verified
    ? 0.08
    : 0;

  const metrics = {
    degreeCentrality: Math.round(degree * 1000) / 1000,
    inDegree,
    outDegree,
    interactionCentrality: Math.round(interactionCentrality * 1000) / 1000,
    connectivityWeight: Math.round(connectivityWeight * 1000) / 1000,
    graphCentralityScore: Math.min(
      1,
      Math.round((degree * 0.45 + connectivityWeight * 0.35 + interactionCentrality * 0.2 + verifiedBoost) * 1000) / 1000
    ),
  };

  cacheCentrality(entityId, metrics);
  return metrics;
}

export function computeInfluenceScore(entityId, entity = null) {
  const pool = getEntityPool();
  const e = entity ?? pool.find((x) => x.id === entityId);
  const centrality = computeGraphCentrality(entityId);
  const hq = e ? getHairQooScoreValue(e, pool) / 100 : 0.4;
  const trust = e && getVerifiedStatus(e).verified ? 0.1 : 0;
  const engagement = e ? Math.min(1, (e.engagement?.views ?? 0) / 5000) : 0;

  return Math.min(
    1,
    Math.round(
      (centrality.graphCentralityScore * 0.4 + hq * 0.35 + engagement * 0.15 + trust) * 1000
    ) / 1000
  );
}

export function warmupCentralityCache(entities = null) {
  const pool = entities ?? getEntityPool();
  return pool.map((e) => ({ id: e.id, ...computeGraphCentrality(e.id), influence: computeInfluenceScore(e.id, e) }));
}
