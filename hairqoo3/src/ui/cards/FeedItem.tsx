"use client";

import Link from "next/link";
import Image from "next/image";
import type { Entity } from "@/core/entities/entity";
import { formatCompact } from "@/core/utils/format";
import { useDict } from "@/core/state/i18nStore";
import { GlassPanel } from "@/ui/primitives/GlassPanel";
import { ScoreBadge } from "@/ui/badges/ScoreBadge";
import { VerifiedBadge } from "@/ui/badges/VerifiedBadge";
import styles from "./FeedItem.module.css";

/** Pełnoszerokościowy element feedu (TikTok-style) dla DiscoverFeed. */
export function FeedItem({ entity }: { entity: Entity }) {
  const dict = useDict();
  const cover = entity.media[0];
  const isVideo = entity.type === "video";

  return (
    <GlassPanel as="article" className={styles.item}>
      <Link
        href={`/entity/${entity.type}/${entity.id}`}
        className={styles.mediaLink}
        aria-label={entity.title}
      >
        <div className={styles.media}>
          {cover && (
            <Image
              src={cover.url}
              alt={cover.alt ?? entity.title}
              fill
              sizes="(max-width: 720px) 100vw, 720px"
              style={{
                objectFit: "cover",
                objectPosition: cover.focalPoint ?? "center",
              }}
            />
          )}
          {isVideo && (
            <span className={styles.play} aria-hidden="true">
              ▶
            </span>
          )}
          <div className={styles.overlay}>
            <span className={styles.type}>{dict.entityTypes[entity.type]}</span>
          </div>
        </div>
      </Link>

      <div className={styles.body}>
        <div className={styles.headRow}>
          <h3 className={styles.title}>{entity.title}</h3>
          {typeof entity.score === "number" && <ScoreBadge score={entity.score} />}
        </div>
        <p className={styles.desc}>{entity.description}</p>

        <div className={styles.footer}>
          <div className={styles.author}>
            {entity.verified && <VerifiedBadge type={entity.type} />}
            {entity.location && <span>{entity.location}</span>}
          </div>
          <div className={styles.engagement}>
            <span>♡ {formatCompact(entity.engagement.likes)}</span>
            <span>↗ {formatCompact(entity.engagement.shares)}</span>
            <span>◷ {formatCompact(entity.engagement.views)}</span>
          </div>
        </div>

        {entity.tags.length > 0 && (
          <ul className={styles.tags}>
            {entity.tags.slice(0, 4).map((tag) => (
              <li key={tag} className={styles.tag}>
                #{tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </GlassPanel>
  );
}
