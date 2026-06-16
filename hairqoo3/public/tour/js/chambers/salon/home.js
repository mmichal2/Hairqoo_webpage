export function initHome(root) {
  root.querySelectorAll("#chamber-salon-home .mock-tile, [data-chamber-id='home'] .mock-tile").forEach((tile, i) => {
    tile.style.animationDelay = `${i * 80}ms`;
  });
}
