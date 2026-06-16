export function initRetention(root) {
  const btn = root.querySelector("[data-chamber-id='retention'] .btn-primary");
  btn?.addEventListener("click", (e) => {
    e.stopPropagation();
    btn.textContent = "✓ Wysłano";
    btn.style.opacity = "0.8";
  });
}
