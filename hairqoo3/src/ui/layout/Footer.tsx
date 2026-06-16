"use client";

import Link from "next/link";
import { useDict } from "@/core/state/i18nStore";
import { Container } from "@/ui/primitives/Container";
import { LanguageSelector } from "@/ui/filters/LanguageSelector";
import styles from "./Footer.module.css";

export function Footer() {
  const dict = useDict();
  const year = new Date().getFullYear();

  const cols = [
    {
      title: dict.footer.product,
      links: [
        { href: "/discover", label: dict.nav.discover },
        { href: "/events", label: dict.nav.events },
        { href: "/education", label: dict.nav.education },
        { href: "/products", label: dict.nav.products },
        { href: "/tv", label: dict.nav.tv },
      ],
    },
    {
      title: dict.footer.company,
      links: [
        { href: "/awards", label: dict.nav.awards },
        { href: "/career", label: dict.nav.career },
        { href: "/community", label: dict.nav.community },
        { href: "/passport", label: dict.nav.passport },
      ],
    },
    {
      title: dict.footer.legal,
      links: [
        { href: "/legal/privacy", label: dict.footer.privacy },
        { href: "/legal/terms", label: dict.footer.terms },
        { href: "/legal/cookies", label: dict.footer.cookies },
      ],
    },
  ];

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <span className={`${styles.brand} strand-text`}>{dict.brand}</span>
            <p className={styles.tagline}>{dict.tagline}</p>
            <div className={styles.lang}>
              <span className={styles.langLabel}>{dict.footer.language}</span>
              <LanguageSelector />
            </div>
          </div>

          {cols.map((col) => (
            <nav key={col.title} className={styles.col} aria-label={col.title}>
              <h3 className={styles.colTitle}>{col.title}</h3>
              <ul className={styles.list}>
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={styles.link}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className={styles.bottom}>
          <span>
            © {year} {dict.brand}. {dict.footer.rights}
          </span>
          <div className={styles.social}>
            <a href="#" aria-label="Instagram">
              IG
            </a>
            <a href="#" aria-label="TikTok">
              TT
            </a>
            <a href="#" aria-label="YouTube">
              YT
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
