"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDict } from "@/core/state/i18nStore";
import { useSearchStore } from "@/core/state/searchStore";
import { getTrendingTags } from "@/core/data/queries";
import { VoiceInputButton } from "@/ui/inputs/VoiceInputButton";
import styles from "./GlobalSearchBar.module.css";

const TRENDING = getTrendingTags(6);

export function GlobalSearchBar({ sticky = false }: { sticky?: boolean }) {
  const dict = useDict();
  const router = useRouter();
  const setQuery = useSearchStore((s) => s.setQuery);
  const query = useSearchStore((s) => s.query);
  const [local, setLocal] = useState(query);
  const [focused, setFocused] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function submit(value: string) {
    const q = value.trim();
    if (!q) return;
    setQuery(q);
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setFocused(false);
  }

  return (
    <div
      ref={boxRef}
      className={`${styles.wrap} ${sticky ? styles.sticky : ""}`}
      data-open={focused}
    >
      <form
        className={styles.bar}
        onSubmit={(e) => {
          e.preventDefault();
          submit(local);
        }}
        role="search"
      >
        <span className={styles.icon} aria-hidden="true">
          🔍
        </span>
        <input
          className={styles.input}
          type="search"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={dict.search.placeholder}
          aria-label={dict.search.placeholder}
          enterKeyHint="search"
        />
        <VoiceInputButton
          onTranscript={setLocal}
          onFinal={(text) => submit(text)}
        />
        <button type="submit" className={styles.submit}>
          {dict.search.submit}
        </button>
      </form>

      {focused && (
        <div className={styles.panel}>
          <p className={styles.panelLabel}>{dict.search.trending}</p>
          <ul className={styles.tagList}>
            {TRENDING.map((tag) => (
              <li key={tag}>
                <button
                  type="button"
                  className={styles.tag}
                  onClick={() => {
                    setLocal(tag);
                    submit(tag);
                  }}
                >
                  #{tag}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
