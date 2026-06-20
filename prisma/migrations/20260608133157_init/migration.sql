-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "heightCm" INTEGER NOT NULL DEFAULT 180,
    "currentWeightKg" REAL NOT NULL DEFAULT 92,
    "targetWeightKg" REAL NOT NULL DEFAULT 78,
    "targetWaistCm" REAL NOT NULL DEFAULT 76,
    "targetHipsCm" REAL NOT NULL DEFAULT 110,
    "targetChestCm" REAL NOT NULL DEFAULT 100,
    "birthYear" INTEGER NOT NULL DEFAULT 1991,
    "calorieTarget" INTEGER NOT NULL DEFAULT 1750,
    "proteinTargetG" INTEGER NOT NULL DEFAULT 150,
    "fatTargetG" INTEGER NOT NULL DEFAULT 60,
    "carbTargetG" INTEGER NOT NULL DEFAULT 140,
    "fiberTargetG" INTEGER NOT NULL DEFAULT 30,
    "waterTargetMl" INTEGER NOT NULL DEFAULT 2500,
    "sleepTargetMin" INTEGER NOT NULL DEFAULT 480,
    "insulinResistance" BOOLEAN NOT NULL DEFAULT true,
    "hypothyroidism" BOOLEAN NOT NULL DEFAULT true,
    "cortisolIssues" BOOLEAN NOT NULL DEFAULT true,
    "vitaminDDeficiency" BOOLEAN NOT NULL DEFAULT true,
    "b12Deficiency" BOOLEAN NOT NULL DEFAULT true,
    "hormoneIssues" BOOLEAN NOT NULL DEFAULT true,
    "pcosSuspected" BOOLEAN NOT NULL DEFAULT false,
    "surgeryRecovery" BOOLEAN NOT NULL DEFAULT true,
    "surgeryDate" DATETIME,
    "cycleLength" INTEGER NOT NULL DEFAULT 28,
    "lastPeriodStart" DATETIME,
    "thyroidMedication" TEXT NOT NULL DEFAULT '',
    "otherMedications" TEXT NOT NULL DEFAULT '',
    "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyLog" (
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
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyLogId" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "calories" INTEGER,
    "proteinG" INTEGER,
    "carbsG" INTEGER,
    "fatG" INTEGER,
    "hadProtein" BOOLEAN NOT NULL DEFAULT true,
    "hadVeggies" BOOLEAN NOT NULL DEFAULT false,
    "hadWalkAfter" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Meal_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyLogId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "intensity" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Workout_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HabitCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyLogId" TEXT NOT NULL,
    "habitKey" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "HabitCheck_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "marker" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "refMin" REAL,
    "refMax" REAL,
    "notes" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "LabResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_userId_date_key" ON "DailyLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "HabitCheck_dailyLogId_habitKey_key" ON "HabitCheck"("dailyLogId", "habitKey");
