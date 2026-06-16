"use client";

import Link from "next/link";
import { useState } from "react";
import { useAIStore } from "@/core/state/aiStore";
import { useDict } from "@/core/state/i18nStore";
import { VoiceInputButton } from "@/ui/inputs/VoiceInputButton";
import styles from "./AIAssistantWidget.module.css";

export function AIAssistantWidget() {
  const dict = useDict();
  const { open, setOpen, thread, loading, failed, ask } = useAIStore();
  const [input, setInput] = useState("");

  function send(value: string) {
    const v = value.trim();
    if (!v) return;
    ask(v);
    setInput("");
  }

  return (
    <>
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen(true)}
        aria-label={dict.ai.open}
      >
        <span aria-hidden="true">✦</span>
        <span className={styles.fabLabel}>{dict.ai.title}</span>
      </button>

      {open && (
        <div className={styles.scrim} onClick={() => setOpen(false)}>
          <aside
            className={styles.drawer}
            role="dialog"
            aria-label={dict.ai.title}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={styles.head}>
              <div>
                <h2 className={styles.title}>{dict.ai.title}</h2>
                <p className={styles.subtitle}>{dict.ai.subtitle}</p>
              </div>
              <button
                type="button"
                className={styles.close}
                onClick={() => setOpen(false)}
                aria-label={dict.common.close}
              >
                ✕
              </button>
            </header>

            <div className={styles.thread}>
              {thread.length === 0 && (
                <div className={styles.suggest}>
                  <p className={styles.suggestLabel}>{dict.ai.suggestionsTitle}</p>
                  {dict.ai.prompts.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={styles.suggestBtn}
                      onClick={() => send(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {thread.map((msg, i) => (
                <div
                  key={i}
                  className={`${styles.msg} ${
                    msg.role === "user" ? styles.user : styles.assistant
                  }`}
                >
                  <p className={styles.msgText}>{msg.text}</p>
                  {msg.entities && msg.entities.length > 0 && (
                    <ul className={styles.entityList}>
                      {msg.entities.map((e) => (
                        <li key={e.id}>
                          <Link
                            href={`/entity/${e.type}/${e.id}`}
                            className={styles.entityLink}
                            onClick={() => setOpen(false)}
                          >
                            <span className={styles.entityTitle}>{e.title}</span>
                            {e.location && (
                              <span className={styles.entityMeta}>{e.location}</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {msg.links && msg.links.length > 0 && (
                    <div className={styles.links}>
                      {msg.links.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          className={styles.navLink}
                          onClick={() => setOpen(false)}
                        >
                          {l.label} →
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && <p className={styles.thinking}>{dict.ai.thinking}</p>}
              {failed && !loading && (
                <p className={styles.thinking}>{dict.errors.aiFailed}</p>
              )}
            </div>

            <form
              className={styles.inputBar}
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                className={styles.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={dict.ai.placeholder}
                aria-label={dict.ai.placeholder}
              />
              <VoiceInputButton
                onTranscript={setInput}
                onFinal={(text) => send(text)}
              />
              <button type="submit" className={styles.send} disabled={loading}>
                {dict.ai.send}
              </button>
            </form>
          </aside>
        </div>
      )}
    </>
  );
}
