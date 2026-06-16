"use client";

import { useState } from "react";
import { useI18nStore } from "@/core/state/i18nStore";
import { useDict } from "@/core/state/i18nStore";
import { SUPPORTED_LANGUAGES } from "@/core/i18n/config";
import styles from "./LanguageSelector.module.css";

export function LanguageSelector() {
  const dict = useDict();
  const { lang, setLang } = useI18nStore();
  const [open, setOpen] = useState(false);
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === lang);

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={dict.common.language}
      >
        <span aria-hidden="true">{current?.flag}</span>
        <span className={styles.code}>{lang.toUpperCase()}</span>
      </button>
      {open && (
        <ul className={styles.menu} role="menu">
          {SUPPORTED_LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={l.code === lang}
                className={`${styles.item} ${l.code === lang ? styles.active : ""}`}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
              >
                <span aria-hidden="true">{l.flag}</span>
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
