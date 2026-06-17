import { Labyrinth } from "./labyrinth.js?version=6.6.0";
import { initForm, initThemeDemo } from "./form.js?version=6.6.0";
import { runPreloader } from "./preloader.js?version=6.6.0";
import { initPosterField } from "./poster.js?version=6.6.0";
import { initGatePoster } from "./gate-poster.js?version=6.6.0";
import { initControls } from "./controls.js?version=6.6.0";
import { initTheme } from "./theme.js?version=6.6.0";
import { applyI18n } from "./i18n.js?version=6.6.0";
import { initControlCenter, refreshControlCenter, restoreHashScroll } from "./control-center.js?version=6.6.0";
import { initAIAssistant } from "./ai-assistant.js?version=6.6.0";
import { initIntelligence } from "./intelligence/index.js?version=6.6.0";
import { initDataLayer } from "./data/data-source.js?version=6.6.0";

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
  restoreHashScroll();
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
  if (document.getElementById("cc-app") && labyrinthInstance) {
    refreshControlCenter();
    restoreHashScroll();
  }
});
