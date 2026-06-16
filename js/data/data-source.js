/**
 * In-memory entity cache — keeps queries.js synchronous for static frontend.
 * Hydrates from Supabase on boot when configured.
 */

import { MOCK_ENTITIES } from "./entities.js";
import { fetchAllEntities, resolveProvider } from "./api.js";
import { applyDataConfig } from "./config.js";

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
        const rows = await fetchAllEntities();
        if (rows.length > 0) {
          entityPool = rows;
        } else {
          console.warn("[HairQoo] Supabase empty — using mock entities");
          entityPool = MOCK_ENTITIES;
          provider = "mock-fallback";
        }
      } catch (err) {
        console.warn("[HairQoo] Supabase fetch failed — mock fallback:", err.message);
        entityPool = MOCK_ENTITIES;
        provider = "mock-fallback";
      }
    } else {
      entityPool = MOCK_ENTITIES;
    }

    ready = true;
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
