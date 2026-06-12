const TUNNEL_MS = 1800;
const WHEEL_COOLDOWN = 400;

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
    this.tunnelVeil = document.getElementById("tunnel-veil");

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

  resetToStart() {
    if (!this.el || !this.chambers.length) return;

    this.isAnimating = false;
    this.snapLocked = true;
    this.el.scrollTop = 0;
    this.currentIndex = 0;
    this.applyTunnelVisuals(0, 1);
    this.updateDepth();

    if (this.onChamberChange) {
      const id = this.chambers[0]?.dataset?.chamberId;
      if (id) this.onChamberChange(0, id);
    }
    if (this.onProgress) this.onProgress(0.5 / this.chambers.length, 0);

    requestAnimationFrame(() => {
      this.el.scrollTop = 0;
      this.lockSnap(800);
    });
  }

  setChambers(chambers, finaleEl = null) {
    this.chambers = chambers || [];
    this.finaleEl = finaleEl;
    this.updateDepth();
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

    const frac = this.getFractionalIndex();
    if (frac >= this.chambers.length - 0.02) {
      const finaleTop = this.getFinaleTop();
      if (Math.abs(this.el.scrollTop - finaleTop) > 6) {
        this.el.scrollTop = finaleTop;
      }
      return;
    }

    const nearest = Math.max(
      0,
      Math.min(this.chambers.length - 1, Math.round(frac))
    );
    const target = this.getChamberTop(nearest);
    if (Math.abs(this.el.scrollTop - target) > 6) {
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
    const ch = this.chambers[index];
    if (!ch) return 0;
    return ch.offsetTop - this.getScrollPadding();
  }

  getFinaleTop() {
    if (!this.finaleEl) return Infinity;
    return this.finaleEl.offsetTop - this.getScrollPadding();
  }

  getFractionalIndex() {
    if (!this.chambers.length) return 0;
    const scrollTop = this.el.scrollTop;
    const finaleTop = this.getFinaleTop();

    if (this.finaleEl && scrollTop >= finaleTop - 2) {
      return this.chambers.length;
    }

    const tops = this.chambers.map((_, i) => this.getChamberTop(i));

    if (scrollTop <= tops[0]) return 0;
    const last = tops.length - 1;
    if (scrollTop >= tops[last] && (!this.finaleEl || scrollTop < finaleTop - 2)) {
      const span = (this.finaleEl ? finaleTop : tops[last] + this.el.clientHeight) - tops[last] || 1;
      const local = (scrollTop - tops[last]) / span;
      return last + Math.min(1, Math.max(0, local)) * 0.99;
    }

    for (let i = 0; i < last; i++) {
      const start = tops[i];
      const end = tops[i + 1];
      if (scrollTop >= start && scrollTop < end) {
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
    const onFinale = fractionalIndex >= this.chambers.length - 0.02;
    const pct = onFinale
      ? 1
      : (fractionalIndex + 0.5) / this.chambers.length;
    const rounded = onFinale
      ? this.chambers.length - 1
      : Math.max(0, Math.min(this.chambers.length - 1, Math.round(fractionalIndex)));
    this.onProgress(Math.max(0, Math.min(1, pct)), rounded, fractionalIndex);
  }

  onWheel(e) {
    if (prefersReducedMotion() || this.snapLocked) return;
    if (this.isAnimating) {
      e.preventDefault();
      return;
    }

    const now = performance.now();
    if (now - this.lastWheel < WHEEL_COOLDOWN) {
      e.preventDefault();
      return;
    }

    if (Math.abs(e.deltaY) < 40) return;

    e.preventDefault();
    this.lastWheel = now;
    this.navigate(e.deltaY > 0 ? 1 : -1);
  }

  navigate(direction) {
    if (this.isAnimating || this.snapLocked) return Promise.resolve();

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

    const target = this.getChamberTop(index);

    if (!smooth || prefersReducedMotion()) {
      this.el.scrollTop = target;
      this.currentIndex = index;
      this.updateDepth();
      const id = chamber.dataset?.chamberId;
      if (id) this.onChamberChange?.(index, id);
      return Promise.resolve();
    }

    return this.animateScrollTo(target, index).then(() => {
      this.currentIndex = index;
      this.updateDepth();
      const id = chamber.dataset?.chamberId;
      if (id) this.onChamberChange?.(index, id);
    });
  }

  scrollToFinale(smooth = true) {
    if (!this.finaleEl) return Promise.resolve();
    const target = this.finaleEl.offsetTop - this.getScrollPadding();

    if (!smooth || prefersReducedMotion()) {
      this.el.scrollTop = target;
      this.onProgress?.(1, this.chambers.length);
      return Promise.resolve();
    }

    return this.animateScrollTo(target, this.chambers.length).then(() => {
      this.onProgress?.(1, this.chambers.length);
    });
  }

  animateScrollTo(target, targetIndex) {
    return new Promise((resolve) => {
      const start = this.el.scrollTop;
      const delta = target - start;
      if (Math.abs(delta) < 2) {
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

        const travelFrac =
          startFrac + (targetIndex - startFrac) * eased;
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
          this.setAnimating(false);
          this.tunnelVeil?.classList.remove("is-visible");
          this.updateDepth();
          resolve();
        }
      };

      requestAnimationFrame(step);
    });
  }
}
