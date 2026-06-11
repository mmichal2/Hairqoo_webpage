import { initHome } from "./home.js";
import { initBook } from "./book.js";
import { initBookings } from "./bookings.js";
import { initAiConsultant } from "./ai-consultant.js";

export function initClientChambers(root) {
  initHome(root);
  initBook(root);
  initBookings(root);
  initAiConsultant(root);
}
