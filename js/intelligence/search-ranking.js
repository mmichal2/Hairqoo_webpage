/** Search ranking intelligence — relevance, boosting, personalization. */

import { getHairQooScore } from "./score-system.js";
import { getVerifiedSearchBoost } from "./verified-trust.js";
import { getSessionProfile } from "./session-store.js";
import { improveRankingFromFeedback } from "./ai-learning.js";

const STOPWORDS = new Set([
  "w", "we", "na", "do", "i", "oraz", "z", "ze", "the", "in", "of", "for", "a", "an",
]);

const TYPE_QUERY_HINTS = {
  event: /(kurs|szkolen|warsztat|masterclass|event|training|workshop|curso|wydarzen)/i,
  educator: /(edukator|trener|mentor|educator|trainer|formateur|stylist)/i,
  product: /(produkt|narzędz|maszynk|kolor|toner|product|tool|clipper|produit)/i,
  academy: /(akademia|academy|académie|escuela)/i,
  salon: /(salon|studio|fryzjer)/i,
  brand: /(marka|brand|marque)/i,
  video: /(wideo|tutorial|film|video|vídeo|vidéo)/i,
};

const RANK_WEIGHTS = {
  keyword: 0.32,
  hairqooScore: 0.22,
  verified: 0.1,
  recency: 0.1,
  popularity: 0.12,
  typeFit: 0.08,
  locale: 0.06,
};

function tokenize(query) {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function haystack(entity) {
  return [entity.title, entity.description, (entity.tags ?? []).join(" "), entity.country, entity.location]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function keywordScore(tokens, entity) {
  if (!tokens.length) return 0.5;
  const hay = haystack(entity);
  let hits = 0;
  let titleHits = 0;
  const title = String(entity.title ?? "").toLowerCase();
  for (const t of tokens) {
    if (hay.includes(t)) hits += 1;
    if (title.includes(t)) titleHits += 1;
  }
  const coverage = hits / tokens.length;
  const titleBoost = titleHits / tokens.length;
  return Math.min(1, coverage * 0.7 + titleBoost * 0.3);
}

function recencyScore(entity) {
  const now = Date.parse("2026-06-16T12:00:00.000Z");
  if (entity.dateEvent) {
    const d = Date.parse(entity.dateEvent);
    const days = (d - now) / 86_400_000;
    if (days >= 0 && days <= 120) return 1 - days / 240;
    if (days < 0) return Math.max(0.2, 0.6 + days / 400);
    return Math.max(0.15, 0.7 - (days - 120) / 500);
  }
  if (entity.dateCreated) {
    const age = (now - Date.parse(entity.dateCreated)) / 86_400_000;
    return Math.max(0.2, 1 - age / 400);
  }
  return 0.45;
}

function popularityScore(entity) {
  const e = entity.engagement ?? {};
  const views = Math.min((e.views ?? 0) / 3000, 1);
  const likes = Math.min((e.likes ?? 0) / 400, 1);
  return views * 0.65 + likes * 0.35;
}

function typeFitScore(query, entity) {
  for (const [type, re] of Object.entries(TYPE_QUERY_HINTS)) {
    if (re.test(query) && entity.type === type) return 1;
  }
  return entity.type === "video" || entity.type === "post" ? 0.35 : 0.5;
}

function localeScore(entity, profile, lang) {
  let score = 0.4;
  if (lang && entity.language === lang) score += 0.35;
  if (profile.preferredCountries.includes(entity.country)) score += 0.25;
  return Math.min(1, score);
}

function profileTypeBias(entity, profile) {
  const idx = profile.preferredTypes.indexOf(entity.type);
  if (idx === -1) return 0;
  return 0.15 * (1 - idx / Math.max(profile.preferredTypes.length, 1));
}

/**
 * @param {string} query
 * @param {object} entity
 * @param {{ lang?: string, profile?: object, network?: object[] }} [ctx]
 */
export function computeRelevanceScore(query, entity, ctx = {}) {
  const tokens = tokenize(query);
  const profile = ctx.profile ?? getSessionProfile();
  const lang = ctx.lang ?? null;
  const hq = getHairQooScore(entity, ctx.network) / 100;

  const parts = {
    keyword: keywordScore(tokens, entity),
    hairqooScore: hq,
    verified: getVerifiedSearchBoost(entity),
    recency: recencyScore(entity),
    popularity: popularityScore(entity),
    typeFit: typeFitScore(query, entity),
    locale: localeScore(entity, profile, lang),
  };

  let total = 0;
  for (const [k, w] of Object.entries(RANK_WEIGHTS)) {
    total += w * parts[k];
  }
  total += profileTypeBias(entity, profile);
  return Math.min(1, Math.max(0, total));
}

/**
 * @param {string} query
 * @param {object[]} results
 * @param {{ lang?: string, profile?: object, network?: object[] }} [ctx]
 * @returns {Array<object & { relevanceScore: number, finalScore: number }>}
 */
export function rankSearchResults(query, results, ctx = {}) {
  const ranked = results.map((entity) => {
    const relevanceScore = computeRelevanceScore(query, entity, ctx);
    return { ...entity, relevanceScore, finalScore: relevanceScore };
  });

  const boosted = improveRankingFromFeedback(ranked, ctx);
  return boosted.sort((a, b) => b.finalScore - a.finalScore || b.relevanceScore - a.relevanceScore);
}

export { tokenize, haystack };
