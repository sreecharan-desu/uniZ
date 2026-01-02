import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import ExcelJS from "exceljs";
import prisma from "../../services/prisma.service";
import { authMiddleware } from "../../student/middlewares/middlewares";
import progressStore from "../utils/progress";
import { getOrCreateSubject } from "../utils/utils";
import { addStudent, getUsers, getStudentSuggestions, searchStudentsAdvanced } from "../../services/admin.service";
import { getStudentDetails } from "../../services/student.service";
import { logger } from "../../../utils/logger";
import { mapOutingToLegacy, mapOutpassToLegacy } from "../../utils/mappers";

export const studentAdminRouter = Router();

// ... existing /getstudents ...

studentAdminRouter.post("/searchstudent", authMiddleware, async (req, res) => {
  const start = Date.now();
  try {
    const { 
      username, 
      branch, 
      year, 
      gender, 
      isPending, 
      isOutside, 
      page = 1, 
      limit = 10 
    } = req.body;

    const query = String(username || "").trim();
    
    // If it's a simple suggestion search (just query, first page)
    if (query && !branch && !year && !gender && isPending === undefined && isOutside === undefined && page === 1 && limit <= 10) {
      const [suggestions, exactStudent] = await Promise.all([
        getStudentSuggestions(query),
        getStudentDetails(query)
      ]);
      return res.json({ success: true, suggestions, student: exactStudent || null });
    }

    // Advanced search with filters and pagination
    const results = await searchStudentsAdvanced({
      query,
      branch,
      year,
      gender,
      isPending,
      isOutside,
      page: Number(page),
      limit: Number(limit)
    });

    return res.json({ success: true, ...results });
  } catch (e: any) {
    logger.error(`Search Student Error: ${e.message || e}`);
    return res.status(500).json({ msg: "Error searching students", success: false });
  }
});

// New Paginated History Endpoint
studentAdminRouter.get("/:id/history", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const page = Math.max(Number(req.query.page || "1"), 1);
    const limit = Math.max(Number(req.query.limit || "10"), 1);
    const skip = (page - 1) * limit;

    const [outings, outpasses, totalOutings, totalOutpasses] = await Promise.all([
      prisma.outing.findMany({ where: { StudentId: id }, skip, take: limit, orderBy: { RequestedTime: 'desc' } }),
      prisma.outpass.findMany({ where: { StudentId: id }, skip, take: limit, orderBy: { RequestedTime: 'desc' } }),
      prisma.outing.count({ where: { StudentId: id } }),
      prisma.outpass.count({ where: { StudentId: id } })
    ]);

    return res.json({
      success: true,
      history: [
        ...outings.map(o => ({ ...mapOutingToLegacy(o), type: 'outing' })),
        ...outpasses.map(o => ({ ...mapOutpassToLegacy(o), type: 'outpass' }))
      ].sort((a: any, b: any) => new Date(b.requested_time).getTime() - new Date(a.requested_time).getTime()),
      pagination: {
        page,
        limit,
        total: totalOutings + totalOutpasses,
        totalPages: Math.ceil((totalOutings + totalOutpasses) / limit)
      }
    });
  } catch (e: any) {
    logger.error(`History Fetch Error: ${e.message || e}`);
    return res.status(500).json({ success: false, msg: "Failed to fetch history" });
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
  } catch (err: any) {
    logger.error(`Template Error: ${err.message || err}`);
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
  } catch (error: any) {
    logger.error(`Update Students Error: ${error.message || error}`);
    return res.status(500).json({ msg: "Unexpected error", success: false });
  }
});
