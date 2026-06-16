"use client";

import Link from "next/link";
import { useDict } from "@/core/state/i18nStore";
import { Section } from "@/ui/primitives/Section";
import { GlassPanel } from "@/ui/primitives/GlassPanel";
import styles from "./PassportPreview.module.css";

const ICONS = ["🎓", "🎟", "✂", "✦"];

export function PassportPreview() {
  const dict = useDict();
  return (
    <Section
      id="passport"
      title={dict.sections.passport}
      subtitle={dict.sections.passportSub}
      action={
        <Link href="/passport" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
          {dict.sections.seeAll} →
        </Link>
      }
    >
      <GlassPanel className={styles.passport}>
        <ol className={styles.timeline}>
          {dict.passport.items.map((t, i) => (
            <li key={`${t.year}-${i}`} className={styles.item}>
              <span className={styles.icon} aria-hidden="true">
                {ICONS[i % ICONS.length]}
              </span>
              <div className={styles.content}>
                <span className={styles.year}>{t.year}</span>
                <span className={styles.label}>{t.label}</span>
              </div>
            </li>
          ))}
        </ol>
      </GlassPanel>
    </Section>
  );
}
