/**
 * Генерация PNG из icon.svg: PWA, Apple, Android launcher.
 * Usage: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const iconSvg = fs.readFileSync(path.join(root, "public/icons/icon.svg"));
const fgSvg = fs.readFileSync(path.join(root, "public/icons/icon-foreground.svg"));

const BRAND = { r: 61, g: 155, b: 110, alpha: 1 };

async function pngFromSvg(svg, size, outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(svg).resize(size, size).png().toFile(outPath);
  console.log(path.relative(root, outPath));
}

async function maskable512(outPath) {
  const size = 512;
  const inner = Math.round(size * 0.82);
  const pad = Math.round((size - inner) / 2);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(iconSvg)
    .resize(inner, inner)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: BRAND })
    .png()
    .toFile(outPath);
  console.log(path.relative(root, outPath));
}

/** Adaptive foreground: капля на прозрачном фоне, ~66% safe zone */
async function adaptiveForeground(svg, canvas, outPath) {
  const inner = Math.round(canvas * 0.66);
  const pad = Math.round((canvas - inner) / 2);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(svg)
    .resize(inner, inner)
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outPath);
  console.log(path.relative(root, outPath));
}

// PWA / Apple
for (const size of [180, 192, 512]) {
  await pngFromSvg(iconSvg, size, path.join(root, `public/icons/icon-${size}.png`));
}
await maskable512(path.join(root, "public/icons/icon-maskable-512.png"));

// Android legacy launcher (полная иконка)
const launcher = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192,
};

for (const [folder, size] of Object.entries(launcher)) {
  const base = path.join(root, `android/app/src/main/res/${folder}`);
  await pngFromSvg(iconSvg, size, path.join(base, "ic_launcher.png"));
  await pngFromSvg(iconSvg, size, path.join(base, "ic_launcher_round.png"));
}

// Android adaptive foreground
const foreground = {
  "mipmap-mdpi": 108,
  "mipmap-hdpi": 162,
  "mipmap-xhdpi": 216,
  "mipmap-xxhdpi": 324,
  "mipmap-xxxhdpi": 432,
};

for (const [folder, size] of Object.entries(foreground)) {
  const out = path.join(root, `android/app/src/main/res/${folder}/ic_launcher_foreground.png`);
  await adaptiveForeground(fgSvg, size, out);
}

console.log("\n✓ Icons generated");
