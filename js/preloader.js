import { t } from "./i18n.js";
import { initPosterField } from "./poster.js";

const STATUS_KEYS = ["preloader.s1", "preloader.s2", "preloader.s3", "preloader.s4"];

export function runPreloader(onDone) {
  const el = document.getElementById("preloader");
  const statusEl = document.getElementById("preloader-status");
  const gate = document.getElementById("gate");

  if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gate?.classList.add("is-poster-ready");
    onDone?.();
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
    el.classList.add("is-done");
    document.body.classList.remove("is-preloading");
    gate?.classList.add("is-poster-ready");
    setTimeout(() => {
      el.remove();
      onDone?.();
    }, 950);
  }, total);
}
