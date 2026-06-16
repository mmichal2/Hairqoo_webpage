import type { ReactNode } from "react";
import styles from "./HScroll.module.css";

interface HScrollProps {
  children: ReactNode;
  className?: string;
}

/** Poziomy, przewijany rząd kart (carousel) — używany w preview-sekcjach. */
export function HScroll({ children, className }: HScrollProps) {
  return <div className={`${styles.row} ${className ?? ""}`}>{children}</div>;
}
