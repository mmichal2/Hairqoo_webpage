import { MOCK_ENTITIES } from "./entities.js";

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
