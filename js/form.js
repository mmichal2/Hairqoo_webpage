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

export function initThemeDemo() {
  const chips = document.querySelectorAll(".theme-chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      if (chip.dataset.theme === "light") {
        document.documentElement.style.setProperty("--bg", "#f7f4ef");
        document.documentElement.style.setProperty("--text", "#1c1824");
        document.documentElement.style.setProperty("--surface", "#ffffff");
        document.documentElement.style.setProperty("--muted", "#5a5568");
      } else {
        document.documentElement.style.removeProperty("--bg");
        document.documentElement.style.removeProperty("--text");
        document.documentElement.style.removeProperty("--surface");
        document.documentElement.style.removeProperty("--muted");
      }
    });
  });
}
