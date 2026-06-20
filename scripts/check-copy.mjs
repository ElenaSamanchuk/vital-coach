#!/usr/bin/env node
/**
 * Проверка продуктового копирайта: «Анализы» → «Чекап» в UI.
 * Запуск: npm run check:copy
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SCAN_DIRS = ["src/components", "src/app", "src/lib"];

const ALLOW = [
  /мета-анализ/i,
  /общий анализ крови/i,
  /раздел «Чекап» — вместо «Анализы»/,
  /анализы крови/i, // dev-комментарии labs-schedule
  /уникальная связка анализов/i, // lab-meal-bridge dev
  /трендов и анализов/i, // insights.ts — «анализ данных»
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?|md)$/.test(name)) out.push(p);
  }
  return out;
}

const forbidden = /\b[Аа]нализ(?:ы|ов|а|у)?\b/;
const hits = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    if (file.endsWith("product-copy.ts")) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (!forbidden.test(line)) return;
      if (ALLOW.some((re) => re.test(line))) return;
      hits.push(`${file.replace(ROOT + "/", "")}:${i + 1}: ${line.trim()}`);
    });
  }
}

// Константы продукта
const copyPath = join(ROOT, "src/lib/product-copy.ts");
const copy = readFileSync(copyPath, "utf8");
const required = ["section: \"Чекап\"", "sectionPath:", "markersTab:"];
const missing = required.filter((s) => !copy.includes(s));

if (missing.length) {
  console.error("product-copy.ts: missing keys:", missing.join(", "));
  process.exit(1);
}

if (hits.length) {
  console.error("Found legacy «анализ*» in user-facing copy:\n");
  hits.forEach((h) => console.error(" ", h));
  process.exit(1);
}

console.log("✓ Copy check passed — «Чекап» terminology consistent");
