import { initHome } from "./home.js?version=6.6.0";
import { initClients } from "./clients.js?version=6.6.0";
import { initVisit } from "./visit.js?version=6.6.0";
import { initCalendar } from "./calendar.js?version=6.6.0";
import { initWallet } from "./wallet.js?version=6.6.0";
import { initFormulas } from "./formulas.js?version=6.6.0";
import { initTimers } from "./timers.js?version=6.6.0";
import { initPortfolio } from "./portfolio.js?version=6.6.0";
import { initSocial } from "./social.js?version=6.6.0";
import { initRetention } from "./retention.js?version=6.6.0";
import { initNotifications } from "./notifications.js?version=6.6.0";

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
