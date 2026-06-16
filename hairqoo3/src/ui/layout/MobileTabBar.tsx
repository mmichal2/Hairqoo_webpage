"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDict } from "@/core/state/i18nStore";
import styles from "./MobileTabBar.module.css";

export function MobileTabBar() {
  const dict = useDict();
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: dict.layout.homeTab, icon: "⌂" },
    { href: "/discover", label: dict.nav.discover, icon: "✦" },
    { href: "/events", label: dict.nav.events, icon: "◷" },
    { href: "/map", label: dict.nav.map, icon: "◉" },
    { href: "/educators", label: dict.nav.educators, icon: "✎" },
  ];

  return (
    <nav className={styles.bar} aria-label={dict.layout.mobileNav}>
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`${styles.tab} ${active ? styles.active : ""}`}
          >
            <span className={styles.icon} aria-hidden="true">
              {t.icon}
            </span>
            <span className={styles.label}>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
