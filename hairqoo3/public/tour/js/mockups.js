export function initMockups(root = document) {
  initHomeTiles(root);
  initBaSlider(root);
  initTimers(root);
  initAiConsultant(root);
  initBookingSlots(root);
  initFormulaList(root);
}

function initHomeTiles(root) {
  root.querySelectorAll("[data-mock='home-tiles']").forEach((grid) => {
    grid.querySelectorAll(".mock-tile").forEach((tile) => {
      tile.addEventListener("mouseenter", () => {
        grid.querySelectorAll(".mock-tile").forEach((t) => t.classList.remove("is-highlight"));
        tile.classList.add("is-highlight");
      });
      tile.addEventListener("click", () => {
        grid.querySelectorAll(".mock-tile").forEach((t) => t.classList.remove("is-highlight"));
        tile.classList.add("is-highlight");
      });
    });
  });
}

function initBaSlider(root) {
  root.querySelectorAll("[data-mock='ba-slider']").forEach((slider) => {
    const before = slider.querySelector(".mock-ba-before");
    const handle = slider.querySelector(".mock-ba-handle");
    if (!before || !handle) return;

    let dragging = false;
    const move = (clientX) => {
      const rect = slider.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(15, Math.min(85, pct));
      before.style.width = `${pct}%`;
      handle.style.left = `${pct}%`;
    };

    handle.addEventListener("mousedown", () => { dragging = true; });
    handle.addEventListener("touchstart", () => { dragging = true; });
    document.addEventListener("mouseup", () => { dragging = false; });
    document.addEventListener("touchend", () => { dragging = false; });
    document.addEventListener("mousemove", (e) => { if (dragging) move(e.clientX); });
    document.addEventListener("touchmove", (e) => {
      if (dragging && e.touches[0]) move(e.touches[0].clientX);
    });
    slider.addEventListener("click", (e) => move(e.clientX));
  });
}

function initTimers(root) {
  root.querySelectorAll("[data-mock='timers']").forEach((wrap) => {
    const timers = wrap.querySelectorAll(".mock-timer");
    timers.forEach((timer, i) => {
      const timeEl = timer.querySelector(".mock-timer-time");
      if (!timeEl) return;
      const durations = [420, 900, 300];
      let remaining = durations[i] || 300;
      let interval = null;

      timer.addEventListener("click", () => {
        if (interval) {
          clearInterval(interval);
          interval = null;
          timer.classList.remove("is-running");
          return;
        }
        timer.classList.add("is-running");
        interval = setInterval(() => {
          remaining -= 1;
          const m = Math.floor(remaining / 60);
          const s = remaining % 60;
          timeEl.textContent = `${m}:${String(s).padStart(2, "0")}`;
          if (remaining <= 0) {
            clearInterval(interval);
            interval = null;
            timer.classList.remove("is-running");
            remaining = durations[i] || 300;
            timeEl.textContent = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
          }
        }, 1000);
      });
    });
  });
}

function initAiConsultant(root) {
  root.querySelectorAll("[data-mock='ai-consultant']").forEach((wrap) => {
    const steps = wrap.querySelectorAll(".mock-ai-step");
    const swatches = wrap.querySelectorAll(".mock-swatch");
    const preview = wrap.querySelector(".mock-ai-preview span");
    const colors = ["Beige blonde", "Honey balayage", "Copper glow", "Cool ash"];

    swatches.forEach((sw, i) => {
      sw.addEventListener("click", () => {
        swatches.forEach((s) => s.classList.remove("is-selected"));
        sw.classList.add("is-selected");
        steps.forEach((st, j) => st.classList.toggle("is-done", j <= 2));
        if (preview) preview.textContent = colors[i] || colors[0];
      });
    });
  });
}

function initBookingSlots(root) {
  root.querySelectorAll("[data-mock='slots']").forEach((grid) => {
    grid.querySelectorAll(".mock-slot:not(.is-disabled)").forEach((slot) => {
      slot.addEventListener("click", () => {
        grid.querySelectorAll(".mock-slot").forEach((s) => s.classList.remove("is-selected"));
        slot.classList.add("is-selected");
      });
    });
  });
}

function initFormulaList(root) {
  root.querySelectorAll("[data-mock='formulas']").forEach((list) => {
    list.querySelectorAll(".mock-formula").forEach((item) => {
      item.addEventListener("click", () => {
        list.querySelectorAll(".mock-formula").forEach((f) => f.classList.remove("is-highlight"));
        item.classList.add("is-highlight");
        item.style.border = "1px solid var(--primary)";
      });
    });
  });
}
