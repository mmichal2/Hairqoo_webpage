"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDict } from "@/core/state/i18nStore";
import { LanguageSelector } from "@/ui/filters/LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Header.module.css";

export function Header() {
  const dict = useDict();
  const pathname = usePathname();

  const links = [
    { href: "/discover", label: dict.nav.discover },
    { href: "/events", label: dict.nav.events },
    { href: "/calendar", label: dict.nav.calendar },
    { href: "/map", label: dict.nav.map },
    { href: "/education", label: dict.nav.education },
    { href: "/educators", label: dict.nav.educators },
    { href: "/products", label: dict.nav.products },
    { href: "/community", label: dict.nav.community },
    { href: "/career", label: dict.nav.career },
    { href: "/tv", label: dict.nav.tv },
    { href: "/awards", label: dict.nav.awards },
    { href: "/passport", label: dict.nav.passport },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label={dict.brand}>
          <Image
            src="/assets/images/hairlab_icon.png"
            alt=""
            width={30}
            height={30}
            className={styles.logo}
          />
          <span className={styles.brandText}>{dict.brand}</span>
        </Link>

        <nav className={styles.nav} aria-label={dict.layout.mainNav}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`${styles.navLink} ${
                pathname === l.href ? styles.active : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={styles.controls}>
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
