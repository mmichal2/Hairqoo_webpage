export function initPosterField(canvas) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const stars = Array.from({ length: 120 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.2 + 0.3,
    a: Math.random() * 0.5 + 0.2,
    tw: Math.random() * Math.PI * 2,
  }));

  let raf = 0;
  let w = 0;
  let h = 0;

  const resize = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  };

  const draw = (t) => {
    ctx.clearRect(0, 0, w, h);
    stars.forEach((s) => {
      const alpha = s.a + Math.sin(t * 0.001 + s.tw) * 0.15;
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(228, 225, 236, ${Math.max(0.1, alpha)})`;
      ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("resize", resize);
  raf = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
  };
}
