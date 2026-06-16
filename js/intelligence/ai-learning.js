/** AI learning layer — ETAP 5 personalization integration. */

import { readStore, writeStore, getSessionProfile } from "./session-store.js";
import { updateScore } from "./score-system.js";
import { updatePassportProgress, getPassportUser } from "./passport-system.js";
import { getDataSessionId } from "../data/interactions.js";
import {
  updateLearningModel,
} from "./personalization/learning-loop.js";
import { getUserPreferenceVector } from "./personalization/user-vector.js";
import { getSessionContext } from "./personalization/session-memory.js";
import { compareEntityToUserVector, buildUserVector } from "./personalization/user-vector.js";
import { getRankingWeights } from "./personalization/learning-loop.js";

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
  const userId = getDataSessionId();
  return {
    interactions: store.ai.interactions.slice(-50),
    profile: getSessionProfile(),
    passport: getPassportUser(),
    session: getSessionContext(userId),
    userVector: buildUserVector(userId),
    rankingWeights: getRankingWeights(userId),
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

/**
 * Log interaction — ETAP 5 unified entry (backward compatible signature).
 * @param {string} type
 * @param {string|null} entityId
 * @param {object} [meta]
 */
export function logUserInteraction(type, entityId, meta = {}) {
  const userId = meta.userId ?? getDataSessionId();
  const entry = {
    type,
    entityId: entityId ?? null,
    meta: { ...meta, userId },
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

  updateLearningModel(userId, { type, entityId, meta: entry.meta });

  if (entityId) {
    import("./global/entity-graph.js")
      .then(({ strengthenEdgeFromInteraction }) => strengthenEdgeFromInteraction(entityId, type))
      .catch(() => {});
  }

  if (entityId && type === "save") {
    updatePassportProgress(getPassportUser(), { type: "entity_save", entityId });
  }
  if (type === "view" && entityId) {
    updatePassportProgress(getPassportUser(), { type: "entity_view", entityId });
  }

  queueMicrotask(() => {
    import("../data/interactions.js")
      .then(({ trackInteractionRemote }) => trackInteractionRemote(type, entityId, entry.meta))
      .catch(() => {});
  });

  return entry;
}

export function improveRankingFromFeedback(entities, ctx = {}) {
  const userId = ctx.userId ?? getDataSessionId();
  const session = getSessionContext(userId);
  const vector = buildUserVector(userId);
  const weights = getRankingWeights(userId);
  const profile = ctx.profile ?? getSessionProfile();
  const store = readStore();
  const dwell = store.ai.entityDwell;
  const saved = new Set([...store.ai.savedEntities, ...session.savedEntities]);

  return entities.map((entity) => {
    let boost = 0;
    if (saved.has(entity.id)) boost += weights.savedSimilarity ?? 0.1;
    if (dwell[entity.id] || session.entityDwell?.[entity.id]) {
      const d = dwell[entity.id] ?? session.entityDwell?.[entity.id] ?? 0;
      boost += Math.min(0.12, d * 0.008);
    }
    boost += compareEntityToUserVector(entity, vector) * (weights.personalization ?? 0.12);
    if (profile.preferredTypes.includes(entity.type)) boost += weights.typeAffinity ?? 0.06;
    const tagOverlap = (entity.tags ?? []).filter((t) => profile.preferredTags.includes(t)).length;
    boost += Math.min(0.08, tagOverlap * 0.03);

    const base = entity.finalScore ?? entity.relevanceScore ?? entity.personalizedScore ?? 0;
    return { ...entity, finalScore: Math.min(1, base + boost), feedbackBoost: boost };
  });
}

export function inferBehavioralTypeHint() {
  const userId = getDataSessionId();
  const vector = buildUserVector(userId);
  const top = Object.entries(vector.entityTypeWeights).sort((a, b) => b[1] - a[1])[0];
  if (top) return top[0];
  const { preferredTypes } = getSessionProfile();
  return preferredTypes[0] ?? null;
}

export { getUserPreferenceVector };
