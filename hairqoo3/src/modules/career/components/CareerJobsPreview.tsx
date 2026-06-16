"use client";

import Link from "next/link";
import { useDict } from "@/core/state/i18nStore";
import { getByType } from "@/core/data/queries";
import { Section } from "@/ui/primitives/Section";
import { GlassPanel } from "@/ui/primitives/GlassPanel";
import { Grid } from "@/ui/primitives/Grid";
import styles from "./CareerJobsPreview.module.css";

export function CareerJobsPreview() {
  const dict = useDict();
  const salons = getByType("salon", 2);
  const academies = getByType("academy", 2);
  const hirers = [...salons, ...academies];

  return (
    <Section
      id="career"
      title={dict.sections.career}
      subtitle={dict.sections.careerSub}
      action={
        <Link href="/career" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
          {dict.sections.seeAll} →
        </Link>
      }
    >
      <Grid min={260}>
        {hirers.map((e, i) => (
          <GlassPanel key={e.id} interactive className={styles.job}>
            <span className={styles.role}>
              {dict.career.roles[i % dict.career.roles.length]}
            </span>
            <h3 className={styles.title}>{e.title}</h3>
            <p className={styles.meta}>{e.location ?? e.country}</p>
            <span className={styles.cta}>{dict.career.apply}</span>
          </GlassPanel>
        ))}
      </Grid>
    </Section>
  );
}
