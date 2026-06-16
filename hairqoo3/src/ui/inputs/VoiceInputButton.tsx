"use client";

import { useDict } from "@/core/state/i18nStore";
import { useI18nStore } from "@/core/state/i18nStore";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import styles from "./VoiceInputButton.module.css";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  /** Po finalnej transkrypcji (auto-submit). */
  onFinal?: (text: string) => void;
  className?: string;
}

export function VoiceInputButton({
  onTranscript,
  onFinal,
  className,
}: VoiceInputButtonProps) {
  const dict = useDict();
  const lang = useI18nStore((s) => s.lang);

  const { listening, supported, error, toggle } = useSpeechRecognition({
    lang,
    onTranscript: (text, isFinal) => {
      onTranscript(text);
      if (isFinal) onFinal?.(text);
    },
  });

  if (!supported) return null;

  const title =
    error === "denied"
      ? dict.search.voiceDenied
      : listening
        ? dict.search.voiceListening
        : dict.search.voice;

  return (
    <button
      type="button"
      className={`${styles.btn} ${listening ? styles.listening : ""} ${
        className ?? ""
      }`}
      onClick={toggle}
      aria-label={title}
      title={title}
      aria-pressed={listening}
    >
      <span className={styles.icon} aria-hidden="true">
        {listening ? "◉" : "🎙"}
      </span>
    </button>
  );
}
