/**
 * In-memory entity cache — keeps queries.js synchronous for static frontend.
 * Hydrates from Supabase on boot when configured.
 * ETAP 6.5: provider state, users, passport, search_index, single brain init.
 */

import { MOCK_ENTITIES } from "./entities.js";
import { fetchAllEntities, fetchSearchIndexScores } from "./api.js";
import { applyDataConfig, resolveProvider } from "./config.js";
import { enrichEntityPool } from "../intelligence/entity-intelligence.js";
import { setRuntimeProvider } from "./provider-state.js";
import { ensureSessionUser, getRuntimeUserEntity } from "./users-store.js";
import { initPassportStore } from "./passport-store.js";
import { hydrateAllAwardVotes } from "../intelligence/awards-system.js";
import { getDataSessionId } from "./interactions.js";

let entityPool = MOCK_ENTITIES;
let provider = "mock";
let ready = false;
let initPromise = null;
let brainInitPromise = null;

export function getEntityPool() {
  return entityPool;
}

export function getDataProvider() {
  return provider;
}

export function isDataReady() {
  return ready;
}

export { getRuntimeUserEntity };

function withTimeout(promise, ms, label = "operation") {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
}

function applySearchIndexBoosts(scoreMap) {
  if (!scoreMap?.size) return;
  entityPool = entityPool.map((entity) => {
    const boost = scoreMap.get(entity.id);
    if (boost == null) return entity;
    return {
      ...entity,
      searchIndexScore: boost,
      ranking: { ...(entity.ranking ?? {}), searchIndexBoost: boost },
    };
  });
}

async function initGlobalBrainOnce(pool) {
  if (brainInitPromise) return brainInitPromise;
  brainInitPromise = (async () => {
    const { initGlobalBrain } = await import("../intelligence/global/index.js");
    return initGlobalBrain(pool, { force: true });
  })();
  return brainInitPromise;
}

async function loadConfig() {
  if (typeof window !== "undefined" && window.__HAIRQOO_DATA_CONFIG) {
    applyDataConfig(window.__HAIRQOO_DATA_CONFIG);
  }
  try {
    const mod = await import("./config.local.js");
    if (mod.DATA_CONFIG_LOCAL) applyDataConfig(mod.DATA_CONFIG_LOCAL);
  } catch {
    /* optional */
  }
}

export async function initDataLayer() {
  if (ready) return { provider, count: entityPool.length };
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await loadConfig();
    provider = resolveProvider();
    setRuntimeProvider(provider);

    if (provider === "supabase") {
      try {
        const rows = await withTimeout(fetchAllEntities(), 8000, "Supabase fetch");
        if (rows.length > 0) {
          entityPool = enrichEntityPool(rows);
        } else {
          console.warn("[HairQoo] Supabase empty — using mock entities");
          entityPool = enrichEntityPool(MOCK_ENTITIES);
          provider = "mock-fallback";
        }
      } catch (err) {
        console.warn("[HairQoo] Supabase fetch failed — mock fallback:", err.message);
        entityPool = enrichEntityPool(MOCK_ENTITIES);
        provider = "mock-fallback";
      }
    } else {
      entityPool = enrichEntityPool(MOCK_ENTITIES);
    }

    setRuntimeProvider(provider);
    const sessionId = getDataSessionId();

    await ensureSessionUser(sessionId);
    const userEntity = getRuntimeUserEntity();
    if (userEntity && !entityPool.some((e) => e.type === "user")) {
      entityPool = [...entityPool, userEntity];
    }

    await initPassportStore(sessionId);

    if (provider === "supabase") {
      const indexScores = await fetchSearchIndexScores();
      applySearchIndexBoosts(indexScores);
      await hydrateAllAwardVotes();
    }

    ready = true;
    await initGlobalBrainOnce(entityPool);

    if (typeof window !== "undefined") {
      window.__HAIRQOO_DATA = { provider, count: entityPool.length, ready: true };
      window.dispatchEvent(new CustomEvent("hairqoo:data-ready", { detail: { provider, count: entityPool.length } }));
    }
    return { provider, count: entityPool.length };
  })();

  return initPromise;
}

/** Force refresh from Supabase (admin / post-migration). */
export async function refreshDataLayer() {
  ready = false;
  initPromise = null;
  brainInitPromise = null;
  return initDataLayer();
}
