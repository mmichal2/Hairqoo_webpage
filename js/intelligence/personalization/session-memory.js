/**
 * ETAP 5 — Session memory engine (client-side, static-site safe).
 */

import { readStore, writeStore } from "../session-store.js?version=6.6.0";
import { getDataSessionId } from "../../data/interactions.js?version=6.6.0";

const MAX_LIST = 80;

function emptySession(userId = null) {
  return {
    userId,
    viewedEntities: [],
    clickedEntities: [],
    savedEntities: [],
    recentSearches: [],
    preferredCategories: [],
    preferredCountries: [],
    preferredLanguages: [],
    ignoredEntities: [],
    entityDwell: {},
  };
}

function pushUnique(list, value, max = MAX_LIST) {
  if (!value) return list;
  const next = [value, ...list.filter((v) => v !== value)];
  return next.slice(0, max);
}

function bumpPref(list, value, max = 12) {
  if (!value) return list;
  const filtered = list.filter((v) => v !== value);
  return [value, ...filtered].slice(0, max);
}

export function initSession(userId = null) {
  const id = userId ?? getDataSessionId();
  writeStore((store) => {
    if (!store.personalization?.session?.userId) {
      store.personalization = store.personalization ?? {};
      store.personalization.session = emptySession(id);
    } else {
      store.personalization.session.userId = id;
    }
    return store;
  });
  return getSessionContext(id);
}

export function getSessionContext(userId = null) {
  const id = userId ?? getDataSessionId();
  const session = readStore().personalization?.session ?? emptySession(id);
  return { ...session, userId: session.userId ?? id };
}

export function resetSession(userId = null) {
  const id = userId ?? getDataSessionId();
  writeStore((store) => {
    store.personalization = store.personalization ?? {};
    store.personalization.session = emptySession(id);
    return store;
  });
  return getSessionContext(id);
}

/**
 * @param {{ type: string, entityId?: string, meta?: object }} event
 */
export function updateSessionMemory(event, userId = null) {
  const id = userId ?? getDataSessionId();
  const type = event.type;
  const entityId = event.entityId ?? event.meta?.entityId ?? null;
  const meta = event.meta ?? {};

  writeStore((store) => {
    store.personalization = store.personalization ?? {};
    const session = { ...emptySession(id), ...(store.personalization.session ?? {}), userId: id };

    if (type === "view" || type === "view_entity") {
      if (entityId) session.viewedEntities = pushUnique(session.viewedEntities, entityId);
    }
    if (type === "click" || type === "click_entity") {
      if (entityId) session.clickedEntities = pushUnique(session.clickedEntities, entityId);
    }
    if (type === "save" || type === "save_entity") {
      if (entityId) session.savedEntities = pushUnique(session.savedEntities, entityId);
    }
    if (type === "search" || type === "search_query") {
      const q = meta.query ?? meta.searchQuery;
      if (q) session.recentSearches = pushUnique(session.recentSearches, q, 30);
    }
    if (type === "vote" || type === "vote_award") {
      if (meta.category) session.preferredCategories = bumpPref(session.preferredCategories, meta.category);
    }
    if (meta.entityType || meta.category) {
      session.preferredCategories = bumpPref(session.preferredCategories, meta.entityType ?? meta.category);
    }
    if (meta.country) session.preferredCountries = bumpPref(session.preferredCountries, meta.country);
    if (meta.language) session.preferredLanguages = bumpPref(session.preferredLanguages, meta.language);
    if (type === "ignore" && entityId) {
      session.ignoredEntities = pushUnique(session.ignoredEntities, entityId, 40);
    }
    if ((type === "dwell" || type === "time_spent_entity") && entityId) {
      session.entityDwell = {
        ...session.entityDwell,
        [entityId]: (session.entityDwell[entityId] ?? 0) + (meta.seconds ?? 3),
      };
    }

    store.personalization.session = session;
    return store;
  });

  return getSessionContext(id);
}

export function storeInteractionEvent(userId, eventType, entityId, metadata = {}) {
  return updateSessionMemory({ type: eventType, entityId, meta: metadata }, userId);
}
