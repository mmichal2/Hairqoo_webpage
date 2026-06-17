import { getLang } from "./i18n.js?version=6.6.0";
import { SPEECH_LOCALES } from "./speech-locales.js?version=6.6.0";

function getRecognitionCtor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function isSpeechSupported() {
  return Boolean(getRecognitionCtor());
}

/**
 * Podłącza przycisk głosowy (wyszukiwarka / asystent AI).
 * @param {HTMLButtonElement} btn
 * @param {{ onTranscript: (text: string) => void, onFinal?: (text: string) => void }} handlers
 */
export function bindVoiceButton(btn, { onTranscript, onFinal }) {
  if (!btn || btn.dataset.voiceBound) return;
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    btn.hidden = true;
    return;
  }

  btn.dataset.voiceBound = "1";
  let recognition = null;
  let listening = false;

  const stop = () => {
    try {
      recognition?.stop();
    } catch {
      /* ignore */
    }
    recognition = null;
    listening = false;
    btn.classList.remove("cc-voice-btn--listening");
    btn.setAttribute("aria-pressed", "false");
  };

  btn.addEventListener("click", () => {
    if (listening) {
      stop();
      return;
    }

    const lang = getLang();
    recognition = new Ctor();
    recognition.lang = SPEECH_LOCALES[lang] ?? SPEECH_LOCALES.pl;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      if (!result) return;
      const text = result[0]?.transcript?.trim() ?? "";
      if (!text) return;
      onTranscript(text);
      if (result.isFinal) onFinal?.(text);
    };

    recognition.onerror = () => stop();
    recognition.onend = () => {
      listening = false;
      btn.classList.remove("cc-voice-btn--listening");
      btn.setAttribute("aria-pressed", "false");
      recognition = null;
    };

    try {
      recognition.start();
      listening = true;
      btn.classList.add("cc-voice-btn--listening");
      btn.setAttribute("aria-pressed", "true");
    } catch {
      stop();
    }
  });
}

export function bindVoiceButtons(root, selector = "[data-voice-btn]") {
  root.querySelectorAll(selector).forEach((btn) => {
    const inputId = btn.dataset.voiceFor;
    const input = inputId ? document.getElementById(inputId) : null;
    if (!input) return;
    bindVoiceButton(btn, {
      onTranscript: (text) => {
        input.value = text;
      },
      onFinal: (text) => {
        input.value = text;
        input.closest("form")?.requestSubmit();
      },
    });
  });
}
