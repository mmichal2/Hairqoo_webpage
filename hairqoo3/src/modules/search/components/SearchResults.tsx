"use client";

import { useEffect } from "react";
import { useSearchStore } from "@/core/state/searchStore";
import { useDict } from "@/core/state/i18nStore";
import { EntityCard } from "@/ui/cards/EntityCard";
import { Grid } from "@/ui/primitives/Grid";
import styles from "./SearchResults.module.css";

export function SearchResults({ initialQuery }: { initialQuery: string }) {
  const dict = useDict();
  const { groups, loading, failed, run, query } = useSearchStore();

  useEffect(() => {
    run(initialQuery);
  }, [initialQuery, run]);

  const total = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className={styles.results}>
      <header className={styles.head}>
        <h1 className={styles.title}>
          {query ? (
            <>
              {dict.search.resultsFor}{" "}
              <span className="strand-text">„{query}”</span>
            </>
          ) : (
            dict.search.allResults
          )}
        </h1>
        {!loading && (
          <p className={styles.count}>
            {total} {dict.search.itemsCount}
          </p>
        )}
      </header>

      {loading && <p className={styles.state}>{dict.common.loading}</p>}
      {failed && <p className={styles.state}>{dict.errors.searchFailed}</p>}

      {!loading && !failed && total === 0 && (
        <p className={styles.state}>{dict.search.noResults}</p>
      )}

      {!loading &&
        !failed &&
        groups.map((group) => (
          <section key={group.type} className={styles.group}>
            <h2 className={styles.groupTitle}>
              {group.label}
              <span className={styles.groupCount}>{group.items.length}</span>
            </h2>
            <Grid min={260}>
              {group.items.map((e) => (
                <EntityCard key={e.id} entity={e} />
              ))}
            </Grid>
          </section>
        ))}
    </div>
  );
}
