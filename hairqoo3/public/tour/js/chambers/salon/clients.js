export function initClients(root) {
  const card = root.querySelector("[data-chamber-id='clients'] .mock-client-card");
  card?.addEventListener("click", () => card.classList.toggle("is-highlight"));
}
