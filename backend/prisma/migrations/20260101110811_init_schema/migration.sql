-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "Username" TEXT NOT NULL,
    "Name" TEXT NOT NULL DEFAULT '',
    "Gender" TEXT NOT NULL DEFAULT '',
    "FatherName" TEXT NOT NULL DEFAULT '',
    "MotherName" TEXT NOT NULL DEFAULT '',
    "FatherOccupation" TEXT NOT NULL DEFAULT '',
    "MotherOccupation" TEXT NOT NULL DEFAULT '',
    "FatherEmail" TEXT NOT NULL DEFAULT '',
    "MotherEmail" TEXT NOT NULL DEFAULT '',
    "FatherAddress" TEXT NOT NULL DEFAULT '',
    "MotherAddress" TEXT NOT NULL DEFAULT '',
    "BloodGroup" TEXT NOT NULL DEFAULT '',
    "DateOfBirth" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "Password" TEXT NOT NULL,
    "Email" TEXT NOT NULL DEFAULT '',
    "OTP" TEXT NOT NULL DEFAULT '',
    "PhoneNumber" TEXT NOT NULL DEFAULT '',
    "FatherPhoneNumber" TEXT NOT NULL DEFAULT '',
    "MotherPhoneNumber" TEXT NOT NULL DEFAULT '',
    "Address" TEXT NOT NULL DEFAULT '',
    "Year" TEXT NOT NULL DEFAULT '',
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
    "Email" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'webmaster',

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
    "currentLevel" TEXT NOT NULL DEFAULT 'caretaker',
    "approvalLogs" JSONB,

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
    "currentLevel" TEXT NOT NULL DEFAULT 'caretaker',
    "approvalLogs" JSONB,

    CONSTRAINT "Outing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credits" DOUBLE PRECISION NOT NULL,
    "branchId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "grade" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "totalClasses" INTEGER NOT NULL DEFAULT 0,
    "attendedClasses" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "text" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_Username_key" ON "Student"("Username");

-- CreateIndex
CREATE INDEX "Student_Branch_Year_idx" ON "Student"("Branch", "Year");

-- CreateIndex
CREATE INDEX "Student_isPresentInCampus_idx" ON "Student"("isPresentInCampus");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_Username_key" ON "Admin"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_Email_key" ON "Admin"("Email");

-- CreateIndex
CREATE INDEX "Outpass_StudentId_idx" ON "Outpass"("StudentId");

-- CreateIndex
CREATE INDEX "Outpass_isApproved_isRejected_isExpired_idx" ON "Outpass"("isApproved", "isRejected", "isExpired");

-- CreateIndex
CREATE INDEX "Outing_StudentId_idx" ON "Outing"("StudentId");

-- CreateIndex
CREATE INDEX "Outing_isApproved_isRejected_isExpired_idx" ON "Outing"("isApproved", "isRejected", "isExpired");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_name_key" ON "Branch"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_name_year_key" ON "Semester"("name", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_branchId_semesterId_key" ON "Subject"("name", "branchId", "semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_studentId_subjectId_semesterId_key" ON "Grade"("studentId", "subjectId", "semesterId");

-- CreateIndex
CREATE INDEX "Attendance_studentId_semesterId_idx" ON "Attendance"("studentId", "semesterId");

-- CreateIndex
CREATE INDEX "Attendance_subjectId_idx" ON "Attendance"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_subjectId_semesterId_key" ON "Attendance"("studentId", "subjectId", "semesterId");

-- AddForeignKey
ALTER TABLE "Outpass" ADD CONSTRAINT "Outpass_StudentId_fkey" FOREIGN KEY ("StudentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outing" ADD CONSTRAINT "Outing_StudentId_fkey" FOREIGN KEY ("StudentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
