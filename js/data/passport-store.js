/**
 * ETAP 6.5 — Unified passport persistence (Supabase OR localStorage, never both).
 */

import { readStore, writeStore } from "../intelligence/session-store.js?version=6.6.0";
import { getPassportBySession, upsertPassportBySession } from "./api.js?version=6.6.0";
import { isRemoteDatastoreActive } from "./provider-state.js?version=6.6.0";
import { getDataSessionId } from "./interactions.js?version=6.6.0";

let passportCache = null;

function emptyUser(sessionId = null) {
  return {
    userId: sessionId,
    completedEvents: [],
    attendedEducation: [],
    certifications: [],
    achievements: [],
    awardsWon: [],
    xpPoints: 0,
    level: 1,
  };
}

function rowToUser(row, sessionId) {
  if (!row) return emptyUser(sessionId);
  return {
    userId: sessionId,
    completedEvents: row.completedEvents ?? [],
    attendedEducation: row.completedEducation ?? [],
    certifications: [],
    achievements: row.achievements ?? [],
    awardsWon: [],
    xpPoints: row.xp ?? 0,
    level: row.level ?? 1,
  };
}

export function getPassportUserSync(userId = null) {
  const id = userId ?? getDataSessionId();
  const base = passportCache ?? (isRemoteDatastoreActive() ? null : readStore().passport) ?? emptyUser(id);
  return { ...emptyUser(id), ...base, userId: base.userId ?? id };
}

export async function initPassportStore(sessionId = null) {
  const sid = sessionId ?? getDataSessionId();
  if (isRemoteDatastoreActive()) {
    try {
      const row = await getPassportBySession(sid);
      passportCache = rowToUser(row, sid);
    } catch {
      passportCache = emptyUser(sid);
    }
  } else {
    const local = readStore().passport;
    passportCache = local ? { ...emptyUser(sid), ...local, userId: sid } : emptyUser(sid);
  }
  return passportCache;
}

export function persistPassportUser(user) {
  const sid = user.userId ?? getDataSessionId();
  const next = { ...user, userId: sid };
  passportCache = next;

  if (isRemoteDatastoreActive()) {
    upsertPassportBySession(sid, next).catch((err) => {
      console.warn("[HairQoo] passport remote persist failed:", err.message);
    });
    return next;
  }

  writeStore((store) => {
    store.passport = next;
    return store;
  });
  return next;
}
