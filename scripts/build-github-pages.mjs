#!/usr/bin/env node
/**
 * Сборка для GitHub Pages: static export + standalone localStorage.
 * Usage: NEXT_PUBLIC_BASE_PATH=/vital-coach node scripts/build-github-pages.mjs
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const backup = path.join(root, ".build-backup");
const manifestPath = path.join(root, "public/manifest.webmanifest");

const moves = [
  [path.join(root, "src/app/api"), path.join(backup, "api")],
  [path.join(root, "src/middleware.ts"), path.join(backup, "middleware.ts")],
];

function restore() {
  if (!fs.existsSync(backup)) return;
  for (const [from, to] of moves) {
    if (fs.existsSync(to)) {
      if (fs.existsSync(from)) fs.rmSync(from, { recursive: true, force: true });
      fs.renameSync(to, from);
    }
  }
  fs.rmSync(backup, { recursive: true, force: true });
}

function hideServerRoutes() {
  fs.mkdirSync(backup, { recursive: true });
  for (const [from, to] of moves) {
    if (fs.existsSync(from)) {
      fs.renameSync(from, to);
    }
  }
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/vital-coach";

try {
  restore();
  hideServerRoutes();

  const manifestBackup = fs.readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(manifestBackup);
  manifest.start_url = `${basePath}/`;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

  execSync("npm run build", {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      GITHUB_PAGES: "true",
      NEXT_PUBLIC_STANDALONE: "true",
      NEXT_PUBLIC_GENERIC_MODE: "true",
      NEXT_PUBLIC_BASE_PATH: basePath,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "",
    },
  });

  console.log("\n✓ Static export in ./out");
  console.log(`  Deploy folder 'out' to GitHub Pages`);
  console.log(`  basePath: ${basePath}`);

  execSync("node scripts/inject-offline-sw.mjs", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, NEXT_PUBLIC_BASE_PATH: basePath },
  });
} finally {
  if (fs.existsSync(manifestPath)) {
    try {
      const m = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      m.start_url = "/";
      fs.writeFileSync(manifestPath, JSON.stringify(m, null, 2) + "\n");
    } catch {
      /* */
    }
  }
  restore();
}
