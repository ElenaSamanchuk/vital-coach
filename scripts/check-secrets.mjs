#!/usr/bin/env node
/** Блокирует коммит секретов и базы с пользователями */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const forbidden = [
  ".env",
  ".env.local",
  "prisma/dev.db",
  "dev.db",
];

const globs = ["*.db", ".env*"];

let failed = false;

for (const f of forbidden) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) {
    try {
      const tracked = execSync(`git ls-files --error-unmatch "${f}" 2>/dev/null`, {
        cwd: root,
        encoding: "utf8",
      });
      if (tracked.trim()) {
        console.error(`❌ В Git отслеживается секретный файл: ${f}`);
        failed = true;
      }
    } catch {
      /* not tracked — ok */
    }
  }
}

try {
  const files = execSync("git ls-files", { cwd: root, encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
  for (const f of files) {
    if (f.endsWith(".db") || f.match(/\.env(\.|$)/)) {
      console.error(`❌ В индексе Git не должно быть: ${f}`);
      failed = true;
    }
    if (f === ".env" || f.startsWith(".env.")) {
      console.error(`❌ .env в Git: ${f}`);
      failed = true;
    }
  }
} catch {
  console.log("ℹ️  Git не инициализирован — проверка tracked-файлов пропущена");
}

if (failed) {
  console.error("\nУдалите из Git: git rm --cached <file>");
  console.error("См. docs/SECURITY.md");
  process.exit(1);
}

console.log("✓ Секреты и база не в Git");
