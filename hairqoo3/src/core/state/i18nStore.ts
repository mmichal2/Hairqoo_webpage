"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LanguageCode } from "@/core/entities/entity";
import { DEFAULT_LANGUAGE } from "@/core/i18n/config";
import { dictionaries, type Dict } from "@/core/i18n/dictionaries";

interface I18nState {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: () => Dict;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      lang: DEFAULT_LANGUAGE,
      setLang: (lang) => set({ lang }),
      t: () => dictionaries[get().lang] ?? dictionaries[DEFAULT_LANGUAGE],
    }),
    { name: "hairqoo3_lang" }
  )
);

/** Hook zwracający aktualny słownik UI. */
export function useDict(): Dict {
  const lang = useI18nStore((s) => s.lang);
  return dictionaries[lang] ?? dictionaries[DEFAULT_LANGUAGE];
}
