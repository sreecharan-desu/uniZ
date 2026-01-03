-- CreateTable
CREATE TABLE "Faculty" (
    "id" TEXT NOT NULL,
    "Username" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Contact" TEXT NOT NULL DEFAULT '',
    "Department" TEXT NOT NULL,
    "Designation" TEXT NOT NULL,
    "Role" TEXT NOT NULL DEFAULT 'teacher',
    "ProfileUrl" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacultySubject" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacultySubject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_Username_key" ON "Faculty"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_Email_key" ON "Faculty"("Email");

-- CreateIndex
CREATE INDEX "Faculty_Department_idx" ON "Faculty"("Department");

-- CreateIndex
CREATE UNIQUE INDEX "FacultySubject_facultyId_subjectId_key" ON "FacultySubject"("facultyId", "subjectId");

-- AddForeignKey
ALTER TABLE "FacultySubject" ADD CONSTRAINT "FacultySubject_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultySubject" ADD CONSTRAINT "FacultySubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
