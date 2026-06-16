/** AI learning layer — session feedback + ranking adaptation. */

import { readStore, writeStore, getSessionProfile } from "./session-store.js";
import { updateScore } from "./score-system.js";
import { updatePassportProgress, getPassportUser } from "./passport-system.js";

const MAX_INTERACTIONS = 200;
const MAX_SEARCH_HISTORY = 30;

const INTERACTION_WEIGHTS = {
  click: 0.12,
  save: 0.22,
  search: 0.05,
  vote: 0.18,
  dwell: 0.15,
  view: 0.08,
};

export function getAIContext() {
  const store = readStore();
  return {
    interactions: store.ai.interactions.slice(-50),
    profile: getSessionProfile(),
    passport: getPassportUser(),
  };
}

export function updateAIContext(patch = {}) {
  writeStore((store) => {
    if (patch.searchQuery) {
      store.ai.searchHistory = [...store.ai.searchHistory, patch.searchQuery].slice(-MAX_SEARCH_HISTORY);
    }
    return store;
  });
  return getAIContext();
}

function bumpAffinity(map, key, amount = 1) {
  if (!key) return;
  map[key] = (map[key] ?? 0) + amount;
}

export function logUserInteraction(type, entityId, meta = {}) {
  const entry = {
    type,
    entityId: entityId ?? null,
    meta,
    at: new Date("2026-06-16T12:00:00.000Z").toISOString(),
  };

  writeStore((store) => {
    store.ai.interactions = [...store.ai.interactions, entry].slice(-MAX_INTERACTIONS);

    if (meta.entityType) bumpAffinity(store.ai.typeAffinity, meta.entityType, INTERACTION_WEIGHTS[type] ?? 1);
    if (meta.country) bumpAffinity(store.ai.countryAffinity, meta.country, (INTERACTION_WEIGHTS[type] ?? 1) * 0.8);
    for (const tag of meta.tags ?? []) bumpAffinity(store.ai.tagAffinity, tag, (INTERACTION_WEIGHTS[type] ?? 1) * 0.5);

    if (type === "search" && meta.query) {
      store.ai.searchHistory = [...store.ai.searchHistory, meta.query].slice(-MAX_SEARCH_HISTORY);
    }
    if (type === "save" && entityId) {
      store.ai.savedEntities = [...new Set([...store.ai.savedEntities, entityId])].slice(-50);
    }
    if (type === "dwell" && entityId) {
      store.ai.entityDwell[entityId] = (store.ai.entityDwell[entityId] ?? 0) + (meta.seconds ?? 3);
    }

    return store;
  });

  if (entityId && (type === "click" || type === "view")) {
    updateScore(entityId, { clicks: type === "click" ? 1 : 0, views: type === "view" ? 1 : 0 });
  }
  if (entityId && type === "save") {
    updateScore(entityId, { saves: 1 });
    updatePassportProgress(getPassportUser(), { type: "entity_save", entityId });
  }
  if (type === "view" && entityId) {
    updatePassportProgress(getPassportUser(), { type: "entity_view", entityId });
  }

  return entry;
}

/**
 * Re-rank entities using lightweight behavioral feedback.
 * @param {Array<{ id: string, finalScore?: number, relevanceScore?: number, type?: string, tags?: string[] }>} entities
 */
export function improveRankingFromFeedback(entities, ctx = {}) {
  const profile = ctx.profile ?? getSessionProfile();
  const store = readStore();
  const dwell = store.ai.entityDwell;
  const saved = new Set(store.ai.savedEntities);

  return entities.map((entity) => {
    let boost = 0;
    if (saved.has(entity.id)) boost += 0.1;
    if (dwell[entity.id]) boost += Math.min(0.12, dwell[entity.id] * 0.008);
    if (profile.preferredTypes.includes(entity.type)) boost += 0.06;
    const tagOverlap = (entity.tags ?? []).filter((t) => profile.preferredTags.includes(t)).length;
    boost += Math.min(0.08, tagOverlap * 0.03);

    const base = entity.finalScore ?? entity.relevanceScore ?? 0;
    return { ...entity, finalScore: Math.min(1, base + boost), feedbackBoost: boost };
  });
}

/** Intent hint from accumulated behavior (for aiAsk). */
export function inferBehavioralTypeHint() {
  const { preferredTypes } = getSessionProfile();
  return preferredTypes[0] ?? null;
}
