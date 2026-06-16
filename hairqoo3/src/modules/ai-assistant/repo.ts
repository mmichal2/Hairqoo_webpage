import type { AIResponse, LanguageCode } from "@/core/entities/entity";
import { aiAsk } from "@/core/data/queries";

/** Repozytorium asystenta AI — mock data lokalnie (działa na hairqoo.com bez serwera API). */
export const aiRepo = {
  async ask(prompt: string, lang: LanguageCode = "pl"): Promise<AIResponse> {
    return aiAsk(prompt, lang);
  },
};
