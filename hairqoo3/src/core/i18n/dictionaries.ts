import type { LanguageCode } from "@/core/entities/entity";
import { DEFAULT_LANGUAGE } from "./config";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { pl } from "./locales/pl";
import { pt } from "./locales/pt";
import type { Dict } from "./types";

export type { Dict } from "./types";

export const dictionaries: Record<LanguageCode, Dict> = {
  pl,
  en,
  es,
  pt,
  fr,
};

/** Słownik UI dla danego języka (SSR + API). */
export function getDict(lang: LanguageCode = DEFAULT_LANGUAGE): Dict {
  return dictionaries[lang] ?? dictionaries[DEFAULT_LANGUAGE];
}

export { pl, en, es, pt, fr };
