"use client";

import { create } from "zustand";

interface FiltersState {
  country: string | null;
  tags: string[];
  setCountry: (c: string | null) => void;
  toggleTag: (t: string) => void;
  clear: () => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  country: null,
  tags: [],
  setCountry: (country) => set({ country }),
  toggleTag: (t) =>
    set((s) => ({
      tags: s.tags.includes(t) ? s.tags.filter((x) => x !== t) : [...s.tags, t],
    })),
  clear: () => set({ country: null, tags: [] }),
}));
