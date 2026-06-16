"use client";

import { create } from "zustand";
import type { SearchGroup } from "@/core/entities/entity";
import { searchRepo } from "@/modules/search/repo";
import { useFiltersStore } from "./filtersStore";
import { useI18nStore } from "./i18nStore";

interface SearchState {
  query: string;
  groups: SearchGroup[];
  suggestions: string[];
  loading: boolean;
  failed: boolean;
  setQuery: (q: string) => void;
  run: (q?: string) => Promise<void>;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  groups: [],
  suggestions: [],
  loading: false,
  failed: false,
  setQuery: (query) => set({ query }),
  run: async (q) => {
    const query = q ?? get().query;
    const { country, tags } = useFiltersStore.getState();
    const lang = useI18nStore.getState().lang;
    set({ loading: true, failed: false });
    try {
      const res = await searchRepo.search(query, {
        country: country ?? undefined,
        tags,
      }, lang);
      set({
        groups: res.groups,
        suggestions: res.suggestions,
        loading: false,
        query,
        failed: false,
      });
    } catch {
      set({ loading: false, failed: true });
    }
  },
  reset: () =>
    set({ query: "", groups: [], suggestions: [], failed: false }),
}));
