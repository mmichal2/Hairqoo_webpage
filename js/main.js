import { Labyrinth } from "./labyrinth.js";
import { initForm, initThemeDemo } from "./form.js";
import { runPreloader } from "./preloader.js";
import { initPosterField } from "./poster.js";
import { applyI18n } from "./i18n.js";

initPosterField(document.getElementById("poster-stars"));
applyI18n(document.getElementById("preloader") || document);

runPreloader(() => {
  const labyrinth = new Labyrinth();
  initForm(labyrinth);
  initThemeDemo();
});
