import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import ExcelJS from "exceljs";
import prisma from "../../services/prisma.service";
import { authMiddleware } from "../../student/middlewares/middlewares";
import progressStore from "../utils/progress";
import { getOrCreateSubject } from "../utils/utils";
import { addStudent, getUsers, getStudentSuggestions } from "../../services/admin.service";
import { getStudentDetails } from "../../services/student.service";

export const studentAdminRouter = Router();

studentAdminRouter.get("/getstudents", authMiddleware, async (req, res) => {
  try {
    const filter = String(req.query.filter || "").trim();
    if (!filter) return res.status(400).json({ msg: "Filter is required", success: false });

    if (filter === "all") {
      const page = Math.max(parseInt(String(req.query.page || "1")), 1);
      const limit = Math.max(parseInt(String(req.query.limit || "5")), 1);
      const skip = (page - 1) * limit;

      const total = await prisma.student.count();
      const students = await getUsers(skip, limit);

      return res.json({
        students,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        msg: `Fetched ${students.length} students`,
        success: true,
      });
    } else if (filter === "names") {
      const students = await prisma.student.findMany({ select: { id: true, Name: true } });
      return res.json({ students, msg: `Fetched ${students.length} students`, success: true });
    } else {
      const student = await prisma.student.findUnique({
        where: { id: filter },
        select: {
          id: true, Name: true, _count: true, Address: true, grades: true, attendance: true,
          BloodGroup: true, Branch: true, createdAt: true, DateOfBirth: true, Email: true,
          FatherAddress: true, FatherEmail: true, FatherName: true, FatherOccupation: true,
        },
      });
      if (!student) return res.status(404).json({ msg: `Student with ID ${filter} not found`, success: false });
      return res.json({ student, msg: `Fetched student ${student.Name}`, success: true });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: "Error fetching students", success: false });
  }
});

studentAdminRouter.post("/searchstudent", authMiddleware, async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    if (!username) return res.status(400).json({ msg: "username required", success: false });
    const suggestions = await getStudentSuggestions(username);
    const exactStudent = await getStudentDetails(username);
    if (!suggestions.length && !exactStudent) return res.json({ success: false, msg: "No student found" });
    return res.json({ success: true, suggestions, student: exactStudent || null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: "Error fetching students", success: false });
  }
});

studentAdminRouter.get("/template", authMiddleware, async (req, res) => {
  try {
    const headers = [
      "ID NUMBER", "NAME OF THE STUDENT", "GENDER", "BRANCH", "BATCH",
      "MOBILE NUMBER", "FATHER'S NAME", "MOTHER'S NAME", "PARENT'S NUMBER",
      "BLOOD GROUP", "ADDRESS",
    ];
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Student Template");
    ws.addRow(headers);
    ws.getRow(1).font = { bold: true };
    ws.getRow(1).alignment = { horizontal: "center" };
    ws.addRow(["RGUKT1234", "John Doe", "Male", "CSE", "2023", "9876543210", "Mr. Doe", "Mrs. Doe", "9123456789", "O+", "Ongole, AP"]);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=student_template.xlsx");
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to generate template", success: false });
  }
});

studentAdminRouter.post("/updatestudents", authMiddleware, async (req, res) => {
  try {
    const studentsInput = req.body;
    if (!Array.isArray(studentsInput) || !studentsInput.length) return res.status(400).json({ msg: "Invalid input", success: false });

    const processId = uuidv4();
    progressStore.set(processId, {
      totalRecords: studentsInput.length,
      processedRecords: 0,
      failedRecords: [],
      status: "pending",
      startTime: new Date(),
    });

    (async () => {
      let processed = 0;
      const failed: { id: string; reason?: any }[] = [];
      for (const studentData of studentsInput) {
        try {
          await addStudent(studentData);
          processed++;
        } catch (err: any) {
          failed.push({ id: studentData["ID NUMBER"], reason: err?.message ?? err });
        }
        const p = progressStore.get(processId);
        if (p) {
          p.processedRecords = processed;
          p.failedRecords = failed;
        }
      }
      const p = progressStore.get(processId);
      if (p) {
        p.status = "completed";
        p.endTime = new Date();
        setTimeout(() => progressStore.delete(processId), 10 * 60 * 1000);
      }
    })();

    return res.status(202).json({
      msg: `Processing ${studentsInput.length} students`,
      processId,
      success: true,
      templateDownload: "/api/v1/admin/students/template",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Unexpected error", success: false });
  }
});
