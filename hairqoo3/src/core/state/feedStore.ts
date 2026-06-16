"use client";

import { create } from "zustand";
import type { Entity } from "@/core/entities/entity";
import { feedRepo } from "@/modules/feed/repo";

interface FeedState {
  items: Entity[];
  cursor: string | null;
  hasMore: boolean;
  loading: boolean;
  initialized: boolean;
  seen: Set<string>;
  loadInitial: (seed?: Entity[]) => Promise<void>;
  loadMore: () => Promise<void>;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  items: [],
  cursor: null,
  hasMore: true,
  loading: false,
  initialized: false,
  seen: new Set<string>(),
  loadInitial: async (seed) => {
    if (get().initialized) return;
    if (seed && seed.length) {
      set({
        items: seed,
        cursor: String(seed.length),
        hasMore: true,
        initialized: true,
        seen: new Set(seed.map((e) => e.id)),
      });
      return;
    }
    set({ loading: true });
    const page = await feedRepo.getPage(null);
    set({
      items: page.items,
      cursor: page.nextCursor,
      hasMore: page.nextCursor !== null,
      loading: false,
      initialized: true,
      seen: new Set(page.items.map((e) => e.id)),
    });
  },
  loadMore: async () => {
    const { loading, hasMore, cursor, items, seen } = get();
    if (loading || !hasMore) return;
    set({ loading: true });
    try {
      const page = await feedRepo.getPage(cursor);
      const fresh = page.items.filter((e) => !seen.has(e.id));
      const nextSeen = new Set(seen);
      fresh.forEach((e) => nextSeen.add(e.id));
      set({
        items: [...items, ...fresh],
        cursor: page.nextCursor,
        hasMore: page.nextCursor !== null,
        loading: false,
        seen: nextSeen,
      });
    } catch {
      set({ loading: false, hasMore: false });
    }
  },
}));
