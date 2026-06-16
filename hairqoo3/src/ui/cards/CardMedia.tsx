"use client";

import Image from "next/image";
import type { Entity } from "@/core/entities/entity";
import { useDict } from "@/core/state/i18nStore";
import { ScoreBadge } from "@/ui/badges/ScoreBadge";
import { VerifiedBadge } from "@/ui/badges/VerifiedBadge";
import styles from "./cards.module.css";

interface CardMediaProps {
  entity: Entity;
  tall?: boolean;
  showPlay?: boolean;
}

export function CardMedia({ entity, tall, showPlay }: CardMediaProps) {
  const dict = useDict();
  const cover = entity.media[0];
  const typeLabel = dict.entityTypes[entity.type];
  const isVideo = entity.type === "video";

  return (
    <div
      className={`${styles.media} ${tall ? styles.mediaTall : ""} ${
        isVideo ? styles.mediaVideo : ""
      }`}
    >
      {cover ? (
        <Image
          src={cover.url}
          alt={cover.alt ?? entity.title}
          fill
          sizes="(max-width: 640px) 80vw, 320px"
          style={{
            objectFit: "cover",
            objectPosition: cover.focalPoint ?? "center",
          }}
        />
      ) : null}
      <div className={styles.topRow}>
        <span className={styles.typeTag}>{typeLabel}</span>
        <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {entity.verified && <VerifiedBadge type={entity.type} />}
          {typeof entity.score === "number" && (
            <ScoreBadge score={entity.score} size="sm" />
          )}
        </span>
      </div>
      {showPlay && (
        <span className={styles.playIcon} aria-hidden="true">
          <span>▶</span>
        </span>
      )}
    </div>
  );
}
