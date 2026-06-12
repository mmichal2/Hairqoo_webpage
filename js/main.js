import { Labyrinth } from "./labyrinth.js";
import { initForm, initThemeDemo } from "./form.js";
import { runPreloader } from "./preloader.js";
import { initPosterField } from "./poster.js";
import { initGatePoster } from "./gate-poster.js";
import { initControls } from "./controls.js";
import { initTheme } from "./theme.js";
import { applyI18n } from "./i18n.js";

initTheme();
initPosterField(document.getElementById("poster-stars"));
initGatePoster();
applyI18n(document.getElementById("preloader") || document);

let labyrinthInstance = null;

initControls({
  onLangChange: () => {
    labyrinthInstance?.updateScrollCue?.();
  },
});

runPreloader(() => {
  labyrinthInstance = new Labyrinth();
  initForm(labyrinthInstance);
  initThemeDemo();
});
