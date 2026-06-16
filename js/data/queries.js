import { MOCK_ENTITIES } from "./entities.js";
import { getCcDict } from "../cc-dict.js";

function popularity(e) {
  return (e.score ?? 50) * 1000 + e.engagement.views;
}

export function getAllEntities() {
  return MOCK_ENTITIES;
}

export function getByType(type, limit = 8) {
  return MOCK_ENTITIES.filter((e) => e.type === type)
    .sort((a, b) => popularity(b) - popularity(a))
    .slice(0, limit);
}

export function getTrending(limit = 8) {
  return [...MOCK_ENTITIES]
    .sort((a, b) => b.engagement.views - a.engagement.views)
    .slice(0, limit);
}

export function getFeedPage(cursor = null, pageSize = 5) {
  const ranked = [...MOCK_ENTITIES].sort((a, b) => popularity(b) - popularity(a));
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
  for (const e of MOCK_ENTITIES) {
    for (const t of e.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([t]) => t);
}

export function getCountriesAggregated() {
  const map = new Map();
  for (const e of MOCK_ENTITIES) {
    if (!e.country) continue;
    map.set(e.country, (map.get(e.country) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([country, count]) => ({ country, count }));
}

export function getCalendarEvents(limit = 6) {
  return MOCK_ENTITIES.filter((e) => e.type === "event" && e.dateEvent)
    .sort((a, b) => String(a.dateEvent).localeCompare(String(b.dateEvent)))
    .slice(0, limit);
}

export function getCountries() {
  return Array.from(
    new Set(MOCK_ENTITIES.map((e) => e.country).filter(Boolean))
  ).sort();
}

export function getEntityById(type, id) {
  return MOCK_ENTITIES.find((e) => e.type === type && e.id === id);
}

const STOPWORDS = new Set([
  "w", "we", "na", "do", "i", "oraz", "z", "ze", "the", "in", "of", "for", "a", "an",
]);

function haystack(e) {
  return [e.title, e.description, e.tags.join(" "), e.country, e.location]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/** Wyszukiwanie globalne (mock — jak prototype queries.ts). */
export function search(query, filters = {}) {
  const q = query.trim().toLowerCase();
  const tokens = q.split(/\s+/).filter((t) => t.length > 1 && !STOPWORDS.has(t));

  let matched = MOCK_ENTITIES.filter((e) => {
    if (filters.type && e.type !== filters.type) return false;
    if (filters.country && e.country !== filters.country) return false;
    if (filters.tags?.length && !filters.tags.some((t) => e.tags.includes(t))) return false;
    if (!q || tokens.length === 0) return true;
    const hay = haystack(e);
    return tokens.some((t) => hay.includes(t));
  });

  const groups = new Map();
  for (const e of matched) {
    const arr = groups.get(e.type) ?? [];
    arr.push(e);
    groups.set(e.type, arr);
  }

  return Array.from(groups.entries()).map(([type, items]) => ({
    type,
    items: items.sort((a, b) => popularity(b) - popularity(a)),
  }));
}

export function filterEntities({ types, country, tags }) {
  let pool = [...MOCK_ENTITIES];
  if (types?.length) pool = pool.filter((e) => types.includes(e.type));
  if (country) pool = pool.filter((e) => e.country === country);
  if (tags?.length) pool = pool.filter((e) => tags.some((t) => e.tags.includes(t)));
  return pool.sort(
    (a, b) => (b.score ?? 50) - (a.score ?? 50) || b.engagement.views - a.engagement.views
  );
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

/** Wydarzenia wg widoku kalendarza (miesiąc / tydzień / rok). */
export function getCalendarEventsByView(view = "month", limit = 20) {
  const now = new Date();
  const events = MOCK_ENTITIES.filter((e) => e.type === "event" && e.dateEvent).sort((a, b) =>
    String(a.dateEvent).localeCompare(String(b.dateEvent))
  );

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

  const pool = filtered.length ? filtered : events;
  return pool.slice(0, limit);
}

export function getEntitiesByOwner(ownerId) {
  return MOCK_ENTITIES.filter((e) => e.ownerId === ownerId).sort(
    (a, b) => popularity(b) - popularity(a)
  );
}

/** Asystent AI — mock lokalny (jak hairqoo3 queries.ts). */
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

  const groups = search(prompt);
  let entities = groups.flatMap((g) => g.items);
  if (type) {
    const typed = entities.filter((e) => e.type === type);
    if (typed.length) entities = typed;
  }
  entities = entities.slice(0, 4);
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
