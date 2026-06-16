/** Verified trust layer — ETAP 4 (independent from base HairQoo Score). */

export const VERIFICATION_TYPES = {
  educator: "educator_verified",
  event: "event_verified",
  product: "product_verified",
  education: "academy_verified",
  academy: "academy_verified",
  salon: "salon_verified",
  brand: "brand_verified",
};

export const VERIFICATION_LEVELS = {
  none: "none",
  verified: "verified",
  premium_verified: "premium_verified",
  /** @deprecated use none */
  pending: "none",
};

const LEVEL_BOOST = {
  none: 0,
  pending: 0,
  verified: 5,
  premium_verified: 12,
};

const SEARCH_BOOST = {
  none: 0,
  pending: 0,
  verified: 0.08,
  premium_verified: 0.15,
};

const TRUST_MULTIPLIER = {
  none: 0.35,
  pending: 0.35,
  verified: 0.72,
  premium_verified: 1,
};

export function resolveVerificationType(entity) {
  if (entity.verificationType) return entity.verificationType;
  return VERIFICATION_TYPES[entity.type] ?? null;
}

export function resolveVerificationLevel(entity) {
  if (entity.verificationLevel) {
    return entity.verificationLevel === "pending" ? VERIFICATION_LEVELS.none : entity.verificationLevel;
  }
  if (!entity.verified && !entity.ranking?.verified) return VERIFICATION_LEVELS.none;
  const score = entity.ranking?.hairQooScore ?? entity.score ?? 0;
  if (score >= 90 || (entity.rating ?? 0) >= 4.8) return VERIFICATION_LEVELS.premium_verified;
  return VERIFICATION_LEVELS.verified;
}

/** @returns {{ verified: boolean, verificationType: string|null, level: string, trustLevel: string }} */
export function getVerifiedStatus(entity) {
  const level = resolveVerificationLevel(entity);
  return {
    verified: level !== VERIFICATION_LEVELS.none,
    verificationType: resolveVerificationType(entity),
    level,
    trustLevel: level,
  };
}

/** Ranking boost only — does NOT mutate base HairQoo Score (ETAP 4). */
export function applyVerifiedBoost(score, verifiedLevel) {
  const level = verifiedLevel === "pending" ? "none" : verifiedLevel;
  const boost = LEVEL_BOOST[level] ?? 0;
  return Math.min(100, Math.max(0, score + boost));
}

export function getVerifiedSearchBoost(entity) {
  const { level } = getVerifiedStatus(entity);
  return SEARCH_BOOST[level] ?? SEARCH_BOOST.none;
}

/** 0–1 trust score for intelligence contracts + ETAP 5 signals. */
export function computeTrustScore(entity) {
  const { level, verificationType } = getVerifiedStatus(entity);
  let score = TRUST_MULTIPLIER[level] ?? TRUST_MULTIPLIER.none;
  if (verificationType) score = Math.min(1, score + 0.05);
  if (entity.rating != null) score = Math.min(1, score * 0.7 + (entity.rating / 5) * 0.3);
  return Math.round(score * 1000) / 1000;
}
