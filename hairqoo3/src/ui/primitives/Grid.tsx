import type { CSSProperties, ReactNode } from "react";

interface GridProps {
  children: ReactNode;
  /** Minimalna szerokość kolumny dla auto-fit. */
  min?: number;
  gap?: string;
  className?: string;
  style?: CSSProperties;
}

export function Grid({
  children,
  min = 260,
  gap = "var(--space-md)",
  className,
  style,
}: GridProps) {
  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))`,
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
