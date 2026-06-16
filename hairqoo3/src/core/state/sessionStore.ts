"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserType = "stylist" | "barber" | "educator" | "brand" | "student";

interface SessionState {
  userType: UserType | null;
  country: string | null;
  savedItems: string[];
  setUserType: (t: UserType | null) => void;
  setCountry: (c: string | null) => void;
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      userType: null,
      country: null,
      savedItems: [],
      setUserType: (userType) => set({ userType }),
      setCountry: (country) => set({ country }),
      toggleSaved: (id) =>
        set((s) => ({
          savedItems: s.savedItems.includes(id)
            ? s.savedItems.filter((x) => x !== id)
            : [...s.savedItems, id],
        })),
      isSaved: (id) => get().savedItems.includes(id),
    }),
    { name: "hairqoo3_session" }
  )
);
