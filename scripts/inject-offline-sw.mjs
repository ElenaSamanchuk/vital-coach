#!/usr/bin/env node
/** Генерирует service worker с precache для offline после первого визита */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "out");
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "/vital-coach").replace(/\/$/, "");

function walk(dir, base = "") {
  const urls = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    if (fs.statSync(full).isDirectory()) urls.push(...walk(full, rel));
    else urls.push(`${basePath}/${rel}`.replace(/\/+/g, "/"));
  }
  return urls;
}

if (!fs.existsSync(outDir)) {
  console.warn("out/ not found — skip SW inject");
  process.exit(0);
}

const urls = walk(outDir).filter((u) => !u.endsWith("sw.js"));
const scope = `${basePath}/`.replace(/\/+/g, "/");

const sw = `/* Vital offline shell — auto-generated */
const CACHE = "vital-shell-v2";
const PRECACHE = ${JSON.stringify(urls, null, 2)};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith("${scope.replace(/"/g, '\\"')}")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE).then((c) => c.put(event.request, clone));
        }
        return response;
      }).catch(() => cached || caches.match("${basePath}/index.html".replace(/\/+/g, "/")));
    })
  );
});
`;

fs.writeFileSync(path.join(outDir, "sw.js"), sw);
console.log(`✓ Offline SW: ${urls.length} URLs, scope ${scope}`);
