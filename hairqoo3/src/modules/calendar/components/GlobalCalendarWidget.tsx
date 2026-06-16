"use client";

import Link from "next/link";
import { useState } from "react";
import { useDict } from "@/core/state/i18nStore";
import { useI18nStore } from "@/core/state/i18nStore";
import { getByType } from "@/core/data/queries";
import { formatDate } from "@/core/utils/format";
import { SPEECH_LOCALES } from "@/core/i18n/speech-locales";
import { Section } from "@/ui/primitives/Section";
import { GlassPanel } from "@/ui/primitives/GlassPanel";
import styles from "./GlobalCalendarWidget.module.css";

type View = "month" | "week" | "year";

export function GlobalCalendarWidget() {
  const dict = useDict();
  const lang = useI18nStore((s) => s.lang);
  const [view, setView] = useState<View>("month");
  const events = getByType("event", 6)
    .filter((e) => e.dateEvent)
    .sort((a, b) => (a.dateEvent! < b.dateEvent! ? -1 : 1));

  const views: { id: View; label: string }[] = [
    { id: "month", label: dict.calendar.month },
    { id: "week", label: dict.calendar.week },
    { id: "year", label: dict.calendar.year },
  ];

  const dateLocale = SPEECH_LOCALES[lang] ?? "pl-PL";

  return (
    <Section
      id="calendar"
      title={dict.sections.calendar}
      subtitle={dict.sections.calendarSub}
      action={
        <Link href="/calendar" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
          {dict.sections.seeAll} →
        </Link>
      }
    >
      <GlassPanel className={styles.panel}>
        <div className={styles.tabs} role="tablist">
          {views.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={view === v.id}
              className={`${styles.tab} ${view === v.id ? styles.tabOn : ""}`}
              onClick={() => setView(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>
        <ul className={styles.list}>
          {events.map((e) => {
            const d = new Date(e.dateEvent!);
            return (
              <li key={e.id} className={styles.row}>
                <span className={styles.date}>
                  <span className={styles.day}>{d.getDate()}</span>
                  <span className={styles.mon}>
                    {d.toLocaleDateString(dateLocale, { month: "short" })}
                  </span>
                </span>
                <span className={styles.info}>
                  <Link href={`/entity/event/${e.id}`} className={styles.name}>
                    {e.title}
                  </Link>
                  <span className={styles.loc}>
                    {e.location} · {formatDate(e.dateEvent, dateLocale)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </GlassPanel>
    </Section>
  );
}
