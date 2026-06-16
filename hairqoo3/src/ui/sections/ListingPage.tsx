"use client";

import { useMemo } from "react";
import type { Entity, EntityType } from "@/core/entities/entity";
import { getAllEntities, getCountries, getTrendingTags } from "@/core/data/queries";
import { useFiltersStore } from "@/core/state/filtersStore";
import { useDict } from "@/core/state/i18nStore";
import { Container } from "@/ui/primitives/Container";
import { Grid } from "@/ui/primitives/Grid";
import { EntityCard } from "@/ui/cards/EntityCard";
import { CountryFilter } from "@/ui/filters/CountryFilter";
import { TagChips } from "@/ui/filters/TagChips";
import styles from "./ListingPage.module.css";

interface ListingPageProps {
  title: string;
  subtitle?: string;
  /** Filtruj do tych typów; pusto = wszystkie. */
  types?: EntityType[];
}

export function ListingPage({ title, subtitle, types }: ListingPageProps) {
  const dict = useDict();
  const { country, tags } = useFiltersStore();
  const countries = useMemo(() => getCountries(), []);
  const topTags = useMemo(() => getTrendingTags(10), []);

  const items = useMemo<Entity[]>(() => {
    let pool = getAllEntities();
    if (types && types.length) pool = pool.filter((e) => types.includes(e.type));
    if (country) pool = pool.filter((e) => e.country === country);
    if (tags.length) pool = pool.filter((e) => tags.some((t) => e.tags.includes(t)));
    return pool.sort(
      (a, b) => (b.score ?? 50) - (a.score ?? 50) || b.engagement.views - a.engagement.views
    );
  }, [types, country, tags]);

  return (
    <Container>
      <header className={styles.head}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </header>

      <div className={styles.filters}>
        <CountryFilter countries={countries} />
        <TagChips tags={topTags} />
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>{dict.common.noFilterResults}</p>
      ) : (
        <Grid min={260}>
          {items.map((e) => (
            <EntityCard key={e.id} entity={e} />
          ))}
        </Grid>
      )}
    </Container>
  );
}
