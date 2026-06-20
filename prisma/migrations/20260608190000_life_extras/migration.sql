-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "leisureQuizJson" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Profile" ADD COLUMN "styleJson" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Profile" ADD COLUMN "notificationPrefsJson" TEXT NOT NULL DEFAULT '{}';
