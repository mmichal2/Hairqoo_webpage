import { initSalonChambers } from "./salon/index.js";
import { initClientChambers } from "./client/index.js";

export function initChambers(root) {
  initSalonChambers(root);
  initClientChambers(root);
}
