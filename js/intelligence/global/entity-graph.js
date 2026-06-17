/**
 * ETAP 6 — Global Entity Graph (directional, weighted).
 */

import { readStore, writeStore } from "../session-store.js?version=6.6.0";
import { getEntityPool } from "../../data/data-source.js?version=6.6.0";
import { getVerifiedStatus } from "../verified-trust.js?version=6.6.0";
import { RELATION_TYPES } from "./constants.js?version=6.6.0";

function emptyGraph() {
  return { nodes: {}, edges: [] };
}

function getGraphStore() {
  return readStore().brain?.graph ?? emptyGraph();
}

function persistGraph(graph) {
  writeStore((store) => {
    store.brain = store.brain ?? {};
    store.brain.graph = graph;
    return store;
  });
}

function addNode(graph, entity) {
  if (!entity?.id) return;
  graph.nodes[entity.id] = {
    id: entity.id,
    type: entity.type,
    title: entity.title,
    country: entity.country ?? null,
    language: entity.language ?? null,
    verified: Boolean(getVerifiedStatus(entity).verified),
  };
}

function addEdge(graph, from, to, relationType, weight = 1) {
  if (!from || !to || from === to || !RELATION_TYPES.has(relationType)) return;
  const verifiedBoost = (graph.nodes[from]?.verified ? 0.1 : 0) + (graph.nodes[to]?.verified ? 0.1 : 0);
  const w = Math.min(5, Math.max(0.1, weight + verifiedBoost));
  const existing = graph.edges.find(
    (e) => e.from === from && e.to === to && e.relationType === relationType
  );
  if (existing) {
    existing.weight = Math.min(5, existing.weight + w * 0.35);
    return;
  }
  graph.edges.push({ from, to, relationType, weight: w });
}

function tagOverlap(a, b) {
  const ta = new Set(a.tags ?? []);
  return (b.tags ?? []).filter((t) => ta.has(t)).length;
}

function inferRelations(graph, entities) {
  const byType = new Map();
  for (const e of entities) {
    addNode(graph, e);
    const arr = byType.get(e.type) ?? [];
    arr.push(e);
    byType.set(e.type, arr);
  }

  const educators = byType.get("educator") ?? [];
  const events = byType.get("event") ?? [];
  const products = byType.get("product") ?? [];
  const brands = byType.get("brand") ?? [];
  const salons = byType.get("salon") ?? [];
  const academies = [...(byType.get("academy") ?? []), ...(byType.get("education") ?? [])];

  for (const edu of educators) {
    for (const ac of academies) {
      if (edu.country === ac.country || tagOverlap(edu, ac) >= 1) {
        addEdge(graph, edu.id, ac.id, "teaches", 1.2);
      }
    }
    for (const ev of events) {
      const speakers = ev.typeData?.speakers ?? [];
      if (tagOverlap(edu, ev) >= 1 || speakers.includes(edu.id) || speakers.includes(edu.title)) {
        addEdge(graph, edu.id, ev.id, "appears_at", 1.4);
      }
    }
  }

  for (const prod of products) {
    const brandId = prod.typeData?.brandId ?? prod.ownerId;
    const brand = brands.find((b) => b.id === brandId || b.ownerId === brandId);
    if (brand) addEdge(graph, brand.id, prod.id, "owns", 1.5);
    for (const ac of academies) {
      if (tagOverlap(prod, ac) >= 1) addEdge(graph, prod.id, ac.id, "used_in", 1);
    }
  }

  for (const salon of salons) {
    for (const edu of educators) {
      if (edu.country === salon.country || edu.ownerId === salon.ownerId) {
        addEdge(graph, salon.id, edu.id, "employs", 1.1);
      }
    }
  }

  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const a = entities[i];
      const b = entities[j];
      const overlap = tagOverlap(a, b);
      if (overlap >= 2) addEdge(graph, a.id, b.id, "related_tag", overlap * 0.4);
      if (a.ownerId && a.ownerId === b.ownerId) addEdge(graph, a.id, b.id, "related_owner", 0.8);
      if (a.country && a.country === b.country) addEdge(graph, a.id, b.id, "same_country", 0.35);
    }
  }

  const session = readStore().personalization?.session;
  const userNode = session?.userId ? `user:${session.userId}` : null;
  const poolById = new Map(entities.map((e) => [e.id, e]));
  if (userNode) {
    graph.nodes[userNode] = {
      id: userNode,
      type: "user",
      title: userNode,
      country: null,
      language: null,
      verified: false,
    };
    for (const eid of session.clickedEntities ?? []) {
      const ent = poolById.get(eid);
      if (ent?.type === "event") addEdge(graph, userNode, eid, "attends", 1.3);
    }
    for (const eid of session.savedEntities ?? []) {
      const ent = poolById.get(eid);
      if (ent && ["academy", "education", "event"].includes(ent.type)) {
        addEdge(graph, userNode, eid, "completes", 1.4);
      }
    }
  }

  return graph;
}

export function createEntityGraph(entities = null) {
  const pool = entities ?? getEntityPool();
  const graph = inferRelations(emptyGraph(), pool);
  persistGraph(graph);
  return graph;
}

export function addEntityRelation(fromId, toId, relationType, weight = 1) {
  const graph = getGraphStore();
  addEdge(graph, fromId, toId, relationType, weight);
  persistGraph(graph);
  return graph;
}

export function getEntityConnections(entityId) {
  const graph = getGraphStore();
  return graph.edges.filter((e) => e.from === entityId || e.to === entityId);
}

export function findRelatedEntities(entityId, depth = 1, entities = null) {
  const graph = getGraphStore();
  const pool = entities ?? getEntityPool();
  const byId = new Map(pool.map((e) => [e.id, e]));
  const visited = new Set([entityId]);
  let frontier = [entityId];
  const found = [];

  for (let d = 0; d < depth; d++) {
    const next = [];
    for (const id of frontier) {
      for (const edge of graph.edges) {
        const neighbor = edge.from === id ? edge.to : edge.to === id ? edge.from : null;
        if (!neighbor || visited.has(neighbor)) continue;
        visited.add(neighbor);
        next.push(neighbor);
        const entity = byId.get(neighbor);
        if (entity) found.push({ entity, relationType: edge.relationType, weight: edge.weight, depth: d + 1 });
      }
    }
    frontier = next;
  }

  return found.sort((a, b) => b.weight - a.weight);
}

export function getEntityGraph() {
  const g = getGraphStore();
  if (!g.edges?.length) return createEntityGraph();
  return g;
}

export function strengthenEdgeFromInteraction(entityId, actionType) {
  const boost = { click: 0.15, save: 0.25, view: 0.08, vote: 0.2 }[actionType] ?? 0.05;
  const graph = getGraphStore();
  for (const edge of graph.edges) {
    if (edge.from === entityId || edge.to === entityId) {
      edge.weight = Math.min(5, edge.weight + boost);
    }
  }
  persistGraph(graph);
}
