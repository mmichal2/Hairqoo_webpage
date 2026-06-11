const SNAP_MS = 650;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function easeSilk(t) {
  return 1 - Math.pow(1 - t, 3);
}

export class ScrollPhysics {
  constructor(labyrinthEl, { onChamberChange, onProgress } = {}) {
    this.el = labyrinthEl;
    this.chambers = [];
    this.financeEl = null;
    this.onChamberChange = onChamberChange;
    this.onProgress = onProgress;
    this.rafId = null;
    this.snapTimer = null;
    this.isAnimating = false;
    this.currentIndex = 0;

    if (!this.el) return;
    this.bind();
  }

  setChambers(chambers, finaleEl = null) {
    this.chambers = chambers || [];
    this.finaleEl = finaleEl;
    this.updateDepth();
  }

  bind() {
    this.el.addEventListener("scroll", () => this.scheduleUpdate(), { passive: true });
    this.el.addEventListener("scrollend", () => this.softSnap(), { passive: true });
    this.el.addEventListener(
      "wheel",
      () => {
        clearTimeout(this.snapTimer);
        this.snapTimer = setTimeout(() => this.softSnap(), 120);
      },
      { passive: true }
    );
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    clearTimeout(this.snapTimer);
  }

  scheduleUpdate() {
    if (this.isAnimating) return;
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.updateDepth();
      this.emitProgress();
    });
  }

  getOffsets() {
    const scrollTop = this.el.scrollTop;
    const viewMid = scrollTop + this.el.clientHeight * 0.42;
    return this.chambers.map((ch) => {
      const top = ch.offsetTop;
      const center = top + ch.offsetHeight * 0.5;
      return { el: ch, top, center, dist: Math.abs(center - viewMid) };
    });
  }

  findNearestIndex() {
    const offsets = this.getOffsets();
    if (!offsets.length) return 0;
    let best = 0;
    let min = Infinity;
    offsets.forEach((o, i) => {
      if (o.dist < min) {
        min = o.dist;
        best = i;
      }
    });
    return best;
  }

  updateDepth() {
    const idx = this.findNearestIndex();
    this.currentIndex = idx;

    this.chambers.forEach((ch, i) => {
      ch.classList.remove("is-active", "is-near", "is-far");
      if (i === idx) {
        ch.classList.add("is-active");
        const progress = this.getChamberScrollProgress(ch);
        ch.style.setProperty("--phone-parallax", `${progress * -12}px`);
      } else if (Math.abs(i - idx) === 1) {
        ch.classList.add("is-near");
        ch.style.setProperty("--phone-parallax", "0px");
      } else {
        ch.classList.add("is-far");
        ch.style.setProperty("--phone-parallax", "0px");
      }
    });

    if (this.onChamberChange) {
      const id = this.chambers[idx]?.dataset?.chamberId;
      if (id) this.onChamberChange(idx, id);
    }
  }

  getChamberScrollProgress(chamber) {
    const rect = chamber.getBoundingClientRect();
    const containerRect = this.el.getBoundingClientRect();
    const chamberMid = rect.top + rect.height * 0.5;
    const containerMid = containerRect.top + containerRect.height * 0.5;
    const delta = chamberMid - containerMid;
    return Math.max(-1, Math.min(1, delta / (containerRect.height * 0.5)));
  }

  emitProgress() {
    if (!this.onProgress || !this.chambers.length) return;
    const idx = this.findNearestIndex();
    const offsets = this.getOffsets();
    const current = offsets[idx];
    if (!current) return;

    const neighbor =
      idx < offsets.length - 1 ? offsets[idx + 1] : offsets[idx - 1];
    let frac = 0;
    if (neighbor && neighbor.dist + current.dist > 0) {
      const total = current.dist + neighbor.dist;
      frac = 1 - current.dist / total;
      frac = Math.max(0, Math.min(1, frac * 0.5));
    }

    const pct = (idx + frac) / this.chambers.length;
    this.onProgress(pct, idx);
  }

  softSnap() {
    if (prefersReducedMotion() || this.isAnimating) return;
    const idx = this.findNearestIndex();
    const offsets = this.getOffsets();
    const current = offsets[idx];
    if (!current) return;

    const threshold = this.el.clientHeight * 0.25;
    if (current.dist > threshold) return;

    this.scrollToChamber(idx, true);
  }

  scrollToChamber(index, smooth = true) {
    const chamber = this.chambers[index];
    if (!chamber || !this.el) return Promise.resolve();

    if (!smooth || prefersReducedMotion()) {
      chamber.scrollIntoView({ behavior: "auto", block: "start" });
      this.currentIndex = index;
      this.updateDepth();
      this.emitProgress();
      return Promise.resolve();
    }

    const target = chamber.offsetTop - parseInt(getComputedStyle(this.el).scrollPaddingTop || "0", 10);
    return this.animateScrollTo(target).then(() => {
      this.currentIndex = index;
      this.updateDepth();
      this.emitProgress();
    });
  }

  scrollToFinale(smooth = true) {
    if (!this.finaleEl) return Promise.resolve();
    if (!smooth || prefersReducedMotion()) {
      this.finaleEl.scrollIntoView({ behavior: "auto", block: "start" });
      if (this.onProgress) this.onProgress(1, this.chambers.length);
      return Promise.resolve();
    }
    const target = this.finaleEl.offsetTop - parseInt(getComputedStyle(this.el).scrollPaddingTop || "0", 10);
    return this.animateScrollTo(target).then(() => {
      if (this.onProgress) this.onProgress(1, this.chambers.length);
    });
  }

  animateScrollTo(target) {
    return new Promise((resolve) => {
      const start = this.el.scrollTop;
      const delta = target - start;
      if (Math.abs(delta) < 2) {
        resolve();
        return;
      }

      this.isAnimating = true;
      const duration = SNAP_MS;
      const startTime = performance.now();

      const step = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const eased = easeSilk(t);
        this.el.scrollTop = start + delta * eased;
        this.updateDepth();
        this.emitProgress();

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          this.isAnimating = false;
          resolve();
        }
      };

      requestAnimationFrame(step);
    });
  }
}
