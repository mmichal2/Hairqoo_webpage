"use client";

import Link from "next/link";
import { useDict } from "@/core/state/i18nStore";
import { getAllEntities } from "@/core/data/queries";
import { Section } from "@/ui/primitives/Section";
import { GlassPanel } from "@/ui/primitives/GlassPanel";
import styles from "./WorldMapInteractive.module.css";

interface CountryStat {
  country: string;
  total: number;
}

export function WorldMapInteractive() {
  const dict = useDict();
  const counts = new Map<string, number>();
  for (const e of getAllEntities()) {
    if (e.country) counts.set(e.country, (counts.get(e.country) ?? 0) + 1);
  }
  const stats: CountryStat[] = Array.from(counts.entries())
    .map(([country, total]) => ({ country, total }))
    .sort((a, b) => b.total - a.total);

  return (
    <Section
      id="map"
      title={dict.sections.map}
      subtitle={dict.sections.mapSub}
      action={
        <Link href="/map" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
          {dict.sections.seeAll} →
        </Link>
      }
    >
      <GlassPanel className={styles.map}>
        <div className={styles.globe} aria-hidden="true">
          <div className={styles.grid} />
          <span className={styles.pulse} style={{ left: "30%", top: "40%" }} />
          <span className={styles.pulse} style={{ left: "52%", top: "32%" }} />
          <span className={styles.pulse} style={{ left: "64%", top: "56%" }} />
          <span className={styles.pulse} style={{ left: "44%", top: "62%" }} />
        </div>
        <div className={styles.countries}>
          <p className={styles.label}>{dict.map.ecosystemLabel}</p>
          <ul className={styles.list}>
            {stats.map((s) => (
              <li key={s.country}>
                <Link
                  href={`/map?country=${encodeURIComponent(s.country)}`}
                  className={styles.country}
                >
                  <span>{s.country}</span>
                  <span className={styles.count}>{s.total}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </GlassPanel>
    </Section>
  );
}
