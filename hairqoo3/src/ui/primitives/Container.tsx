import type { CSSProperties, ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  size?: "content" | "feed";
  className?: string;
  style?: CSSProperties;
}

export function Container({
  children,
  size = "content",
  className,
  style,
}: ContainerProps) {
  const maxWidth = size === "feed" ? "var(--feed-max)" : "var(--content-max)";
  return (
    <div
      className={className}
      style={{
        width: "100%",
        maxWidth,
        marginInline: "auto",
        paddingInline: "var(--space-md)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
