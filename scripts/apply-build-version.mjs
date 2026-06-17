/**
 * ETAP 6.6 — append ?version=HAIQOO_BUILD_VERSION to all relative .js import paths.
 * Run after changing js/build-version.js.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JS_DIR = path.join(ROOT, "js");
const VERSION_FILE = path.join(JS_DIR, "build-version.js");
const VERSION = fs
  .readFileSync(VERSION_FILE, "utf8")
  .match(/HAIQOO_BUILD_VERSION\s*=\s*["']([^"']+)["']/)?.[1];

if (!VERSION) {
  console.error("Could not read HAIQOO_BUILD_VERSION from build-version.js");
  process.exit(1);
}

const SUFFIX = `?version=${VERSION}`;
const IMPORT_RE =
  /(from\s+["'])(\.\.?\/[^"']+\.js)(\?version=[^"']*)?(["'])|(import\s*\(\s*["'])(\.\.?\/[^"']+\.js)(\?version=[^"']*)?(["'])/g;

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, acc);
    else if (name.endsWith(".js")) acc.push(full);
  }
  return acc;
}

let filesChanged = 0;
let importsPatched = 0;

for (const file of walk(JS_DIR)) {
  if (path.basename(file) === "build-version.js") continue;

  const original = fs.readFileSync(file, "utf8");
  let count = 0;
  const next = original.replace(IMPORT_RE, (...args) => {
    count += 1;
    if (args[1] !== undefined) {
      return `${args[1]}${args[2]}${SUFFIX}${args[4]}`;
    }
    return `${args[5]}${args[6]}${SUFFIX}${args[8]}`;
  });

  if (next !== original) {
    fs.writeFileSync(file, next);
    filesChanged += 1;
    importsPatched += count;
  }
}

console.log(`ETAP 6.6 cache: version=${VERSION}, files=${filesChanged}, imports=${importsPatched}`);
