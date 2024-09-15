/*
  Warnings:

  - The primary key for the `Admin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Outing` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Outpass` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Student` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Outing" DROP CONSTRAINT "Outing_StudentId_fkey";

-- DropForeignKey
ALTER TABLE "Outpass" DROP CONSTRAINT "Outpass_StudentId_fkey";

-- AlterTable
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Admin_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Admin_id_seq";

-- AlterTable
ALTER TABLE "Outing" DROP CONSTRAINT "Outing_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "StudentId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Outing_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Outing_id_seq";

-- AlterTable
ALTER TABLE "Outpass" DROP CONSTRAINT "Outpass_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "StudentId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Outpass_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Outpass_id_seq";

-- AlterTable
ALTER TABLE "Student" DROP CONSTRAINT "Student_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Student_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Student_id_seq";

-- AddForeignKey
ALTER TABLE "Outpass" ADD CONSTRAINT "Outpass_StudentId_fkey" FOREIGN KEY ("StudentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outing" ADD CONSTRAINT "Outing_StudentId_fkey" FOREIGN KEY ("StudentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
