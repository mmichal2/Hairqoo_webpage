import { initHome } from "./home.js?version=6.6.0";
import { initBook } from "./book.js?version=6.6.0";
import { initBookings } from "./bookings.js?version=6.6.0";
import { initAiConsultant } from "./ai-consultant.js?version=6.6.0";

export function initClientChambers(root) {
  initHome(root);
  initBook(root);
  initBookings(root);
  initAiConsultant(root);
}
