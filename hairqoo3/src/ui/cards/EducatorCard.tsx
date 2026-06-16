import Link from "next/link";
import type { Entity } from "@/core/entities/entity";
import { GlassPanel } from "@/ui/primitives/GlassPanel";
import { CardMedia } from "./CardMedia";
import styles from "./cards.module.css";

export function EducatorCard({ entity }: { entity: Entity }) {
  return (
    <GlassPanel as="article" interactive className={styles.card}>
      <Link href={`/entity/${entity.type}/${entity.id}`} aria-label={entity.title}>
        <CardMedia entity={entity} tall />
      </Link>
      <div className={styles.body}>
        <h3 className={styles.title}>{entity.title}</h3>
        <p className={styles.desc}>{entity.description}</p>
        <div className={styles.meta}>
          {entity.country && <span>{entity.country}</span>}
          {entity.tags[0] && (
            <>
              <span className={styles.dot} />
              <span>{entity.tags[0]}</span>
            </>
          )}
        </div>
      </div>
    </GlassPanel>
  );
}
