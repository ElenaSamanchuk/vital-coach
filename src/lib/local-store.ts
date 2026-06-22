/**
 * IndexedDB для standalone — фото дня, большие объёмы данных.
 * Миграция с localStorage (vital_local_v1) при первом запуске.
 */
import type { DailyLog, Examination, HabitCheck, LabResult, Meal, Profile, Workout } from "@prisma/client";
import { buildProfileFromAssessment } from "./profile-save";
import { DEFAULT_ASSESSMENT } from "./onboarding-assessment";
import { GENERIC_PROFILE, GENERIC_MODE } from "./app-config";
import { startOfDayDate } from "./dates";

const LS_KEY = "vital_local_v1";
const DB_NAME = "vital_coach_v2";
const STORE = "kv";
const DATA_KEY = "main";

export type StoredDailyLog = DailyLog & {
  meals: Meal[];
  workouts: Workout[];
  habits: HabitCheck[];
};

export interface LocalDB {
  profile: Profile | null;
  dailyLogs: StoredDailyLog[];
  labs: LabResult[];
  examinations: Examination[];
}

export interface BackupPayload {
  version?: number;
  profile?: Profile | null;
  dailyLogs?: StoredDailyLog[];
  labResults?: LabResult[];
  examinations?: Examination[];
}

let initPromise: Promise<void> | null = null;

function emptyDb(): LocalDB {
  return { profile: null, dailyLogs: [], labs: [], examinations: [] };
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readDb(): Promise<LocalDB> {
  if (typeof window === "undefined") return emptyDb();
  const idb = await openDb();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(DATA_KEY);
    req.onsuccess = () => resolve((req.result as LocalDB | undefined) ?? emptyDb());
    req.onerror = () => reject(req.error);
  });
}

async function writeDb(data: LocalDB): Promise<void> {
  const idb = await openDb();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(data, DATA_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function migrateFromLocalStorage(): LocalDB | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as LocalDB;
    localStorage.removeItem(LS_KEY);
    return data;
  } catch {
    return null;
  }
}

/** Вызвать один раз при старте приложения */
export async function initStore(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const migrated = migrateFromLocalStorage();
    if (migrated) await writeDb(migrated);

    if (GENERIC_MODE && typeof localStorage !== "undefined") {
      const db = await readDb();
      if (db.profile?.onboardingDone && !db.profile.name?.trim()) {
        db.profile.onboardingDone = false;
        await writeDb(db);
      }
    }
  })();
  return initPromise;
}

export async function getProfile(): Promise<Profile | null> {
  await initStore();
  return (await readDb()).profile;
}

function defaultProfileFields(data: ReturnType<typeof buildProfileFromAssessment>) {
  return {
    id: "local-profile",
    userId: "local-user",
    ...data,
    targetChestCm: 90,
    trackingTagsJson: "[]",
    backlogTasksJson: "[]",
    interestsJson: "[]",
    leisureQuizJson: "{}",
    styleJson: "{}",
    notificationPrefsJson: "{}",
    assessmentJson: "{}",
    weeklyExperimentJson: "{}",
    wheelScores: "{}",
    permaScores: "{}",
    bigFiveScores: "{}",
    ikigaiJson: "{}",
    who5Scores: "{}",
    sdtScores: "{}",
    ryffScores: "{}",
    coreValuesJson: "[]",
    weeklyReviewJson: "{}",
    unlockedAchievements: "[]",
    leisureFavorites: "[]",
    intellectFavorites: "[]",
    thyroidMedication: "",
    otherMedications: "",
    surgeryDate: null,
    lastPeriodStart: null,
    lastBackupAt: null,
    updatedAt: new Date().toISOString(),
  } as unknown as Profile;
}

export async function ensureProfile(): Promise<Profile> {
  await initStore();
  const db = await readDb();
  if (db.profile) return db.profile;
  const data = buildProfileFromAssessment({
    ...DEFAULT_ASSESSMENT,
    ...GENERIC_PROFILE,
    name: "",
  });
  db.profile = {
    ...defaultProfileFields(data),
    onboardingDone: false,
  };
  await writeDb(db);
  return db.profile;
}

