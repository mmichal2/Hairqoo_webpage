"use client";

import { useThemeStore } from "@/core/state/themeStore";
import { useDict } from "@/core/state/i18nStore";
import styles from "./ThemeToggle.module.css";

export function ThemeToggle() {
  const dict = useDict();
  const { theme, toggle } = useThemeStore();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={isDark ? dict.theme.light : dict.theme.dark}
      title={isDark ? dict.theme.light : dict.theme.dark}
    >
      <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
    </button>
  );
}
