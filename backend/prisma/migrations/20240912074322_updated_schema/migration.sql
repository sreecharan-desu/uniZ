/*
  Warnings:

  - Added the required column `Message` to the `Outing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isRejected` to the `Outing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Message` to the `Outpass` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isRejected` to the `Outpass` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Outing" ADD COLUMN     "Message" TEXT NOT NULL,
ADD COLUMN     "isRejected" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Outpass" ADD COLUMN     "Message" TEXT NOT NULL,
ADD COLUMN     "isRejected" BOOLEAN NOT NULL;
