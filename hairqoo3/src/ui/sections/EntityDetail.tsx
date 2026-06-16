"use client";

import Image from "next/image";
import Link from "next/link";
import type { Entity } from "@/core/entities/entity";
import { formatCompact, formatDate } from "@/core/utils/format";
import { useDict } from "@/core/state/i18nStore";
import { Container } from "@/ui/primitives/Container";
import { Grid } from "@/ui/primitives/Grid";
import { GlassPanel } from "@/ui/primitives/GlassPanel";
import { ScoreBadge } from "@/ui/badges/ScoreBadge";
import { VerifiedBadge } from "@/ui/badges/VerifiedBadge";
import { EntityCard } from "@/ui/cards/EntityCard";
import styles from "./EntityDetail.module.css";

export function EntityDetail({
  entity,
  related,
}: {
  entity: Entity;
  related: Entity[];
}) {
  const dict = useDict();
  const cover = entity.media[0];

  return (
    <Container>
      <article className={styles.detail}>
        <div className={styles.hero}>
          {cover && (
            <Image
              src={cover.url}
              alt={cover.alt ?? entity.title}
              fill
              sizes="(max-width: 900px) 100vw, 900px"
              style={{
                objectFit: "cover",
                objectPosition: cover.focalPoint ?? "center",
              }}
              priority
            />
          )}
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.head}>
          <div className={styles.badges}>
            <span className={styles.type}>{dict.entityTypes[entity.type]}</span>
            {entity.verified && <VerifiedBadge type={entity.type} withLabel />}
            {typeof entity.score === "number" && (
              <ScoreBadge score={entity.score} />
            )}
          </div>
          <h1 className={styles.title}>{entity.title}</h1>
          <p className={styles.meta}>
            {[entity.location, entity.country, formatDate(entity.dateEvent)]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className={styles.desc}>{entity.description}</p>

          <ul className={styles.tags}>
            {entity.tags.map((t) => (
              <li key={t} className={styles.tag}>
                #{t}
              </li>
            ))}
          </ul>

          <GlassPanel className={styles.stats}>
            <Stat
              label={dict.entityDetail.views}
              value={formatCompact(entity.engagement.views)}
            />
            <Stat
              label={dict.entityDetail.likes}
              value={formatCompact(entity.engagement.likes)}
            />
            <Stat
              label={dict.entityDetail.saves}
              value={formatCompact(entity.engagement.saves)}
            />
            <Stat
              label={dict.entityDetail.shares}
              value={formatCompact(entity.engagement.shares)}
            />
          </GlassPanel>
        </div>

        {related.length > 0 && (
          <section className={styles.related}>
            <h2 className={styles.relatedTitle}>{dict.common.similar}</h2>
            <Grid min={240}>
              {related.map((e) => (
                <EntityCard key={e.id} entity={e} />
              ))}
            </Grid>
          </section>
        )}

        <Link href="/" className={styles.back}>
          ← {dict.common.backHome}
        </Link>
      </article>
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
