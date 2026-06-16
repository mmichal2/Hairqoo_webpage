"use client";

import { useFiltersStore } from "@/core/state/filtersStore";
import styles from "./TagChips.module.css";

export function TagChips({ tags }: { tags: string[] }) {
  const { tags: active, toggleTag } = useFiltersStore();

  return (
    <ul className={styles.list}>
      {tags.map((tag) => {
        const on = active.includes(tag);
        return (
          <li key={tag}>
            <button
              type="button"
              className={`${styles.chip} ${on ? styles.on : ""}`}
              aria-pressed={on}
              onClick={() => toggleTag(tag)}
            >
              #{tag}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
