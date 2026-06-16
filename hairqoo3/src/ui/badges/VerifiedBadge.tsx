"use client";

import type { EntityType } from "@/core/entities/entity";
import { useDict } from "@/core/state/i18nStore";
import styles from "./VerifiedBadge.module.css";

interface VerifiedBadgeProps {
  type?: EntityType;
  withLabel?: boolean;
}

export function VerifiedBadge({ type, withLabel = false }: VerifiedBadgeProps) {
  const dict = useDict();
  const label =
    (type && dict.verified[type]) || dict.verified.default;

  return (
    <span className={styles.badge} title={label} aria-label={label}>
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 1l2.9 2.1 3.5-.4 1.1 3.4 2.9 2-1.3 3.3 1.3 3.3-2.9 2-1.1 3.4-3.5-.4L12 23l-2.9-2.1-3.5.4-1.1-3.4-2.9-2 1.3-3.3L1.6 9.2l2.9-2 1.1-3.4 3.5.4L12 1z"
        />
        <path
          fill="var(--cosmic-void)"
          d="M10.6 14.6l-2.2-2.2-1.3 1.3 3.5 3.5 6-6-1.3-1.3z"
        />
      </svg>
      {withLabel && <span className={styles.label}>{label}</span>}
    </span>
  );
}
