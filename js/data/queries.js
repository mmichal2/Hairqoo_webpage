import { getEntityPool } from "./data-source.js";
import { getCcDict } from "../cc-dict.js";
import { getHairQooScore } from "../intelligence/score-system.js";
import {
  searchEntities,
  groupSearchResults,
} from "./search-engine.js";
import { getAwardNominee } from "../intelligence/awards-system.js";
import {
  improveRankingFromFeedback,
  inferBehavioralTypeHint,
  logUserInteraction,
  updateAIContext,
} from "../intelligence/ai-learning.js";
import { getSessionProfile } from "../intelligence/session-store.js";
import { getLang } from "../i18n.js";

function pool() {
  return getEntityPool();
}

function entityRank(a, b) {
  const network = pool();
  const sa = getHairQooScore(a, network);
  const sb = getHairQooScore(b, network);
  return sb - sa || (b.engagement?.views ?? 0) - (a.engagement?.views ?? 0);
}

export function getAllEntities() {
  return pool();
}

export function getByType(type, limit = 8) {
  return pool()
    .filter((e) => e.type === type)
    .sort(entityRank)
    .slice(0, limit);
}

export function getTrending(limit = 8) {
  const profile = getSessionProfile();
  const network = pool();
  const ranked = improveRankingFromFeedback(
    network.map((e) => ({
      ...e,
      finalScore: (e.engagement?.views ?? 0) / 5000 + getHairQooScore(e, network) / 200,
    })),
    { profile }
  );
  return ranked.sort((a, b) => b.finalScore - a.finalScore).slice(0, limit);
}

export function getFeedPage(cursor = null, pageSize = 5) {
  const ranked = [...pool()].sort(entityRank);
  const start = cursor ? Number.parseInt(cursor, 10) || 0 : 0;
  const slice = ranked.slice(start, start + pageSize);
  const next = start + pageSize;
  return {
    items: slice,
    nextCursor: next < ranked.length ? String(next) : null,
  };
}

