const PORTAL_MS = 580;

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitTransition(el, ms = PORTAL_MS) {
  if (!el || prefersReducedMotion()) return wait(0);
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.removeEventListener("transitionend", onEnd);
      resolve();
    };
    const onEnd = (e) => {
      if (e.target === el) finish();
    };
    el.addEventListener("transitionend", onEnd);
    setTimeout(finish, ms + 80);
  });
}

export function portalTilePress(tile) {
  if (!tile || prefersReducedMotion()) return Promise.resolve();
  tile.classList.add("is-pressed");
  return wait(180).then(() => tile.classList.remove("is-pressed"));
}

export async function portalEnter({ gate, labyrinth, firstChamber, onMidpoint }) {
  if (prefersReducedMotion()) {
    onMidpoint?.();
    return;
  }

  gate?.classList.add("is-exiting");
  labyrinth?.classList.add("is-entering");
  labyrinth?.classList.remove("is-entering-done");

  await wait(PORTAL_MS * 0.35);
  onMidpoint?.();

  labyrinth?.classList.add("is-entering-done");
  await waitTransition(labyrinth, PORTAL_MS);

  gate?.classList.remove("is-exiting");
  labyrinth?.classList.remove("is-entering", "is-entering-done");

  if (firstChamber) {
    firstChamber.classList.add("is-stagger-reveal");
    await wait(480);
    firstChamber.classList.remove("is-stagger-reveal");
  }
}

export async function portalExit({ gate, labyrinth, onStart, onComplete }) {
  if (prefersReducedMotion()) {
    onStart?.();
    onComplete?.();
    return;
  }

  labyrinth?.classList.add("is-exiting");
  gate?.classList.remove("is-hidden");
  gate?.classList.add("is-entering");
  gate?.classList.remove("is-entering-done");

  onStart?.();

  await wait(PORTAL_MS * 0.4);

  gate?.classList.add("is-entering-done");
  await waitTransition(gate, PORTAL_MS);

  gate?.classList.remove("is-entering", "is-entering-done");
  labyrinth?.classList.remove("is-exiting", "is-active");

  onComplete?.();
}

export function withViewTransition(fn) {
  if (prefersReducedMotion() || !document.startViewTransition) {
    return fn();
  }
  return document.startViewTransition(() => fn());
}
