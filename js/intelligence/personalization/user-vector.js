/**
 * ETAP 5 — User preference vector (lightweight behavioral model).
 */

import { readStore, writeStore } from "../session-store.js?version=6.6.0";
import { getSessionContext } from "./session-memory.js?version=6.6.0";
import { getDataSessionId } from "../../data/interactions.js?version=6.6.0";

const EVENT_WEIGHTS = {
  view_entity: 0.08,
  view: 0.08,
  click_entity: 0.18,
  click: 0.18,
  save_entity: 0.28,
  save: 0.28,
  search_query: 0.05,
  search: 0.05,
  vote_award: 0.2,
  vote: 0.2,
  time_spent_entity: 0.15,
  dwell: 0.15,
  ignore: -0.12,
};

function emptyVector() {
  return {
    categoryWeights: {},
    countryWeights: {},
    languageWeights: {},
    entityTypeWeights: {},
    tagWeights: {},
  };
}

function bump(map, key, delta) {
  if (!key) return;
  map[key] = Math.max(0, (map[key] ?? 0) + delta);
}

export function buildUserVector(userId = null) {
  const id = userId ?? getDataSessionId();
  const stored = readStore().personalization?.userVectors?.[id];
  if (stored) return stored;

  const session = getSessionContext(id);
  const vector = emptyVector();

  for (const _ of session.clickedEntities) bump(vector.entityTypeWeights, "clicked", 0.01);
  for (const cat of session.preferredCategories) bump(vector.categoryWeights, cat, 0.5);
  for (const c of session.preferredCountries) bump(vector.countryWeights, c, 0.5);
  for (const l of session.preferredLanguages) bump(vector.languageWeights, l, 0.5);

  return vector;
}

export function updateUserVector(interactionEvent, userId = null) {
  const id = userId ?? getDataSessionId();
  const { type, entityId, meta = {} } = interactionEvent;
  const weight = EVENT_WEIGHTS[type] ?? 0.1;

  writeStore((store) => {
    store.personalization = store.personalization ?? {};
    store.personalization.userVectors = store.personalization.userVectors ?? {};
    const vector = { ...emptyVector(), ...(store.personalization.userVectors[id] ?? buildUserVector(id)) };

    if (meta.entityType) bump(vector.entityTypeWeights, meta.entityType, weight);
    if (meta.category) bump(vector.categoryWeights, meta.category, weight);
    if (meta.country) bump(vector.countryWeights, meta.country, weight * 0.9);
    if (meta.language) bump(vector.languageWeights, meta.language, weight * 0.85);
    for (const tag of meta.tags ?? []) bump(vector.tagWeights, tag, weight * 0.45);
    if (type === "ignore" && meta.entityType) {
      bump(vector.entityTypeWeights, meta.entityType, weight);
    }

    store.personalization.userVectors[id] = vector;
    return store;
  });

  return buildUserVector(id);
}

/** @returns {number} 0–1 affinity */
export function compareEntityToUserVector(entity, userVector) {
  if (!entity || !userVector) return 0;

  let score = 0;
  let weights = 0;

  const typeW = userVector.entityTypeWeights[entity.type] ?? 0;
  if (typeW) {
    score += Math.min(1, typeW) * 0.35;
    weights += 0.35;
  }

  const countryW = userVector.countryWeights[entity.country] ?? 0;
  if (countryW) {
    score += Math.min(1, countryW) * 0.25;
    weights += 0.25;
  }

  const langW = userVector.languageWeights[entity.language] ?? 0;
  if (langW) {
    score += Math.min(1, langW) * 0.2;
    weights += 0.2;
  }

  const tagOverlap = (entity.tags ?? []).reduce((s, t) => s + (userVector.tagWeights[t] ?? 0), 0);
  if (tagOverlap > 0) {
    score += Math.min(1, tagOverlap / 3) * 0.2;
    weights += 0.2;
  }

  return weights > 0 ? Math.min(1, score / weights) : 0;
}

export function getUserPreferenceVector(userId = null) {
  return buildUserVector(userId ?? getDataSessionId());
}
