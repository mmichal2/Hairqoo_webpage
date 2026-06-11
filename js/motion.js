const PORTAL_MS = 580;
const DOOR_MS = 2200;

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

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export function portalTilePress(tile) {
  if (!tile || prefersReducedMotion()) return Promise.resolve();
  tile.classList.add("is-pressed");
  return wait(180).then(() => tile.classList.remove("is-pressed"));
}

/**
 * Cinematic door opening — gate crossfades under closed doors,
 * labyrinth reveals as doors swing open in slow motion.
 */
export async function portalDoorEnter({
  gate,
  labyrinth,
  doors,
  firstChamber,
  tunnelVeil,
  portal,
  onGateConcealed,
  onDoorsOpen,
}) {
  if (prefersReducedMotion()) {
    onGateConcealed?.();
    gate?.classList.add("is-hidden");
    labyrinth?.classList.add("is-active");
    if (firstChamber) {
      firstChamber.classList.add("is-active");
      firstChamber.style.setProperty("--ch-emerge", "1");
    }
    onDoorsOpen?.();
    return;
  }

  document.body.classList.add("is-portal-door-transition");

  doors?.removeAttribute("hidden");
  doors?.classList.remove("is-opening", "is-open", "is-fading", "portal-doors--salon", "portal-doors--client");
  doors?.classList.add("is-active", `portal-doors--${portal}`);

  labyrinth?.classList.remove("is-entering", "is-entering-done", "is-poster-launch", "is-door-entering");
  labyrinth?.classList.add("is-active", "is-door-waiting");
  if (labyrinth) labyrinth.scrollTop = 0;

  if (firstChamber) {
    firstChamber.classList.add("is-active", "is-door-reveal");
    firstChamber.classList.remove("is-near", "is-far");
    firstChamber.style.setProperty("--ch-emerge", "0");
  }

  tunnelVeil?.classList.add("is-door-phase");

  await nextFrame();
  await nextFrame();

  gate?.classList.add("is-exiting-soft");

  await wait(380);
  onGateConcealed?.();
  gate?.classList.add("is-concealed");
  gate?.classList.remove("is-exiting-soft");

  await wait(120);

  doors?.classList.add("is-opening");
  labyrinth?.classList.remove("is-door-waiting");
  labyrinth?.classList.add("is-door-entering");
  tunnelVeil?.classList.add("is-visible");

  await wait(DOOR_MS * 0.55);
  firstChamber?.classList.add("is-door-lit");
  firstChamber?.style.setProperty("--ch-emerge", "0.6");

  await wait(DOOR_MS * 0.45);

  doors?.classList.add("is-open");
  firstChamber?.style.setProperty("--ch-emerge", "1");

  await wait(320);
  onDoorsOpen?.();

  doors?.classList.add("is-fading");
  await wait(650);

  doors?.classList.remove("is-active", "is-opening", "is-open", "is-fading", "portal-doors--salon", "portal-doors--client");
  doors?.setAttribute("hidden", "");
  labyrinth?.classList.remove("is-door-waiting", "is-door-entering");
  firstChamber?.classList.remove("is-door-reveal", "is-door-lit");
  document.body.classList.remove("is-portal-door-transition");
}

/** @deprecated kept for reference — use portalDoorEnter */
export async function portalEnter({ gate, labyrinth, firstChamber, onMidpoint }) {
  return portalDoorEnter({
    gate,
    labyrinth,
    doors: document.getElementById("portal-doors"),
    firstChamber,
    tunnelVeil: document.getElementById("tunnel-veil"),
    portal: "salon",
    onGateConcealed: onMidpoint,
    onDoorsOpen: () => {},
  });
}

export async function portalExit({ gate, labyrinth, onStart, onComplete }) {
  if (prefersReducedMotion()) {
    onStart?.();
    onComplete?.();
    return;
  }

  labyrinth?.classList.add("is-exiting");
  gate?.classList.remove("is-hidden", "is-concealed");
  gate?.classList.add("is-entering");
  gate?.classList.remove("is-entering-done");

  onStart?.();

  await wait(PORTAL_MS * 0.4);

  gate?.classList.add("is-entering-done");
  await waitTransition(gate, PORTAL_MS);

  gate?.classList.remove("is-entering", "is-entering-done");
  labyrinth?.classList.remove("is-exiting", "is-active", "is-door-waiting", "is-door-entering");

  onComplete?.();
}

export function withViewTransition(fn) {
  if (prefersReducedMotion() || !document.startViewTransition) {
    return fn();
  }
  return document.startViewTransition(() => fn());
}
