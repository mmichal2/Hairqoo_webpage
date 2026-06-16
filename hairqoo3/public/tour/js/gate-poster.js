export function initGatePoster() {
  const frame = document.getElementById("gate-hero-frame");
  const gate = document.getElementById("gate");
  if (!frame || !gate) return () => {};

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return () => {};

  let raf = 0;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const onMove = (e) => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    targetX = nx * 12;
    targetY = ny * 8;
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const tick = () => {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    frame.style.setProperty("--parallax-x", `${currentX}px`);
    frame.style.setProperty("--parallax-y", `${currentY}px`);
    if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0;
    }
  };

  const onLeave = () => {
    targetX = 0;
    targetY = 0;
    if (!raf) raf = requestAnimationFrame(tick);
  };

  gate.addEventListener("mousemove", onMove);
  gate.addEventListener("mouseleave", onLeave);

  return () => {
    gate.removeEventListener("mousemove", onMove);
    gate.removeEventListener("mouseleave", onLeave);
    if (raf) cancelAnimationFrame(raf);
    frame.style.removeProperty("--parallax-x");
    frame.style.removeProperty("--parallax-y");
  };
}
