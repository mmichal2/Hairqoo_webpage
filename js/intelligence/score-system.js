/** HairQoo Score — ETAP 4 core intelligence engine (0–100, deterministic). */

import { readStore, writeStore } from "./session-store.js?version=6.6.0";
import { getVerifiedStatus } from "./verified-trust.js?version=6.6.0";

export const SCORE_TIERS = {
  ELITE: { min: 90, label: "ELITE" },
  HIGH: { min: 75, label: "HIGH" },
  MID: { min: 50, label: "MID" },
  BASE: { min: 0, label: "BASE" },
};

export const SCORE_REFERENCE_DATE = new Date("2026-06-16T12:00:00.000Z");

const SIGNAL_WEIGHTS = {
  engagement: 0.25,
  quality: 0.25,
  trust: 0.15,
  popularity: 0.2,
  recency: 0.15,
};

const SCORABLE_TYPES = new Set([
  "educator",
  "event",
  "product",
  "education",
  "academy",
  "salon",
  "brand",
]);

export function getScoreTier(score) {
  if (score >= SCORE_TIERS.ELITE.min) return SCORE_TIERS.ELITE.label;
  if (score >= SCORE_TIERS.HIGH.min) return SCORE_TIERS.HIGH.label;
  if (score >= SCORE_TIERS.MID.min) return SCORE_TIERS.MID.label;
  return SCORE_TIERS.BASE.label;
}

function clamp100(n) {
  return Math.min(100, Math.max(0, n));
}

function metricsOf(entity) {
  return entity.metrics ?? entity.engagement ?? {};
}

export function engagementComponent(entity) {
  const e = metricsOf(entity);
  const views = Math.min((e.views ?? 0) / 5000, 1);
  const clicks = Math.min((e.clicks ?? e.likes ?? 0) / 600, 1);
  const saves = Math.min((e.saves ?? 0) / 250, 1);
  const shares = Math.min((e.shares ?? 0) / 150, 1);
  return clamp100((views * 0.4 + clicks * 0.3 + saves * 0.2 + shares * 0.1) * 100);
}

function descriptionQuality(text) {
  const len = String(text ?? "").trim().length;
  if (len >= 120) return 100;
  if (len >= 60) return 75;
  if (len >= 25) return 50;
  if (len > 0) return 30;
  return 0;
}

export function qualityComponent(entity) {
  let pts = 0;
  if (entity.title?.length > 2) pts += 15;
  if (entity.tags?.length >= 2) pts += 15;
  if (entity.country) pts += 10;
  if (entity.city || entity.location) pts += 10;
  const media = entity.media ?? [];
  pts += Math.min(25, media.length * 12);
  const hasVideo = media.some((m) => m?.type === "video" || String(m?.url ?? "").includes("video"));
  if (hasVideo) pts += 10;
  pts += descriptionQuality(entity.description) * 0.15;
  return clamp100(pts);
}

/** Trust metadata quality — separate from verified ranking boost (ETAP 4 rule). */
export function trustComponent(entity) {
  let pts = 50;
  if (entity.rating != null) pts = clamp100((entity.rating / 5) * 100);
  const { verified, level } = getVerifiedStatus(entity);
  if (verified && level !== "none" && level !== "pending") pts = clamp100(pts * 0.85 + 15);
  if (entity.verificationType) pts = clamp100(pts + 5);
  return pts;
}

export function popularityComponent(entity, network = null) {
  const e = metricsOf(entity);
  const base = Math.min((e.views ?? 0) / 3500, 1) * 0.55 + Math.min((e.clicks ?? e.likes ?? 0) / 450, 1) * 0.45;
  const velocity = interactionVelocity(entity.id);
  let trending = 0.5;
  if (network?.length) {
    const avgViews =
      network.reduce((s, x) => s + (metricsOf(x).views ?? 0), 0) / Math.max(network.length, 1);
    trending = Math.min(1, (e.views ?? 0) / Math.max(avgViews, 1));
  }
  return clamp100((base * 0.5 + velocity * 0.3 + trending * 0.2) * 100);
}

