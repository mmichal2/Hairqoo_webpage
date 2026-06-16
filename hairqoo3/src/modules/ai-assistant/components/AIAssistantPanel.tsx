"use client";

import { useAIStore } from "@/core/state/aiStore";
import { useDict } from "@/core/state/i18nStore";
import { GlassPanel } from "@/ui/primitives/GlassPanel";
import styles from "./AIAssistantPanel.module.css";

export function AIAssistantPanel() {
  const dict = useDict();
  const { setOpen, ask } = useAIStore();

  function start(prompt: string) {
    setOpen(true);
    ask(prompt);
  }

  return (
    <GlassPanel className={styles.panel}>
      <div className={styles.head}>
        <span className={styles.badge} aria-hidden="true">
          ✦ AI
        </span>
        <h2 className={styles.title}>{dict.ai.title}</h2>
        <p className={styles.subtitle}>{dict.ai.subtitle}</p>
      </div>
      <div className={styles.prompts}>
        {dict.ai.prompts.map((p) => (
          <button
            key={p}
            type="button"
            className={styles.prompt}
            onClick={() => start(p)}
          >
            {p}
          </button>
        ))}
      </div>
      <button type="button" className={styles.openBtn} onClick={() => setOpen(true)}>
        {dict.ai.open} →
      </button>
    </GlassPanel>
  );
}
