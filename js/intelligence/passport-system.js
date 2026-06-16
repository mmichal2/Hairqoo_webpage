/** Passport career graph — XP, levels, progression (client-side). */

import { readStore, writeStore } from "./session-store.js";

export const XP_RULES = {
  event_attend: 120,
  education_complete: 200,
  certification: 350,
  achievement: 150,
  award_win: 800,
  award_vote: 25,
  entity_view: 5,
  entity_save: 40,
};

const MAX_LEVEL = 100;
const XP_PER_LEVEL = 1000;

export function getDefaultUser() {
  return {
    completedEvents: [],
    attendedEducation: [],
    certifications: [],
    achievements: [],
    xpPoints: 0,
    level: 1,
  };
}

export function getPassportUser() {
  return readStore().passport ?? getDefaultUser();
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
  xp += user.completedEvents.length * XP_RULES.event_attend;
  xp += user.attendedEducation.length * XP_RULES.education_complete;
  xp += user.certifications.length * XP_RULES.certification;
  xp += user.achievements.length * XP_RULES.achievement;
  xp += user.xpPoints ?? 0;
  return xp;
}

export function getUserLevel(xp) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  return Math.min(MAX_LEVEL, Math.max(1, level));
}

export function xpToNextLevel(xp) {
  const level = getUserLevel(xp);
  if (level >= MAX_LEVEL) return 0;
  const currentFloor = (level - 1) * XP_PER_LEVEL;
  return level * XP_PER_LEVEL - xp + (xp - currentFloor > 0 ? 0 : 0);
}

export function getLevelProgress(xp) {
  const level = getUserLevel(xp);
  const floor = (level - 1) * XP_PER_LEVEL;
  const ceiling = level >= MAX_LEVEL ? floor + XP_PER_LEVEL : level * XP_PER_LEVEL;
  const span = ceiling - floor || XP_PER_LEVEL;
  return {
    level,
    xp,
    floor,
    ceiling,
    progress: level >= MAX_LEVEL ? 1 : (xp - floor) / span,
    xpToNext: level >= MAX_LEVEL ? 0 : ceiling - xp,
  };
}

/**
 * Apply a career event to the user passport.
 * @param {object} user
 * @param {{ type: string, entityId?: string, label?: string, meta?: object }} event
 */
export function updatePassportProgress(user, event) {
  const next = {
    ...getDefaultUser(),
    ...user,
    completedEvents: [...(user.completedEvents ?? [])],
    attendedEducation: [...(user.attendedEducation ?? [])],
    certifications: [...(user.certifications ?? [])],
    achievements: [...(user.achievements ?? [])],
  };

  const stamp = { ...event, at: event.at ?? new Date("2026-06-16T12:00:00.000Z").toISOString() };

  switch (event.type) {
    case "event_attend":
      if (event.entityId && !next.completedEvents.some((e) => e.entityId === event.entityId)) {
        next.completedEvents.push(stamp);
        next.xpPoints = (next.xpPoints ?? 0) + XP_RULES.event_attend;
      }
      break;
    case "education_complete":
      if (event.entityId && !next.attendedEducation.some((e) => e.entityId === event.entityId)) {
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
    default:
      break;
  }

  const totalXp = calculateUserXP(next);
  next.level = getUserLevel(totalXp);
  return persistUser(next);
}

/** Full progression snapshot for consumers (no UI). */
export function getPassportProgress() {
  const user = getPassportUser();
  const totalXp = calculateUserXP(user);
  return {
    user,
    totalXp,
    ...getLevelProgress(totalXp),
    timeline: [
      ...user.certifications.map((e) => ({ ...e, kind: "certification" })),
      ...user.completedEvents.map((e) => ({ ...e, kind: "event" })),
      ...user.attendedEducation.map((e) => ({ ...e, kind: "education" })),
      ...user.achievements.map((e) => ({ ...e, kind: "achievement" })),
    ].sort((a, b) => String(b.at).localeCompare(String(a.at))),
  };
}