export function interactionVelocity(entityId) {
  const sig = readStore().scoreSignals[entityId];
  if (!sig) return 0.35;
  const recent = (sig.views ?? 0) + (sig.clicks ?? 0) * 2 + (sig.saves ?? 0) * 3;
  return Math.min(1, recent / 80);
}

export function recencyComponent(entity) {
  const ref = SCORE_REFERENCE_DATE.getTime();
  const rankingRecency = entity.ranking?.recencyScore;
  if (rankingRecency != null && rankingRecency > 0) return clamp100(rankingRecency);

  if (entity.dateEvent) {
    const days = (new Date(entity.dateEvent).getTime() - ref) / 86_400_000;
    if (days >= 0 && days <= 180) return clamp100(100 - days * 0.35);
    if (days > 180) return clamp100(70 - Math.min(40, (days - 180) * 0.1));
    return clamp100(60 + Math.min(30, Math.abs(days) * 0.05));
  }
  if (entity.dateCreated) {
    const ageDays = (ref - new Date(entity.dateCreated).getTime()) / 86_400_000;
    return clamp100(100 - Math.min(80, ageDays * 0.15));
  }
  return 50;
}

function weightedBreakdown(breakdown) {
  let total = 0;
  for (const [key, weight] of Object.entries(SIGNAL_WEIGHTS)) {
    total += (breakdown[key] ?? 0) * weight;
  }
  return clamp100(total);
}

/**
 * Full HairQoo Score result (ETAP 4 contract).
 * Verified boost is NOT applied to base score — used in search/trust layers separately.
 */
export function computeHairQooScore(entity, network = null) {
  if (!entity) {
    return {
      score: 0,
      tier: SCORE_TIERS.BASE.label,
      breakdown: { engagement: 0, quality: 0, trust: 0, popularity: 0, recency: 0 },
    };
  }

  if (!SCORABLE_TYPES.has(entity.type) && entity.score == null) {
    const fallback = clamp100((metricsOf(entity).views ?? 0) / 50);
    return {
      score: Math.round(fallback),
      tier: getScoreTier(fallback),
      breakdown: {
        engagement: fallback,
        quality: 40,
        trust: 40,
        popularity: fallback,
        recency: 40,
      },
    };
  }

  const breakdown = {
    engagement: engagementComponent(entity),
    quality: qualityComponent(entity),
    trust: trustComponent(entity),
    popularity: popularityComponent(entity, network),
    recency: recencyComponent(entity),
  };

  const blended = weightedBreakdown(breakdown);
  const legacy = entity.ranking?.hairQooScore ?? entity.score;
  const score = Math.round(clamp100(blended * 0.88 + (legacy ?? blended) * 0.12));

  return { score, tier: getScoreTier(score), breakdown };
}

/** ETAP 4 primary API — returns full score object. */
export function getHairQooScore(entity, network = null) {
  return computeHairQooScore(entity, network);
}

/** Numeric score for sorting / ETAP 3 search (backward compatible). */
export function getHairQooScoreValue(entity, network = null) {
  return computeHairQooScore(entity, network).score;
}

export function updateScore(entityId, signals = {}) {
  writeStore((store) => {
    const prev = store.scoreSignals[entityId] ?? {};
    store.scoreSignals[entityId] = {
      views: (prev.views ?? 0) + (signals.views ?? 0),
      clicks: (prev.clicks ?? 0) + (signals.clicks ?? 0),
      saves: (prev.saves ?? 0) + (signals.saves ?? 0),
      manual: signals.manual ?? prev.manual,
      updatedAt: signals.updatedAt ?? SCORE_REFERENCE_DATE.toISOString(),
    };
    return store;
  });
}

export function enrichEntityScore(entity, network = null) {
  const result = computeHairQooScore(entity, network);
  return {
    ...entity,
    hairqooScore: result.score,
    scoreTier: result.tier,
    scoreBreakdown: result.breakdown,
    verifiedStatus: getVerifiedStatus(entity),
  };
}
