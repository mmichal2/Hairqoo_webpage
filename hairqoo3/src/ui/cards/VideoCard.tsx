import Link from "next/link";
import type { Entity } from "@/core/entities/entity";
import { formatCompact } from "@/core/utils/format";
import { GlassPanel } from "@/ui/primitives/GlassPanel";
import { CardMedia } from "./CardMedia";
import styles from "./cards.module.css";

export function VideoCard({ entity }: { entity: Entity }) {
  return (
    <GlassPanel as="article" interactive className={styles.card}>
      <Link href={`/entity/${entity.type}/${entity.id}`} aria-label={entity.title}>
        <CardMedia entity={entity} showPlay />
      </Link>
      <div className={styles.body}>
        <h3 className={styles.title}>{entity.title}</h3>
        <div className={styles.meta}>
          <span>{formatCompact(entity.engagement.views)} wyświetleń</span>
        </div>
      </div>
    </GlassPanel>
  );
}
