-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "Username" TEXT NOT NULL,
    "Password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outpass" (
    "id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "FromDay" TIMESTAMP(3) NOT NULL,
    "ToDay" TIMESTAMP(3) NOT NULL,
    "StudentId" INTEGER NOT NULL,

    CONSTRAINT "Outpass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outing" (
    "id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "FromTime" TIMESTAMP(3) NOT NULL,
    "ToTime" TIMESTAMP(3) NOT NULL,
    "StudentId" INTEGER NOT NULL,

    CONSTRAINT "Outing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_Username_key" ON "Admin"("Username");

-- AddForeignKey
ALTER TABLE "Outpass" ADD CONSTRAINT "Outpass_StudentId_fkey" FOREIGN KEY ("StudentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outing" ADD CONSTRAINT "Outing_StudentId_fkey" FOREIGN KEY ("StudentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
