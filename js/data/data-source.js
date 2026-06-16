/**
 * In-memory entity cache — keeps queries.js synchronous for static frontend.
 * Hydrates from Supabase on boot when configured.
 */

import { MOCK_ENTITIES } from "./entities.js";
import { fetchAllEntities, resolveProvider } from "./api.js";
import { applyDataConfig } from "./config.js";
import { enrichEntityPool } from "../intelligence/entity-intelligence.js";

let entityPool = MOCK_ENTITIES;
let provider = "mock";
let ready = false;
let initPromise = null;

export function getEntityPool() {
  return entityPool;
}

export function getDataProvider() {
  return provider;
}

export function isDataReady() {
  return ready;
}

function withTimeout(promise, ms, label = "operation") {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
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

    ready = true;
    try {
      const { initGlobalBrain } = await import("../intelligence/global/index.js");
      initGlobalBrain(entityPool);
    } catch (err) {
      console.warn("[HairQoo] Global brain init deferred:", err.message);
    }
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
  return initDataLayer();
}
