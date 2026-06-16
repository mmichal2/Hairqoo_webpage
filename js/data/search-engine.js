/**
 * ETAP 3 — Global Search Ranking Engine
 * "Google for the Hair & Beauty Industry"
 * No UI — pure ranking pipeline over ETAP 2 entity pool.
 */

import { getHairQooScore } from "../intelligence/score-system.js";
import { getVerifiedStatus, VERIFICATION_LEVELS } from "../intelligence/verified-trust.js";
import { getSessionProfile } from "../intelligence/session-store.js";
import { getEntityPool } from "./data-source.js";
import { getLang } from "../i18n.js";

/** Unified searchable types (cross-type global ranking). */
export const SEARCHABLE_TYPES = new Set([
  "event",
  "educator",
  "product",
  "education",
  "academy",
  "brand",
  "salon",
  "video",
  "post",
]);

/** Balancing groups — academy maps to education. */
export const TYPE_BALANCE_GROUPS = {
  event: "event",
  educator: "educator",
  product: "product",
  education: "education",
  academy: "education",
  brand: "brand",
  salon: "salon",
  video: "video",
  post: "post",
};

export const REGIONS = {
  europe: new Set([
    "Polska",
    "Niemcy",
    "Francja",
    "Włochy",
    "Hiszpania",
    "Portugalia",
    "Wielka Brytania",
    "United Kingdom",
    "Berlin",
    "Mediolan",
    "Paryż",
  ]),
  latam: new Set(["Brazylia", "Meksyk", "Argentyna", "Kolumbia", "Chile", "Peru"]),
  north_america: new Set(["USA", "Kanada", "United States", "Canada", "Meksyk"]),
  asia: new Set(["Japonia", "Korea", "Chiny", "Singapur", "Tajlandia", "Indie"]),
};

const LANG_DEFAULT_COUNTRY = {
  pl: "Polska",
  en: "United Kingdom",
  es: "Hiszpania",
  fr: "Francja",
  pt: "Portugalia",
};

const STOPWORDS = new Set([
  "w", "we", "na", "do", "i", "oraz", "z", "ze", "the", "in", "of", "for", "a", "an", "and", "or",
]);

/** Spec formula weights (sum = 1.0). */
export const RANK_WEIGHTS = {
  keyword: 0.4,
  hairQooScore: 0.2,
  verified: 0.15,
  popularity: 0.1,
  recency: 0.1,
  geoLanguage: 0.05,
};

const REFERENCE_MS = Date.parse("2026-06-16T12:00:00.000Z");
const TYPE_CAP_RATIO = 0.4;

