import type {
  AIResponse,
  Entity,
  EntityType,
  FeedPage,
  LanguageCode,
  SearchGroup,
} from "@/core/entities/entity";
import { DEFAULT_LANGUAGE } from "@/core/i18n/config";
import { getDict } from "@/core/i18n/dictionaries";
import { MOCK_ENTITIES } from "./mock-entities";

export interface FilterParams {
  country?: string;
  language?: string;
  tags?: string[];
  type?: EntityType;
}

function matchesFilters(e: Entity, f: FilterParams): boolean {
  if (f.country && e.country !== f.country) return false;
  if (f.language && e.language !== f.language) return false;
  if (f.type && e.type !== f.type) return false;
  if (f.tags && f.tags.length > 0) {
    const has = f.tags.some((t) => e.tags.includes(t));
    if (!has) return false;
  }
  return true;
}

function popularity(e: Entity): number {
  return (e.score ?? 50) * 1000 + e.engagement.views;
}

export function getAllEntities(): Entity[] {
  return MOCK_ENTITIES;
}

export function getEntityById(type: string, id: string): Entity | undefined {
  return MOCK_ENTITIES.find((e) => e.id === id && e.type === type);
}

export function getByType(type: EntityType, limit = 8): Entity[] {
  return MOCK_ENTITIES.filter((e) => e.type === type)
    .sort((a, b) => popularity(b) - popularity(a))
    .slice(0, limit);
}

export function getTrending(limit = 8): Entity[] {
  return [...MOCK_ENTITIES]
    .sort((a, b) => b.engagement.views - a.engagement.views)
    .slice(0, limit);
}

export function getCountries(): string[] {
  return Array.from(
    new Set(MOCK_ENTITIES.map((e) => e.country).filter(Boolean) as string[])
  ).sort();
}

export function getTrendingTags(limit = 10): string[] {
  const counts = new Map<string, number>();
  for (const e of MOCK_ENTITIES) {
    for (const t of e.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([t]) => t);
}

/** Słowa pomijane przy tokenizacji zapytania (PL/EN). */
const STOPWORDS = new Set([
  "w",
  "we",
  "na",
  "do",
  "i",
  "oraz",
  "z",
  "ze",
  "the",
  "in",
  "of",
  "for",
  "a",
  "an",
]);

function haystack(e: Entity): string {
  return [e.title, e.description, e.tags.join(" "), e.country, e.location]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/** GLOBAL SEARCH — zwraca wyniki pogrupowane po typie encji. */
export function search(
  query: string,
  filters: FilterParams = {},
  lang: LanguageCode = DEFAULT_LANGUAGE
): SearchGroup[] {
  const dict = getDict(lang);
  const q = query.trim().toLowerCase();
  const tokens = q
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));

  const matched = MOCK_ENTITIES.filter((e) => {
    if (!matchesFilters(e, filters)) return false;
    if (!q || tokens.length === 0) return true;
    const hay = haystack(e);
    return tokens.some((t) => hay.includes(t));
  });

  const groups = new Map<EntityType, Entity[]>();
  for (const e of matched) {
    const arr = groups.get(e.type) ?? [];
    arr.push(e);
    groups.set(e.type, arr);
  }

  const relevance = (e: Entity) => {
    if (tokens.length === 0) return 0;
    const hay = haystack(e);
    return tokens.reduce((n, t) => (hay.includes(t) ? n + 1 : n), 0);
  };

  return Array.from(groups.entries())
    .map(([type, items]) => ({
      type,
      label: dict.entityGroups[type],
      items: items.sort(
        (a, b) => relevance(b) - relevance(a) || popularity(b) - popularity(a)
      ),
    }))
    .sort((a, b) => b.items.length - a.items.length);
}

/** Sugestie autouzupełniania (tytuły + tagi). */
export function suggestions(query: string, limit = 6): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return getTrendingTags(limit);
  const pool = new Set<string>();
  for (const e of MOCK_ENTITIES) {
    if (e.title.toLowerCase().includes(q)) pool.add(e.title);
    for (const t of e.tags) if (t.toLowerCase().includes(q)) pool.add(t);
  }
  return Array.from(pool).slice(0, limit);
}

/** Personalizowany feed z paginacją kursorową. */
export function getFeedPage(cursor: string | null, pageSize = 5): FeedPage {
  const ranked = [...MOCK_ENTITIES].sort((a, b) => popularity(b) - popularity(a));
  const start = cursor ? Number.parseInt(cursor, 10) || 0 : 0;
  const slice = ranked.slice(start, start + pageSize);
  const next = start + pageSize;
  return {
    items: slice,
    nextCursor: next < ranked.length ? String(next) : null,
  };
}

/** Mock AI: klasyfikuje intencję i zwraca strukturalną odpowiedź. */
export function aiAsk(
  prompt: string,
  lang: LanguageCode = DEFAULT_LANGUAGE
): AIResponse {
  const dict = getDict(lang);
  const p = prompt.toLowerCase();
  let type: EntityType | null = null;
  if (/(kurs|szkolen|warsztat|masterclass|nauk|edukac|course|training|workshop|curso|formación|formation|cours)/.test(p))
    type = "event";
  else if (/(edukator|trener|mentor|nauczyciel|educator|trainer|formateur)/.test(p))
    type = "educator";
  else if (/(produkt|narzędz|maszynk|kolor|toner|utleniacz|product|tool|clipper|produit|produto)/.test(p))
    type = "product";
  else if (/(wideo|tutorial|film|video|vídeo|vidéo)/.test(p)) type = "video";

  const groups = search(prompt, {}, lang);
  let entities: Entity[] = groups.flatMap((g) => g.items);
  if (type) {
    const typed = entities.filter((e) => e.type === type);
    if (typed.length) entities = typed;
  }
  entities = entities.slice(0, 4);
  if (entities.length === 0) entities = getTrending(4);

  const typeLabel = type
    ? ({
        event: dict.aiAnswers.typeEvent,
        educator: dict.aiAnswers.typeEducator,
        product: dict.aiAnswers.typeProduct,
        video: dict.aiAnswers.typeVideo,
      }[type] ?? dict.aiAnswers.typeDefault)
    : dict.aiAnswers.typeDefault;

  const template =
    entities.length === 1 ? dict.aiAnswers.foundOne : dict.aiAnswers.found;
  const answer =
    entities.length > 0
      ? template.replace("{count}", String(entities.length)).replace("{type}", typeLabel)
      : dict.errors.aiNoMatch;

  const links = [
    {
      label: dict.aiAnswers.allResults,
      href: `/search?q=${encodeURIComponent(prompt)}`,
    },
  ];
  if (type === "event")
    links.push({ label: dict.aiAnswers.eventsLink, href: "/events" });
  if (type === "educator")
    links.push({ label: dict.aiAnswers.educatorsLink, href: "/educators" });
  if (type === "product")
    links.push({ label: dict.aiAnswers.productsLink, href: "/products" });

  return { answer, entities, links };
}
