import { Labyrinth } from "./labyrinth.js";
import { initForm, initThemeDemo } from "./form.js";
import { runPreloader } from "./preloader.js";
import { initPosterField } from "./poster.js";
import { initGatePoster } from "./gate-poster.js";
import { initControls } from "./controls.js";
import { initTheme } from "./theme.js";
import { applyI18n } from "./i18n.js";
import { initControlCenter } from "./control-center.js";
import { initAIAssistant } from "./ai-assistant.js";
import { initIntelligence } from "./intelligence/index.js";
import { initDataLayer } from "./data/data-source.js";

let labyrinthInstance = null;

function hideBootFallback() {
  const banner = document.getElementById("boot-fallback");
  if (banner) banner.hidden = true;
}

async function boot() {
  initTheme();
  initIntelligence();
  initPosterField(document.getElementById("poster-stars"));
  initGatePoster();
  applyI18n(document.getElementById("preloader") || document);

  initControls({
    onLangChange: () => {
      if (labyrinthInstance && labyrinthInstance.updateScrollCue) {
        labyrinthInstance.updateScrollCue();
      }
    },
  });

  runPreloader();

  const dataTask = initDataLayer();
  labyrinthInstance = new Labyrinth();
  await dataTask;
  initControlCenter(labyrinthInstance);
  initAIAssistant();
  initForm(labyrinthInstance);
  initThemeDemo();
  window.__hairqooAppReady = true;
  hideBootFallback();
}

boot().catch((err) => {
  console.error("Hairqoo init failed:", err);
  window.__hairqooAppReady = false;
  if (window.__hairqooReleaseGate) window.__hairqooReleaseGate();
});

window.addEventListener("hairqoo:data-ready", () => {
  const root = document.getElementById("cc-app");
  if (root && labyrinthInstance) {
    initControlCenter(labyrinthInstance);
  }
});
