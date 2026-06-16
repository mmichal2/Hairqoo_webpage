import Link from "next/link";
import type { Entity } from "@/core/entities/entity";
import { formatDate } from "@/core/utils/format";
import { GlassPanel } from "@/ui/primitives/GlassPanel";
import { CardMedia } from "./CardMedia";
import styles from "./cards.module.css";

export function EventCard({ entity }: { entity: Entity }) {
  return (
    <GlassPanel as="article" interactive className={styles.card}>
      <Link href={`/entity/${entity.type}/${entity.id}`} aria-label={entity.title}>
        <CardMedia entity={entity} />
      </Link>
      <div className={styles.body}>
        <h3 className={styles.title}>{entity.title}</h3>
        <p className={styles.desc}>{entity.description}</p>
        <div className={styles.meta}>
          {entity.dateEvent && <span>{formatDate(entity.dateEvent)}</span>}
          {entity.location && (
            <>
              <span className={styles.dot} />
              <span>{entity.location}</span>
            </>
          )}
        </div>
      </div>
    </GlassPanel>
  );
}
