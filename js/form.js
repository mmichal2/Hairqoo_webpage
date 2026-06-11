import { getLang, t } from "./i18n.js";

export function initForm(labyrinth) {
  const form = document.getElementById("signup-form");
  const message = document.getElementById("form-message");
  if (!form || !message) return;

  labyrinth.onPortalChange = (portal) => {
    const select = form.querySelector("#businessType");
    if (!select) return;
    if (portal === "client") {
      select.value = "client";
    } else if (portal === "salon") {
      select.value = select.value === "client" ? "" : select.value || "freelancer";
    }
  };

  const savedPortal = JSON.parse(localStorage.getItem("hairqoo_labyrinth") || "{}").portal;
  if (savedPortal === "client") {
    const select = form.querySelector("#businessType");
    if (select) select.value = "client";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      message.textContent = t("finale.formError");
      message.style.color = "#ff4d6d";
      return;
    }
    const name = String(new FormData(form).get("name") || "").trim();
    message.textContent = `${t("finale.formThanks")}${name ? `, ${name}` : ""}! ${t("finale.formSaved")}`;
    message.style.color = "#7b61ff";
    form.reset();
    const portal = JSON.parse(localStorage.getItem("hairqoo_labyrinth") || "{}").portal;
    if (portal === "client") {
      form.querySelector("#businessType").value = "client";
    }
  });
}

import { applyTheme } from "./theme.js";

export function initThemeDemo() {
  document.querySelectorAll(".theme-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      applyTheme(chip.dataset.theme);
      localStorage.setItem("hairqoo_theme", chip.dataset.theme);
    });
  });
}
