"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LanguageCode } from "@/core/entities/entity";
import { SPEECH_LOCALES } from "@/core/i18n/speech-locales";

export type VoiceError = "unsupported" | "denied" | "no-speech" | null;

interface UseSpeechRecognitionOptions {
  lang: LanguageCode;
  onTranscript?: (text: string, isFinal: boolean) => void;
}

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function detectSpeechSupport(): boolean {
  return Boolean(getRecognitionCtor());
}

/**
 * Web Speech API — wyszukiwanie/asystent głosowy bez zewnętrznych zależności.
 * Działa w Chrome, Edge, Safari (webkit); wymaga HTTPS lub localhost.
 */
export function useSpeechRecognition({
  lang,
  onTranscript,
}: UseSpeechRecognitionOptions) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(detectSpeechSupport);
  const [error, setError] = useState<VoiceError>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError("unsupported");
      return;
    }

    stop();
    setError(null);

    const recognition = new Ctor();
    recognition.lang = SPEECH_LOCALES[lang] ?? SPEECH_LOCALES.pl;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      if (!result) return;
      const text = result[0]?.transcript?.trim() ?? "";
      if (!text) return;
      onTranscriptRef.current?.(text, result.isFinal);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("denied");
      } else if (event.error === "no-speech") {
        setError("no-speech");
      }
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } catch {
      setError("unsupported");
      setListening(false);
    }
  }, [lang, stop]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  useEffect(() => () => stop(), [stop]);

  return { listening, supported, error, start, stop, toggle };
}
