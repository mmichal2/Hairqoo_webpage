/**
 * Production data access layer — Supabase with mock fallback.
 * ETAP 2: schema-backed reads/writes; no UI logic.
 */

import { DATA_CONFIG, resolveProvider, isSupabaseConfigured, applyDataConfig } from "./config.js";
import { supabaseRequest, supabaseRpc, buildQuery } from "./supabase-client.js";
import { rowToEntity, rowsToEntities, entityToRow } from "./entity-mapper.js";
import { MOCK_ENTITIES } from "./entities.js";

export { isSupabaseConfigured, resolveProvider };

export function isSupabaseEnabled() {
  return resolveProvider() === "supabase";
}

async function loadOptionalConfig() {
  if (typeof window !== "undefined" && window.__HAIRQOO_DATA_CONFIG) {
    applyDataConfig(window.__HAIRQOO_DATA_CONFIG);
  }
  try {
    const mod = await import("./config.local.js");
    if (mod.DATA_CONFIG_LOCAL) applyDataConfig(mod.DATA_CONFIG_LOCAL);
  } catch {
    /* optional local config */
  }
}

/**
 * @param {string} [type]
 * @param {{ country?: string, language?: string, tags?: string[], limit?: number, offset?: number }} [filters]
 */
export async function getEntities(type, filters = {}) {
  await loadOptionalConfig();
  if (!isSupabaseEnabled()) {
    return filterMockEntities(type, filters);
  }

  const t = DATA_CONFIG.tables.entities;
  const params = {
    select: "*",
    order: "ranking->>hairQooScore.desc.nullslast,created_at.desc",
  };
  if (type) params.type = `eq.${type === "academy" ? "education" : type}`;
  if (filters.country) params.country = `eq.${filters.country}`;
  if (filters.language) params.language = `eq.${filters.language}`;
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.offset) params.offset = String(filters.offset);
  if (filters.tags?.length) params.tags = `cs.{${filters.tags.join(",")}}`;

  const rows = await supabaseRequest(t, { query: buildQuery(params) });
  let entities = rowsToEntities(rows);
  if (type === "academy") entities = entities.filter((e) => e.type === "academy" || e.id?.startsWith("academy"));
  return entities;
}

/** Fetch all entities for in-memory cache (static site sync queries). */
export async function fetchAllEntities() {
  await loadOptionalConfig();
  if (!isSupabaseEnabled()) return [...MOCK_ENTITIES];
  const rows = await supabaseRequest(DATA_CONFIG.tables.entities, {
    query: buildQuery({ select: "*", limit: "500" }),
  });
  return rowsToEntities(rows);
}

export async function getEntityById(id, type = null) {
  await loadOptionalConfig();
  if (!isSupabaseEnabled()) {
    if (type) return MOCK_ENTITIES.find((e) => e.id === id && e.type === type) ?? null;
    return MOCK_ENTITIES.find((e) => e.id === id) ?? null;
  }

  const params = { select: "*", legacy_id: `eq.${id}`, limit: "1" };
  const rows = await supabaseRequest(DATA_CONFIG.tables.entities, { query: buildQuery(params) });
  const entity = rowToEntity(rows?.[0]);
  if (type && entity && entity.type !== type) return null;
  return entity;
}

/**
 * @param {string} id — legacy_id
 * @param {{ views?: number, clicks?: number, saves?: number, shares?: number }} metrics
 */
export async function updateEntityMetrics(id, metrics) {
  await loadOptionalConfig();
  if (!isSupabaseEnabled()) return { ok: true, provider: "mock" };

  try {
    await supabaseRpc("increment_entity_metrics", {
      p_legacy_id: id,
      p_views: metrics.views ?? 0,
      p_clicks: metrics.clicks ?? 0,
      p_saves: metrics.saves ?? 0,
      p_shares: metrics.shares ?? 0,
    });
    return { ok: true, provider: "supabase" };
  } catch {
    const rows = await supabaseRequest(DATA_CONFIG.tables.entities, {
      query: buildQuery({ select: "metrics", legacy_id: `eq.${id}`, limit: "1" }),
    });
    const current = rows?.[0]?.metrics ?? {};
    const next = {
      views: (current.views ?? 0) + (metrics.views ?? 0),
      clicks: (current.clicks ?? 0) + (metrics.clicks ?? 0),
      saves: (current.saves ?? 0) + (metrics.saves ?? 0),
      shares: (current.shares ?? 0) + (metrics.shares ?? 0),
    };
    await supabaseRequest(DATA_CONFIG.tables.entities, {
      method: "PATCH",
      query: buildQuery({ legacy_id: `eq.${id}` }),
      body: { metrics: next, updated_at: new Date().toISOString() },
      prefer: "return=minimal",
    });
    return { ok: true, provider: "supabase" };
  }
}

