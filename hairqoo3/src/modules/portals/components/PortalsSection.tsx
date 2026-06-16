"use client";

import { useDict } from "@/core/state/i18nStore";
import { Section } from "@/ui/primitives/Section";
import { GlassPanel } from "@/ui/primitives/GlassPanel";
import styles from "./PortalsSection.module.css";

/**
 * Sekcja portali Hairqoo — zachowana ze strony hairqoo.com:
 * "Twój biznes / Portal Fryzjera" oraz "Twoje wizyty / Portal Klienta".
 */
export function PortalsSection() {
  const dict = useDict();
  const p = dict.portals;

  return (
    <Section id="portals">
      <div className={styles.grid}>
        <div className={styles.col}>
          <h2 className={`${styles.headline} strand-text`}>{p.businessHeadline}</h2>
          <GlassPanel
            as="article"
            interactive
            className={`${styles.tile} ${styles.tileSalon}`}
          >
            <a className={styles.tileLink} href="/tour/#/salon/home" aria-label={p.salonTitle}>
              <span className={`${styles.icon} ${styles.iconSalon}`} aria-hidden="true">
                ✂
              </span>
              <h3 className={styles.tileTitle}>{p.salonTitle}</h3>
              <p className={styles.tileDesc}>{p.salonDesc}</p>
              <span className={styles.cta}>{p.salonCta}</span>
            </a>
          </GlassPanel>
        </div>

        <div className={styles.col}>
          <h2 className={`${styles.headline} ${styles.headlineRight} strand-text`}>
            {p.clientHeadline}
          </h2>
          <GlassPanel
            as="article"
            interactive
            className={`${styles.tile} ${styles.tileClient}`}
          >
            <a className={styles.tileLink} href="/tour/#/client/home" aria-label={p.clientTitle}>
              <span className={`${styles.icon} ${styles.iconClient}`} aria-hidden="true">
                ◇
              </span>
              <h3 className={styles.tileTitle}>{p.clientTitle}</h3>
              <p className={styles.tileDesc}>{p.clientDesc}</p>
              <span className={styles.cta}>{p.clientCta}</span>
            </a>
          </GlassPanel>
        </div>
      </div>
    </Section>
  );
}
