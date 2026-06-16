"use client";

import { create } from "zustand";
import type { Entity } from "@/core/entities/entity";
import { aiRepo } from "@/modules/ai-assistant/repo";
import { useI18nStore } from "./i18nStore";

export interface AIMessage {
  role: "user" | "assistant";
  text: string;
  entities?: Entity[];
  links?: { label: string; href: string }[];
}

interface AIState {
  open: boolean;
  thread: AIMessage[];
  loading: boolean;
  failed: boolean;
  setOpen: (open: boolean) => void;
  ask: (prompt: string) => Promise<void>;
}

export const useAIStore = create<AIState>((set, get) => ({
  open: false,
  thread: [],
  loading: false,
  failed: false,
  setOpen: (open) => set({ open }),
  ask: async (prompt) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const lang = useI18nStore.getState().lang;
    set({
      thread: [...get().thread, { role: "user", text: trimmed }],
      loading: true,
      failed: false,
    });
    try {
      const res = await aiRepo.ask(trimmed, lang);
      set({
        thread: [
          ...get().thread,
          {
            role: "assistant",
            text: res.answer,
            entities: res.entities,
            links: res.links,
          },
        ],
        loading: false,
        failed: false,
      });
    } catch {
      set({ loading: false, failed: true });
    }
  },
}));
