import { initTheme } from "./theme.js?version=6.6.0";
import { initControls } from "./controls.js?version=6.6.0";
import { applyI18n } from "./i18n.js?version=6.6.0";
import { initAIAssistant } from "./ai-assistant.js?version=6.6.0";
import { initIntelligence } from "./intelligence/index.js?version=6.6.0";
import { initDataLayer } from "./data/data-source.js?version=6.6.0";

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
