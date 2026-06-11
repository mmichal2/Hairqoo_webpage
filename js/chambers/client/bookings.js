export function initBookings(root) {
  root.querySelectorAll("[data-chamber-id='bookings'] .mock-appointment").forEach((a) => {
    a.style.cursor = "pointer";
    a.addEventListener("click", () => {
      a.style.background = "rgba(255, 178, 184, 0.15)";
    });
  });
}
