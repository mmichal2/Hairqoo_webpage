import { initSalonChambers } from "./salon/index.js?version=6.6.0";
import { initClientChambers } from "./client/index.js?version=6.6.0";

export function initChambers(root) {
  initSalonChambers(root);
  initClientChambers(root);
}
