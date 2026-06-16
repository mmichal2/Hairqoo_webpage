/** HairQoo Score — unified quality + ranking engine (0–100, deterministic). */

import { readStore, writeStore } from "./session-store.js";
import { applyVerifiedBoost, getVerifiedStatus } from "./verified-trust.js";

export const SCORE_TIERS = {
  ELITE: { min: 90, label: "ELITE" },
  HIGH: { min: 75, label: "HIGH" },
  MID: { min: 50, label: "MID" },
  BASE: { min: 0, label: "BASE" },
};

/** Fixed reference date — scores stay deterministic across sessions. */
export const SCORE_REFERENCE_DATE = new Date("2026-06-16T12:00:00.000Z");

const WEIGHTS = {
  engagement: 0.22,
  rating: 0.14,
  completeness: 0.14,
  recency: 0.14,
  influence: 0.12,
  signals: 0.14,
  legacy: 0.10,
};

const SCORABLE_TYPES = new Set(["educator", "event", "product", "academy", "salon", "brand"]);

export function getScoreTier(score) {
  if (score >= SCORE_TIERS.ELITE.min) return SCORE_TIERS.ELITE.label;
  if (score >= SCORE_TIERS.HIGH.min) return SCORE_TIERS.HIGH.label;
  if (score >= SCORE_TIERS.MID.min) return SCORE_TIERS.MID.label;
  return SCORE_TIERS.BASE.label;
}

function clamp100(n) {
  return Math.min(100, Math.max(0, n));
}

function engagementComponent(entity) {
  const e = entity.engagement ?? {};
  const views = Math.min((e.views ?? 0) / 5000, 1);
  const clicks = Math.min((e.clicks ?? e.likes ?? 0) / 600, 1);
  const saves = Math.min((e.saves ?? 0) / 250, 1);
  return (views * 0.5 + clicks * 0.3 + saves * 0.2) * 100;
}

function ratingComponent(entity) {
  if (entity.rating == null) return 50;
  return clamp100((entity.rating / 5) * 100);
}

function completenessComponent(entity) {
  let pts = 0;
  if (entity.title?.length > 2) pts += 20;
  if (entity.description?.length > 20) pts += 25;
  if (entity.tags?.length >= 2) pts += 20;
  if (entity.media?.length) pts += 15;
  if (entity.country) pts += 10;
  if (entity.location || entity.type === "product" || entity.type === "brand") pts += 10;
  return clamp100(pts);
}

function recencyComponent(entity) {
  const ref = SCORE_REFERENCE_DATE.getTime();
  if (entity.dateEvent) {
    const eventMs = new Date(entity.dateEvent).getTime();
    const days = (eventMs - ref) / 86_400_000;
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

function influenceComponent(entity, network = null) {
  let mentions = 0;
  const titleTokens = new Set(
    String(entity.title ?? "")
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 3)
  );
  if (network?.length && titleTokens.size) {
    for (const other of network) {
      if (other.id === entity.id) continue;
      const hay = `${other.description ?? ""} ${(other.tags ?? []).join(" ")}`.toLowerCase();
      for (const tok of titleTokens) {
        if (hay.includes(tok)) mentions += 1;
      }
    }
  }
  const connectionBoost = entity.ownerId ? 8 : 0;
  return clamp100(Math.min(mentions * 4, 60) + connectionBoost + (entity.engagement?.shares ?? 0) / 80);
}

function signalsComponent(entityId) {
  const sig = readStore().scoreSignals[entityId];
  if (!sig) return 50;
  const views = Math.min((sig.views ?? 0) / 200, 1);
  const clicks = Math.min((sig.clicks ?? 0) / 50, 1);
  const saves = Math.min((sig.saves ?? 0) / 20, 1);
  const manual = sig.manual ?? 50;
  return clamp100(manual * 0.4 + (views * 0.35 + clicks * 0.15 + saves * 0.1) * 100);
}

function weightedSum(parts) {
  let total = 0;
  for (const [key, val] of Object.entries(parts)) {
    total += (WEIGHTS[key] ?? 0) * val;
  }
  return clamp100(total);
}

/**
 * Compute HairQoo Score for an entity (deterministic for same inputs).
 * @param {object} entity
 * @param {object[]} [network] — optional entity pool for cross-network influence
 */
export function getHairQooScore(entity, network = null) {
  if (!entity) return 0;
  if (!SCORABLE_TYPES.has(entity.type) && entity.score == null) {
    return clamp100((entity.engagement?.views ?? 0) / 50);
  }

  const base = weightedSum({
    engagement: engagementComponent(entity),
    rating: ratingComponent(entity),
    completeness: completenessComponent(entity),
    recency: recencyComponent(entity),
    influence: influenceComponent(entity, network),
    signals: signalsComponent(entity.id),
    legacy: entity.score ?? 50,
  });

  const { level } = getVerifiedStatus(entity);
  return Math.round(applyVerifiedBoost(base, level));
}

/** Persist engagement / manual signals that influence future score computation. */
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

/** Attach computed score + tier to entity copy (non-destructive). */
export function enrichEntityScore(entity, network = null) {
  const score = getHairQooScore(entity, network);
  return {
    ...entity,
    hairqooScore: score,
    scoreTier: getScoreTier(score),
    verifiedStatus: getVerifiedStatus(entity),
  };
}
