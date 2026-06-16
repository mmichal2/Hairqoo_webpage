import { initTheme } from "./theme.js";
import { initControls } from "./controls.js";
import { applyI18n } from "./i18n.js";
import { initAIAssistant } from "./ai-assistant.js";
import { initIntelligence } from "./intelligence/index.js";
import { initDataLayer } from "./data/data-source.js";

/** Wspólny bootstrap stron hubu (bez labiryntu). */
export async function bootHubPage(render) {
  initIntelligence();
  initTheme();
  await initDataLayer();
  initControls({
    onLangChange: () => {
      const root = document.getElementById("hub-root");
      if (root) render(root);
    },
  });
  initAIAssistant();
  applyI18n(document);
  const root = document.getElementById("hub-root");
  if (root) render(root);
  window.addEventListener("hairqoo:lang", () => {
    const r = document.getElementById("hub-root");
    if (r) render(r);
  });
  window.addEventListener("hairqoo:data-ready", () => {
    const r = document.getElementById("hub-root");
    if (r) render(r);
  });
}
