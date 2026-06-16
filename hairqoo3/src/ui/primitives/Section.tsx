import type { ReactNode } from "react";
import { Container } from "./Container";
import styles from "./Section.module.css";

interface SectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  size?: "content" | "feed";
}

export function Section({
  id,
  title,
  subtitle,
  action,
  children,
  size = "content",
}: SectionProps) {
  return (
    <section id={id} className={styles.section}>
      <Container size={size}>
        {(title || action) && (
          <header className={styles.header}>
            <div>
              {title && <h2 className={styles.title}>{title}</h2>}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            {action && <div className={styles.action}>{action}</div>}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
