import { Labyrinth } from "./labyrinth.js";
import { initForm, initThemeDemo } from "./form.js";
import { runPreloader } from "./preloader.js";
import { initPosterField } from "./poster.js";
import { initGatePoster } from "./gate-poster.js";
import { initControls } from "./controls.js";
import { initTheme } from "./theme.js";
import { applyI18n } from "./i18n.js";

let labyrinthInstance = null;

try {
  initTheme();
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

  labyrinthInstance = new Labyrinth();
  initForm(labyrinthInstance);
  initThemeDemo();
  window.__hairqooAppReady = true;

  runPreloader();
} catch (err) {
  console.error("Hairqoo init failed:", err);
  window.__hairqooAppReady = false;
  if (window.__hairqooReleaseGate) window.__hairqooReleaseGate();
}
