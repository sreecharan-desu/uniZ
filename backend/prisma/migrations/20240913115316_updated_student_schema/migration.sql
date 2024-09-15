-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "isApplicationPending" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "isPresentInCampus" SET DEFAULT true;
