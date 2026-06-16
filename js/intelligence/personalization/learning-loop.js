/**
 * ETAP 5 — Behavioral learning loop + dynamic ranking weights.
 */

import { readStore, writeStore } from "../session-store.js";
import { updateSessionMemory } from "./session-memory.js";
import { updateUserVector, getUserPreferenceVector } from "./user-vector.js";
import { updateScore } from "../score-system.js";
import { getDataSessionId } from "../../data/interactions.js";

const BASE_RANKING_WEIGHTS = {
  personalization: 0.12,
  typeAffinity: 0.08,
  countryAffinity: 0.05,
  languageAffinity: 0.04,
  savedSimilarity: 0.1,
  viewHistory: 0.06,
};

export function updateLearningModel(userId, interactionEvent) {
  const id = userId ?? getDataSessionId();
  updateSessionMemory(interactionEvent, id);
  updateUserVector(interactionEvent, id);
  adjustRankingWeights(id, interactionEvent);

  const { type, entityId } = interactionEvent;
  if (entityId && (type === "click" || type === "click_entity")) {
    updateScore(entityId, { clicks: 1 });
  }
  if (entityId && (type === "view" || type === "view_entity")) {
    updateScore(entityId, { views: 1 });
  }
  if (entityId && (type === "save" || type === "save_entity")) {
    updateScore(entityId, { saves: 1 });
  }

  return getUserPreferenceVector(id);
}

export function adjustRankingWeights(userId, lastEvent = null) {
  const id = userId ?? getDataSessionId();
  const vector = getUserPreferenceVector(id);
  const weights = { ...BASE_RANKING_WEIGHTS };

  const topType = topKey(vector.entityTypeWeights);
  if (topType) weights.typeAffinity = Math.min(0.15, weights.typeAffinity + 0.03);

  if (lastEvent?.type === "ignore" && lastEvent.meta?.entityType) {
    const t = lastEvent.meta.entityType;
    if (vector.entityTypeWeights[t] > 0.2) {
      weights.typeAffinity = Math.max(0.02, weights.typeAffinity - 0.04);
    }
  }

  if (topKey(vector.countryWeights)) weights.countryAffinity = Math.min(0.1, weights.countryAffinity + 0.02);
  if (topKey(vector.languageWeights)) weights.languageAffinity = Math.min(0.08, weights.languageAffinity + 0.02);

  writeStore((store) => {
    store.personalization = store.personalization ?? {};
    store.personalization.rankingWeights = store.personalization.rankingWeights ?? {};
    store.personalization.rankingWeights[id] = weights;
    return store;
  });

  return weights;
}

export function getRankingWeights(userId = null) {
  const id = userId ?? getDataSessionId();
  return readStore().personalization?.rankingWeights?.[id] ?? { ...BASE_RANKING_WEIGHTS };
}

function topKey(map) {
  const entries = Object.entries(map ?? {}).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? null;
}
