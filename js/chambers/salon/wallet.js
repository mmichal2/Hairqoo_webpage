export function initWallet(root) {
  const value = root.querySelector("[data-chamber-id='wallet'] .mock-revenue-value");
  if (!value) return;
  let n = 0;
  const target = 4280;
  const obs = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    const interval = setInterval(() => {
      n += 120;
      if (n >= target) {
        value.textContent = "4 280 zł";
        clearInterval(interval);
        return;
      }
      value.textContent = `${n.toLocaleString("pl-PL")} zł`;
    }, 40);
    obs.disconnect();
  }, { threshold: 0.5 });
  const chamber = root.querySelector("[data-chamber-id='wallet']");
  if (chamber) obs.observe(chamber);
}
