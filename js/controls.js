import { applyI18n, getLang, setLang, t, SUPPORTED_LANGUAGES } from "./i18n.js?version=6.6.0";

function closeAllLangMenus(except) {
  document.querySelectorAll("[data-lang-menu]").forEach((menu) => {
    if (menu === except) return;
    menu.classList.remove("is-open");
    menu.querySelector("[data-lang-panel]")?.setAttribute("hidden", "");
  });
}

function renderLangPanel(panel) {
  if (!panel) return;
  const lang = getLang();
  panel.innerHTML = SUPPORTED_LANGUAGES.map(
    ({ code, flag, labelKey }) => `
    <button
      type="button"
      class="lang-menu-item${lang === code ? " is-active" : ""}"
      data-lang-option="${code}"
      role="menuitemradio"
      aria-checked="${lang === code}"
    >
      <span class="lang-menu-flag" aria-hidden="true">${flag}</span>
      <span class="lang-menu-label" data-i18n="${labelKey}">${t(labelKey)}</span>
      <span class="lang-menu-check" aria-hidden="true">✓</span>
    </button>`
  ).join("");
}

function bindLangMenu(menu) {
  const trigger = menu.querySelector("[data-lang-trigger]");
  const panel = menu.querySelector("[data-lang-panel]");
  if (!trigger || !panel) return;

  renderLangPanel(panel);

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = menu.classList.toggle("is-open");
    if (open) {
      closeAllLangMenus(menu);
      panel.removeAttribute("hidden");
      renderLangPanel(panel);
      applyI18n(panel);
    } else {
      panel.setAttribute("hidden", "");
    }
  });

  panel.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-lang-option]");
    if (!btn) return;
    const code = btn.dataset.langOption;
    setLang(code);
    localStorage.setItem("hairqoo_lang", code);
    applyI18n();
    document.querySelectorAll("[data-lang-menu]").forEach((m) => {
      renderLangPanel(m.querySelector("[data-lang-panel]"));
      applyI18n(m.querySelector("[data-lang-panel]"));
      m.classList.remove("is-open");
      m.querySelector("[data-lang-panel]")?.setAttribute("hidden", "");
    });
    window.dispatchEvent(new CustomEvent("hairqoo:lang", { detail: { lang: code } }));
  });
}

export function initControls({ onLangChange } = {}) {
  document.querySelectorAll("[data-lang-menu]").forEach(bindLangMenu);

  document.addEventListener("click", () => closeAllLangMenus());

  const saved = localStorage.getItem("hairqoo_lang");
  if (saved) setLang(saved);
  applyI18n();

  if (onLangChange) {
    window.addEventListener("hairqoo:lang", (e) => onLangChange(e.detail?.lang));
  }
}

export function refreshLangMenus() {
  document.querySelectorAll("[data-lang-menu]").forEach((menu) => {
    renderLangPanel(menu.querySelector("[data-lang-panel]"));
    applyI18n(menu.querySelector("[data-lang-panel]"));
  });
}
