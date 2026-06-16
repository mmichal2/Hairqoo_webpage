import { initHome } from "./home.js";
import { initClients } from "./clients.js";
import { initVisit } from "./visit.js";
import { initCalendar } from "./calendar.js";
import { initWallet } from "./wallet.js";
import { initFormulas } from "./formulas.js";
import { initTimers } from "./timers.js";
import { initPortfolio } from "./portfolio.js";
import { initSocial } from "./social.js";
import { initRetention } from "./retention.js";
import { initNotifications } from "./notifications.js";

export function initSalonChambers(root) {
  initHome(root);
  initClients(root);
  initVisit(root);
  initCalendar(root);
  initWallet(root);
  initFormulas(root);
  initTimers(root);
  initPortfolio(root);
  initSocial(root);
  initRetention(root);
  initNotifications(root);
}
