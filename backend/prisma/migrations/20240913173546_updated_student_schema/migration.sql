/*
  Warnings:

  - The `inTime` column on the `Outpass` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Outpass" DROP COLUMN "inTime",
ADD COLUMN     "inTime" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
