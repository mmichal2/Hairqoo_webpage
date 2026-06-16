"use client";

import { useState } from "react";
import { useDict } from "@/core/state/i18nStore";
import { GlassPanel } from "@/ui/primitives/GlassPanel";
import styles from "./NewsletterSignup.module.css";

export function NewsletterSignup() {
  const dict = useDict();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <GlassPanel className={styles.panel}>
      <div className={styles.copy}>
        <h2 className={styles.title}>{dict.newsletter.title}</h2>
        <p className={styles.desc}>{dict.newsletter.desc}</p>
      </div>
      {done ? (
        <p className={styles.success}>{dict.newsletter.success}</p>
      ) : (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) setDone(true);
          }}
        >
          <input
            type="email"
            required
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={dict.newsletter.placeholder}
            aria-label={dict.newsletter.placeholder}
          />
          <button type="submit" className={styles.cta}>
            {dict.newsletter.cta}
          </button>
        </form>
      )}
    </GlassPanel>
  );
}
