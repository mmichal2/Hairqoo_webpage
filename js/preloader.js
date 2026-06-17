import { t } from "./i18n.js?version=6.6.0";
import { initPosterField } from "./poster.js?version=6.6.0";

const STATUS_KEYS = ["preloader.s1", "preloader.s2", "preloader.s3", "preloader.s4"];

function dismissPreloader(el, gate, onDone, { instant = false } = {}) {
  document.body.classList.remove("is-preloading");
  gate?.classList.add("is-poster-ready");
  window.__hairqooMarkBootComplete?.();

  if (!el) {
    onDone?.();
    return;
  }

  el.classList.add("is-done");
  const delay = instant ? 0 : 950;
  setTimeout(() => {
    el.remove();
    onDone?.();
  }, delay);
}

export function runPreloader(onDone) {
  const el = document.getElementById("preloader");
  const statusEl = document.getElementById("preloader-status");
  const gate = document.getElementById("gate");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!el || reducedMotion) {
    dismissPreloader(el, gate, onDone, { instant: true });
    return;
  }

  document.body.classList.add("is-preloading");
  initPosterField(document.getElementById("preloader-stars"));

  let i = 0;
  const statusInterval = setInterval(() => {
    if (statusEl && STATUS_KEYS[i]) {
      statusEl.textContent = t(STATUS_KEYS[i]);
      i = Math.min(i + 1, STATUS_KEYS.length - 1);
    }
  }, 450);

  const total = 2900;
  setTimeout(() => {
    clearInterval(statusInterval);
    if (statusEl) statusEl.textContent = t("preloader.ready");
    dismissPreloader(el, gate, onDone);
  }, total);
}