export function tokenize(query) {
  return String(query ?? "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

export function haystack(entity) {
  return [
    entity.title,
    entity.description,
    (entity.tags ?? []).join(" "),
    entity.country,
    entity.city,
    entity.location,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const row = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[n];
}

/** Basic fuzzy token match against haystack words. */
export function fuzzyTokenMatch(hay, token) {
  if (!token) return 0;
  if (hay.includes(token)) return 1;
  if (token.length < 3) return 0;
  const words = hay.split(/[\s,.#]+/).filter(Boolean);
  let best = 0;
  for (const word of words) {
    if (word.startsWith(token)) best = Math.max(best, 0.88);
    if (token.length >= 4 && word.includes(token)) best = Math.max(best, 0.75);
    if (token.length >= 4 && levenshtein(word.slice(0, token.length + 2), token) <= 1) {
      best = Math.max(best, 0.65);
    }
  }
  return best;
}

function keywordScore(tokens, entity) {
  if (!tokens.length) return 0.35;
  const title = String(entity.title ?? "").toLowerCase();
  const desc = String(entity.description ?? "").toLowerCase();
  const tagStr = (entity.tags ?? []).join(" ").toLowerCase();
  const fullHay = haystack(entity);

  let titleAcc = 0;
  let tagAcc = 0;
  let descAcc = 0;
  let fuzzyAcc = 0;

  for (const t of tokens) {
    titleAcc += title.includes(t) ? 1 : fuzzyTokenMatch(title, t);
    tagAcc += tagStr.includes(t) ? 1 : fuzzyTokenMatch(tagStr, t);
    descAcc += desc.includes(t) ? 1 : fuzzyTokenMatch(desc, t);
    fuzzyAcc += fuzzyTokenMatch(fullHay, t);
  }

  const n = tokens.length;
  const blended =
    (titleAcc / n) * 0.5 + (tagAcc / n) * 0.3 + (descAcc / n) * 0.15 + (fuzzyAcc / n) * 0.05;
  return Math.min(1, blended);
}

function resolveHairQooScore(entity, network) {
  const fromRanking = entity.ranking?.hairQooScore;
  if (fromRanking != null && fromRanking > 0) return Math.min(100, fromRanking) / 100;
  const fromScore = entity.score ?? entity.hairqooScore;
  if (fromScore != null && fromScore > 0) return Math.min(100, fromScore) / 100;
  return getHairQooScore(entity, network) / 100;
}

function verifiedBoostScore(entity) {
  const { level } = getVerifiedStatus(entity);
  if (level === VERIFICATION_LEVELS.premium_verified) return 1;
  if (level === VERIFICATION_LEVELS.verified) return 0.65;
  return 0;
}

function popularityScore(entity) {
  const m = entity.metrics ?? entity.engagement ?? {};
  const views = Math.min((m.views ?? 0) / 4000, 1);
  const clicks = Math.min((m.clicks ?? m.likes ?? 0) / 500, 1);
  const saves = Math.min((m.saves ?? 0) / 200, 1);
  return views * 0.5 + clicks * 0.35 + saves * 0.15;
}

function recencyScore(entity) {
  const rankingRecency = entity.ranking?.recencyScore;
  if (rankingRecency != null && rankingRecency > 0) return Math.min(1, rankingRecency / 100);

  const dateStr = entity.dateEvent ?? entity.typeData?.date ?? entity.dateCreated;
  if (!dateStr) return 0.4;

  const ms = Date.parse(dateStr);
  const days = (ms - REFERENCE_MS) / 86_400_000;

  if (entity.type === "event" && entity.dateEvent) {
    if (days >= 0 && days <= 180) return 1 - days / 360;
    if (days < 0) return Math.max(0.25, 0.55 + days / 500);
    return Math.max(0.15, 0.65 - (days - 180) / 600);
  }

  const age = (REFERENCE_MS - ms) / 86_400_000;
  return Math.max(0.15, 1 - age / 450);
}

function resolveRegion(country) {
  if (!country) return null;
  for (const [region, set] of Object.entries(REGIONS)) {
    if (set.has(country)) return region;
  }
  return null;
}

function geoLanguageBoost(entity, ctx) {
  let score = 0;
  const userCountry = ctx.userCountry;
  const userRegion = ctx.userRegion;
  const lang = ctx.lang;

  if (lang && entity.language === lang) score += 0.55;
  if (userCountry && entity.country === userCountry) score += 0.45;
  else if (userRegion && resolveRegion(entity.country) === userRegion) score += 0.25;

  if (ctx.region && ctx.region !== "global") {
    const entityRegion = resolveRegion(entity.country);
    if (entityRegion === ctx.region) score += 0.2;
  }

  return Math.min(1, score);
}

function getInteractionSignals(entity, profile) {
  return {
    saved: profile.savedEntityIds?.includes(entity.id) ?? false,
    preferredType: profile.preferredTypes?.includes(entity.type) ?? false,
    tagOverlap: (entity.tags ?? []).filter((t) => profile.preferredTags?.includes(t)),
    preferredCountry: profile.preferredCountries?.includes(entity.country) ?? false,
  };
}

function buildContext(filters = {}, options = {}) {
  const profile = options.profile ?? getSessionProfile();
  const lang =
    options.lang ?? filters.language ?? (typeof document !== "undefined" ? getLang() : "pl");
  const userCountry =
    filters.country ?? profile.preferredCountries?.[0] ?? LANG_DEFAULT_COUNTRY[lang] ?? null;
  const userRegion = filters.region ?? resolveRegion(userCountry);

  return {
    lang,
    userCountry,
    userRegion,
    region: filters.region ?? null,
    profile,
    network: options.network ?? getEntityPool(),
    limit: options.limit ?? 50,
  };
}

/**
 * Full score breakdown (debuggable — ETAP 5 AI prep).
 * @returns {{ finalScore: number, breakdown: object, interactionSignals: object }}
 */
export function computeScoreBreakdown(query, entity, ctx = {}) {
  const context = ctx.network ? ctx : buildContext({}, ctx);
  const tokens = tokenize(query);

  const breakdown = {
    keywordScore: keywordScore(tokens, entity),
    hairQooScore: resolveHairQooScore(entity, context.network),
    verifiedBoost: verifiedBoostScore(entity),
    popularityScore: popularityScore(entity),
    recencyScore: recencyScore(entity),
    geoLanguageBoost: geoLanguageBoost(entity, context),
  };

  const finalScore =
    breakdown.keywordScore * RANK_WEIGHTS.keyword +
    breakdown.hairQooScore * RANK_WEIGHTS.hairQooScore +
    breakdown.verifiedBoost * RANK_WEIGHTS.verified +
    breakdown.popularityScore * RANK_WEIGHTS.popularity +
    breakdown.recencyScore * RANK_WEIGHTS.recency +
    breakdown.geoLanguageBoost * RANK_WEIGHTS.geoLanguage;

  return {
    finalScore: Math.min(1, Math.max(0, finalScore)),
    breakdown,
    weights: { ...RANK_WEIGHTS },
    interactionSignals: getInteractionSignals(entity, context.profile),
  };
}

/** @returns {number} 0–1 relevance score */
export function computeRelevanceScore(query, entity, ctx = {}) {
  return computeScoreBreakdown(query, entity, ctx).finalScore;
}

export function normalizeScores(results) {
  if (!results.length) return [];
  const scores = results.map((r) => r.finalScore ?? r.relevanceScore ?? 0);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const span = max - min || 1;

  return results.map((r) => {
    const raw = r.finalScore ?? r.relevanceScore ?? 0;
    const normalizedScore = (raw - min) / span;
    return {
      ...r,
      normalizedScore,
      searchMeta: {
        ...(r.searchMeta ?? {}),
        normalizedScore,
        rawScore: raw,
      },
    };
  });
}

/**
 * Soft cap: max 40% of results from one balance group.
 */
export function applyTypeBalance(ranked, limit) {
  const cap = Math.max(1, Math.floor(limit * TYPE_CAP_RATIO));
  const counts = new Map();
  const picked = [];
  const deferred = [];

  for (const item of ranked) {
    const group = TYPE_BALANCE_GROUPS[item.type] ?? item.type;
    const count = counts.get(group) ?? 0;
    if (count < cap) {
      picked.push(item);
      counts.set(group, count + 1);
    } else {
      deferred.push(item);
    }
    if (picked.length >= limit) break;
  }

  if (picked.length < limit) {
    for (const item of deferred) {
      if (picked.length >= limit) break;
      picked.push(item);
    }
  }

  return picked;
}

export function matchesQuery(query, entity) {
  const tokens = tokenize(query);
  if (!tokens.length) return true;
  const hay = haystack(entity);
  return tokens.some((t) => hay.includes(t) || fuzzyTokenMatch(hay, t) >= 0.65);
}

function fetchCandidates(query, filters, ctx) {
  let pool = ctx.network.filter((e) => SEARCHABLE_TYPES.has(e.type));

  if (filters.type) pool = pool.filter((e) => e.type === filters.type);
  if (filters.types?.length) pool = pool.filter((e) => filters.types.includes(e.type));
  if (filters.country) pool = pool.filter((e) => e.country === filters.country);
  if (filters.language) pool = pool.filter((e) => e.language === filters.language);
  if (filters.region && filters.region !== "global") {
    pool = pool.filter((e) => resolveRegion(e.country) === filters.region);
  }
  if (filters.tags?.length) {
    pool = pool.filter((e) => filters.tags.some((t) => (e.tags ?? []).includes(t)));
  }

  const q = String(query ?? "").trim();
  if (q) pool = pool.filter((e) => matchesQuery(q, e));

  return pool;
}

/**
 * Rank entities with full breakdown metadata.
 */
export function rankSearchResults(query, entities, ctx = {}) {
  const context = buildContext({}, ctx);

  return entities
    .map((entity) => {
      const { finalScore, breakdown, weights, interactionSignals } = computeScoreBreakdown(
        query,
        entity,
        context
      );
      return {
        ...entity,
        relevanceScore: finalScore,
        finalScore,
        searchMeta: {
          query,
          breakdown,
          weights,
          interactionSignals,
          balanceGroup: TYPE_BALANCE_GROUPS[entity.type] ?? entity.type,
        },
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore || b.relevanceScore - a.relevanceScore);
}

/**
 * Global unified search pipeline.
 * @param {string} query
 * @param {{ type?: string, types?: string[], country?: string, language?: string, region?: string, tags?: string[] }} filters
 * @param {{ limit?: number, lang?: string, profile?: object, network?: object[] }} [options]
 */
export function searchEntities(query, filters = {}, options = {}) {
  const ctx = buildContext(filters, options);
  const limit = options.limit ?? 50;

  const candidates = fetchCandidates(query, filters, ctx);
  const ranked = rankSearchResults(query, candidates, ctx);
  const balanced = applyTypeBalance(ranked, limit);
  return normalizeScores(balanced);
}

/** Group flat ranked results by type (for existing search.html UI). */
export function groupSearchResults(flatResults) {
  const groups = new Map();
  for (const e of flatResults) {
    const arr = groups.get(e.type) ?? [];
    arr.push(e);
    groups.set(e.type, arr);
  }
  return Array.from(groups.entries()).map(([type, items]) => ({ type, items }));
}

export { resolveRegion };
