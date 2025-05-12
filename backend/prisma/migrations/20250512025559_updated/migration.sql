/*
  Warnings:

  - You are about to drop the column `date` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `isPresent` on the `Attendance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,subjectId,semesterId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Attendance_studentId_subjectId_semesterId_date_key";

-- DropIndex
DROP INDEX "Attendance_subjectId_date_idx";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "date",
DROP COLUMN "isPresent",
ADD COLUMN     "attendedClasses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalClasses" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Attendance_subjectId_idx" ON "Attendance"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_subjectId_semesterId_key" ON "Attendance"("studentId", "subjectId", "semesterId");
