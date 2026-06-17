/** Awards — ETAP 4 global competition engine. */

import { readStore, writeStore } from "./session-store.js?version=6.6.0";
import { getHairQooScoreValue, interactionVelocity } from "./score-system.js?version=6.6.0";
import { getVerifiedStatus, computeTrustScore } from "./verified-trust.js?version=6.6.0";
import { logUserInteraction } from "./ai-learning.js?version=6.6.0";
import { trackInteractionRemote } from "../data/interactions.js?version=6.6.0";
import { submitAwardVote, fetchAwardVoteCounts } from "../data/api.js?version=6.6.0";
import { getDataSessionId } from "../data/interactions.js?version=6.6.0";
import { getSessionUser } from "../data/users-store.js?version=6.6.0";
import { isRemoteDatastoreActive } from "../data/provider-state.js?version=6.6.0";

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

function voteCountFor(entityId, category) {
  const remote = remoteVoteCounts[category];
  if (remote && remote[entityId] != null) return remote[entityId];
  const bucket = readStore().awards.votes[cycleKey(category)] ?? {};
  return bucket[entityId] ?? 0;
}

/** Remote award_votes cache (ETAP 6.5). */
const remoteVoteCounts = {};

export async function hydrateAwardVotes(category) {
  if (!isRemoteDatastoreActive()) return null;
  const season = getCurrentSeason(categoryMeta(category).cycle);
  const counts = await fetchAwardVoteCounts(category, season);
  if (counts) remoteVoteCounts[category] = counts;
  return counts;
}

export async function hydrateAllAwardVotes() {
  for (const category of Object.keys(AWARD_CATEGORIES)) {
    await hydrateAwardVotes(category).catch(() => {});
  }
}

/**
 * Cast award vote — award_votes (remote) or local store (offline mock).
 */
export function voteForAward(userId, entityId, category) {
  const sessionId = userId ?? getDataSessionId();
  const season = getCurrentSeason(categoryMeta(category).cycle);
  const uvKey = `${category}:${season}`;

  writeStore((store) => {
    if (!store.awards.userVotes) store.awards.userVotes = {};
    store.awards.userVotes[uvKey] = entityId;
    if (!isRemoteDatastoreActive()) {
      const key = cycleKey(category);
      if (!store.awards.votes[key]) store.awards.votes[key] = {};
      store.awards.votes[key][entityId] = (store.awards.votes[key][entityId] ?? 0) + 1;
      store.awards.cycles[key] = season;
    }
    return store;
  });

  if (isRemoteDatastoreActive()) {
    const userUuid = getSessionUser()?.id ?? null;
    submitAwardVote({
      category,
      season,
      entityLegacyId: entityId,
      sessionId,
      userId: userUuid,
    })
      .then(() => hydrateAwardVotes(category))
      .catch((err) => console.warn("[HairQoo] award vote failed:", err.message));
  }

  logUserInteraction("vote", entityId, { category, userId: sessionId });
  trackInteractionRemote("vote", entityId, { category, userId: sessionId });

  return getAwardRankings(category);
}

/** @deprecated use voteForAward */
export function vote(entityId, category) {
  return voteForAward(null, entityId, category);
}

export function computeAwardScore(entity, category) {
  if (!entity || !category) return 0;

  const votes = voteCountFor(entity.id, category);
  const voteScore = Math.min(1, votes / 10);
  const hq = getHairQooScoreValue(entity) / 100;
  const trust = computeTrustScore(entity);
  const velocity = interactionVelocity(entity.id);
  const verifiedBonus = getVerifiedStatus(entity).verified ? 0.05 : 0;

  const total =
    voteScore * 0.5 + hq * 0.22 + trust * 0.13 + velocity * 0.1 + verifiedBonus;

  return Math.min(1, Math.round(total * 1000) / 1000);
}

/** Ranked list with computed award scores for current season. */
export function getAwardRankings(category, candidates = []) {
  const key = cycleKey(category);
  const bucket = readStore().awards.votes[key] ?? {};
  const entityIds = new Set([
    ...Object.keys(bucket),
    ...candidates.map((e) => e.id),
  ]);

  const byId = new Map(candidates.map((e) => [e.id, e]));

  return Array.from(entityIds)
    .map((entityId) => {
      const entity = byId.get(entityId) ?? { id: entityId };
      const votes = bucket[entityId] ?? 0;
      const awardScore = computeAwardScore(entity, category);
      return { entityId, votes, awardScore, category, season: getCurrentSeason(categoryMeta(category).cycle) };
    })
    .sort((a, b) => b.awardScore - a.awardScore || b.votes - a.votes || a.entityId.localeCompare(b.entityId));
}

export function getAwardNominee(category, candidates = []) {
  const { entityType } = categoryMeta(category);
  const pool = candidates.filter((e) => e.type === entityType);
  if (!pool.length) return null;

  const rankings = getAwardRankings(category, pool);
  const scoreMap = new Map(rankings.map((r) => [r.entityId, r.awardScore]));

  return [...pool].sort(
    (a, b) => (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0)
  )[0];
}

export function hasVoted(category) {
  const uvKey = `${category}:${getCurrentSeason(categoryMeta(category).cycle)}`;
  return Boolean(readStore().awards.userVotes?.[uvKey]);
}

export function getUserVote(category) {
  const uvKey = `${category}:${getCurrentSeason(categoryMeta(category).cycle)}`;
  return readStore().awards.userVotes?.[uvKey] ?? null;
}

export function computeAwardRankPotential(entity, categories = Object.keys(AWARD_CATEGORIES)) {
  const relevant = categories.filter((cat) => categoryMeta(cat).entityType === entity.type);
  if (!relevant.length) return 0;
  return Math.max(...relevant.map((cat) => computeAwardScore(entity, cat)));
}
