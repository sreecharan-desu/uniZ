/*
  Warnings:

  - You are about to drop the column `IssuedTIme` on the `Outing` table. All the data in the column will be lost.
  - You are about to drop the column `IssuedTIme` on the `Outpass` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Outing" DROP COLUMN "IssuedTIme",
ADD COLUMN     "RequestedTime" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Outpass" DROP COLUMN "IssuedTIme",
ADD COLUMN     "RequestedTime" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
