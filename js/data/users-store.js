/**
 * ETAP 6.5 — Session users ↔ Supabase users table + runtime user entity.
 */

import { DATA_CONFIG } from "./config.js?version=6.6.0";
import { supabaseRequest, buildQuery } from "./supabase-client.js?version=6.6.0";
import { isRemoteDatastoreActive } from "./provider-state.js?version=6.6.0";
import { getDataSessionId } from "./interactions.js?version=6.6.0";

let sessionUser = null;
let runtimeUserEntity = null;

export function getSessionUser() {
  return sessionUser;
}

export function getRuntimeUserEntity() {
  return runtimeUserEntity;
}

function buildUserEntity(sessionId, displayName = "Guest") {
  return {
    id: `user-${sessionId}`,
    type: "user",
    title: displayName,
    description: "HairQoo passport holder — personalized ecosystem member.",
    country: null,
    language: "pl",
    tags: ["passport", "member"],
    media: [{ type: "image", url: "./assets/images/sections/hero-home.jpg", alt: displayName }],
    verified: false,
    score: 0,
    engagement: { views: 0, likes: 0, saves: 0, shares: 0 },
    ownerId: sessionId,
    typeData: { sessionId, role: "student" },
  };
}

export async function ensureSessionUser(sessionId = null) {
  const sid = sessionId ?? getDataSessionId();

  if (!isRemoteDatastoreActive()) {
    sessionUser = { id: sid, legacy_id: sid, role: "student", display_name: "Guest" };
    runtimeUserEntity = buildUserEntity(sid);
    return sessionUser;
  }

  try {
    const rows = await supabaseRequest(DATA_CONFIG.tables.users, {
      query: buildQuery({ select: "*", legacy_id: `eq.${sid}`, limit: "1" }),
    });
    if (rows?.[0]) {
      sessionUser = rows[0];
    } else {
      const inserted = await supabaseRequest(DATA_CONFIG.tables.users, {
        method: "POST",
        body: {
          legacy_id: sid,
          role: "student",
          display_name: "Guest",
          profile: { sessionId: sid },
          passport_data: {},
        },
        prefer: "return=representation",
      });
      sessionUser = Array.isArray(inserted) ? inserted[0] : inserted;
    }
    runtimeUserEntity = buildUserEntity(sid, sessionUser.display_name ?? "Guest");
    runtimeUserEntity.typeData = {
      ...runtimeUserEntity.typeData,
      userUuid: sessionUser.id,
      role: sessionUser.role,
    };
    return sessionUser;
  } catch (err) {
    console.warn("[HairQoo] ensureSessionUser failed:", err.message);
    sessionUser = { id: sid, legacy_id: sid, role: "student", display_name: "Guest" };
    runtimeUserEntity = buildUserEntity(sid);
    return sessionUser;
  }
}
