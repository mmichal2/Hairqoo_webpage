"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/core/state/themeStore";
import { useI18nStore } from "@/core/state/i18nStore";

/**
 * Stosuje motyw (data-theme) i język (lang) do <html> po hydratacji.
 * Stan trzymany w persistowanych store'ach Zustand.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const lang = useI18nStore((s) => s.lang);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  return <>{children}</>;
}
