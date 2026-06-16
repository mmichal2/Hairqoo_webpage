"use client";

import Link from "next/link";
import { useState } from "react";
import { useDict } from "@/core/state/i18nStore";
import { getByType } from "@/core/data/queries";
import { Section } from "@/ui/primitives/Section";
import { GlassPanel } from "@/ui/primitives/GlassPanel";
import { Grid } from "@/ui/primitives/Grid";
import { ScoreBadge } from "@/ui/badges/ScoreBadge";
import styles from "./AwardsPreview.module.css";

export function AwardsPreview() {
  const dict = useDict();
  const categories = [
    { key: dict.awards.educatorOfYear, nominee: getByType("educator", 1)[0] },
    { key: dict.awards.eventOfYear, nominee: getByType("event", 1)[0] },
    { key: dict.awards.productOfYear, nominee: getByType("product", 1)[0] },
  ].filter((c) => c.nominee);

  const [voted, setVoted] = useState<Record<string, boolean>>({});

  return (
    <Section
      id="awards"
      title={dict.sections.awards}
      subtitle={dict.sections.awardsSub}
      action={
        <Link href="/awards" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
          {dict.sections.seeAll} →
        </Link>
      }
    >
      <Grid min={280}>
        {categories.map((c) => (
          <GlassPanel key={c.key} className={styles.cat}>
            <span className={styles.catName}>{c.key}</span>
            <div className={styles.nominee}>
              <span className={styles.trophy} aria-hidden="true">
                🏆
              </span>
              <div>
                <p className={styles.nomTitle}>{c.nominee!.title}</p>
                {typeof c.nominee!.score === "number" && (
                  <ScoreBadge score={c.nominee!.score} size="sm" />
                )}
              </div>
            </div>
            <button
              type="button"
              className={`${styles.vote} ${voted[c.key] ? styles.voted : ""}`}
              onClick={() => setVoted((v) => ({ ...v, [c.key]: !v[c.key] }))}
            >
              {voted[c.key] ? dict.awards.voted : dict.awards.vote}
            </button>
          </GlassPanel>
        ))}
      </Grid>
    </Section>
  );
}
