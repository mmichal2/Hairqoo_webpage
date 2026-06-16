import type { LanguageCode } from "@/core/entities/entity";
import type { FilterParams } from "@/core/data/queries";
import { search, suggestions } from "@/core/data/queries";

export interface SearchResponse {
  query: string;
  groups: ReturnType<typeof search>;
  suggestions: string[];
}

/** Repozytorium wyszukiwania — mock data lokalnie (działa na hairqoo.com bez serwera API). */
export const searchRepo = {
  async search(
    query: string,
    filters: FilterParams = {},
    lang: LanguageCode = "pl"
  ): Promise<SearchResponse> {
    return {
      query,
      groups: search(query, filters, lang),
      suggestions: suggestions(query),
    };
  },
};