export async function getUserPassport(userId) {
  await loadOptionalConfig();
  if (!isSupabaseEnabled()) return null;

  const byUser = await supabaseRequest(DATA_CONFIG.tables.passportProgress, {
    query: buildQuery({ select: "*", user_id: `eq.${userId}`, limit: "1" }),
  });
  if (byUser?.[0]) return normalizePassportRow(byUser[0]);
  return null;
}

export async function getPassportBySession(sessionId) {
  await loadOptionalConfig();
  if (!isSupabaseEnabled()) return null;
  const rows = await supabaseRequest(DATA_CONFIG.tables.passportProgress, {
    query: buildQuery({ select: "*", session_id: `eq.${sessionId}`, limit: "1" }),
  });
  return rows?.[0] ? normalizePassportRow(rows[0]) : null;
}

export async function updateUserXP(userId, xpDelta, patch = {}) {
  await loadOptionalConfig();
  if (!isSupabaseEnabled()) return { ok: true, provider: "mock" };

  const XP_PER_LEVEL = 1000;
  const existing = (await getUserPassport(userId)) ?? {
    user_id: userId,
    xp: 0,
    level: 1,
    completed_events: [],
    completed_education: [],
    achievements: [],
  };

  const xp = (existing.xp ?? 0) + xpDelta;
  const level = Math.min(100, Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1));
  const body = {
    user_id: userId,
    xp,
    level,
    completed_events: patch.completedEvents ?? existing.completed_events ?? [],
    completed_education: patch.completedEducation ?? existing.completed_education ?? [],
    achievements: patch.achievements ?? existing.achievements ?? [],
    updated_at: new Date().toISOString(),
  };

  await supabaseRequest(DATA_CONFIG.tables.passportProgress, {
    method: "POST",
    query: buildQuery({ on_conflict: "user_id" }),
    body,
    prefer: "resolution=merge-duplicates,return=representation",
  });
  return { ok: true, xp, level, provider: "supabase" };
}

/** Search via precomputed search_index (optional; falls back to client filter). */
export async function searchIndexed({ query, country, language, limit = 50 }) {
  await loadOptionalConfig();
  if (!isSupabaseEnabled()) return null;

  const params = {
    select: "entity_legacy_id,weighted_score,entities(*)",
    order: "weighted_score.desc",
    limit: String(limit),
  };
  if (query) params.keyword_index = `fts.${query}`;
  if (country) params.country_boost = `gte.0`;
  if (language) params.language_boost = `gte.0`;

  try {
    const rows = await supabaseRequest(DATA_CONFIG.tables.searchIndex, { query: buildQuery(params) });
    return rowsToEntities(rows.map((r) => r.entities).filter(Boolean));
  } catch {
    return null;
  }
}

/** Upsert entities from mock (migration / admin seed). */
export async function upsertEntities(entities) {
  await loadOptionalConfig();
  if (!isSupabaseEnabled()) return { count: 0, provider: "mock" };
  const rows = entities.map(entityToRow);
  await supabaseRequest(DATA_CONFIG.tables.entities, {
    method: "POST",
    query: buildQuery({ on_conflict: "legacy_id" }),
    body: rows,
    prefer: "resolution=merge-duplicates,return=minimal",
  });
  return { count: rows.length, provider: "supabase" };
}

function normalizePassportRow(row) {
  return {
    userId: row.user_id,
    sessionId: row.session_id,
    xp: row.xp ?? 0,
    level: row.level ?? 1,
    completedEvents: row.completed_events ?? [],
    completedEducation: row.completed_education ?? [],
    achievements: row.achievements ?? [],
    updatedAt: row.updated_at,
  };
}

function filterMockEntities(type, filters) {
  let pool = [...MOCK_ENTITIES];
  if (type) pool = pool.filter((e) => e.type === type);
  if (filters.country) pool = pool.filter((e) => e.country === filters.country);
  if (filters.language) pool = pool.filter((e) => e.language === filters.language);
  if (filters.tags?.length) pool = pool.filter((e) => filters.tags.some((t) => e.tags?.includes(t)));
  if (filters.limit) pool = pool.slice(0, filters.limit);
  return pool;
}
