-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "interestsJson" TEXT NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "DailyLog" ADD COLUMN "shoppingJson" TEXT NOT NULL DEFAULT '[]';
