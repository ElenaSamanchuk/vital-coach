import { BASE_PATH } from "./app-config";

/** Путь без basePath (GitHub Pages) и trailing slash — для сравнения с href */
export function normalizeAppPath(pathname: string): string {
  let p = pathname || "/";
  const base = BASE_PATH.replace(/\/$/, "");
  if (base && (p === base || p.startsWith(`${base}/`))) {
    p = p.slice(base.length) || "/";
  }
  if (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1);
  }
  return p || "/";
}

export function isNavActive(pathname: string, href: string): boolean {
  const p = normalizeAppPath(pathname);
  if (href === "/") return p === "/";
  return p === href || p.startsWith(`${href}/`);
}
