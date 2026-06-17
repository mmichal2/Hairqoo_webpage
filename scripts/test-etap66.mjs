/** ETAP 6.6 polish smoke test */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HAIQOO_BUILD_VERSION } from "../js/build-version.js?version=6.6.0";
import {
  getBrainContextReadOnly,
  getGlobalBrainSummaryReadOnly,
} from "../js/ai-assistant.js?version=6.6.0";
import { restoreHashScroll, refreshControlCenter } from "../js/control-center.js?version=6.6.0";
import { readAIVisibility } from "../js/hub-shared.js?version=6.6.0";
import { enrichEntityPool } from "../js/intelligence/entity-intelligence.js?version=6.6.0";
import { MOCK_ENTITIES } from "../js/data/entities.js?version=6.6.0";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JS_DIR = path.join(ROOT, "js");

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, acc);
    else if (name.endsWith(".js")) acc.push(full);
  }
  return acc;
}

let unversioned = 0;
for (const file of walk(JS_DIR)) {
  if (path.basename(file) === "build-version.js") continue;
  const content = fs.readFileSync(file, "utf8");
  const bad = [...content.matchAll(/from\s+["'](\.\.?\/[^"']+\.js)(?!\?version=)/g)];
  const badDyn = [...content.matchAll(/import\s*\(\s*["'](\.\.?\/[^"']+\.js)(?!\?version=)/g)];
  if (bad.length || badDyn.length) {
    unversioned += bad.length + badDyn.length;
    console.error("unversioned import in", path.relative(ROOT, file));
  }
}

if (unversioned > 0) {
  console.error("FAIL — unversioned imports:", unversioned);
  process.exit(1);
}

const entity = enrichEntityPool(MOCK_ENTITIES)[0];
const vis = readAIVisibility(entity);
console.log("build version", HAIQOO_BUILD_VERSION);
console.log("AI visibility sample", vis?.hairQooScore != null);
console.log("exports", typeof restoreHashScroll, typeof refreshControlCenter);
console.log("brain hooks", typeof getBrainContextReadOnly, typeof getGlobalBrainSummaryReadOnly);
console.log("OK — ETAP 6.6 smoke test passed");
