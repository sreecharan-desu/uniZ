import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../../services/prisma.service";
import progressStore from "../utils/progress";
import { getOrCreateSubject, validateAttendanceInput } from "../utils/utils";
import { authMiddleware } from "../../student/middlewares/middlewares";

export const attendanceRouter = Router();

attendanceRouter.post("/addattendance", authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    const validationErrors = validateAttendanceInput(data);
    if (validationErrors?.length)
      return res.status(400).json({ msg: "Invalid input", success: false, errors: validationErrors });

    const { year, SemesterName } = data;
    // Format: Sem-1 or Sem - 1
    const [semWord, dashOrNum, semNumber] = SemesterName.replace("-", " - ").split(/\s+/).filter(Boolean);
    const formattedSemName = `${semWord} - ${semNumber || dashOrNum}`;

    const semester = await prisma.semester.findFirst({
      where: { year, name: formattedSemName },
      select: { id: true },
    });
    if (!semester) return res.status(400).json({ msg: `Semester "${year} ${formattedSemName}" not found`, success: false });

    const studentsInput = data.Students;
    const processId = uuidv4();

    progressStore.set(processId, {
      totalRecords: studentsInput.length,
      processedRecords: 0,
      errors: [],
      status: "pending",
      startTime: new Date(),
    });

    (async () => {
      let processedRecords = 0;
      const errors: any[] = [];

      for (const [index, studentData] of studentsInput.entries()) {
        try {
          const student = await prisma.student.findFirst({
            where: { Username: studentData.IdNumber.toLowerCase() },
            select: { id: true, Branch: true },
          });
          if (!student) {
            errors.push({ recordIndex: index, message: `Student "${studentData.IdNumber}" not found` });
            updateProgress(processedRecords, errors, processId);
            continue;
          }

          const branch = await prisma.branch.findFirst({ where: { name: student.Branch } });
          if (!branch) {
            errors.push({ recordIndex: index, message: `Branch "${student.Branch}" not found` });
            updateProgress(processedRecords, errors, processId);
            continue;
          }

          const existingSubjects = await prisma.subject.findMany({ where: { semesterId: semester.id, branchId: branch.id } });
          const subjMap: any = new Map(existingSubjects.map((s) => [s.name, s.id]));

          for (const record of studentData.Attendance) {
            const { SubjectName, ClassesHappened, ClassesAttended } = record;
            if (!SubjectName || ClassesHappened == null || ClassesAttended == null) continue;

            let subjectId = subjMap.get(SubjectName);
            if (!subjectId) {
              const subj = await getOrCreateSubject(SubjectName, semester.id, branch.id, { names: [], credits: [] }, true);
              if (!subj) continue;
              subjectId = subj.id;
              subjMap.set(SubjectName, subjectId);
            }

            await prisma.attendance.upsert({
              where: { studentId_subjectId_semesterId: { studentId: student.id, subjectId, semesterId: semester.id } },
              update: { attendedClasses: ClassesAttended, totalClasses: ClassesHappened },
              create: { studentId: student.id, subjectId, semesterId: semester.id, attendedClasses: ClassesAttended, totalClasses: ClassesHappened },
            });
          }
          processedRecords++;
          updateProgress(processedRecords, errors, processId);
        } catch (err: any) {
          errors.push({ recordIndex: index, message: err.message });
          updateProgress(processedRecords, errors, processId);
        }
      }
      const p = progressStore.get(processId);
      if (p) {
        p.status = "completed";
        p.endTime = new Date();
        setTimeout(() => progressStore.delete(processId), 10 * 60 * 1000);
      }
    })();

    return res.status(202).json({ msg: `Processing ${studentsInput.length} records`, processId, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error", success: false });
  }
});

function updateProgress(processedRecords: number, errors: any[], processId: string) {
  const p = progressStore.get(processId);
  if (p) {
    p.processedRecords = processedRecords;
    p.errors = [...errors];
    p.failedRecords = errors.map((e) => ({ id: e.recordIndex, reason: e.message }));
  }
}