export function getTrendingTags(limit = 10) {
  const counts = new Map();
  for (const e of pool()) {
    for (const t of e.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([t]) => t);
}

export function getCountriesAggregated() {
  const map = new Map();
  for (const e of pool()) {
    if (!e.country) continue;
    map.set(e.country, (map.get(e.country) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([country, count]) => ({ country, count }));
}

export function getCalendarEvents(limit = 6) {
  return pool()
    .filter((e) => e.type === "event" && e.dateEvent)
    .sort((a, b) => String(a.dateEvent).localeCompare(String(b.dateEvent)))
    .slice(0, limit);
}

export function getCountries() {
  return Array.from(new Set(pool().map((e) => e.country).filter(Boolean))).sort();
}

export function getEntityById(type, id) {
  return pool().find((e) => e.type === type && e.id === id);
}

export function getAwardLeader(category) {
  return getAwardNominee(category, pool());
}

export function search(query, filters = {}) {
  const lang = typeof document !== "undefined" ? getLang() : "pl";
  const profile = getSessionProfile();
  const flat = searchEntities(query, filters, {
    limit: filters.limit ?? 100,
    lang,
    profile,
    network: pool(),
  });
  return groupSearchResults(flat);
}

export function filterEntities({ types, country, tags }) {
  let p = [...pool()];
  if (types?.length) p = p.filter((e) => types.includes(e.type));
  if (country) p = p.filter((e) => e.country === country);
  if (tags?.length) p = p.filter((e) => tags.some((t) => e.tags.includes(t)));
  return p.sort(entityRank);
}

function weekRange(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + 1);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

export function getCalendarEventsByView(view = "month", limit = 20) {
  const now = new Date();
  const events = pool()
    .filter((e) => e.type === "event" && e.dateEvent)
    .sort((a, b) => String(a.dateEvent).localeCompare(String(b.dateEvent)));

  const filtered = events.filter((e) => {
    const d = new Date(e.dateEvent);
    if (view === "month") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (view === "week") {
      const { start, end } = weekRange(now);
      return d >= start && d <= end;
    }
    if (view === "year") {
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const result = filtered.length ? filtered : events;
  return result.slice(0, limit);
}

export function getEntitiesByOwner(ownerId) {
  return pool().filter((e) => e.ownerId === ownerId).sort(entityRank);
}

export function aiAsk(prompt, lang = "pl") {
  const dict = getCcDict(lang);
  const p = prompt.toLowerCase();
  let type = null;
  if (/(kurs|szkolen|warsztat|masterclass|nauk|edukac|course|training|workshop|curso|formación|formation|cours)/.test(p))
    type = "event";
  else if (/(edukator|trener|mentor|nauczyciel|educator|trainer|formateur)/.test(p))
    type = "educator";
  else if (/(produkt|narzędz|maszynk|kolor|toner|utleniacz|product|tool|clipper|produit|produto)/.test(p))
    type = "product";
  else if (/(wideo|tutorial|film|video|vídeo|vidéo)/.test(p)) type = "video";

  if (!type) type = inferBehavioralTypeHint();

  logUserInteraction("search", null, { query: prompt });
  updateAIContext({ searchQuery: prompt });

  const groups = search(prompt);
  let entities = groups.flatMap((g) => g.items);
  if (type) {
    const typed = entities.filter((e) => e.type === type);
    if (typed.length) entities = typed;
  }
  entities = improveRankingFromFeedback(entities, { profile: getSessionProfile() })
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 4);
  if (entities.length === 0) entities = getTrending(4);

  const typeLabel = type
    ? ({
        event: dict.aiAnswers?.typeEvent ?? "wydarzenia",
        educator: dict.aiAnswers?.typeEducator ?? "edukatorzy",
        product: dict.aiAnswers?.typeProduct ?? "produkty",
        video: dict.aiAnswers?.typeVideo ?? "wideo",
      }[type] ?? dict.aiAnswers?.typeDefault ?? "wyniki")
    : dict.aiAnswers?.typeDefault ?? "wyniki";

  const template =
    entities.length === 1
      ? dict.aiAnswers?.foundOne ?? "Znalazłem 1 dopasowaną pozycję ({type})."
      : dict.aiAnswers?.found ?? "Znalazłem {count} dopasowanych pozycji ({type}).";
  const answer =
    entities.length > 0
      ? template.replace("{count}", String(entities.length)).replace("{type}", typeLabel)
      : dict.errors?.aiNoMatch ?? "Nie znalazłem dopasowań.";

  const links = [
    {
      label: dict.aiAnswers?.allResults ?? dict.search?.allResults ?? "Wszystkie wyniki",
      href: `/search?q=${encodeURIComponent(prompt)}`,
    },
  ];
  if (type === "event")
    links.push({ label: dict.aiAnswers?.eventsLink ?? "Wydarzenia", href: "/events" });
  if (type === "educator")
    links.push({ label: dict.aiAnswers?.educatorsLink ?? "Edukatorzy", href: "/educators" });
  if (type === "product")
    links.push({ label: dict.aiAnswers?.productsLink ?? "Produkty", href: "/products" });

  return { answer, entities, links };
}

export { getHairQooScore, getScoreTier, getVerifiedStatus } from "../intelligence/index.js";

// Search engine API (ETAP 3)
export {
  searchEntities,
  computeRelevanceScore,
  computeScoreBreakdown,
  rankSearchResults,
  normalizeScores,
  applyTypeBalance,
  groupSearchResults,
  tokenize,
  matchesQuery,
  SEARCHABLE_TYPES,
  RANK_WEIGHTS,
  REGIONS,
} from "./search-engine.js";

// Data layer API (ETAP 2)
export {
  getEntities,
  getEntityById as getEntityByIdAsync,
  updateEntityMetrics,
  getUserPassport,
  updateUserXP,
  upsertEntities,
  searchIndexed,
} from "./api.js";
export { trackInteraction } from "./interactions.js";
export { initDataLayer, refreshDataLayer, getDataProvider, isDataReady } from "./data-source.js";
