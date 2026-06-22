import { GENERIC_MODE } from "./app-config";

/** Что показывать в версии «для всех» (GitHub Pages / APK) */
export const GENERIC_FEATURES = {
  medical: !GENERIC_MODE,
  cycle: !GENERIC_MODE,
  deepPsychology: !GENERIC_MODE,
  checkupTab: !GENERIC_MODE,
  timeRings: !GENERIC_MODE,
  lifeCatalog: !GENERIC_MODE,
  bodyAnalytics: !GENERIC_MODE,
  horizonPlan: !GENERIC_MODE,
  journeyBanner: !GENERIC_MODE,
  dayRhythm: !GENERIC_MODE,
  wellbeingPain: !GENERIC_MODE,
  careHomeBlock: !GENERIC_MODE,
  lifePulse: GENERIC_MODE,
} as const;
