"use client";

import { useDict } from "@/core/state/i18nStore";
import { Container } from "@/ui/primitives/Container";
import { GlobalSearchBar } from "@/modules/search";
import styles from "./HomeHero.module.css";

export function HomeHero() {
  const dict = useDict();
  return (
    <section className={styles.hero}>
      <Container>
        <p className={styles.kicker}>{dict.tagline}</p>
        <h1 className={styles.title}>
          {dict.hero.title}{" "}
          <span className="strand-text">{dict.hero.highlight}</span>
        </h1>
        <p className={styles.lead}>{dict.hero.lead}</p>
        <div className={styles.search}>
          <GlobalSearchBar />
        </div>
      </Container>
    </section>
  );
}
