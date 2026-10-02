import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "fs";
import { Resvg } from "@resvg/resvg-js";

const shape = readFileSync("assets/brand/hairqoo_monogram_shape.svg", "utf8");
const mint = readFileSync("assets/brand/hairqoo_monogram_mint.svg", "utf8");
const shapePath = shape.match(/<path[^>]*d="([^"]+)"/)[1];
const mintPath = mint.match(/<path[^>]*d="([^"]+)"/)[1];

const pad = 140;
const scale = (1024 - pad * 2) / 1024;
const tx = (1024 - 965 * scale) / 2;
const ty = pad;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="hq" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ede8ff"/>
      <stop offset="45%" stop-color="#c9bfff"/>
      <stop offset="100%" stop-color="#917eff"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="#0b0b12"/>
  <g transform="translate(${tx},${ty}) scale(${scale})">
    <path fill="url(#hq)" fill-rule="evenodd" d="${shapePath}"/>
    <path fill="#59FFA2" fill-rule="evenodd" d="${mintPath}"/>
  </g>
</svg>`;

mkdirSync("assets/brand/icons", { recursive: true });
writeFileSync("assets/brand/icons/hairqoo-app-icon.svg", svg);

function render(size, out) {
  const r = new Resvg(svg, { fitTo: { mode: "width", value: size } });
  writeFileSync(out, Buffer.from(r.render().asPng()));
  console.log("wrote", out, `${size}x${size}`);
}

render(1024, "assets/brand/icons/hairqoo-app-icon-1024.png");
render(512, "assets/brand/icons/hairqoo-app-icon-512.png");
render(180, "assets/brand/icons/hairqoo-app-icon-180.png");
render(32, "assets/brand/icons/favicon-32.png");
render(16, "assets/brand/icons/favicon-16.png");

copyFileSync("assets/brand/icons/favicon-32.png", "favicon.png");
copyFileSync("assets/brand/icons/hairqoo-app-icon-180.png", "apple-touch-icon.png");
copyFileSync("assets/brand/icons/hairqoo-app-icon-1024.png", "tiktok-app-icon-1024.png");
console.log("done");
