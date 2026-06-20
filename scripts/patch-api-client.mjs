#!/usr/bin/env node
/** Заменяет fetch("/api/...) на apiClient и добавляет import */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src");

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (/\.(tsx|ts)$/.test(name)) files.push(p);
  }
  return files;
}

const importLine = 'import { apiClient } from "@/lib/api-client";';

for (const file of walk(root)) {
  if (file.includes("api-client.ts") || file.includes("standalone-api")) continue;
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes('fetch("/api/') && !src.includes("fetch('/api/")) continue;
  src = src.replace(/fetch\((['"])\/api\//g, "apiClient($1/api/");
  if (!src.includes("@/lib/api-client")) {
    const useClient = src.startsWith('"use client"');
    if (useClient) {
      src = src.replace(/"use client";\n\n/, `"use client";\n\n${importLine}\n`);
    } else {
      src = `${importLine}\n${src}`;
    }
  }
  fs.writeFileSync(file, src);
  console.log("patched", path.relative(root, file));
}
