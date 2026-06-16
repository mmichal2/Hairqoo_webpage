import type { FeedPage } from "@/core/entities/entity";
import { getFeedPage } from "@/core/data/queries";

/** Repozytorium feedu — mock data lokalnie (działa na hairqoo.com bez serwera API). */
export const feedRepo = {
  async getPage(cursor: string | null): Promise<FeedPage> {
    return getFeedPage(cursor);
  },
};
