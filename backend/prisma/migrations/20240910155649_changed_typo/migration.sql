/*
  Warnings:

  - You are about to drop the column `reason` on the `Outpass` table. All the data in the column will be lost.
  - Added the required column `Reason` to the `Outpass` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Outpass" DROP COLUMN "reason",
ADD COLUMN     "Reason" TEXT NOT NULL;
