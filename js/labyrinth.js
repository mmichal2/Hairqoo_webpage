import { CHAMBER_CONFIG, applyFinaleI18n, applyI18n, t } from "./i18n.js";
import { initMockups } from "./mockups.js";
import { initChambers } from "./chambers/index.js";
import { portalDoorEnter, portalExit, portalTilePress } from "./motion.js";
import { ScrollPhysics } from "./scroll-physics.js";

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
    this.isTransitioning = false;
    this.scrollPhysics = null;
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
      scrollCue: document.getElementById("scroll-cue"),
      tunnelVeil: document.getElementById("tunnel-veil"),
      portalDoors: document.getElementById("portal-doors"),
      labyrinthHomeExit: document.getElementById("labyrinth-home-exit"),
    };
    this.onPortalChange = null;
    this.onFinale = false;
    this.init();
  }

  getTotalSteps() {
    return this.chambers.length + 1;
  }

  getFinaleIndex() {
    return this.chambers.length;
  }

  updateFinaleStep(portal) {
    const el = document.getElementById("finale-step");
    if (!el || !portal) return;
    const total = CHAMBER_CONFIG[portal].length + 1;
    if (portal === "client") {
      el.textContent = `${total} / ${total}`;
    } else {
      el.textContent = `${String(total).padStart(2, "0")} / ${total}`;
    }
  }

  init() {
    this.showGateOnLoad();
    this.bindGate();
    this.bindKeyboard();
    window.addEventListener("hairqoo:lang", () => {
      if (this.portal) {
        applyI18n(this.elements.chambersContainer);
        applyFinaleI18n(this.portal);
        this.updateFinaleStep(this.portal);
        this.updateScrollCue();
      }
    });
    this.bindBackToGate();
    this.bindScrollCue();
    this.bindLabyrinthHomeExit();
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) this.showGateOnLoad();
    });
  }

  showGateOnLoad(fromPortal = false) {
    this.clearUrlHash();
    this.portal = null;
    this.isTransitioning = false;
    saveState({ portal: null, lastChamber: 0 });

    this.scrollPhysics?.destroy();
    this.scrollPhysics = null;

    this.elements.gate?.classList.remove(
      "is-hidden",
      "is-concealed",
      "is-exiting",
      "is-exiting-soft",
      "is-entering",
      "is-entering-done"
    );
    this.elements.portalDoors?.setAttribute("hidden", "");
    this.elements.portalDoors?.classList.remove(
      "is-active",
      "is-opening",
      "is-open",
      "is-fading",
      "portal-doors--salon",
      "portal-doors--client"
    );
    document.body.classList.remove("is-portal-door-transition");
    document.body.classList.remove(
      "is-labyrinth-active",
      "portal-salon-active",
      "portal-client-active"
    );
    if (fromPortal) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.body.classList.remove("is-gate-restoring");
        });
      });
    }
    this.elements.labyrinth?.classList.remove(
      "is-active",
      "is-entering",
      "is-entering-done",
      "is-exiting",
      "is-poster-active"
    );
    this.elements.minimap?.classList.remove("is-visible");
    this.hideScrollCue();
    this.hideProgressRing();
    this.elements.labyrinthHomeExit?.setAttribute("hidden", "");
    this.elements.tunnelVeil?.classList.remove("is-visible", "is-door-phase");
    this.elements.labyrinth?.classList.remove("is-tunnel-active", "is-exiting");

    if (this.elements.chambersContainer) {
      this.elements.chambersContainer.innerHTML = "";
    }
    if (this.elements.labyrinth) {
      this.elements.labyrinth.scrollTop = 0;
    }
    document.body.style.removeProperty("--tunnel-dark");
    document.body.style.removeProperty("--emerge");
    if (this.observer) this.observer.disconnect();

    window.scrollTo(0, 0);
  }

  clearUrlHash() {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    /* Preserve homepage section anchors (#discover, #events, …) — ETAP 6.5 */
    if (!/^(salon|client)(\/|$)/.test(hash)) return;
    const url = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", url);
  }

  bindGate() {
    document.querySelectorAll("[data-portal]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (this.isTransitioning) return;
        await portalTilePress(btn);
        await this.enterPortal(btn.dataset.portal);
      });
    });
  }

  bindBackToGate() {
    this.elements.backToGate?.addEventListener("click", (e) => {
      e.preventDefault();
      if (!this.isTransitioning) this.exitToGate();
    });
  }

  async enterPortal(portal) {
    if (!CHAMBER_CONFIG[portal] || this.isTransitioning) return;

    this.isTransitioning = true;
    this.portal = portal;
    saveState({ portal, lastChamber: 0 });

    document.body.classList.add("is-labyrinth-active", `portal-${portal}-active`);
    this.elements.labyrinthHomeExit?.removeAttribute("hidden");
    this.showProgressRing();
    applyI18n(this.elements.labyrinthHomeExit);

    this.renderChambers(portal);
    this.renderMinimap(portal);
    this.renderChecklist(portal);
    applyFinaleI18n(portal);
    this.updateFinaleStep(portal);

    const firstChamber = this.chambers[0] || null;

    if (this.elements.labyrinth) {
      this.elements.labyrinth.scrollTop = 0;
      this.elements.labyrinth.classList.add("is-poster-active");
      this.elements.labyrinth.classList.remove("is-door-waiting", "is-door-entering");
    }
    window.scrollTo(0, 0);
    this.hideScrollCue();

    await portalDoorEnter({
      gate: this.elements.gate,
      labyrinth: this.elements.labyrinth,
      doors: this.elements.portalDoors,
      firstChamber,
      tunnelVeil: this.elements.tunnelVeil,
      portal,
      onGateConcealed: () => {
        this.elements.gate?.classList.add("is-concealed");
        if (this.elements.labyrinth) this.elements.labyrinth.scrollTop = 0;
      },
      onDoorsOpen: () => {
        this.elements.gate?.classList.add("is-hidden");
        this.elements.gate?.classList.remove("is-concealed");
      },
    });

    this.elements.labyrinth?.classList.add("is-tunnel-active");
    this.elements.tunnelVeil?.classList.remove("is-door-phase", "is-visible");
    document.body.style.setProperty("--tunnel-dark", "0");
    document.body.style.setProperty("--emerge", "1");

    this.initScrollPhysics();
    this.scrollPhysics?.resetToStart();
    if (this.elements.labyrinth) this.elements.labyrinth.scrollTop = 0;
    this.currentIndex = 0;
    this.onFinale = false;
    this.updateProgressFromPct(0.5 / this.getTotalSteps());
    this.updateScrollCue();

    if (this.onPortalChange) this.onPortalChange(portal);
    window.dispatchEvent(new CustomEvent("hairqoo:portal", { detail: { portal } }));

    this.isTransitioning = false;
  }

  async exitToGate() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    await portalExit({
      gate: this.elements.gate,
      labyrinth: this.elements.labyrinth,
      onStart: () => {
        this.elements.minimap?.classList.remove("is-visible");
        this.hideScrollCue();
        this.hideProgressRing();
        this.elements.labyrinthHomeExit?.setAttribute("hidden", "");
        this.elements.tunnelVeil?.classList.remove("is-visible", "is-door-phase");
        this.elements.portalDoors?.setAttribute("hidden", "");
        this.elements.portalDoors?.classList.remove(
          "is-active",
          "is-opening",
          "is-open",
          "is-fading"
        );
      },
      onComplete: () => {
        this.showGateOnLoad(true);
      },
    });

    this.isTransitioning = false;
  }

  initScrollPhysics() {
    this.scrollPhysics?.destroy();
    this.scrollPhysics = new ScrollPhysics(this.elements.labyrinth, {
      onChamberChange: (idx, chamberId) => {
        this.currentIndex = idx;
        this.onFinale = false;
        this.markVisited(chamberId);
        this.updateProgressFromPct((idx + 0.5) / this.getTotalSteps(), idx);
        this.updateScrollCue();
      },
      onProgress: (pct, activeIndex) => {
        this.updateProgressFromPct(pct, activeIndex);
        this.checkFinaleVisibility();
      },
      onAnimating: (animating) => {
        this.elements.scrollCue?.classList.toggle("is-animating", animating);
        this.elements.progressRing?.classList.toggle("is-animating", animating);
      },
    });
    this.scrollPhysics.setChambers(this.chambers, this.elements.finale);
  }

  bindScrollCue() {
    this.elements.scrollCue?.addEventListener("click", () => {
      if (this.isTransitioning || this.scrollPhysics?.isAnimating) return;
      this.goToNext();
    });
  }

  hideScrollCue() {
    const cue = this.elements.scrollCue;
    if (!cue) return;
    cue.classList.remove("is-visible", "is-finish", "is-animating");
    cue.setAttribute("hidden", "");
  }

  showProgressRing() {
    const ring = this.elements.progressRing;
    if (!ring) return;
    ring.removeAttribute("hidden");
    ring.classList.add("is-visible");
  }

  hideProgressRing() {
    const ring = this.elements.progressRing;
    if (!ring) return;
    ring.classList.remove("is-visible");
    ring.setAttribute("hidden", "");
    if (this.elements.ringFill) {
      const circ = 2 * Math.PI * 14;
      this.elements.ringFill.style.strokeDasharray = String(circ);
      this.elements.ringFill.style.strokeDashoffset = String(circ);
    }
  }

  updateScrollCue() {
    const cue = this.elements.scrollCue;
    if (!cue || !this.portal) return;

    if (this.onFinale) {
      this.hideScrollCue();
      return;
    }

    cue.removeAttribute("hidden");
    cue.classList.add("is-visible");

    const isLast = this.currentIndex >= this.chambers.length - 1;
    cue.classList.toggle("is-finish", isLast);

    const label = cue.querySelector(".scroll-cue-label");
    if (label) {
      label.textContent = isLast ? t("nav.scrollFinish") : t("nav.scrollDown");
    }

    cue.setAttribute(
      "aria-label",
      isLast ? t("nav.scrollFinishAria") : t("nav.scrollDownAria")
    );
  }

  checkFinaleVisibility() {
    const lab = this.elements.labyrinth;
    const finale = this.elements.finale;
    if (!lab || !finale || !this.chambers.length) return;

    const padding =
      parseInt(getComputedStyle(lab).scrollPaddingTop || "0", 10) || 0;
    const finaleTop = finale.offsetTop - padding;

    if (lab.scrollTop >= finaleTop - 2) {
      if (!this.onFinale) {
        this.onFinale = true;
        this.hideScrollCue();
        this.updateMinimapDots(this.getFinaleIndex(), true);
        this.updateProgressFromPct(1, this.getFinaleIndex());
      }
    } else if (this.onFinale) {
      this.onFinale = false;
      this.updateScrollCue();
    }
  }

  async goToNext() {
    if (this.isTransitioning || this.scrollPhysics?.isAnimating) return;

    if (this.currentIndex < this.chambers.length - 1) {
      await this.goToChamber(this.currentIndex + 1);
    } else {
      await this.goToFinale();
    }
    this.updateScrollCue();
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
        section
          .querySelectorAll(".chamber-home-btn, [data-chamber-home]")
          .forEach((el) => el.remove());
      }
      container.appendChild(node);
    });

    this.chambers = [...container.querySelectorAll(".chamber")];
    this.bindChamberNav();
    applyI18n(container);
    initMockups(container);
    initChambers(container);
    this.setupObserver();
  }

  bindLabyrinthHomeExit() {
    this.elements.labyrinthHomeExit?.addEventListener("click", () => {
      if (!this.isTransitioning) this.exitToGate();
    });
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

    const finaleIdx = CHAMBER_CONFIG[portal].length;
    const finaleDot = document.createElement("button");
    finaleDot.type = "button";
    finaleDot.className = "minimap-dot glass minimap-dot--finale";
    finaleDot.title = t("nav.scrollFinish");
    finaleDot.dataset.index = String(finaleIdx);
    finaleDot.addEventListener("click", () => {
      if (!this.isTransitioning && !this.scrollPhysics?.isAnimating) this.goToFinale();
    });
    minimap.appendChild(finaleDot);

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
      const backBtn = chamber.querySelector("[data-action='back']");
      backBtn?.addEventListener("click", () => {
        if (this.isTransitioning || this.scrollPhysics?.isAnimating) return;
        if (index > 0) this.goToChamber(index - 1);
        else this.exitToGate();
      });
    });
  }

  setupObserver() {
    if (this.observer) this.observer.disconnect();
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.dataset.chamberId) {
            const idx = Number(entry.target.dataset.chamberIndex);
            if (!Number.isNaN(idx)) {
              this.markVisited(entry.target.dataset.chamberId);
            }
          }
        });
      },
      { threshold: 0.45, root: this.elements.labyrinth }
    );
    this.chambers.forEach((c) => this.observer.observe(c));
  }

  markVisited(chamberId) {
    const key = `${this.portal}/${chamberId}`;
    if (this.visited.has(key)) return;
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

  updateProgressFromPct(pct, activeIndex = null) {
    const clamped = Math.max(0, Math.min(1, pct));

    const ring = this.elements.ringFill;
    if (ring) {
      const r = 14;
      const circ = 2 * Math.PI * r;
      ring.style.strokeDasharray = String(circ);
      ring.style.strokeDashoffset = String(circ * (1 - clamped));
    }

    const thread = this.elements.threadFill;
    if (thread) {
      const len = 800;
      thread.style.strokeDasharray = String(len);
      thread.style.strokeDashoffset = String(len * (1 - clamped));
    }

    if (typeof activeIndex === "number" && !Number.isNaN(activeIndex)) {
      if (activeIndex < this.getFinaleIndex()) {
        this.currentIndex = activeIndex;
      } else if (activeIndex >= this.getFinaleIndex()) {
        this.onFinale = true;
      }
      this.updateMinimapDots(activeIndex, this.onFinale);
    } else {
      this.updateMinimapDots(this.currentIndex, this.onFinale);
    }
  }

  updateMinimapDots(activeIndex, onFinale = this.onFinale) {
    if (!this.minimapDots?.length || !this.chambers.length) return;

    const finaleIdx = this.getFinaleIndex();
    const current = onFinale
      ? finaleIdx
      : Math.max(0, Math.min(finaleIdx - 1, activeIndex ?? this.currentIndex));

    this.minimapDots.forEach((dot, i) => {
      dot.classList.toggle("is-current", i === current);
      dot.classList.toggle("is-visited", i < current);
    });
  }

  async goToChamber(index, smooth = true) {
    const chamber = this.chambers[index];
    if (!chamber) return;

    this.currentIndex = index;
    this.onFinale = false;
    saveState({ lastChamber: index });

    if (this.scrollPhysics) {
      await this.scrollPhysics.scrollToChamber(index, smooth);
    } else {
      chamber.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    }

    this.updateProgressFromPct((index + 0.5) / this.getTotalSteps(), index);
    this.updateScrollCue();
  }

  async goToFinale() {
    this.onFinale = true;
    this.hideScrollCue();
    if (this.scrollPhysics) {
      await this.scrollPhysics.scrollToFinale(true);
    } else {
      this.elements.finale?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    this.updateProgressFromPct(1, this.getFinaleIndex());
    this.updateMinimapDots(this.getFinaleIndex(), true);
  }

  bindKeyboard() {
    document.addEventListener("keydown", (e) => {
      if (!this.portal || this.isTransitioning) return;
      if (e.key === "Escape") {
        this.exitToGate();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        this.goToNext();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (this.onFinale) this.goToChamber(this.chambers.length - 1);
        else if (this.currentIndex > 0) this.goToChamber(this.currentIndex - 1);
      }
    });
  }
}
