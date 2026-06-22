/**
 * Шаги из Health Connect (Android APK).
 * Плагин HealthSteps регистрируется в MainActivity.
 */
import { Capacitor, registerPlugin } from "@capacitor/core";

interface HealthStepsPlugin {
  getTodaySteps(): Promise<{ steps: number; source?: string }>;
  isAvailable(): Promise<{ available: boolean }>;
}

const HealthSteps = registerPlugin<HealthStepsPlugin>("HealthSteps");

export function isAndroidNative(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

export async function syncAndroidSteps(): Promise<number | null> {
  if (!isAndroidNative()) return null;
  try {
    const avail = await HealthSteps.isAvailable();
    if (!avail.available) return null;
    const { steps } = await HealthSteps.getTodaySteps();
    return typeof steps === "number" && steps >= 0 ? steps : null;
  } catch {
    return null;
  }
}