export async function saveProfile(patch: Partial<Profile>): Promise<Profile> {
  await initStore();
  const db = await readDb();
  const base = db.profile ?? (await ensureProfile());
  const merged = { ...base, ...patch, updatedAt: new Date() } as Profile;
  const period = (patch as { lastPeriodStart?: string | Date | null }).lastPeriodStart;
  if (period === "" || period === null) merged.lastPeriodStart = null;
  else if (period !== undefined) merged.lastPeriodStart = new Date(period);
  db.profile = merged;
  await writeDb(db);
  return merged;
}

function logKey(date: Date) {
  return startOfDayDate(date).toISOString();
}

export async function getDailyLog(date: Date): Promise<StoredDailyLog | null> {
  await initStore();
  const key = logKey(date);
  return (await readDb()).dailyLogs.find((l) => logKey(new Date(l.date)) === key) ?? null;
}

export async function getDailyLogs(opts?: { from?: Date; days?: number; limit?: number }) {
  await initStore();
  let logs = [...(await readDb()).dailyLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  if (opts?.from) logs = logs.filter((l) => new Date(l.date) >= opts.from!);
  if (opts?.days) {
    const from = new Date();
    from.setDate(from.getDate() - opts.days);
    logs = logs.filter((l) => new Date(l.date) >= from);
  }
  if (opts?.limit) logs = logs.slice(0, opts.limit);
  return logs;
}

export async function upsertDailyLog(
  date: Date,
  patch: Partial<StoredDailyLog> & { partial?: boolean },
): Promise<StoredDailyLog> {
  await initStore();
  const db = await readDb();
  const key = logKey(date);
  const idx = db.dailyLogs.findIndex((l) => logKey(new Date(l.date)) === key);
  const partial = patch.partial === true;
  const existing = idx >= 0 ? db.dailyLogs[idx] : null;

  const pick = <T,>(next: T | undefined, prev: T | undefined): T | undefined =>
    partial ? (next !== undefined ? next : prev) : next;

  const base: StoredDailyLog =
    existing ??
    ({
      id: crypto.randomUUID(),
      userId: "local-user",
      date: startOfDayDate(date),
      weightKg: null,
      waistCm: null,
      hipsCm: null,
      chestCm: null,
      cycleDay: null,
      cyclePhase: null,
      calories: null,
      proteinG: null,
      fatG: null,
      carbsG: null,
      fiberG: null,
      waterMl: null,
      steps: null,
      sleepMinutes: null,
      sleepQuality: null,
      energy: null,
      mood: null,
      stress: null,
      cortisolFeeling: null,
      postMealWalks: 0,
      thyroidMedTaken: false,
      thyroidMedOnTime: false,
      supplementsTaken: false,
      mealChoices: "{}",
      workoutChoice: "",
      softDay: false,
      dayPhoto: "",
      dayTagsJson: "[]",
      tasksJson: "[]",
      shoppingJson: "[]",
      leisureJson: "[]",
      intellectJson: "[]",
      leisureMinutes: null,
      lifeActionsJson: "{}",
      workSatisfaction: null,
      notes: "",
      meals: [],
      workouts: [],
      habits: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as StoredDailyLog);

  const next = {
    ...base,
    date: startOfDayDate(date),
    weightKg: pick(patch.weightKg, base.weightKg),
    waistCm: pick(patch.waistCm, base.waistCm),
    hipsCm: pick(patch.hipsCm, base.hipsCm),
    chestCm: pick(patch.chestCm, base.chestCm),
    cycleDay: pick(patch.cycleDay, base.cycleDay),
    cyclePhase: pick(patch.cyclePhase, base.cyclePhase),
    calories: pick(patch.calories, base.calories),
    proteinG: pick(patch.proteinG, base.proteinG),
    fatG: pick(patch.fatG, base.fatG),
    carbsG: pick(patch.carbsG, base.carbsG),
    fiberG: pick(patch.fiberG, base.fiberG),
    waterMl: pick(patch.waterMl, base.waterMl),
    steps: pick(patch.steps, base.steps),
    sleepMinutes: pick(patch.sleepMinutes, base.sleepMinutes),
    sleepQuality: pick(patch.sleepQuality, base.sleepQuality),
    energy: pick(patch.energy, base.energy),
    mood: pick(patch.mood, base.mood),
    stress: pick(patch.stress, base.stress),
    cortisolFeeling: pick(patch.cortisolFeeling, base.cortisolFeeling),
    postMealWalks: pick(patch.postMealWalks, base.postMealWalks) ?? 0,
    thyroidMedTaken: pick(patch.thyroidMedTaken, base.thyroidMedTaken) ?? false,
    thyroidMedOnTime: pick(patch.thyroidMedOnTime, base.thyroidMedOnTime) ?? false,
    supplementsTaken: pick(patch.supplementsTaken, base.supplementsTaken) ?? false,
    mealChoices: patch.mealChoices ?? base.mealChoices,
    workoutChoice:
      patch.workoutChoice !== undefined
        ? (pick(patch.workoutChoice, base.workoutChoice) ?? "")
        : base.workoutChoice,
    softDay: pick(patch.softDay, base.softDay) ?? false,
    dayPhoto: patch.dayPhoto ?? (partial ? base.dayPhoto : base.dayPhoto),
    dayTagsJson: patch.dayTagsJson ?? base.dayTagsJson,
    tasksJson: patch.tasksJson ?? base.tasksJson,
    shoppingJson: patch.shoppingJson ?? base.shoppingJson,
    leisureJson: patch.leisureJson ?? base.leisureJson,
    intellectJson: patch.intellectJson ?? base.intellectJson,
    leisureMinutes: pick(patch.leisureMinutes, base.leisureMinutes),
    lifeActionsJson: patch.lifeActionsJson ?? base.lifeActionsJson,
    workSatisfaction: pick(patch.workSatisfaction, base.workSatisfaction),
    notes: pick(patch.notes, base.notes) ?? "",
    meals: patch.meals ?? (partial ? base.meals : []),
    workouts: patch.workouts ?? (partial ? base.workouts : []),
    habits: patch.habits ?? (partial ? base.habits : []),
    updatedAt: new Date(),
  } as StoredDailyLog;

  if (idx >= 0) db.dailyLogs[idx] = next;
  else db.dailyLogs.push(next);
  await writeDb(db);
  return next;
}

export async function getLabs() {
  await initStore();
  return [...(await readDb()).labs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function addLab(data: {
  date: string | Date;
  marker: string;
  value: number;
  unit: string;
  refMin?: number;
  refMax?: number;
  notes?: string;
}) {
  await initStore();
  const db = await readDb();
  const lab = {
    id: crypto.randomUUID(),
    userId: "local-user",
    date: new Date(data.date),
    marker: data.marker,
    value: data.value,
    unit: data.unit,
    refMin: data.refMin ?? null,
    refMax: data.refMax ?? null,
    notes: data.notes ?? "",
  } as LabResult;
  db.labs.push(lab);
  await writeDb(db);
  return lab;
}

export async function deleteLab(id: string) {
  await initStore();
  const db = await readDb();
  db.labs = db.labs.filter((l) => l.id !== id);
  await writeDb(db);
}

export async function getExaminations() {
  await initStore();
  return [...(await readDb()).examinations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function addExamination(data: {
  date: string | Date;
  studyKey: string;
  category?: string;
  status?: string;
  resultSummary?: string;
  findings?: string;
  notes?: string;
}) {
  await initStore();
  const db = await readDb();
  const exam = {
    id: crypto.randomUUID(),
    userId: "local-user",
    date: new Date(data.date),
    studyKey: data.studyKey,
    category: data.category ?? "imaging",
    status: data.status ?? "done",
    resultSummary: data.resultSummary ?? "",
    findings: data.findings ?? "",
    notes: data.notes ?? "",
    createdAt: new Date(),
  } as Examination;
  db.examinations.push(exam);
  await writeDb(db);
  return exam;
}

export async function exportBackup() {
  await initStore();
  const db = await readDb();
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    userId: "local-user",
    email: null,
    profile: db.profile,
    dailyLogs: db.dailyLogs,
    labResults: db.labs,
    examinations: db.examinations,
  };
}

export async function importBackup(payload: BackupPayload): Promise<void> {
  await initStore();
  const db = await readDb();
  if (payload.profile) db.profile = payload.profile;
  if (payload.dailyLogs) db.dailyLogs = payload.dailyLogs;
  if (payload.labResults) db.labs = payload.labResults;
  if (payload.examinations) db.examinations = payload.examinations;
  await writeDb(db);
}

export async function markBackupDone() {
  await saveProfile({ lastBackupAt: new Date() } as Partial<Profile>);
}
