export function initCalendar(root) {
  root.querySelectorAll("[data-chamber-id='calendar'] .mock-appointment").forEach((appt) => {
    appt.addEventListener("click", () => {
      appt.style.borderLeftColor = "var(--secondary)";
    });
  });
}
