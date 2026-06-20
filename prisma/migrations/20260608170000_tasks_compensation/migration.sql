-- AlterTable
ALTER TABLE "DailyLog" ADD COLUMN "tasksJson" TEXT NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "backlogTasksJson" TEXT NOT NULL DEFAULT '[]';
