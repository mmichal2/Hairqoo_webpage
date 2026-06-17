/**
 * PRE-ETAP 7 — unify all HTML asset cache busting to ?version=HAIQOO_BUILD_VERSION
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VERSION = fs
  .readFileSync(path.join(ROOT, "js", "build-version.js"), "utf8")
  .match(/HAIQOO_BUILD_VERSION\s*=\s*["']([^"']+)["']/)?.[1];

if (!VERSION) {
  console.error("HAIQOO_BUILD_VERSION not found");
  process.exit(1);
}

const SUFFIX = `?version=${VERSION}`;
let changed = 0;

for (const name of fs.readdirSync(ROOT)) {
  if (!name.endsWith(".html")) continue;
  const file = path.join(ROOT, name);
  const original = fs.readFileSync(file, "utf8");
  const next = original.replace(/\?(?:v|version)=[^"']+/g, SUFFIX);
  if (next !== original) {
    fs.writeFileSync(file, next);
    changed += 1;
  }
}

console.log(`Cache unify: version=${VERSION}, html files updated=${changed}`);
