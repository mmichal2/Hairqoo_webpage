"use client";

import { GlobalSearchBar } from "@/modules/search";
import styles from "./MobileSearchBar.module.css";

/** Sticky search bar — widoczny tylko na mobile (zgodnie z mobile-first rules). */
export function MobileSearchBar() {
  return (
    <div className={styles.wrap}>
      <GlobalSearchBar />
    </div>
  );
}
