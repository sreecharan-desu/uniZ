/*
  Warnings:

  - Added the required column `inTime` to the `Outpass` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Outing" ADD COLUMN     "inTime" TIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Outpass" ADD COLUMN     "inTime" TIME NOT NULL;
