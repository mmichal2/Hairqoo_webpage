/**
 * Interaction tracking — feeds ETAP 3/4/5 (search, intelligence, AI).
 * Fire-and-forget; never blocks UI.
 */

import { DATA_CONFIG } from "./config.js";
import { supabaseRequest, buildQuery } from "./supabase-client.js";
import { updateEntityMetrics } from "./api.js";
import { isLocalDatastoreActive } from "./provider-state.js";

const METRIC_MAP = {
  view: { views: 1 },
  click: { clicks: 1 },
  save: { saves: 1 },
  vote: {},
  search: {},
  dwell: { views: 0 },
};

export function getDataSessionId() {
  if (typeof localStorage === "undefined") return "server";
  let id = localStorage.getItem(DATA_CONFIG.sessionKey);
  if (!id) {
    id = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(DATA_CONFIG.sessionKey, id);
  }
  return id;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value ?? ""));
}

/**
 * @param {string|null} userId
 * @param {string|null} entityId — legacy_id
 * @param {"view"|"click"|"save"|"vote"|"search"} actionType
 * @param {object} [metadata]
 */
export async function trackInteraction(userId, entityId, actionType, metadata = {}) {
  if (isLocalDatastoreActive()) {
    if (entityId && METRIC_MAP[actionType]) {
      await updateEntityMetrics(entityId, METRIC_MAP[actionType]).catch(() => {});
    }
    return { ok: true, provider: "local" };
  }

  const sessionId = getDataSessionId();
  const row = {
    user_id: userId && isUuid(userId) ? userId : null,
    session_id: sessionId,
    entity_legacy_id: entityId || null,
    action_type: actionType,
    metadata,
    created_at: new Date().toISOString(),
  };

  await supabaseRequest(DATA_CONFIG.tables.interactions, {
    method: "POST",
    body: row,
    prefer: "return=minimal",
  });

  if (entityId && METRIC_MAP[actionType]) {
    await updateEntityMetrics(entityId, METRIC_MAP[actionType]).catch(() => {});
  }

  return { ok: true, provider: "supabase" };
}

/** Bridge from client intelligence hooks (no AI logic). */
export function trackInteractionRemote(actionType, entityId, metadata = {}) {
  const userId = metadata.userId ?? null;
  return trackInteraction(userId, entityId, actionType, metadata).catch((err) => {
    console.warn("[HairQoo] trackInteraction failed:", err.message);
  });
}
