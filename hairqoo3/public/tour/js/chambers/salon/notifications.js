export function initNotifications(root) {
  root.querySelectorAll("[data-chamber-id='notifications'] .mock-notif").forEach((n) => {
    n.addEventListener("click", () => n.classList.remove("is-unread"));
  });
}
