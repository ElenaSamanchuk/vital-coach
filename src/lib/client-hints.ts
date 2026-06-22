/** Одноразовые подсказки UI (localStorage). */

export const HINT_KEYS = {
  rebrandNotice: "potok-rebrand-notice-seen",
  pwaBannerDismissed: "potok-pwa-banner-dismissed",
} as const;

export function hintSeen(key: string): boolean {
  if (typeof localStorage === "undefined") return true;
  return localStorage.getItem(key) === "1";
}

export function markHintSeen(key: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, "1");
}
