"use client";

import { useDict } from "@/core/state/i18nStore";
import { Container } from "@/ui/primitives/Container";
import styles from "./DiscoverHeading.module.css";

export function DiscoverHeading() {
  const dict = useDict();
  return (
    <Container size="feed">
      <div className={styles.head}>
        <h2 className={styles.title}>{dict.sections.discover}</h2>
        <p className={styles.subtitle}>{dict.sections.discoverSub}</p>
      </div>
    </Container>
  );
}
