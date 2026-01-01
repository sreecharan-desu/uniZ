-- CreateIndex
CREATE INDEX "Outing_StudentId_idx" ON "Outing"("StudentId");

-- CreateIndex
CREATE INDEX "Outing_isApproved_isRejected_isExpired_idx" ON "Outing"("isApproved", "isRejected", "isExpired");

-- CreateIndex
CREATE INDEX "Outpass_StudentId_idx" ON "Outpass"("StudentId");

-- CreateIndex
CREATE INDEX "Outpass_isApproved_isRejected_isExpired_idx" ON "Outpass"("isApproved", "isRejected", "isExpired");

-- CreateIndex
CREATE INDEX "Student_Branch_Year_idx" ON "Student"("Branch", "Year");

-- CreateIndex
CREATE INDEX "Student_isPresentInCampus_idx" ON "Student"("isPresentInCampus");
