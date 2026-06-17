import { applyI18n } from "./i18n.js?version=6.6.0";

const STORAGE_KEY = "hairqoo_theme";

const LIGHT_VARS = {
  "--bg": "#f7f4ef",
  "--cosmic-void": "#ece8e1",
  "--surface": "#ffffff",
  "--surface-soft": "#f3efe8",
  "--surface-high": "#e8e4dc",
  "--surface-highest": "#ddd8cf",
  "--text": "#1c1824",
  "--muted": "#5a5568",
  "--line": "#c8c2b8",
  "--outline": "#7a7585",
  "--primary": "#5a45d4",
  "--primary-dark": "#4635b8",
  "--secondary": "#e87888",
  "--glass-fill": "rgba(255, 255, 255, 0.72)",
  "--glass-border": "rgba(90, 85, 104, 0.14)",
  "--shadow": "0 10px 30px rgba(28, 24, 36, 0.08), 0 2px 12px rgba(90, 69, 212, 0.1)",
  "--shadow-glow": "0 0 40px rgba(90, 69, 212, 0.18)",
};

const LIGHT_META = "#f7f4ef";

let currentTheme = "dark";

export function getTheme() {
  return currentTheme;
}

export function applyTheme(theme, { animate = true } = {}) {
  currentTheme = theme === "light" ? "light" : "dark";
  const root = document.documentElement;

  if (animate) root.classList.add("is-theme-transitioning");

  if (currentTheme === "light") {
    root.setAttribute("data-theme", "light");
    Object.entries(LIGHT_VARS).forEach(([key, val]) => root.style.setProperty(key, val));
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", LIGHT_META);
  } else {
    root.removeAttribute("data-theme");
    Object.keys(LIGHT_VARS).forEach((key) => root.style.removeProperty(key));
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#13131A");
  }

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.classList.toggle("is-light-active", currentTheme === "light");
    btn.setAttribute("aria-pressed", currentTheme === "light" ? "true" : "false");
  });

  document.querySelectorAll(".theme-chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.theme === currentTheme);
  });

  applyI18n();

  if (animate) {
    window.setTimeout(() => root.classList.remove("is-theme-transitioning"), 520);
  }
}

export function toggleTheme() {
  applyTheme(currentTheme === "light" ? "dark" : "light");
  localStorage.setItem(STORAGE_KEY, currentTheme);
}

export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  applyTheme(saved === "light" ? "light" : "dark", { animate: false });

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    if (btn.dataset.themeBound) return;
    btn.dataset.themeBound = "1";
    btn.addEventListener("click", () => toggleTheme());
  });
}
