import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import ExcelJS from "exceljs";
import prisma from "../../services/prisma.service";
import progressStore from "../utils/progress";
import { getOrCreateSubject, validateGradesInput } from "../utils/utils";
import { authMiddleware } from "../../student/middlewares/middlewares";

export const gradesRouter = Router();

gradesRouter.post("/addgrades", authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    const validationErrors = validateGradesInput(data);
    if (validationErrors?.length)
      return res.status(400).json({ msg: "Invalid input", success: false, errors: validationErrors });

    const [year, semWord, semNum] = String(data.SemesterName || "").split(" ");
    if (!year || !semWord || !semNum)
      return res.status(400).json({ msg: "Invalid SemesterName format (expected 'E2 Sem 1')", success: false });

    const semester = await prisma.semester.findFirst({
      where: { year, name: `${semWord} - ${semNum}` },
      select: { id: true },
    });
    if (!semester)
      return res.status(400).json({ msg: `Semester "${data.SemesterName}" not found`, success: false });

    const studentsInput = data.Students || [];
    const processId = uuidv4();

    progressStore.set(processId, {
      totalRecords: studentsInput.length,
      processedRecords: 0,
      errors: [],
      status: "pending",
      startTime: new Date(),
      percentage: 0,
    });

    const gradeMap: Record<string, number> = { Ex: 10, A: 9, B: 8, C: 7, D: 6, E: 5, R: 0 };

    (async () => {
      let processedRecords = 0;
      const errors: any[] = [];

      for (const [index, studentData] of studentsInput.entries()) {
        let studentProcessed = false;
        try {
          const student = await prisma.student.findFirst({
            where: { Username: studentData.Username.toLowerCase() },
            select: { id: true, Branch: true },
          });

          if (!student) {
            errors.push({ recordIndex: index, message: `Student ${studentData.Username} not found` });
            updateProgress(processedRecords, errors, studentsInput.length, processId);
            continue;
          }

          const branch = await prisma.branch.findFirst({
            where: { name: student.Branch },
            select: { id: true },
          });
          if (!branch) {
            errors.push({ recordIndex: index, message: `Branch ${student.Branch} not found` });
            updateProgress(processedRecords, errors, studentsInput.length, processId);
            continue;
          }

          const existingSubjects = await prisma.subject.findMany({
            where: { semesterId: semester.id, branchId: branch.id },
            select: { id: true, name: true },
          });
          const subjMap: any = new Map(existingSubjects.map((s) => [s.name, s.id]));

          for (const grade of studentData.Grades) {
            let subjectId = subjMap.get(grade.SubjectName);
            if (!subjectId) {
              const isElective = grade.SubjectName.includes("Elective") || grade.SubjectName.includes("MOOC");
              if (!isElective) {
                errors.push({ recordIndex: index, message: `Subject ${grade.SubjectName} missing` });
                continue;
              }
              const subj = await getOrCreateSubject(grade.SubjectName, semester.id, branch.id, { names: [], credits: [] }, true);
              if (!subj) {
                errors.push({ recordIndex: index, message: `Failed to create elective ${grade.SubjectName}` });
                continue;
              }
              subjectId = subj.id;
              subjMap.set(grade.SubjectName, subjectId);
            }

            const numericGrade = gradeMap[grade.Grade];
            if (numericGrade === undefined) {
              errors.push({ recordIndex: index, message: `Invalid grade "${grade.Grade}" for ${grade.SubjectName}` });
              continue;
            }

            await prisma.grade.upsert({
              where: { studentId_subjectId_semesterId: { studentId: student.id, subjectId, semesterId: semester.id } },
              update: { grade: numericGrade },
              create: { studentId: student.id, subjectId, semesterId: semester.id, grade: numericGrade },
            });
            studentProcessed = true;
          }
          if (studentProcessed) processedRecords++;
          updateProgress(processedRecords, errors, studentsInput.length, processId);
        } catch (err: any) {
          errors.push({ recordIndex: index, message: `Error processing student ${studentData.Username}: ${err.message}` });
          updateProgress(processedRecords, errors, studentsInput.length, processId);
        }
      }

      const finalP = progressStore.get(processId);
      if (finalP) {
        finalP.status = processedRecords > 0 ? "completed" : "failed";
        finalP.endTime = new Date();
        setTimeout(() => progressStore.delete(processId), 10 * 60 * 1000);
      }
    })();

    return res.status(202).json({
      msg: `Processing ${studentsInput.length} grade records`,
      processId,
      success: true,
      templateDownload: "/api/v1/admin/grades/template",
    });
  } catch (err) {
    console.error("POST /addgrades error:", err);
    return res.status(500).json({ msg: "Internal Server Error", success: false });
  }
});

function updateProgress(processedRecords: number, errors: any[], total: number, processId: string) {
  const p = progressStore.get(processId);
  if (p) {
    p.processedRecords = processedRecords;
    p.errors = errors;
    p.percentage = total > 0 ? parseFloat(((processedRecords / total) * 100).toFixed(2)) : 0;
  }
}

gradesRouter.post("/template", authMiddleware, async (req, res) => {
  try {
    const { year, semester, branch } = req.body;
    if (!year || !semester || !branch)
      return res.status(400).json({ msg: "year, semester, and branch are required", success: false });

    const semesterFormatted = semester.replace(/Sem\s*-?\s*(\d+)/i, "Sem - $1");
    const semesterRecord = await prisma.semester.findUnique({ where: { name_year: { name: semesterFormatted, year } } });
    if (!semesterRecord) return res.status(404).json({ msg: `Semester ${year} ${semesterFormatted} not found`, success: false });

    const branchRecord = await prisma.branch.findUnique({ where: { name: branch } });
    if (!branchRecord) return res.status(404).json({ msg: `Branch ${branch} not found`, success: false });

    const subjects = await prisma.subject.findMany({ where: { branchId: branchRecord.id, semesterId: semesterRecord.id } });
    if (!subjects.length) return res.status(404).json({ msg: `No subjects found`, success: false });

    const students = await prisma.student.findMany({ where: { Year: year, Branch: branch }, select: { Username: true } });
    if (!students.length) return res.status(404).json({ msg: `No students found`, success: false });

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet(`${year}-${semester}-${branch}`);
    ws.columns = [
      { header: "Username", key: "Username", width: 30 },
      { header: "SubjectName", key: "SubjectName", width: 40 },
      { header: "Grade", key: "Grade", width: 10 },
    ];

    for (const student of students) {
      for (const subject of subjects) {
        ws.addRow({ Username: student.Username, SubjectName: subject.name, Grade: "" });
      }
    }

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${year}_${semester}_${branch}_grades_template.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("POST /grades/template error:", err);
    res.status(500).json({ msg: "Failed to generate template", success: false });
  }
});
