/** Passport engine — ETAP 4 career progression system. */

import { readStore, writeStore } from "./session-store.js";
import { getDataSessionId } from "../data/interactions.js";

export const XP_RULES = {
  event_attend: 120,
  education_complete: 200,
  certification: 350,
  achievement: 150,
  award_win: 800,
  award_vote: 25,
  entity_view: 5,
  entity_save: 40,
  engagement: 15,
};

const MAX_LEVEL = 100;
const XP_PER_LEVEL = 1000;

export function getDefaultUser() {
  return {
    userId: null,
    completedEvents: [],
    attendedEducation: [],
    certifications: [],
    achievements: [],
    awardsWon: [],
    xpPoints: 0,
    level: 1,
  };
}

export function getPassportUser(userId = null) {
  const user = readStore().passport ?? getDefaultUser();
  if (userId && user.userId && user.userId !== userId) return { ...getDefaultUser(), userId };
  return user;
}

function persistUser(user) {
  writeStore((store) => {
    store.passport = user;
    return store;
  });
  return user;
}

export function calculateUserXP(user) {
  let xp = 0;
  xp += (user.completedEvents ?? []).length * XP_RULES.event_attend;
  xp += (user.attendedEducation ?? []).length * XP_RULES.education_complete;
  xp += (user.certifications ?? []).length * XP_RULES.certification;
  xp += (user.achievements ?? []).length * XP_RULES.achievement;
  xp += (user.awardsWon ?? []).length * XP_RULES.award_win;
  xp += user.xpPoints ?? 0;
  return xp;
}

export function getUserLevel(xp) {
  return calculateUserLevel(xp).level;
}

/** ETAP 4 level API with progressToNextLevel. */
export function calculateUserLevel(xpPoints) {
  const xp = Math.max(0, xpPoints ?? 0);
  const level = Math.min(MAX_LEVEL, Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1));
  const floor = (level - 1) * XP_PER_LEVEL;
  const ceiling = level >= MAX_LEVEL ? floor + XP_PER_LEVEL : level * XP_PER_LEVEL;
  const span = ceiling - floor || XP_PER_LEVEL;
  const progressToNextLevel = level >= MAX_LEVEL ? 1 : (xp - floor) / span;
  return {
    level,
    xpPoints: xp,
    progressToNextLevel,
    xpToNext: level >= MAX_LEVEL ? 0 : ceiling - xp,
    floor,
    ceiling,
  };
}

export function getLevelProgress(xp) {
  const r = calculateUserLevel(xp);
  return {
    level: r.level,
    xp,
    floor: r.floor,
    ceiling: r.ceiling,
    progress: r.progressToNextLevel,
    xpToNext: r.xpToNext,
  };
}

function applyActivity(user, activity) {
  const next = {
    ...getDefaultUser(),
    ...user,
    completedEvents: [...(user.completedEvents ?? [])],
    attendedEducation: [...(user.attendedEducation ?? [])],
    certifications: [...(user.certifications ?? [])],
    achievements: [...(user.achievements ?? [])],
    awardsWon: [...(user.awardsWon ?? [])],
  };

  const stamp = {
    ...activity,
    at: activity.at ?? new Date("2026-06-16T12:00:00.000Z").toISOString(),
  };

  switch (activity.type) {
    case "event_attend":
      if (activity.entityId && !next.completedEvents.some((e) => e.entityId === activity.entityId)) {
        next.completedEvents.push(stamp);
        next.xpPoints = (next.xpPoints ?? 0) + XP_RULES.event_attend;
      }
      break;
    case "education_complete":
      if (activity.entityId && !next.attendedEducation.some((e) => e.entityId === activity.entityId)) {
        next.attendedEducation.push(stamp);
        next.xpPoints = (next.xpPoints ?? 0) + XP_RULES.education_complete;
      }
      break;
    case "certification":
      next.certifications.push(stamp);
      next.xpPoints = (next.xpPoints ?? 0) + XP_RULES.certification;
      break;
    case "achievement":
      next.achievements.push(stamp);
      next.xpPoints = (next.xpPoints ?? 0) + XP_RULES.achievement;
      break;
    case "award_win":
      next.awardsWon.push(stamp);
      next.achievements.push({ ...stamp, type: "award_win" });
      next.xpPoints = (next.xpPoints ?? 0) + XP_RULES.award_win;
      break;
    case "award_vote":
      next.xpPoints = (next.xpPoints ?? 0) + XP_RULES.award_vote;
      break;
    case "entity_view":
      next.xpPoints = (next.xpPoints ?? 0) + XP_RULES.entity_view;
      break;
    case "entity_save":
      next.xpPoints = (next.xpPoints ?? 0) + XP_RULES.entity_save;
      break;
    case "engagement":
      next.xpPoints = (next.xpPoints ?? 0) + XP_RULES.engagement;
      break;
    default:
      break;
  }

  const totalXp = calculateUserXP(next);
  next.level = getUserLevel(totalXp);
  return next;
}

/** @param {object} user */
export function updatePassportProgress(user, activity) {
  return persistUser(applyActivity(user, activity));
}

/** ETAP 4 — update by user/session id. */
export function updatePassportProgressById(userId, activity) {
  const resolvedId = userId ?? getDataSessionId();
  const user = { ...getPassportUser(resolvedId), userId: resolvedId };
  return persistUser(applyActivity(user, { ...activity, userId: resolvedId }));
}

export function getPassportProgress() {
  return getPassportSummary();
}

/** ETAP 4 passport summary contract. */
export function getPassportSummary(userId = null) {
  const user = getPassportUser(userId);
  const totalXp = calculateUserXP(user);
  const levelInfo = calculateUserLevel(totalXp);
  return {
    userId: user.userId ?? userId ?? getDataSessionId(),
    user,
    xpPoints: totalXp,
    level: levelInfo.level,
    progressToNextLevel: levelInfo.progressToNextLevel,
    xpToNext: levelInfo.xpToNext,
    completedEvents: user.completedEvents ?? [],
    completedEducation: user.attendedEducation ?? [],
    achievements: user.achievements ?? [],
    awardsWon: user.awardsWon ?? [],
    timeline: [
      ...(user.certifications ?? []).map((e) => ({ ...e, kind: "certification" })),
      ...(user.completedEvents ?? []).map((e) => ({ ...e, kind: "event" })),
      ...(user.attendedEducation ?? []).map((e) => ({ ...e, kind: "education" })),
      ...(user.achievements ?? []).map((e) => ({ ...e, kind: "achievement" })),
      ...(user.awardsWon ?? []).map((e) => ({ ...e, kind: "award" })),
    ].sort((a, b) => String(b.at).localeCompare(String(a.at))),
  };
}
