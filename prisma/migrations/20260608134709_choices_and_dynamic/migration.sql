-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DailyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "weightKg" REAL,
    "waistCm" REAL,
    "hipsCm" REAL,
    "chestCm" REAL,
    "cycleDay" INTEGER,
    "cyclePhase" TEXT,
    "calories" INTEGER,
    "proteinG" INTEGER,
    "fatG" INTEGER,
    "carbsG" INTEGER,
    "fiberG" INTEGER,
    "waterMl" INTEGER,
    "sleepMinutes" INTEGER,
    "sleepQuality" INTEGER,
    "energy" INTEGER,
    "mood" INTEGER,
    "stress" INTEGER,
    "cortisolFeeling" INTEGER,
    "postMealWalks" INTEGER NOT NULL DEFAULT 0,
    "thyroidMedTaken" BOOLEAN NOT NULL DEFAULT false,
    "thyroidMedOnTime" BOOLEAN NOT NULL DEFAULT false,
    "supplementsTaken" BOOLEAN NOT NULL DEFAULT false,
    "mealChoices" TEXT NOT NULL DEFAULT '{}',
    "workoutChoice" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DailyLog" ("calories", "carbsG", "chestCm", "cortisolFeeling", "createdAt", "cycleDay", "cyclePhase", "date", "energy", "fatG", "fiberG", "hipsCm", "id", "mood", "notes", "postMealWalks", "proteinG", "sleepMinutes", "sleepQuality", "stress", "supplementsTaken", "thyroidMedOnTime", "thyroidMedTaken", "updatedAt", "userId", "waistCm", "waterMl", "weightKg") SELECT "calories", "carbsG", "chestCm", "cortisolFeeling", "createdAt", "cycleDay", "cyclePhase", "date", "energy", "fatG", "fiberG", "hipsCm", "id", "mood", "notes", "postMealWalks", "proteinG", "sleepMinutes", "sleepQuality", "stress", "supplementsTaken", "thyroidMedOnTime", "thyroidMedTaken", "updatedAt", "userId", "waistCm", "waterMl", "weightKg" FROM "DailyLog";
DROP TABLE "DailyLog";
ALTER TABLE "new_DailyLog" RENAME TO "DailyLog";
CREATE UNIQUE INDEX "DailyLog_userId_date_key" ON "DailyLog"("userId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
