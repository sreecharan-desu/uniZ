/*
  Warnings:

  - Changed the type of `FromTime` on the `Outing` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `ToTime` on the `Outing` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Outing" DROP COLUMN "FromTime",
ADD COLUMN     "FromTime" TIMESTAMP(3) NOT NULL,
DROP COLUMN "ToTime",
ADD COLUMN     "ToTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Outpass" ALTER COLUMN "FromDay" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "ToDay" SET DATA TYPE TIMESTAMP(3);
