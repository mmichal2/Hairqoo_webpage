const TUNNEL_MS = 1800;
const WHEEL_COOLDOWN = 400;
const SNAP_TOLERANCE = 10;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function easeTunnel(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export class ScrollPhysics {
  constructor(labyrinthEl, { onChamberChange, onProgress, onAnimating } = {}) {
    this.el = labyrinthEl;
    this.chambers = [];
    this.finaleEl = null;
    this.onChamberChange = onChamberChange;
    this.onProgress = onProgress;
    this.onAnimating = onAnimating;
    this.rafId = null;
    this.isAnimating = false;
    this.snapLocked = false;
    this.currentIndex = 0;
    this.lastWheel = 0;
    this.touchStartY = 0;
    this.touchStartTarget = null;
    this._tops = [];
    this._finaleTop = Infinity;
    this.tunnelVeil = document.getElementById("tunnel-veil");
    this._onResize = () => this.measurePositions();

    if (!this.el) return;
    this.bind();
  }

  lockSnap(ms = 900) {
    this.snapLocked = true;
    clearTimeout(this._snapLockTimer);
    this._snapLockTimer = setTimeout(() => {
      this.snapLocked = false;
    }, ms);
  }

  measurePositions() {
    if (!this.el || !this.chambers.length) return;

    const scrollTop = this.el.scrollTop;
    const containerRect = this.el.getBoundingClientRect();
    const pad = this.getScrollPadding();

    this._tops = this.chambers.map((ch) => {
      const rect = ch.getBoundingClientRect();
      return Math.max(0, rect.top - containerRect.top + scrollTop - pad);
    });

    if (this.finaleEl) {
      const rect = this.finaleEl.getBoundingClientRect();
      this._finaleTop = Math.max(0, rect.top - containerRect.top + scrollTop - pad);
    } else {
      this._finaleTop = Infinity;
    }
  }

  resetToStart() {
    if (!this.el || !this.chambers.length) return;

    this.isAnimating = false;
    this.snapLocked = true;
    this.el.scrollTop = 0;
    this.currentIndex = 0;
    this.measurePositions();
    this.applyTunnelVisuals(0, 1);
    this.updateDepth();

    if (this.onChamberChange) {
      const id = this.chambers[0]?.dataset?.chamberId;
      if (id) this.onChamberChange(0, id);
    }
    if (this.onProgress) this.onProgress(0.5 / (this.chambers.length + 1), 0);

    requestAnimationFrame(() => {
      this.measurePositions();
      this.el.scrollTop = 0;
      this.lockSnap(800);
    });
  }

  setChambers(chambers, finaleEl = null) {
    this.chambers = chambers || [];
    this.finaleEl = finaleEl;
    requestAnimationFrame(() => {
      this.measurePositions();
      this.updateDepth();
    });
  }

  bind() {
    this.el.addEventListener("scroll", () => this.scheduleUpdate(), { passive: true });
    this.el.addEventListener("wheel", (e) => this.onWheel(e), { passive: false });
    this.el.addEventListener(
      "touchstart",
      (e) => {
        this.touchStartY = e.touches[0]?.clientY ?? 0;
        this.touchStartTarget = e.target;
      },
      { passive: true }
    );
    this.el.addEventListener("touchend", (e) => this.onTouchEnd(e), { passive: true });
    window.addEventListener("resize", this._onResize);
  }

  onTouchEnd(e) {
    if (prefersReducedMotion() || this.isAnimating || this.snapLocked) return;

    const endY = e.changedTouches[0]?.clientY ?? 0;
    const dy = this.touchStartY - endY;
    if (Math.abs(dy) < 72) return;

    const body = this.touchStartTarget?.closest?.(".chamber-body");
    if (body && body.scrollHeight > body.clientHeight + 8) {
      const atTop = body.scrollTop <= 2;
      const atBottom = body.scrollTop + body.clientHeight >= body.scrollHeight - 2;
      if (dy > 0 && !atBottom) return;
      if (dy < 0 && !atTop) return;
    }

    const now = performance.now();
    if (now - this.lastWheel < WHEEL_COOLDOWN) return;
    this.lastWheel = now;
    this.navigate(dy > 0 ? 1 : -1);
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    clearTimeout(this._snapLockTimer);
    window.removeEventListener("resize", this._onResize);
  }

  setAnimating(value) {
    this.isAnimating = value;
    this.onAnimating?.(value);
  }

  scheduleUpdate() {
    if (this.isAnimating) return;
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.updateDepthFromScroll();
      this.maybeSnapToNearest();
    });
  }

  maybeSnapToNearest() {
    if (this.isAnimating || this.snapLocked || !this.chambers.length) return;

    this.measurePositions();
    const scrollTop = this.el.scrollTop;
    const finaleTop = this.getFinaleTop();

    if (this.finaleEl && scrollTop >= finaleTop - SNAP_TOLERANCE) {
      if (Math.abs(scrollTop - finaleTop) > SNAP_TOLERANCE) {
        this.el.scrollTop = finaleTop;
      }
      return;
    }

    const settledTop = this.getChamberTop(this.currentIndex);
    if (Math.abs(scrollTop - settledTop) <= SNAP_TOLERANCE) {
      return;
    }

    const frac = this.getFractionalIndex();
    const nearest = Math.max(
      0,
      Math.min(this.chambers.length - 1, Math.round(frac))
    );
    const target = this.getChamberTop(nearest);
    if (Math.abs(scrollTop - target) > SNAP_TOLERANCE) {
      this.el.scrollTop = target;
      if (nearest !== this.currentIndex) {
        this.currentIndex = nearest;
        this.updateDepth();
        const id = this.chambers[nearest]?.dataset?.chamberId;
        if (id) this.onChamberChange?.(nearest, id);
      } else {
        this.emitProgress(frac);
      }
    }
  }

  getScrollPadding() {
    return parseInt(getComputedStyle(this.el).scrollPaddingTop || "0", 10) || 0;
  }

  getChamberTop(index) {
    if (!this._tops.length) this.measurePositions();
    return this._tops[index] ?? 0;
  }

  getFinaleTop() {
    if (this._finaleTop === undefined || !this._tops.length) this.measurePositions();
    return this._finaleTop ?? Infinity;
  }

  getFractionalIndex() {
    if (!this.chambers.length) return 0;

    this.measurePositions();
    const scrollTop = this.el.scrollTop;
    const finaleTop = this.getFinaleTop();
    const tops = this._tops;

    if (this.finaleEl && scrollTop >= finaleTop - SNAP_TOLERANCE) {
      return this.chambers.length;
    }

    if (scrollTop <= tops[0] + SNAP_TOLERANCE) return 0;

    const last = tops.length - 1;
    if (scrollTop >= tops[last] - SNAP_TOLERANCE && (!this.finaleEl || scrollTop < finaleTop - SNAP_TOLERANCE)) {
      const span = (this.finaleEl ? finaleTop : tops[last] + this.el.clientHeight) - tops[last] || 1;
      const local = (scrollTop - tops[last]) / span;
      return last + Math.min(1, Math.max(0, local)) * 0.99;
    }

    for (let i = 0; i < last; i++) {
      const start = tops[i];
      const end = tops[i + 1];
      if (scrollTop >= start - SNAP_TOLERANCE && scrollTop < end - SNAP_TOLERANCE) {
        const span = end - start || 1;
        return i + (scrollTop - start) / span;
      }
    }
    return last;
  }

  applyTunnelVisuals(fractionalIndex, emergeOverride = null) {
    const max = Math.max(0, this.chambers.length - 1);
    const frac = Math.max(0, Math.min(max, fractionalIndex));
    const nearest = Math.round(frac);
    const local = frac - nearest;
    const emerge =
      emergeOverride ?? Math.max(0, Math.min(1, 1 - Math.abs(local) * 1.85));
    const tunnelDark = Math.max(0, Math.min(1, 1 - emerge));

    this.el.style.setProperty("--tunnel-dark", String(tunnelDark));
    this.el.style.setProperty("--emerge", String(emerge));
    document.body.style.setProperty("--tunnel-dark", String(tunnelDark));
    document.body.style.setProperty("--emerge", String(emerge));

    this.chambers.forEach((ch, i) => {
      const chEmerge = Math.max(0, Math.min(1, 1 - Math.abs(frac - i)));
      ch.style.setProperty("--ch-emerge", String(chEmerge));
    });
  }

  updateDepthFromScroll() {
    const frac = this.getFractionalIndex();
    const onFinale = Boolean(this.finaleEl && frac >= this.chambers.length - 0.02);
    const idx = onFinale
      ? this.chambers.length - 1
      : Math.max(0, Math.min(this.chambers.length - 1, Math.round(frac)));
    const visualFrac = onFinale ? this.chambers.length - 1 : frac;

    this.applyTunnelVisuals(visualFrac);

    this.chambers.forEach((ch, i) => {
      ch.classList.remove("is-active", "is-near", "is-far", "is-emerging");
      const dist = Math.abs(i - visualFrac);
      if (dist < 0.35) ch.classList.add("is-active");
      else if (dist < 1.2) ch.classList.add("is-near");
      else ch.classList.add("is-far");
      if (dist > 0.1 && dist < 0.95) ch.classList.add("is-emerging");
    });

    if (!onFinale && idx !== this.currentIndex) {
      this.currentIndex = idx;
      const id = this.chambers[idx]?.dataset?.chamberId;
      if (id) this.onChamberChange?.(idx, id);
    }

    this.emitProgress(frac);
  }

  updateDepth() {
    this.applyTunnelVisuals(this.currentIndex, 1);
    this.chambers.forEach((ch, i) => {
      ch.classList.remove("is-active", "is-near", "is-far", "is-emerging");
      if (i === this.currentIndex) {
        ch.classList.add("is-active");
        ch.style.setProperty("--ch-emerge", "1");
      } else if (Math.abs(i - this.currentIndex) === 1) {
        ch.classList.add("is-near");
        ch.style.setProperty("--ch-emerge", "0");
      } else {
        ch.classList.add("is-far");
        ch.style.setProperty("--ch-emerge", "0");
      }
    });
    this.emitProgress(this.currentIndex);
  }

  emitProgress(fractionalIndex) {
    if (!this.onProgress || !this.chambers.length) return;
    const totalSteps = this.chambers.length + 1;
    const onFinale =
      !this.isAnimating &&
      fractionalIndex >= this.chambers.length - 0.02 &&
      this.el.scrollTop >= this.getFinaleTop() - SNAP_TOLERANCE;
    const pct = onFinale
      ? 1
      : (fractionalIndex + 0.5) / totalSteps;
    const rounded = onFinale
      ? this.chambers.length
      : this.isAnimating
        ? this.currentIndex
        : Math.max(0, Math.min(this.chambers.length - 1, Math.round(fractionalIndex)));
    this.onProgress(Math.max(0, Math.min(1, pct)), rounded, fractionalIndex);
  }

  onWheel(e) {
    if (prefersReducedMotion() || this.snapLocked) return;

    const body = e.target?.closest?.(".chamber-body");
    const innerScrollable = body && body.scrollHeight > body.clientHeight + 8;

    if (this.isAnimating) {
      e.preventDefault();
      return;
    }

    if (Math.abs(e.deltaY) < 40) {
      if (innerScrollable) return;
      e.preventDefault();
      return;
    }

    if (innerScrollable) {
      const atTop = body.scrollTop <= 2;
      const atBottom = body.scrollTop + body.clientHeight >= body.scrollHeight - 2;
      if (e.deltaY > 0 && !atBottom) return;
      if (e.deltaY < 0 && !atTop) return;
    }

    const now = performance.now();
    if (now - this.lastWheel < WHEEL_COOLDOWN) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    this.lastWheel = now;
    this.navigate(e.deltaY > 0 ? 1 : -1);
  }

  navigate(direction) {
    if (this.isAnimating || this.snapLocked) return Promise.resolve();

    this.measurePositions();

    if (this.finaleEl && this.el.scrollTop >= this.getFinaleTop() - SNAP_TOLERANCE) {
      if (direction < 0) {
        return this.scrollToChamber(this.chambers.length - 1, true);
      }
      return Promise.resolve();
    }

    const target = this.currentIndex + direction;
    if (target < 0) {
      return Promise.resolve();
    }
    if (target >= this.chambers.length) {
      return this.scrollToFinale(true);
    }
    return this.scrollToChamber(target, true);
  }

  scrollToChamber(index, smooth = true) {
    const chamber = this.chambers[index];
    if (!chamber || !this.el) return Promise.resolve();

    this.measurePositions();
    const target = this.getChamberTop(index);
    this.currentIndex = index;

    if (!smooth || prefersReducedMotion()) {
      this.el.scrollTop = target;
      this.updateDepth();
      const id = chamber.dataset?.chamberId;
      if (id) this.onChamberChange?.(index, id);
      this.lockSnap(450);
      return Promise.resolve();
    }

    return this.animateScrollTo(target, index).then(() => {
      this.el.scrollTop = target;
      this.currentIndex = index;
      this.updateDepth();
      const id = chamber.dataset?.chamberId;
      if (id) this.onChamberChange?.(index, id);
      this.lockSnap(500);
    });
  }

  scrollToFinale(smooth = true) {
    if (!this.finaleEl) return Promise.resolve();

    this.measurePositions();
    const target = this.getFinaleTop();
    this.currentIndex = this.chambers.length - 1;

    if (!smooth || prefersReducedMotion()) {
      this.el.scrollTop = target;
      this.onProgress?.(1, this.chambers.length);
      this.lockSnap(450);
      return Promise.resolve();
    }

    return this.animateScrollTo(target, this.chambers.length).then(() => {
      this.el.scrollTop = target;
      this.onProgress?.(1, this.chambers.length);
      this.lockSnap(500);
    });
  }

  animateScrollTo(target, targetIndex) {
    return new Promise((resolve) => {
      const start = this.el.scrollTop;
      const delta = target - start;
      if (Math.abs(delta) < 2) {
        this.currentIndex = Math.min(targetIndex, this.chambers.length - 1);
        resolve();
        return;
      }

      this.setAnimating(true);
      this.tunnelVeil?.classList.add("is-visible");
      const duration = TUNNEL_MS;
      const startTime = performance.now();
      const startFrac = this.getFractionalIndex();

      const step = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const eased = easeTunnel(t);
        this.el.scrollTop = start + delta * eased;

        const travelFrac = startFrac + (targetIndex - startFrac) * eased;
        this.applyTunnelVisuals(travelFrac);

        this.chambers.forEach((ch, i) => {
          ch.classList.remove("is-active", "is-near", "is-far", "is-emerging");
          const dist = Math.abs(i - travelFrac);
          if (dist < 0.35) ch.classList.add("is-active");
          else if (dist < 1.2) ch.classList.add("is-near");
          else ch.classList.add("is-far");
          if (dist > 0.08 && dist < 0.92) ch.classList.add("is-emerging");
        });

        this.emitProgress(travelFrac);

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          this.el.scrollTop = target;
          this.setAnimating(false);
          this.tunnelVeil?.classList.remove("is-visible");
          resolve();
        }
      };

      requestAnimationFrame(step);
    });
  }
}
