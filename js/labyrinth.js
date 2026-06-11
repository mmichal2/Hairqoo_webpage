import { CHAMBER_CONFIG, applyI18n, getLang, setLang } from "./i18n.js";
import { initMockups } from "./mockups.js";
import { initChambers } from "./chambers/index.js";

const STORAGE_KEY = "hairqoo_labyrinth";

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveState(partial) {
  const state = { ...loadState(), ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export class Labyrinth {
  constructor() {
    this.portal = null;
    this.chambers = [];
    this.currentIndex = 0;
    this.visited = new Set();
    this.elements = {
      gate: document.getElementById("gate"),
      labyrinth: document.getElementById("labyrinth"),
      chambersContainer: document.getElementById("chambers"),
      finale: document.getElementById("finale"),
      progressThread: document.getElementById("progress-thread"),
      progressRing: document.getElementById("progress-ring"),
      minimap: document.getElementById("minimap"),
      ringFill: document.getElementById("ring-fill"),
      threadFill: document.getElementById("thread-fill"),
      backToGate: document.getElementById("back-to-gate"),
    };
    this.onPortalChange = null;
    this.init();
  }

  init() {
    this.showGateOnLoad();
    this.bindGate();
    this.bindLang();
    this.bindKeyboard();
    this.bindBackToGate();
    window.addEventListener("hashchange", () => this.onHashChange());
  }

  showGateOnLoad() {
    this.clearUrlHash();
    this.portal = null;
    this.elements.gate?.classList.remove("is-hidden");
    document.body.classList.remove("is-labyrinth-active");
    this.elements.labyrinth?.classList.remove("is-active");
    this.elements.progressThread?.classList.remove("is-visible");
    this.elements.progressRing?.classList.remove("is-visible");
    this.elements.minimap?.classList.remove("is-visible");
    if (this.elements.chambersContainer) {
      this.elements.chambersContainer.innerHTML = "";
    }
    window.scrollTo(0, 0);
  }

  clearUrlHash() {
    if (!window.location.hash) return;
    const url = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", url);
  }

  onHashChange() {
    const hash = window.location.hash.replace(/^#\/?/, "");
    if (!hash) {
      if (this.portal) this.exitToGate(false);
      return;
    }
    if (hash === "finale") {
      if (!this.portal) return;
      this.goToFinale();
      return;
    }
    const [portal, chamberId] = hash.split("/");
    if (!CHAMBER_CONFIG[portal]) return;
    if (this.portal !== portal) this.enterPortal(portal, false);
    const idx = CHAMBER_CONFIG[portal].indexOf(chamberId);
    if (idx >= 0) this.goToChamber(idx, true);
  }

  bindGate() {
    document.querySelectorAll("[data-portal]").forEach((btn) => {
      btn.addEventListener("click", () => this.enterPortal(btn.dataset.portal));
    });
  }

  bindLang() {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        setLang(btn.dataset.lang);
        localStorage.setItem("hairqoo_lang", getLang());
        applyI18n();
        document.querySelectorAll(".lang-btn").forEach((b) => {
          b.classList.toggle("is-active", b.dataset.lang === getLang());
        });
      });
    });
    const saved = localStorage.getItem("hairqoo_lang");
    if (saved) setLang(saved);
    applyI18n();
    document.querySelectorAll(".lang-btn").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.lang === getLang());
    });
  }

  bindBackToGate() {
    this.elements.backToGate?.addEventListener("click", (e) => {
      e.preventDefault();
      this.exitToGate();
    });
  }

  enterPortal(portal, scroll = true) {
    if (!CHAMBER_CONFIG[portal]) return;
    this.portal = portal;
    saveState({ portal, lastChamber: 0 });

    this.elements.gate?.classList.add("is-hidden");
    document.body.classList.add("is-labyrinth-active");
    this.elements.labyrinth?.classList.add("is-active");
    this.elements.progressThread?.classList.add("is-visible");
    this.elements.progressRing?.classList.add("is-visible");

    this.renderChambers(portal);
    this.renderMinimap(portal);
    this.renderChecklist(portal);

    this.goToChamber(0, scroll);

    if (this.onPortalChange) this.onPortalChange(portal);
    window.dispatchEvent(new CustomEvent("hairqoo:portal", { detail: { portal } }));
  }

  exitToGate(clearHash = true) {
    this.portal = null;
    this.elements.gate?.classList.remove("is-hidden");
    document.body.classList.remove("is-labyrinth-active");
    this.elements.labyrinth?.classList.remove("is-active");
    this.elements.progressThread?.classList.remove("is-visible");
    this.elements.progressRing?.classList.remove("is-visible");
    this.elements.minimap?.classList.remove("is-visible");
    this.elements.chambersContainer.innerHTML = "";
    if (clearHash) this.clearUrlHash();
    window.scrollTo(0, 0);
  }

  renderChambers(portal) {
    const ids = CHAMBER_CONFIG[portal];
    const container = this.elements.chambersContainer;
    container.innerHTML = "";

    ids.forEach((id, index) => {
      const tpl = document.getElementById(`tpl-${portal}-${id}`);
      if (!tpl) return;
      const node = tpl.content.cloneNode(true);
      const section = node.querySelector(".chamber");
      if (section) {
        section.dataset.chamberId = id;
        section.dataset.chamberIndex = String(index);
        section.id = `chamber-${portal}-${id}`;
        if (index % 2 === 1) section.classList.add("chamber--reverse");
      }
      container.appendChild(node);
    });

    this.chambers = [...container.querySelectorAll(".chamber")];
    this.bindChamberNav();
    this.bindHints();
    applyI18n(container);
    initMockups(container);
    initChambers(container);
    this.setupObserver();
  }

  renderMinimap(portal) {
    const minimap = this.elements.minimap;
    if (!minimap) return;
    minimap.innerHTML = "";
    minimap.classList.add("is-visible");

    CHAMBER_CONFIG[portal].forEach((id, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "minimap-dot glass";
      dot.title = id;
      dot.dataset.index = String(i);
      dot.addEventListener("click", () => this.goToChamber(i));
      minimap.appendChild(dot);
    });
    this.minimapDots = [...minimap.querySelectorAll(".minimap-dot")];
  }

  renderChecklist(portal) {
    const list = document.getElementById("checklist");
    if (!list) return;
    list.innerHTML = "";
    const state = loadState();
    const visited = new Set(state.visitedChambers || []);

    CHAMBER_CONFIG[portal].forEach((id) => {
      const item = document.createElement("div");
      item.className = "checklist-item";
      item.dataset.chamberId = id;
      if (visited.has(`${portal}/${id}`)) item.classList.add("is-checked");
      item.innerHTML = `<span data-i18n="checklist.${id}"></span>`;
      list.appendChild(item);
    });
    applyI18n(list);
  }

  bindChamberNav() {
    this.chambers.forEach((chamber, index) => {
      const nextBtn = chamber.querySelector("[data-action='next']");
      const backBtn = chamber.querySelector("[data-action='back']");

      nextBtn?.addEventListener("click", () => {
        if (index < this.chambers.length - 1) {
          this.goToChamber(index + 1);
        } else {
          this.goToFinale();
        }
      });

      backBtn?.addEventListener("click", () => {
        if (index > 0) this.goToChamber(index - 1);
        else this.exitToGate();
      });
    });
  }

  bindHints() {
    this.chambers.forEach((chamber) => {
      const hint = chamber.querySelector(".chamber-hint");
      const close = chamber.querySelector(".chamber-hint-close");
      const id = chamber.dataset.chamberId;
      const key = `hint_${this.portal}_${id}`;
      if (localStorage.getItem(key) === "1") hint?.classList.add("is-dismissed");
      close?.addEventListener("click", () => {
        hint?.classList.add("is-dismissed");
        localStorage.setItem(key, "1");
      });
    });
  }

  setupObserver() {
    if (this.observer) this.observer.disconnect();
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-active");
            const idx = Number(entry.target.dataset.chamberIndex);
            if (!Number.isNaN(idx)) {
              this.currentIndex = idx;
              this.markVisited(entry.target.dataset.chamberId);
              this.updateProgress();
            }
          }
        });
      },
      { threshold: 0.45, root: this.elements.labyrinth }
    );
    this.chambers.forEach((c) => this.observer.observe(c));
    this.elements.finale &&
      this.observer.observe(this.elements.finale);
  }

  markVisited(chamberId) {
    const key = `${this.portal}/${chamberId}`;
    this.visited.add(key);
    const state = loadState();
    const visited = new Set(state.visitedChambers || []);
    visited.add(key);
    saveState({
      visitedChambers: [...visited],
      lastChamber: this.currentIndex,
      portal: this.portal,
    });
    document
      .querySelector(`.checklist-item[data-chamber-id="${chamberId}"]`)
      ?.classList.add("is-checked");
  }

  updateProgress() {
    const total = this.chambers.length;
    const current = this.currentIndex + 1;
    const pct = total ? current / total : 0;

    const ring = this.elements.ringFill;
    if (ring) {
      const r = 14;
      const circ = 2 * Math.PI * r;
      ring.style.strokeDasharray = String(circ);
      ring.style.strokeDashoffset = String(circ * (1 - pct));
    }

    const thread = this.elements.threadFill;
    if (thread) {
      const len = 800;
      thread.style.strokeDasharray = String(len);
      thread.style.strokeDashoffset = String(len * (1 - pct));
    }

    this.minimapDots?.forEach((dot, i) => {
      dot.classList.toggle("is-current", i === this.currentIndex);
      dot.classList.toggle("is-visited", i < this.currentIndex);
    });

    if (this.portal && this.chambers[this.currentIndex]) {
      const id = this.chambers[this.currentIndex].dataset.chamberId;
      window.location.hash = `#/${this.portal}/${id}`;
    }
  }

  goToChamber(index, smooth = true) {
    const chamber = this.chambers[index];
    if (!chamber) return;
    chamber.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    this.currentIndex = index;
    saveState({ lastChamber: index });
    this.updateProgress();
  }

  goToFinale() {
    this.elements.finale?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.location.hash = "#/finale";
    this.currentIndex = this.chambers.length;
    const ring = this.elements.ringFill;
    if (ring) {
      const circ = 2 * Math.PI * 14;
      ring.style.strokeDasharray = String(circ);
      ring.style.strokeDashoffset = "0";
    }
    const thread = this.elements.threadFill;
    if (thread) {
      thread.style.strokeDasharray = "800";
      thread.style.strokeDashoffset = "0";
    }
  }

  bindKeyboard() {
    document.addEventListener("keydown", (e) => {
      if (!this.portal) return;
      if (e.key === "Escape") {
        this.exitToGate();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        if (this.currentIndex < this.chambers.length - 1) {
          this.goToChamber(this.currentIndex + 1);
        } else {
          this.goToFinale();
        }
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (this.currentIndex > 0) this.goToChamber(this.currentIndex - 1);
      }
    });
  }
}
