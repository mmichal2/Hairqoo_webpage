export function initPortfolio(root) {
  root.querySelectorAll("[data-chamber-id='portfolio'] .mock-portfolio-item").forEach((item) => {
    item.addEventListener("click", () => {
      item.style.outline = "2px solid var(--primary)";
    });
  });
}
