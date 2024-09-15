-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "Username" TEXT NOT NULL,
    "Name" TEXT NOT NULL DEFAULT '',
    "Gender" TEXT NOT NULL DEFAULT 'Male',
    "Password" TEXT NOT NULL,
    "Email" TEXT NOT NULL DEFAULT '',
    "OTP" TEXT NOT NULL DEFAULT '',
    "PhoneNumber" TEXT NOT NULL DEFAULT '',
    "FatherPhoneNumber" TEXT NOT NULL DEFAULT '',
    "MotherPhoneNumber" TEXT NOT NULL DEFAULT '',
    "Address" TEXT NOT NULL DEFAULT '',
    "Year" TEXT NOT NULL DEFAULT 'E2',
    "Branch" TEXT NOT NULL DEFAULT '',
    "Section" TEXT NOT NULL DEFAULT '',
    "Roomno" TEXT NOT NULL DEFAULT '',
    "isPresentInCampus" BOOLEAN NOT NULL DEFAULT true,
    "isApplicationPending" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "Username" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outpass" (
    "id" TEXT NOT NULL,
    "StudentId" TEXT NOT NULL,
    "Reason" TEXT NOT NULL,
    "FromDay" TIMESTAMP(3) NOT NULL,
    "ToDay" TIMESTAMP(3) NOT NULL,
    "Days" INTEGER NOT NULL DEFAULT 0,
    "RequestedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "issuedBy" TEXT NOT NULL DEFAULT 'none',
    "issuedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Message" TEXT,
    "isRejected" BOOLEAN NOT NULL DEFAULT false,
    "rejectedBy" TEXT NOT NULL DEFAULT 'none',
    "rejectedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Outpass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outing" (
    "id" TEXT NOT NULL,
    "StudentId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "FromTime" TIMESTAMP(3) NOT NULL,
    "ToTime" TIMESTAMP(3) NOT NULL,
    "Hours" INTEGER NOT NULL DEFAULT 0,
    "RequestedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "issuedBy" TEXT NOT NULL DEFAULT 'none',
    "issuedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Message" TEXT,
    "isRejected" BOOLEAN NOT NULL DEFAULT false,
    "rejectedBy" TEXT NOT NULL DEFAULT 'none',
    "rejectedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Outing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_Username_key" ON "Student"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_Username_key" ON "Admin"("Username");

-- AddForeignKey
ALTER TABLE "Outpass" ADD CONSTRAINT "Outpass_StudentId_fkey" FOREIGN KEY ("StudentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outing" ADD CONSTRAINT "Outing_StudentId_fkey" FOREIGN KEY ("StudentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
