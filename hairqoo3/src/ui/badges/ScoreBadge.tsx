import styles from "./ScoreBadge.module.css";

interface ScoreBadgeProps {
  /** HairQoo Score 0-100 */
  score: number;
  size?: "sm" | "md";
}

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const tier = score >= 90 ? "elite" : score >= 75 ? "high" : "base";
  return (
    <span
      className={`${styles.badge} ${styles[size]} ${styles[tier]}`}
      title={`HairQoo Score: ${score}`}
      aria-label={`HairQoo Score ${score} na 100`}
    >
      <span className={styles.spark} aria-hidden="true">
        ✦
      </span>
      {score}
    </span>
  );
}
