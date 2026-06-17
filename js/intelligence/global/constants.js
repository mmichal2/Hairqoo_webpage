/** ETAP 6 — extended regions (merges with ETAP 3 search-engine REGIONS). */

import { REGIONS as SEARCH_REGIONS } from "../../data/search-engine.js?version=6.6.0";

export const GLOBAL_REGIONS = {
  europe: SEARCH_REGIONS.europe,
  latam: SEARCH_REGIONS.latam,
  north_america: SEARCH_REGIONS.north_america,
  asia: SEARCH_REGIONS.asia,
  middle_east: new Set([
    "ZEA",
    "UAE",
    "Izrael",
    "Israel",
    "Turcja",
    "Turkey",
    "Arabia Saudyjska",
    "Saudi Arabia",
  ]),
  africa: new Set([
    "RPA",
    "South Africa",
    "Nigeria",
    "Kenia",
    "Kenya",
    "Maroko",
    "Morocco",
    "Egipt",
    "Egypt",
  ]),
};

export const RELATION_TYPES = new Set([
  "teaches",
  "appears_at",
  "used_in",
  "owns",
  "employs",
  "attends",
  "completes",
  "related_tag",
  "related_owner",
  "same_country",
  "related",
]);

export function resolveGlobalRegion(country) {
  if (!country) return null;
  for (const [region, set] of Object.entries(GLOBAL_REGIONS)) {
    if (set.has(country)) return region;
  }
  return "global";
}

/** Canonical tag synonyms across PL/EN/ES/FR/PT. */
export const TAG_SEMANTIC_MAP = {
  balayage: ["balayage", "balyage"],
  fade: ["fade", "skin fade", "wyblak"],
  barber: ["barber", "barbering", "fryzjer"],
  kolor: ["kolor", "color", "colour", "colore", "couleur", "cor"],
  blonde: ["blonde", "blond", "rubio", "blond", "loiro"],
  warsztat: ["warsztat", "workshop", "taller", "atelier", "oficina"],
  summit: ["summit", "zjazd", "cumbre", "sommet"],
  produkt: ["produkt", "product", "produit", "produto"],
  edukacja: ["edukacja", "education", "educación", "formation", "educação"],
};

export const QUERY_LANG_HINTS = {
  pl: /\b(w|we|na|dla|szkolen|szkolenie|kurs|edukator|produkt|warsztat|balayage|fryzjer|fryzjersk)\b/i,
  en: /\b(the|for|course|training|educator|product|workshop|hair)\b/i,
  es: /\b(el|la|curso|formación|educador|producto|taller)\b/i,
  fr: /\b(le|la|cours|formation|éducateur|produit|atelier)\b/i,
  pt: /\b(o|a|curso|formação|educador|produto|workshop)\b/i,
};
