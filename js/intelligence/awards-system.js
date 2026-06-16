/** Awards — seasonal competition + vote aggregation engine. */

import { readStore, writeStore } from "./session-store.js";
import { getHairQooScore } from "./score-system.js";
import { logUserInteraction } from "./ai-learning.js";

export const AWARD_CATEGORIES = {
  educator_of_year: { key: "educatorOfYear", entityType: "educator", cycle: "yearly" },
  event_of_year: { key: "eventOfYear", entityType: "event", cycle: "yearly" },
  product_of_year: { key: "productOfYear", entityType: "product", cycle: "yearly" },
};

const REF_DATE = new Date("2026-06-16T12:00:00.000Z");

export function getCurrentSeason(cycle = "yearly") {
  const y = REF_DATE.getFullYear();
  const m = REF_DATE.getMonth();
  if (cycle === "monthly") return `${y}-${String(m + 1).padStart(2, "0")}`;
  return String(y);
}

function categoryMeta(category) {
  const meta = AWARD_CATEGORIES[category];
  if (!meta) throw new Error(`Unknown award category: ${category}`);
  return meta;
}

function cycleKey(category) {
  const { cycle } = categoryMeta(category);
  return `${category}:${getCurrentSeason(cycle)}`;
}

/** Cast a vote (one per category per cycle, client-side). */
export function vote(entityId, category) {
  const key = cycleKey(category);
  writeStore((store) => {
    if (!store.awards.votes[key]) store.awards.votes[key] = {};
    const bucket = store.awards.votes[key];
    bucket[entityId] = (bucket[entityId] ?? 0) + 1;
    store.awards.cycles[key] = getCurrentSeason(categoryMeta(category).cycle);
    return store;
  });
  logUserInteraction("vote", entityId, { category });
  return getAwardRankings(category);
}

/** Ranked list for a category in the current season. */
export function getAwardRankings(category) {
  const key = cycleKey(category);
  const bucket = readStore().awards.votes[key] ?? {};
  return Object.entries(bucket)
    .map(([entityId, votes]) => ({ entityId, votes, awardScore: votes }))
    .sort((a, b) => b.votes - a.votes || a.entityId.localeCompare(b.entityId));
}

/** Combined base quality + community votes. */
export function computeAwardScore(entity, category = null) {
  const base = getHairQooScore(entity) / 100;
  if (!category) return base;

  const rankings = getAwardRankings(category);
  const row = rankings.find((r) => r.entityId === entity.id);
  const voteBoost = row ? Math.min(0.4, row.votes * 0.08) : 0;
  return Math.min(1, base * 0.6 + voteBoost + (entity.verified ? 0.05 : 0));
}

/** Leading nominee for UI (votes first, then HairQoo Score). */
export function getAwardNominee(category, candidates = []) {
  const { entityType } = categoryMeta(category);
  const pool = candidates.filter((e) => e.type === entityType);
  if (!pool.length) return null;

  const rankings = getAwardRankings(category);
  const voteMap = new Map(rankings.map((r) => [r.entityId, r.votes]));

  return [...pool].sort((a, b) => {
    const va = voteMap.get(a.id) ?? 0;
    const vb = voteMap.get(b.id) ?? 0;
    if (vb !== va) return vb - va;
    return computeAwardScore(b, category) - computeAwardScore(a, category);
  })[0];
}

export function hasVoted(category) {
  const key = cycleKey(category);
  const bucket = readStore().awards.votes[key] ?? {};
  return Object.keys(bucket).length > 0;
}

export function getUserVote(category) {
  const key = cycleKey(category);
  const bucket = readStore().awards.votes[key] ?? {};
  const top = Object.entries(bucket).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : null;
}
