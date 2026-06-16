import type { CSSProperties, ReactNode } from "react";
import styles from "./GlassPanel.module.css";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "article" | "section" | "aside";
  interactive?: boolean;
}

export function GlassPanel({
  children,
  className,
  style,
  as: Tag = "div",
  interactive = false,
}: GlassPanelProps) {
  return (
    <Tag
      className={`${styles.panel} ${interactive ? styles.interactive : ""} ${
        className ?? ""
      }`}
      style={style}
    >
      {children}
    </Tag>
  );
}
