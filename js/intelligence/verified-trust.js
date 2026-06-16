/** Verified trust layer — identity + credibility flags (separate from score). */

export const VERIFICATION_TYPES = {
  educator: "educator_verified",
  event: "event_verified",
  product: "product_verified",
  academy: "academy_verified",
  salon: "salon_verified",
  brand: "brand_verified",
};

export const VERIFICATION_LEVELS = {
  pending: "pending",
  verified: "verified",
  premium_verified: "premium_verified",
};

const LEVEL_BOOST = {
  pending: 0,
  verified: 5,
  premium_verified: 12,
};

const SEARCH_BOOST = {
  pending: 0,
  verified: 0.08,
  premium_verified: 0.15,
};

export function resolveVerificationType(entity) {
  if (entity.verificationType) return entity.verificationType;
  return VERIFICATION_TYPES[entity.type] ?? null;
}

export function resolveVerificationLevel(entity) {
  if (entity.verificationLevel) return entity.verificationLevel;
  if (!entity.verified) return VERIFICATION_LEVELS.pending;
  if (entity.score >= 90 || entity.rating >= 4.8) return VERIFICATION_LEVELS.premium_verified;
  return VERIFICATION_LEVELS.verified;
}

/** @returns {{ verified: boolean, verificationType: string|null, level: string }} */
export function getVerifiedStatus(entity) {
  const level = resolveVerificationLevel(entity);
  return {
    verified: level !== VERIFICATION_LEVELS.pending,
    verificationType: resolveVerificationType(entity),
    level,
  };
}

/** Score boost from trust level (additive, 0–100 scale). */
export function applyVerifiedBoost(score, verifiedLevel) {
  const boost = LEVEL_BOOST[verifiedLevel] ?? 0;
  return Math.min(100, Math.max(0, score + boost));
}

/** Search ranking multiplier (0–1 additive factor base). */
export function getVerifiedSearchBoost(entity) {
  const { level } = getVerifiedStatus(entity);
  return SEARCH_BOOST[level] ?? 0;
}
