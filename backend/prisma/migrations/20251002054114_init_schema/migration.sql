/*
  Warnings:

  - A unique constraint covering the columns `[Email]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "Email" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Admin_Email_key" ON "Admin"("Email");
