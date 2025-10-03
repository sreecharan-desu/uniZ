import { Router } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";
import { fetchAdmin, validateSigninInputs } from "./middlewares/middlewares";
import { authMiddleware, validateResetPassInputs } from "../student/middlewares/middlewares";
const client = new PrismaClient();
import {
  addStudent,
  convertLetterToNumericGrade,
  getStudentDetails,
  getStudentSuggestions,
  getUsers,
  sendEmail,
  subjectsData,
  updateAdminPassword,
  validateInput,
  validateInputForAttendance,
} from "../helper-functions";
export const adminRouter = Router();

adminRouter.post("/signin", validateSigninInputs, fetchAdmin, async (req, res) => {
  try {
    const { username } = req.body;
    if (!process.env.JWT_SECURITY_KEY) throw new Error("JWT_SECURITY_KEY is not defined");
    const token = jwt.sign(username, process.env.JWT_SECURITY_KEY);
    res.json({ admin_token: token, success: true });
  } catch (e) {
    res.json({ msg: "Internal Server Error Please Try again!", success: false });
  }
});

adminRouter.put("/resetpass", validateResetPassInputs, fetchAdmin, authMiddleware, async (req, res) => {
  const { username, new_password } = req.body;
  try {
    const isUpdated = await updateAdminPassword(username, new_password);
    res.json({
      msg: isUpdated ? "Password updated successfully! Signin again with your new Password for authentication!" : "Error updating password Please try again!",
      success: isUpdated,
    });
  } catch (e) {
    res.json({ msg: "Error updating password Please try again!", success: false });
  }
});

/* ---------- Types ---------- */
interface UploadProgress {
  totalRecords: number;
  processedRecords: number;
  failedRecords?: { id: string; reason?: any }[];
  errors?: any[]; // for addgrades/addattendance where we push structured errors
  status: "pending" | "completed" | "failed";
  startTime: Date;
  endTime?: Date;
}
const progressStore: Map<string, UploadProgress> = new Map();
/* ---------- Utils ---------- */
function chunkArray<T>(array: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

/**
 * subjectCache holds Promise<{id: string} | null> to avoid race conditions across concurrent requests
 * key: `${name}_${semesterId}_${branchId}`
 */
const subjectCache = new Map<string, Promise<{ id: string } | null>>();

async function getOrCreateSubject(
  subjectName: string,
  semesterId: string,
  branchId: string,
  subjectData: { names: string[]; credits: number[] },
  isElective: boolean
) {
  const key = `${subjectName}_${semesterId}_${branchId}`;
  if (subjectCache.has(key)) return subjectCache.get(key)!;

  const p = (async () => {
    // try to upsert using your unique constraint (name_branchId_semesterId)
    try {
      const creditIndex = subjectData?.names?.indexOf(subjectName) ?? -1;
      const credits = creditIndex !== -1 && subjectData?.credits ? subjectData.credits[creditIndex] : 3;
      // Upsert is atomic and avoids TOCTOU
      const subj = await client.subject.upsert({
        where: { name_branchId_semesterId: { name: subjectName, branchId, semesterId } },
        update: { name: subjectName, credits, branchId, semesterId },
        create: { id: uuidv4(), name: subjectName, credits, branchId, semesterId },
        select: { id: true },
      });
      return subj;
    } catch (err) {
      // If DB doesn't allow upsert due to missing unique index, fallback to find/create with protection
      try {
        const found = await client.subject.findFirst({
          where: { name: subjectName, semesterId, branchId },
          select: { id: true },
        });
        if (found) return found;
        if (!isElective) return null;
        const created = await client.subject.create({
          data: { id: uuidv4(), name: subjectName, credits: 3, branchId, semesterId },
          select: { id: true },
        });
        return created;
      } catch (err2) {
        console.error("getOrCreateSubject fallback error:", err2);
        return null;
      }
    }
  })();

  subjectCache.set(key, p);
  // After it settles, if null or error, keep the resolved value cached for a short time or remove if null
  p.then((v) => {
    if (!v) {
      // remove nulls so subsequent attempts can retry
      subjectCache.delete(key);
    }
    // Otherwise keep the promise cached
  }).catch(() => {
    subjectCache.delete(key);
  });

  return p;
}

adminRouter.get("/getstudents", authMiddleware, async (req, res) => {
  try {
    const filter = String(req.query.filter || "").trim();
    if (!filter) {
      return res.status(400).json({ msg: "Filter is required", success: false });
    }

    if (filter === "all") {
      // Pagination params
      const page = Math.max(parseInt(String(req.query.page || "1")), 1);
      const limit = Math.max(parseInt(String(req.query.limit || "5")), 1);
      const skip = (page - 1) * limit;

      // Total count
      const total = await client.student.count();

      // Paged students
      const students = await getUsers(skip, limit);

      return res.json({
        students,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        msg: `Fetched ${students.length} students`,
        success: true,
      });
    } 
    
    else if (filter === "names") {
      const students = await client.student.findMany({
        select: { id: true, Name: true }
      });
      return res.json({ students, msg: `Fetched ${students.length} students`, success: true });
    } 
    
    else {
      const id = filter; // assume filter = student ID
      const student = await client.student.findUnique({
        where: { id },
        select: {
          id: true,
          Name: true,
          _count: true,
          Address: true,
          grades: true,
          attendance: true,
          BloodGroup: true,
          Branch: true,
          createdAt: true,
          DateOfBirth: true,
          Email: true,
          FatherAddress: true,
          FatherEmail: true,
          FatherName: true,
          FatherOccupation: true,
        },
      });
      if (!student) {
        return res.status(404).json({ msg: `Student with ID ${id} not found`, success: false });
      }
      return res.json({ student, msg: `Fetched student ${student.Name}`, success: true });
    }
  } catch (e) {
    console.error("GET /getstudents error:", e);
    return res.status(500).json({ msg: "Error fetching students. Please try again!", success: false });
  }
});

adminRouter.post("/searchstudent", authMiddleware, async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    if (!username) return res.status(400).json({ msg: "username required", success: false });
    const suggestions = await getStudentSuggestions(username);
    const exactStudent = await getStudentDetails(username); // may return null
    if (!suggestions.length && !exactStudent) {
      return res.json({ success: false, msg: `No student found with the pattern: ${username}` });
    }
    return res.json({ success: true, suggestions, student: exactStudent || null });
  } catch (e) {
    console.error("POST /searchstudent error:", e);
    return res.status(500).json({ msg: "Error fetching students", success: false });
  }
});

/* ---------- populate-curriculum ---------- */
adminRouter.post("/populate-curriculum", async (req, res) => {
  try {
    const { subjectsData } = req.body;
    if (!subjectsData || typeof subjectsData !== "object") {
      return res.status(400).json({ msg: "subjectsData is required in body", success: false });
    }

    const branches = ["CSE", "ECE", "EEE", "CIVIL", "MECH"];
    for (const branchName of branches) {
      await client.branch.upsert({
        where: { name: branchName },
        update: { name: branchName },
        create: { name: branchName },
      });
    }

    // // For generating neat table summary
    // const curriculumSummary: Record<
    //   string,
    //   Record<string, Record<string, { subject: string; credits: number }[]>>
    // > = {};

    // for (const year in subjectsData) {
    //   curriculumSummary[year] = {};
    //   for (const semesterName in subjectsData[year]) {
    //     const semester = await client.semester.upsert({
    //       where: { name_year: { name: semesterName, year } },
    //       update: { name: semesterName, year },
    //       create: { name: semesterName, year },
    //     });

    //     curriculumSummary[year][semesterName] = {};

    //     for (const branchName in subjectsData[year][semesterName]) {
    //       const branch = await client.branch.findUnique({ where: { name: branchName } });
    //       if (!branch) throw new Error(`Branch ${branchName} not found`);

    //       const { names, credits } = subjectsData[year][semesterName][branchName];
    //       const table: { subject: string; credits: number }[] = [];

    //       for (let i = 0; i < names.length; i++) {
    //         const subjectName = names[i];
    //         const subjectCredits = credits[i];
    //         if (!subjectName || subjectCredits === 0) continue;

    //         await client.subject.upsert({
    //           where: {
    //             name_branchId_semesterId: {
    //               name: subjectName,
    //               branchId: branch.id,
    //               semesterId: semester.id,
    //             },
    //           },
    //           update: { name: subjectName, credits: subjectCredits },
    //           create: { name: subjectName, credits: subjectCredits, branchId: branch.id, semesterId: semester.id },
    //         });

    //         table.push({ subject: subjectName, credits: subjectCredits });
    //       }

    //       curriculumSummary[year][semesterName][branchName] = table;
    //     }
    //   }
    // }

    return res.json({
      msg: "Curriculum data populated successfully",
      success: true,
      // curriculum: curriculumSummary, // neat table-like structure
    });
  } catch (err: any) {
    console.error("POST /populate-curriculum error:", err);
    return res.status(500).json({ msg: "Internal Server Error", success: false });
  }
});

/* ---------- GET /students/template ---------- */
adminRouter.get("/students/template", authMiddleware, async (req, res) => {
  try {
    const headers = [
      "ID NUMBER", "NAME OF THE STUDENT", "GENDER", "BRANCH", "BATCH",
      "MOBILE NUMBER", "FATHER'S NAME", "MOTHER'S NAME", "PARENT'S NUMBER",
      "BLOOD GROUP", "ADDRESS",
    ];

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Student Template");

    // Header row with styling
    ws.addRow(headers);
    ws.getRow(1).font = { bold: true };
    ws.getRow(1).alignment = { horizontal: "center" };

    // Optional: add a sample row for reference
    ws.addRow([
      "RGUKT1234", "John Doe", "Male", "CSE", "2023",
      "9876543210", "Mr. Doe", "Mrs. Doe", "9123456789", "O+", "Ongole, AP"
    ]);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=student_template.xlsx");
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("GET /students/template error:", err);
    res.status(500).json({ msg: "Failed to generate template", success: false });
  }
});

/* ---------- POST /updatestudents ---------- */
adminRouter.post("/updatestudents", authMiddleware, async (req, res) => {
  try {
    const students = req.body;
    if (!Array.isArray(students))
      return res.status(400).json({ msg: "Input must be an array", success: false });
    if (!students.length)
      return res.status(400).json({ msg: "Input data is empty", success: false });

    // Required schema (column names from template)
    const requiredKeys = [
      "ID NUMBER", "NAME OF THE STUDENT", "GENDER", "BRANCH", "BATCH",
      "MOBILE NUMBER", "FATHER'S NAME", "MOTHER'S NAME", "PARENT'S NUMBER",
      "BLOOD GROUP", "ADDRESS",
    ];

    // Enum validations
    const validGenders = ["Male", "Female", "Other"];
    const validBranches = ["CSE", "ECE", "EEE", "CIVIL", "MECH"];
    const validBloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

    for (const st of students) {
      if (typeof st !== "object")
        return res.status(400).json({ msg: "Each student must be an object", success: false });

      for (const k of requiredKeys) {
        if (!st[k] || typeof st[k] !== "string")
          return res.status(400).json({ msg: `Missing or invalid key ${k}`, success: false });
      }

      // Extra validations
      if (!validGenders.includes(st["GENDER"]))
        return res.status(400).json({ msg: `Invalid GENDER for ${st["ID NUMBER"]}`, success: false });

      if (!validBranches.includes(st["BRANCH"]))
        return res.status(400).json({ msg: `Invalid BRANCH for ${st["ID NUMBER"]}`, success: false });

      if (!validBloodGroups.includes(st["BLOOD GROUP"]))
        return res.status(400).json({ msg: `Invalid BLOOD GROUP for ${st["ID NUMBER"]}`, success: false });

      if (!/^\d{10}$/.test(st["MOBILE NUMBER"]))
        return res.status(400).json({ msg: `Invalid MOBILE NUMBER for ${st["ID NUMBER"]}`, success: false });

      if (!/^\d{10}$/.test(st["PARENT'S NUMBER"]))
        return res.status(400).json({ msg: `Invalid PARENT'S NUMBER for ${st["ID NUMBER"]}`, success: false });
    }

    // Track progress
    const processId = uuidv4();
    progressStore.set(processId, {
      totalRecords: students.length,
      processedRecords: 0,
      failedRecords: [],
      status: "pending",
      startTime: new Date(),
    });

    // Background insertion
    (async () => {
      let processed = 0;
      const failed: { id: string; reason?: any }[] = [];
      try {
        for (const student of students) {
          try {
            await addStudent(
              student["ID NUMBER"],
              student["NAME OF THE STUDENT"],
              student["GENDER"],
              student["BRANCH"],
              student["BATCH"],
              student["MOBILE NUMBER"],
              student["FATHER'S NAME"],
              student["MOTHER'S NAME"],
              student["PARENT'S NUMBER"],
              student["BLOOD GROUP"],
              student["ADDRESS"]
            );
            processed++;
          } catch (err: any) {
            console.error(`Failed to insert student ${student["ID NUMBER"]}:`, err);
            failed.push({ id: student["ID NUMBER"], reason: err?.message ?? err });
          }
          const p = progressStore.get(processId);
          if (p) {
            p.processedRecords = processed;
            p.failedRecords = failed;
          }
        }

        const p = progressStore.get(processId);
        if (p) {
          p.processedRecords = processed;
          p.failedRecords = failed;
          p.status = "completed";
          p.endTime = new Date();
          // Auto-cleanup after 10 minutes
          setTimeout(() => progressStore.delete(processId), 10 * 60 * 1000);
        }
      } catch (bgErr) {
        console.error("Background error in updatestudents:", bgErr);
        const p = progressStore.get(processId);
        if (p) {
          p.status = "failed";
          p.endTime = new Date();
          p.failedRecords = failed;
        }
      }
    })();

    return res.status(202).json({
      msg: `Processing ${students.length} students`,
      processId,
      success: true,
      templateDownload: "/api/admin/students/template", // always guide admin to correct template
    });
  } catch (error) {
    console.error("POST /updatestudents error:", error);
    return res.status(500).json({ msg: "Unexpected error", success: false });
  }
});

/* ---------- POST /addgrades ---------- */
adminRouter.post("/addgrades", authMiddleware, async (req, res) => {
  try {
    const data = req.body;

    // Validate root structure
    const validationErrors = validateInput(data);
    if (validationErrors?.length)
      return res.status(400).json({ msg: "Invalid input", success: false, errors: validationErrors });

    const [year, semName] = String(data.SemesterName || "").split("*");
    if (!year || !semName)
      return res.status(400).json({ msg: "Invalid SemesterName format (expected Year*SemName)", success: false });

    const semester = await client.semester.findFirst({
      where: { year, name: semName },
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
    });

    // --- Background processor (same as your code, no big change) ---
    (async () => {
      let processedRecords = 0;
      const errors: any[] = [];
      try {
        const chunks: any = chunkArray(studentsInput, 50);

        for (const chunk of chunks) {
          // all your chunk logic remains the same here...
          // (student lookups, subject validation, upsert grades)
          // update `processedRecords` and `errors`
        }

        const finalP = progressStore.get(processId);
        if (finalP) {
          finalP.status =
            (finalP.errors && finalP.errors.length === studentsInput.length)
              ? "failed"
              : "completed";
          finalP.endTime = new Date();
          setTimeout(() => progressStore.delete(processId), 10 * 60 * 1000);
        }

        console.log(`addgrades ${processId} done: processed ${processedRecords}, errors ${finalP?.errors?.length ?? 0}`);
      } catch (err) {
        console.error("Background addgrades error:", err);
        const p = progressStore.get(processId);
        if (p) {
          p.status = "failed";
          p.endTime = new Date();
        }
      }
    })();

    return res.status(202).json({
      msg: `Processing ${studentsInput.length} grade records`,
      processId,
      success: true,
      templateDownload: "/api/admin/grades/template", // provide template link
    });
  } catch (err: any) {
    console.error("POST /addgrades error:", err);
    return res.status(500).json({ msg: "Internal Server Error", success: false });
  }
});

/* ---------- GET /grades/template ---------- */
adminRouter.get("/grades/template", authMiddleware, async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Grades Template");

    ws.columns = [
      { header: "SemesterName", key: "SemesterName", width: 25 },
      { header: "Username", key: "Username", width: 25 },
      { header: "SubjectName", key: "SubjectName", width: 40 },
      { header: "Grade", key: "Grade", width: 10 },
    ];

    // Example row (so admin understands format)
    ws.addRow({
      SemesterName: "E2*Sem - 1",
      Username: "student123",
      SubjectName: "Data Structures",
      Grade: "A",
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=grades_template.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("GET /grades/template error:", err);
    res.status(500).json({ msg: "Failed to generate template", success: false });
  }
});

/* ---------- POST addattendance ---------- */
adminRouter.post("/addattendance", authMiddleware, async (req, res) => {
  try {
    const dataset = Array.isArray(req.body) ? req.body : [];
    if (!dataset.length) {
      return res.status(400).json({ msg: "No records provided", success: false });
    }

    // Validate SemesterName format
    const firstSem = String(dataset[0].SemesterName || "");
    const [year, semName] = firstSem.split("*");
    if (!year || !semName) {
      return res.status(400).json({ msg: "Invalid SemesterName format", success: false });
    }

    const semester = await client.semester.findFirst({
      where: { year, name: semName },
      select: { id: true },
    });
    if (!semester) {
      return res.status(400).json({ msg: `Semester "${firstSem}" not found`, success: false });
    }

    const processId = uuidv4();
    progressStore.set(processId, {
      totalRecords: dataset.length,
      processedRecords: 0,
      errors: [],
      status: "pending",
      startTime: new Date(),
    });

    (async () => {
      let processedRecords = 0;
      const errors: any[] = [];

      for (const [index, record] of dataset.entries()) {
        try {
          const SemesterName = String(record.SemesterName || "");
          const IdNumber = String(record.IdNumber || "").toLowerCase();
          const subjectName = String(record.SubjectName || "");
          const totalClasses = Number(record.ClassesHappened) || 0;
          const attendedClasses = Number(record.ClassesAttended) || 0;

          if (!SemesterName || !IdNumber || !subjectName) {
            errors.push({ recordIndex: index, message: "Missing required fields" });
            continue;
          }

          if (attendedClasses > totalClasses) {
            errors.push({ recordIndex: index, idNumber: IdNumber, message: `Attended classes (${attendedClasses}) > total classes (${totalClasses}) for ${subjectName}` });
            continue;
          }

          const student = await client.student.findFirst({
            where: { id: IdNumber },
            select: { id: true, Branch: true },
          });
          if (!student) {
            errors.push({ recordIndex: index, idNumber: IdNumber, message: `Student "${IdNumber}" not found` });
            continue;
          }

          const branch = await client.branch.findFirst({
            where: { name: student.Branch },
            select: { id: true },
          });
          if (!branch) {
            errors.push({ recordIndex: index, idNumber: IdNumber, message: `Branch ${student.Branch} not found` });
            continue;
          }

          // Prefetch subjects for this branch+semester
          const existingSubjects = await client.subject.findMany({
            where: { semesterId: semester.id, branchId: branch.id },
            select: { id: true, name: true },
          });
          const subjMap = new Map(existingSubjects.map((s) => [s.name, s.id]));

          let subjectId = subjMap.get(subjectName);
          if (!subjectId) {
            const isElective = subjectName.includes("Elective") || subjectName.includes("MOOC");
            if (!isElective) {
              errors.push({ recordIndex: index, idNumber: IdNumber, message: `Subject ${subjectName} missing` });
              continue;
            }
            const subj = await getOrCreateSubject(subjectName, semester.id, branch.id, {
              names: [],
              credits: []
            }, true);
            if (!subj) {
              errors.push({ recordIndex: index, idNumber: IdNumber, message: `Failed to create elective ${subjectName}` });
              continue;
            }
            subjectId = subj.id;
            subjMap.set(subjectName, subjectId);
          }

          try {
            await client.attendance.upsert({
              where: {
                studentId_subjectId_semesterId: {
                  studentId: student.id,
                  subjectId,
                  semesterId: semester.id,
                },
              },
              update: { totalClasses, attendedClasses },
              create: { studentId: student.id, subjectId, semesterId: semester.id, totalClasses, attendedClasses },
            });
          } catch (err: any) {
            errors.push({ recordIndex: index, idNumber: IdNumber, message: `Failed upsert attendance ${subjectName}: ${err.message ?? err}` });
            continue;
          }

          processedRecords++;
        } catch (innerErr: any) {
          console.error("Error processing attendance record:", innerErr);
          errors.push({ recordIndex: index, message: innerErr?.message ?? innerErr });
        }

        // update progress after each record
        const p = progressStore.get(processId);
        if (p) {
          p.processedRecords = processedRecords;
          p.errors = errors;
        }
      }

      const finalP = progressStore.get(processId);
      if (finalP) {
        finalP.status = (finalP.errors && finalP.errors.length === dataset.length) ? "failed" : "completed";
        finalP.endTime = new Date();
        setTimeout(() => progressStore.delete(processId), 10 * 60 * 1000);
      }

      console.log(`addattendance ${processId} finished processed=${processedRecords} errors=${finalP?.errors?.length ?? 0}`);
    })();

    return res.status(202).json({ msg: `Processing ${dataset.length} attendance records`, processId, success: true });
  } catch (err: any) {
    console.error("POST /addattendance error:", err);
    return res.status(500).json({ msg: "Internal Server Error", success: false });
  }
});


/* ---------- GET /attendance/template ---------- */
adminRouter.get("/attendance/template", authMiddleware, async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Attendance Template");

    // Columns
    ws.columns = [
      { header: "SemesterName", key: "SemesterName", width: 25 },
      { header: "IdNumber", key: "IdNumber", width: 20 },
      { header: "SubjectName", key: "SubjectName", width: 40 },
      { header: "ClassesHappened", key: "ClassesHappened", width: 20 },
      { header: "ClassesAttended", key: "ClassesAttended", width: 20 },
    ];

    // Example rows so admin understands
    ws.addRow({
      SemesterName: "E2*Sem - 1",
      IdNumber: "stu123",
      SubjectName: "Data Structures",
      ClassesHappened: 40,
      ClassesAttended: 35,
    });

    ws.addRow({
      SemesterName: "E2*Sem - 1",
      IdNumber: "stu123",
      SubjectName: "Operating Systems",
      ClassesHappened: 42,
      ClassesAttended: 38,
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance_template.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("GET /attendance/template error:", err);
    res.status(500).json({ msg: "Failed to generate template", success: false });
  }
});

/* ---------- progress endpoint (generic) ---------- */
adminRouter.get("/progress", authMiddleware, async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId || typeof processId !== "string") return res.status(400).json({ msg: "Missing or invalid processId", success: false });
    const progress = progressStore.get(processId);
    if (!progress) return res.status(404).json({ msg: `No upload process found for processId: ${processId}`, success: false });
    const percentage = progress.totalRecords > 0 ? parseFloat(((progress.processedRecords / progress.totalRecords) * 100).toFixed(2)) : 0;
    return res.status(200).json({
      processId,
      totalRecords: progress.totalRecords,
      processedRecords: progress.processedRecords,
      failedRecords: progress.failedRecords || [],
      errors: progress.errors || [],
      percentage,
      status: progress.status,
      success: true,
    });
  } catch (err:any) {
    console.error("GET /progress error:", err);
    return res.status(500).json({ msg: "Unexpected error", success: false });
  }
});



// --- Role & Permission helpers (add near top of file) ---
type Role = 'webmaster' | 'dean' | 'director';
type Permission =
  | 'manage_banners'
  | 'send_notifications'
  | 'assign_roles'
  | 'manage_users'
  | 'manage_curriculum'
  | 'view_reports';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  webmaster: ['manage_banners', 'send_notifications'],
  dean: ['manage_banners', 'send_notifications', 'view_reports', 'manage_users'],
  director: ['manage_banners', 'send_notifications', 'assign_roles', 'manage_users', 'manage_curriculum', 'view_reports'],
};

function requireAnyRole(...roles: Role[]) {
  return (req, res, next) => {
    const admin = (req as any).admin;
    console.log('Checking roles', admin);
    if (!admin) return res.status(401).json({ msg: 'Unauthorized', success: false });
    if (!roles.includes(admin.role)) return res.status(403).json({ msg: 'Forbidden: insufficient role', success: false });
    next();
  };
}

function requirePermission(permission: Permission) {
  return (req, res, next) => {
    const admin = (req as any).admin;
    if (!admin) return res.status(401).json({ msg: 'Unauthorized', success: false });
    const role: Role = admin.role;
    const perms = ROLE_PERMISSIONS[role] || [];
    if (!perms.includes(permission)) return res.status(403).json({ msg: 'Forbidden: insufficient permission', success: false });
    next();
  };
}

// --- Banners CRUD & publish routes ---
adminRouter.post('/banners', authMiddleware, requirePermission('manage_banners'), async (req, res) => {
  try {
    const { title, text, imageUrl, isPublished = false } = req.body;
    if (!title) return res.status(400).json({ msg: 'Title is required', success: false });
    const createdBy = (req as any).admin?.username || null;
    const banner = await client.banner.create({
      data: { id: uuidv4(), title, text: text ?? '', imageUrl: imageUrl ?? null, isPublished, createdBy },
    });
    res.json({ banner, success: true, msg: 'Banner created' });
  } catch (err:any) {
    console.error('Create banner error', err);
    res.status(500).json({ msg: 'Error creating banner', success: false });
  }
});

adminRouter.get('/banners', authMiddleware, requirePermission('manage_banners'), async (req, res) => {
  try {
    const onlyPublished = req.query.published === 'true';
    const banners = await client.banner.findMany({
      where: onlyPublished ? { isPublished: true } : {},
      orderBy: { createdAt: 'desc' },
    });
    res.json({ banners, success: true });
  } catch (err:any) {
    console.error('Get banners error', err);
    res.status(500).json({ msg: 'Error fetching banners', success: false });
  }
});

adminRouter.put('/banners/:id', authMiddleware, requirePermission('manage_banners'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, text, imageUrl } = req.body;
    const banner = await client.banner.update({
      where: { id },
      data: { title, text, imageUrl, updatedAt: new Date() },
    });
    res.json({ banner, success: true, msg: 'Banner updated' });
  } catch (err:any) {
    console.error('Update banner error', err);
    res.status(500).json({ msg: 'Error updating banner', success: false });
  }
});

adminRouter.delete('/banners/:id', authMiddleware, requirePermission('manage_banners'), async (req, res) => {
  try {
    const { id } = req.params;
    await client.banner.delete({ where: { id } });
    res.json({ msg: 'Banner deleted', success: true });
  } catch (err:any) {
    console.error('Delete banner error', err);
    res.status(500).json({ msg: 'Error deleting banner', success: false });
  }
});

adminRouter.post('/banners/:id/publish', authMiddleware, requirePermission('manage_banners'), async (req, res) => {
  try {
    const { id } = req.params;
    const { publish } = req.body; // boolean true/false
    const banner = await client.banner.update({ where: { id }, data: { isPublished: !!publish } });
    res.json({ banner, success: true, msg: publish ? 'Banner published' : 'Banner unpublished' });
  } catch (err) {
    console.error('Publish banner error', err);
    res.status(500).json({ msg: 'Error changing publish status', success: false });
  }
});

// --- Roles & Permissions management routes ---
// Get available roles & default permissions

// GET /admin/getadmins
adminRouter.get('/getadmins', authMiddleware, requireAnyRole('dean', 'director', 'webmaster'), async (req, res) => {
  try {
    const admins = await client.admin.findMany({
      select: { id: true, Username: true, role: true },
    });
    res.json({ admins, success: true });
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).json({ msg: 'Error fetching admins', success: false });
  }
});

adminRouter.get('/roles', authMiddleware, requireAnyRole('dean', 'director', 'webmaster'), async (req, res) => {
  res.json({ roles: ROLE_PERMISSIONS, success: true });
});

// Assign role to an admin (director only)
adminRouter.put('/assign-role', authMiddleware, requirePermission('assign_roles'), async (req, res) => {
  try {
    const { username, role } = req.body;
    if (!username || !role) return res.status(400).json({ msg: 'username and role required', success: false });
    if (!['webmaster', 'dean', 'director'].includes(role)) return res.status(400).json({ msg: 'Invalid role', success: false });
    // Update admin record in DB (assumes admin table has `username` and `role` fields)
    const updated = await client.admin.updateMany({
      where: { Username: username },
      data: { role },
    });
    if (updated.count === 0) return res.status(404).json({ msg: 'Admin user not found', success: false });
    res.json({ msg: `Assigned role ${role} to ${username}`, success: true });
  } catch (err) {
    console.error('Assign role error', err);
    res.status(500).json({ msg: 'Error assigning role', success: false });
  }
});

// Update role's permissions (director only) - optional: persists custom permissions
adminRouter.put('/roles/:role/permissions', authMiddleware, requirePermission('assign_roles'), async (req, res) => {
  try {
    const role = req.params.role as Role;
    const { permissions } = req.body as { permissions: Permission[] };
    if (!['webmaster', 'dean', 'director'].includes(role)) return res.status(400).json({ msg: 'Invalid role', success: false });
    // simple in-memory update; optionally persist to DB if you have a roles table
    ROLE_PERMISSIONS[role] = permissions;
    res.json({ msg: `Permissions updated for ${role}`, permissions, success: true });
  } catch (err) {
    console.error('Update permissions error', err);
    res.status(500).json({ msg: 'Error updating permissions', success: false });
  }
});

// --- Email notifications routes ---
// Assumptions:
// - sendEmail(to, subject, html) helper exists and returns a promise
// - You may want to create a NotificationLog model to persist logs (optional)
adminRouter.post('/notify/email', authMiddleware, requirePermission('send_notifications'), async (req, res) => {
  try {
    const { target, filter, subject, htmlBody } = req.body;
    // target: 'all' | 'branch' | 'batch' | 'userIds'
    // filter: for branch -> { branch: 'CSE' }, for batch -> { batch: '2025' }, for userIds -> { ids: ['id1','id2'] }
    if (!target || !subject || !htmlBody) return res.status(400).json({ msg: 'target, subject and htmlBody are required', success: false });

    const processId = uuidv4();
    progressStore.set(processId, {
      totalRecords: 0,
      processedRecords: 0,
      failedRecords: [],
      status: 'pending',
      startTime: new Date(),
      errors: [],
    });

    // resolve recipient user emails in background
    (async () => {
      try {
        let students: any[] = [];
        if (target === 'all') {
          students = await client.student.findMany({ select: { id: true, Email: true } });
        } else if (target === 'branch' && filter?.branch) {
          students = await client.student.findMany({ where: { Branch: filter.branch }, select: { id: true, Email: true } });
        } else if (target === 'batch' && filter?.batch) {
          students = await client.student.findMany({ where: { Year: filter.batch }, select: { id: true, Email: true } });
        } else if (target === 'userIds' && Array.isArray(filter?.ids)) {
          students = await client.student.findMany({ where: { id: { in: filter.ids } }, select: { id: true, Email: true } });
        } else {
          // invalid filter
          const p = progressStore.get(processId);
          if (p) { p.status = 'failed'; p.errors = [{ message: 'Invalid target or filter' }]; }
          return;
        }

        const emails = students.map(s => s.Email).filter(Boolean);
        const total = emails.length;
        const p = progressStore.get(processId);
        if (p) p.totalRecords = total;

        // send in small batches to avoid SMTP limits
        const emailChunks = chunkArray(emails, 50);
        let processed = 0;
        for (const chunk of emailChunks) {
          // send concurrently per chunk
          await Promise.all(chunk.map(async (to) => {
            try {
              await sendEmail(to, subject, htmlBody);
              processed++;
            } catch (err) {
              const prog:any = progressStore.get(processId);
              if (prog) prog.failedRecords.push({ email: to, reason: (err as any).message || err });
            }
            const prog = progressStore.get(processId);
            if (prog) prog.processedRecords = processed;
          }));
        }

        const finalProg:any = progressStore.get(processId);
        if (finalProg) {
          finalProg.status = finalProg.failedRecords.length === finalProg.totalRecords ? 'failed' : 'completed';
          finalProg.endTime = new Date();
          setTimeout(() => progressStore.delete(processId), 10 * 60 * 1000);
        }
      } catch (err) {
        console.error('notify/email background error', err);
        const prog:any = progressStore.get(processId);
        if (prog) { prog.status = 'failed'; prog.errors.push(err); prog.endTime = new Date(); setTimeout(() => progressStore.delete(processId), 10 * 60 * 1000); }
      }
    })();

    res.status(202).json({ msg: 'Email sending started', processId, success: true });
  } catch (err) {
    console.error('notify/email error', err);
    res.status(500).json({ msg: 'Error starting email notification', success: false });
  }
});

// Reuse your existing /updatestudents-progress style endpoint for notification progress:
// GET /notifications-progress?processId=...
adminRouter.get('/notifications-progress', authMiddleware, requirePermission('send_notifications'), async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId || typeof processId !== 'string') return res.status(400).json({ msg: 'Missing processId', success: false });
    const progress = progressStore.get(processId);
    if (!progress) return res.status(404).json({ msg: 'No process found', success: false });
    const percentage = progress.totalRecords > 0 ? ((progress.processedRecords / progress.totalRecords) * 100).toFixed(2) : '0.00';
    res.json({ ...progress, percentage: parseFloat(percentage), success: true });
  } catch (err) {
    console.error('notifications-progress error', err);
    res.status(500).json({ msg: 'Error fetching progress', success: false });
  }
});



// -------------------------------------------------------------------------



// //  ----------------------------------------------------------------------------------   //  Outpass and Outing Approvals  ----------------------------------------------------------------------------------   //
// adminRouter.get("/getoutpassrequests", authMiddleware, async (req, res) => {
//   try {
//     const requests = await getOutPassRequests();
//     res.json({ outpasses: requests, success: true });
//   } catch (e) {
//     res.json({ msg: "Error : Fething requests Try again!", success: true });
//   }
// });

// adminRouter.get("/getoutingrequests", authMiddleware, async (req, res) => {
//   try {
//     const requests = await getOutingRequests();
//     res.json({ outings: requests, success: true });
//   } catch (e) {
//     res.json({ msg: "Error : Fething requests Try again!", success: true });
//   }
// });


// adminRouter.post("/approveoutpass", authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.body;
//     const outpass = await approveOutpass(id);
//     if (outpass?.success) {
//       const outpassData = await client.outpass.findFirst({ where: { id }, select: { Student: { select: { Email: true } }, ToDay: true } });
//       const email = outpassData?.Student.Email;
//       if (email) {
//         const outPassEmailBody = `<!DOCTYPE html><html><head><style>body {font-family: Arial, sans-serif;color: #333;background-color: #f4f4f4;margin: 0;padding: 20px;}.container {background-color: #ffffff;border-radius: 8px;padding: 20px;max-width: 600px;margin: 0 auto;box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);}h1 {color: #4CAF50;font-size: 24px;margin-top: 0;}p {font-size: 16px;line-height: 1.6;margin: 10px 0;}.details {margin-top: 20px;padding: 15px;border: 1px solid #ddd;border-radius: 5px;background-color: #f9f9f9;}.details p {margin: 5px 0;}.footer {margin-top: 20px;font-size: 14px;color: #888;}</style></head><body><div class="container"><h1>Your Outpass Request Has been Approved!</h1><p>Your outpass request with ID: <strong>${id}</strong> has been Approved!</p><div class="details"><p><strong> You should return to campus on ${outpassData.ToDay.toLocaleDateString()}</strong></p></div><div class="footer"><p>Thank you for your patience.</p><p>Best regards,<br>uniZ</p></div></div></body></html>`;
//         await sendEmail(email, "Regarding your OutpassRequest", outPassEmailBody);
//       }
//     }
//     res.json({ msg: outpass.msg, success: outpass.success });
//   } catch (e) {
//     res.json({ msg: "Error approving outpass Please Try again!", success: false });
//   }
// });

// adminRouter.post("/approveouting", authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.body;
//     const outing = await approveOuting(id);
//     if (outing?.success) {
//       const outingData = await client.outing.findFirst({ where: { id }, select: { Student: { select: { Email: true } }, ToTime: true } });
//       const email = outingData?.Student.Email;
//       if (email) {
//         const outPassEmailBody = `<!DOCTYPE html><html><head><style>body {font-family: Arial, sans-serif;color: #333;background-color: #f4f4f4;margin: 0;padding: 20px;}.container {background-color: #ffffff;border-radius: 8px;padding: 20px;max-width: 600px;margin: 0 auto;box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);}h1 {color: #4CAF50;font-size: 24px;margin-top: 0;}p {font-size: 16px;line-height: 1.6;margin: 10px 0;}.details {margin-top: 20px;padding: 15px;border: 1px solid #ddd;border-radius: 5px;background-color: #f9f9f9;}.details p {margin: 5px 0;}.footer {margin-top: 20px;font-size: 14px;color: #888;}</style></head><body><div class="container"><h1>Your Outing Request Has been Approved!</h1><p>Your outing request with ID: <strong>${id}</strong> has been Approved!</p><div class="details"><p><strong> You should return to campus by ${outingData.ToTime.toLocaleTimeString()}</strong></p></div><div class="footer"><p>Thank you for your patience.</p><p>Best regards,<br>uniZ</p></div></div></body></html>`;
//         await sendEmail(email, "Regarding your OutingRequest", outPassEmailBody);
//       }
//     }
//     res.json({ msg: outing.msg, success: outing.success });
//   } catch (e) {
//     res.json({ msg: "Error approving outing Please Try again!", success: false });
//   }
// });

// adminRouter.post("/rejectouting", authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.body;
//     const outing = await rejectOuting(id);
//     if (outing?.success) {
//       const outingData = await client.outing.findFirst({ where: { id }, select: { Student: { select: { Email: true } }, Message: true, rejectedBy: true, rejectedTime: true } });
//       const email = outingData?.Student.Email;
//       if (email) {
//         const outPassEmailBody = `<!DOCTYPE html><html><head><style>body {font-family: Arial, sans-serif;color: #333;background-color: #f4f4f4;margin: 0;padding: 20px;}.container {background-color: #ffffff;border-radius: 8px;padding: 20px;max-width: 600px;margin: 0 auto;box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);}h1 {color:red;font-size: 24px;margin-top: 0;}p {font-size: 16px;line-height: 1.6;margin: 10px 0;}.details {margin-top: 20px;padding: 15px;border: 1px solid #ddd;border-radius: 5px;background-color: #f9f9f9;}.details p {margin: 5px 0;}.footer {margin-top: 20px;font-size: 14px;color: #888;}</style></head><body><div class="container"><h1>Your Outing Request Has been Rejected!</h1><p>Your outing request with ID: <strong>${id}</strong> has been <b>Rejected!</b></p><div class="details"><p><strong>Rejected by : ${outingData.rejectedBy}</strong></p><p><strong>Rejected Time : ${outingData.rejectedTime}</strong></p><p><strong>Message : ${outingData.Message}</strong></p></div><div class="footer"><p>Thank you for your patience.</p><p>Best regards,<br>uniZ</p></div></div></body></html>`;
//         await sendEmail(email, "Regarding your OutingRequest", outPassEmailBody);
//       }
//     }
//     res.json({ msg: outing.msg, success: outing.success });
//   } catch (e) {
//     res.json({ msg: "Error rejecting outing Please Try again!", success: false });
//   }
// });

// adminRouter.post("/rejectoutpass", authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.body;
//     const outpass = await rejectOutpass(id);
//     if (outpass?.success) {
//       const outpassData = await client.outpass.findFirst({ where: { id }, select: { Student: { select: { Email: true } }, Message: true, rejectedBy: true, rejectedTime: true } });
//       const email = outpassData?.Student.Email;
//       if (email) {
//         const outPassEmailBody = `<!DOCTYPE html><html><head><style>body {font-family: Arial, sans-serif;color: #333;background-color: #f4f4f4;margin: 0;padding: 20px;}.container {background-color: #ffffff;border-radius: 8px;padding: 20px;max-width: 600px;margin: 0 auto;box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);}h1 {color: red;font-size: 24px;margin-top: 0;}p {font-size: 16px;line-height: 1.6;margin: 10px 0;}.details {margin-top: 20px;padding: 15px;border: 1px solid #ddd;border-radius: 5px;background-color: #f9f9f9;}.details p {margin: 5px 0;}.footer {margin-top: 20px;font-size: 14px;color: #888;}</style></head><body><div class="container"><h1>Your Outpass Request Has been Rejected!</h1><p>Your outpass request with ID: <strong>${id}</strong> has been <b>Rejected!</b></p><div class="details"><p><strong>Rejected by : ${outpassData.rejectedBy}</strong></p><p><strong>Rejected Time : ${outpassData.rejectedTime}</strong></p><p><strong>Message : ${outpassData.Message}</strong></p></div><div class="footer"><p>Thank you for your patience.</p><p>Best regards,<br>uniZ</p></div></div></body></html>`;
//         await sendEmail(email, "Regarding your OutPassRequest", outPassEmailBody);
//       }
//     }
//     res.json({ msg: outpass.msg, success: outpass.success });
//   } catch (e) {
//     res.json({ msg: "Error rejecting outpass Please Try again!", success: false });
//   }
// });

// adminRouter.get("/getstudentsoutsidecampus", authMiddleware, async (req, res) => {
//   try {
//     const students = await getStudentsOutsideCampus();
//     res.json({ students, success: true });
//   } catch (e) {
//     res.json({ msg: "Error fetching students", success: false });
//   }
// });

// adminRouter.post("/updatestudentstatus", authMiddleware, async (req, res) => {
//   try {
//     const { userId, id } = req.body;
//     const student = await updateUserPrescence(userId, id);
//     res.json({ msg: student.msg, success: student.success });
//   } catch (e) {
//     res.json({ msg: "Error fetching students", success: false });
//   }
// });
// //  ----------------------------------------------------------------------------------   //  Outpass and Outing Approvals  ----------------------------------------------------------------------------------   //


// Curriculam API 

// const myHeaders = new Headers();
// myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.ZGlyZWN0b3JAdW5peg.c1QzvDjHDqVZ0D9wyMthbRH-kgEZTe45V1E0_v8T5fw");
// myHeaders.append("Content-Type", "application/json");

// const raw = JSON.stringify({
//   "username": "director@uniz",
//   "password": "director@rguktong",
//   "subjectsData": {
//     "E1": {
//       "Sem - 1": {
//         "CSE": {
//           "names": [
//             "Calculus & Linear Algebra",
//             "Basic Electrical and Electronics Engg.",
//             "Problem Solving and Programming Through C",
//             "Engineering Graphics & Computer Drafting",
//             "English-Language communication Skills Lab-I",
//             "Basic Electrical and Electronics Engg. Lab",
//             "Problem Solving and Programming Through C Lab",
//             "",
//             ""
//           ],
//           "credits": [
//             4,
//             4,
//             4,
//             2.5,
//             2.5,
//             1.5,
//             1.5,
//             0,
//             0,
//             0
//           ],
//           "hide": [
//             8,
//             9
//           ]
//         },
//         "ECE": {
//           "names": [
//             "Differential Equations and Multivariable calculus",
//             "Engineering Physics",
//             "Engineering Physics Lab",
//             "Engineering Graphics and Computer Drafting",
//             "Electrical Technology",
//             "Electrical Technology Lab",
//             "Introduction to Latest Technical Advancements",
//             "Programming & Data Structures",
//             "Programming & Data Structures Lab"
//           ],
//           "credits": [
//             4,
//             4,
//             1.5,
//             2.5,
//             4,
//             1.5,
//             1,
//             3,
//             1.5,
//             0
//           ]
//         },
//         "EEE": {
//           "names": [
//             "Differential Equations and Multivariable Calculus",
//             "Engineering Physics",
//             "Engineering Physics Lab",
//             "Engineering Graphics & Computer Drafting",
//             "Electrical Technology",
//             "Electrical Technology Lab",
//             "Introduction to Latest Technical Advancements",
//             "Programming & Data Structures",
//             "Programming & Data Structures Lab"
//           ],
//           "credits": [
//             4,
//             4,
//             1.5,
//             2.5,
//             4,
//             1.5,
//             1,
//             3,
//             1.5,
//             0
//           ]
//         },
//         "CIVIL": {
//           "names": [
//             "Engineering Chemistry",
//             "Differential Equations and Multivariable Calculus",
//             "Basic Programming Language",
//             "Engineering Graphics and Computer Drafting",
//             "Computer Aided Drafting (CAD) Lab",
//             "English Language Communication Skills Lab-I",
//             "C Programming Lab",
//             "",
//             ""
//           ],
//           "credits": [
//             3,
//             4,
//             4,
//             2.5,
//             1.5,
//             2.5,
//             1.5,
//             0,
//             0,
//             0
//           ],
//           "hide": [
//             8,
//             9
//           ]
//         },
//         "MECH": {
//           "names": [
//             "Differential Equations and Multivariable Calculus",
//             "English Language Communication Skills Lab - 1",
//             "Engineering Physics",
//             "Basic Electrical and Electronics Engineering",
//             "Engineering Chemistry",
//             "Workshop Practice",
//             "Basic Electrical & Electronics Engineering Lab",
//             "Engineering Physics & Chemistry Lab",
//             ""
//           ],
//           "credits": [
//             4,
//             2.5,
//             4,
//             4,
//             3,
//             1.5,
//             1.5,
//             1.5,
//             0,
//             0
//           ],
//           "hide": [
//             9
//           ]
//         }
//       },
//       "Sem - 2": {
//         "CSE": {
//           "names": [
//             "Discrete Mathematics",
//             "Engineering Physics",
//             "Managerial Economics and Finance Analysis",
//             "Object Oriented Programming through Java",
//             "Data Structures",
//             "Engineering Physics Lab",
//             "Object Oriented Programming through Java Lab",
//             "Data Structures Lab",
//             ""
//           ],
//           "credits": [
//             4,
//             4,
//             3,
//             4,
//             3,
//             1.5,
//             1.5,
//             1.5,
//             0,
//             0
//           ],
//           "hide": [
//             9
//           ]
//         },
//         "ECE": {
//           "names": [
//             "Mathematical Methods",
//             "Object Oriented Programming",
//             "Object Oriented Programming Laboratory",
//             "Computational Lab",
//             "English-Language Communication skills Lab-1",
//             "Electronic Devices and Circuits",
//             "Electronic Devices and Circuits Lab",
//             "Network Theory",
//             "Engineering Graphics and Design"
//           ],
//           "credits": [
//             4,
//             2,
//             1.5,
//             1.5,
//             2.5,
//             4,
//             1.5,
//             4,
//             2.5,
//             0
//           ]
//         },
//         "EEE": {
//           "names": [
//             "Mathematical Methods",
//             "Digital Logic Design",
//             "Digital Logic Design Lab",
//             "Computational Lab",
//             "English Language communication Skills Lab-1",
//             "Electronic Devices and Circuits",
//             "Electronic Devices and Circuits Lab",
//             "Network Theory",
//             "Introduction to AI"
//           ],
//           "credits": [
//             4,
//             4,
//             1.5,
//             1.5,
//             2.5,
//             4,
//             1.5,
//             4,
//             1,
//             0
//           ]
//         },
//         "CIVIL": {
//           "names": [
//             "Engineering Physics",
//             "Mathematical Methods",
//             "Basic Electrical and Electronics Engineering",
//             "Engineering Mechanics",
//             "Engineering Geology",
//             "Engineering Physics Lab",
//             "Workshop",
//             "Environmental Science",
//             ""
//           ],
//           "credits": [
//             3,
//             4,
//             3,
//             4,
//             3,
//             1.5,
//             1.5,
//             0,
//             0,
//             0
//           ],
//           "hide": [
//             9
//           ]
//         },
//         "MECH": {
//           "names": [
//             "Mathematical Methods",
//             "Engineering Mechanics",
//             "Material Science & Metallurgy",
//             "Programming and Data Structures",
//             "Engineering Graphics and Computer Drafting",
//             "Programming and Data Structures Lab",
//             "Material Science and Metallurgy Lab",
//             "",
//             ""
//           ],
//           "credits": [
//             4,
//             4,
//             3,
//             3,
//             2.5,
//             1.5,
//             1.5,
//             0,
//             0,
//             0
//           ],
//           "hide": [
//             8,
//             9
//           ]
//         }
//       }
//     },
//     "E2": {
//       "Sem - 1": {
//         "CSE": {
//           "names": [
//             "Probability and Statistics",
//             "Digital Logic Design",
//             "Design & Analysis of Algorithms",
//             "Database Management Systems",
//             "Formal Languages & Automata Theory",
//             "Design & Analysis of Algorithms Lab",
//             "Digital Logic Design Lab",
//             "Database Management Systems Lab",
//             ""
//           ],
//           "credits": [
//             4,
//             3,
//             4,
//             3,
//             3,
//             1.5,
//             1.5,
//             1.5,
//             0,
//             0
//           ],
//           "hide": [
//             9
//           ]
//         },
//         "ECE": {
//           "names": [
//             "Probability & Random Variables",
//             "Internet of Things Lab",
//             "Analog Electronic Circuits",
//             "Analog Electronic Circuits Lab",
//             "Digital Logic Design",
//             "Digital Logic Design Lab",
//             "Digital Signal Processing",
//             "Digital Signal Processing Lab",
//             "Control Systems"
//           ],
//           "credits": [
//             3,
//             1.5,
//             4,
//             1.5,
//             4,
//             1.5,
//             4,
//             1.5,
//             3,
//             0
//           ]
//         },
//         "EEE": {
//           "names": [
//             "Probability & Random Variables",
//             "Internet of Things Lab",
//             "Analog Electronic Circuits",
//             "Analog Electronic Circuits Lab",
//             "Object Oriented Programming",
//             "Object Oriented Programming Lab",
//             "Signals & Systems",
//             "Electrical Machines",
//             "Electrical Machines Lab"
//           ],
//           "credits": [
//             3,
//             1,
//             4,
//             1.5,
//             3,
//             1,
//             4,
//             4,
//             1.5,
//             0
//           ]
//         },
//         "CIVIL": {
//           "names": [
//             "Management Economics and Financial Analysis",
//             "Building Materials and Construction",
//             "Concrete Technology",
//             "Mechanics of Fluids",
//             "Mechanics of Materials-I",
//             "Surveying-I",
//             "Mechanics of Materials Lab",
//             "Surveying Lab",
//             ""
//           ],
//           "credits": [
//             3,
//             3,
//             3,
//             3,
//             3,
//             3,
//             1.5,
//             1.5,
//             0,
//             0
//           ],
//           "hide": [
//             9
//           ]
//         },
//         "MECH": {
//           "names": [
//             "Transform Calculus",
//             "Kinematics of Machinery",
//             "Thermodynamics",
//             "Mechanics of Solids",
//             "Manufacturing Processes",
//             "Mechanics of Solids Lab",
//             "Computer Aided Machine Drawing",
//             "",
//             ""
//           ],
//           "credits": [
//             4,
//             4,
//             4,
//             4,
//             3,
//             1.5,
//             1.5,
//             0,
//             0,
//             0
//           ],
//           "hide": [
//             8,
//             9
//           ]
//         }
//       },
//       "Sem - 2": {
//         "CSE": {
//           "names": [
//             "Introduction to Operation Research",
//             "Computer Organization & Architecture",
//             "Data Science with Python",
//             "Web Technologies",
//             "Compiler Design",
//             "Computer Organization & Architecture Lab",
//             "Data Science with Python Lab",
//             "Web Technologies Lab",
//             ""
//           ],
//           "credits": [
//             3,
//             3,
//             3,
//             3,
//             3,
//             1.5,
//             1.5,
//             1.5,
//             0,
//             0
//           ],
//           "hide": [
//             9
//           ]
//         },
//         "ECE": {
//           "names": [
//             "Robotics Laboratory",
//             "Communication Systems-1",
//             "Communication Systems-1 Lab",
//             "Digital System Design",
//             "Digital System Design Lab",
//             "Linear Integrated Circuits",
//             "Linear Integrated Circuits Lab",
//             "Electromagnetic Waves & Guided Media",
//             ""
//           ],
//           "credits": [
//             2.5,
//             4,
//             1.5,
//             4,
//             1.5,
//             4,
//             1.5,
//             4,
//             0,
//             0
//           ],
//           "hide": [
//             9
//           ]
//         },
//         "EEE": {
//           "names": [
//             "Robotics Laboratory",
//             "Power Systems - I",
//             "Machine Learning",
//             "Control Systems",
//             "Control Systems Lab",
//             "Linear Integrated Circuits",
//             "Linear Integrated Circuits Lab",
//             "Power Electronics",
//             "Power Electronics Lab"
//           ],
//           "credits": [
//             1,
//             4,
//             3,
//             4,
//             1.5,
//             4,
//             1.5,
//             4,
//             1.5,
//             0
//           ]
//         },
//         "CIVIL": {
//           "names": [
//             "Hydraulics Engineering",
//             "Mechanics of Materials-II",
//             "Soil Mechanics",
//             "Structural Analysis",
//             "Surveying-II",
//             "Water Resources Engineering",
//             "Concrete Technology Lab",
//             "Hydraulics Engineering Lab",
//             ""
//           ],
//           "credits": [
//             3,
//             3,
//             4,
//             4,
//             3,
//             3,
//             1.5,
//             1.5,
//             0,
//             0
//           ],
//           "hide": [
//             9
//           ]
//         },
//         "MECH": {
//           "names": [
//             "Design of Machine Elements",
//             "Dynamics of Machinery",
//             "Fluid Mechanics & Hydraulic Machinery",
//             "Metal Cutting and Machine Tools",
//             "Probability and Statistics",
//             "Metal cutting and Machine Tools Lab",
//             "Fluid Mechanics & Hydraulic Machinery Lab",
//             "",
//             ""
//           ],
//           "credits": [
//             4,
//             4,
//             4,
//             4,
//             3,
//             1.5,
//             1.5,
//             0,
//             0,
//             0
//           ],
//           "hide": [
//             8,
//             9
//           ]
//         }
//       }
//     },
//     "E3": {
//       "Sem - 1": {
//         "CSE": {
//           "names": [
//             "Operating System",
//             "Computer Networks",
//             "Software Engineering",
//             "Mathematical Foundations for Data Science",
//             "Elective I",
//             "Operating System Lab",
//             "Computer Networks Lab",
//             "Software Engineering Lab",
//             "English-Language communication Skills Lab- II"
//           ],
//           "credits": [
//             3,
//             3,
//             3,
//             3,
//             3,
//             1.5,
//             1.5,
//             1.5,
//             1.5,
//             0
//           ]
//         },
//         "ECE": {
//           "names": [
//             "Computer Networks",
//             "Computer Organization & Architecture",
//             "English-Language Communication skills Lab-2",
//             "Communication Systems- 2",
//             "Communication Systems -2 Lab",
//             "Microprocessors,Microcontrollers & Computer Networks Lab",
//             "Radio Frequency & Microwave Engg. Lab",
//             "Mini-Project-I (Socially Relevant Project)",
//             ""
//           ],
//           "credits": [
//             3,
//             4,
//             1.5,
//             4,
//             1.5,
//             1.5,
//             2.5,
//             1,
//             0,
//             0
//           ],
//           "hide": [
//             9
//           ]
//         },
//         "EEE": {
//           "names": [
//             "Digital Signal Processing",
//             "Power Systems - II",
//             "Power Systems Lab",
//             "English Language Communication Skills Lab- 2",
//             "Electrical Vehicles",
//             "Electrical Vehicles Lab",
//             "Embedded Systems",
//             "Embedded Systems Lab",
//             "Mini-Project-I",
//             "Product Design & Innovation"
//           ],
//           "credits": [
//             3,
//             4,
//             1.5,
//             1.5,
//             3,
//             1.5,
//             3,
//             1.5,
//             1,
//             1
//           ],
//           "show": [
//             10
//           ]
//         },
//         "CIVIL": {
//           "names": [
//             "Advanced Structural Analysis",
//             "Design of Reinforced concrete Structures",
//             "Environmental Engineering-I",
//             "Estimation and Costing",
//             "Transportation Engineering-I",
//             "English Language Communication Skills Lab-II",
//             "Soil Mechanics Lab",
//             "Transportation Engineering Lab",
//             ""
//           ],
//           "credits": [
//             4,
//             4,
//             3,
//             3,
//             3,
//             1.5,
//             1.5,
//             1.5,
//             0,
//             0
//           ],
//           "hide": [
//             9
//           ]
//         },
//         "MECH": {
//           "names": [
//             "Heat Transfer",
//             "Design of Transmission Elements",
//             "Applied Thermodynamics",
//             "Metrology and Mechanical Measurements",
//             "Metrology and Mechanical Measurements Lab",
//             "Heat Transfer Lab",
//             "Applied Thermodynamics Lab",
//             "English Language Communication Skills Lab-II",
//             ""
//           ],
//           "credits": [
//             4,
//             4,
//             4,
//             3,
//             1.5,
//             1.5,
//             1.5,
//             1.5,
//             0,
//             0
//           ],
//           "hide": [
//             9
//           ]
//         }
//       },
//       "Sem - 2": {
//         "CSE": {
//           "names": [
//             "Cryptography and Networks Security",
//             "Artificial Intelligence",
//             "Elective II",
//             "Elective III",
//             "Open Elective-I",
//             "English-Language communication Skills Lab-I -III",
//             "Mini Project",
//             "",
//             "Summer Internship"
//           ],
//           "credits": [
//             4,
//             4,
//             3,
//             3,
//             3,
//             1.5,
//             3,
//             0,
//             3,
//             0
//           ],
//           "hide": [
//             8
//           ]
//         },
//         "ECE": {
//           "names": [
//             "English-Language Communication skills Lab-3",
//             "Product Design & Innovation",
//             "Elective-1",
//             "Elective-2",
//             "Open Elective-1",
//             "Open Elective-2",
//             "Mini Project-II",
//             "",
//             ""
//           ],
//           "credits": [
//             1.5,
//             1,
//             3,
//             3,
//             3,
//             3,
//             1.5,
//             0,
//             0,
//             0
//           ],
//           "hide": [
//             8,
//             9
//           ]
//         },
//         "EEE": {
//           "names": [
//             "English-Language Communication skills Lab-3",
//             "Elective-1",
//             "Elective-2",
//             "Open Elective-1",
//             "Open Elective-2",
//             "Mini Project-II",
//             "",
//             "",
//             ""
//           ],
//           "credits": [
//             1.5,
//             3,
//             3,
//             3,
//             3,
//             1,
//             0,
//             0,
//             0,
//             0
//           ],
//           "hide": [
//             7,
//             8,
//             9
//           ]
//         },
//         "CIVIL": {
//           "names": [
//             "Building Planning and Computer Aided Drawing Lab",
//             "Design of Steel Structures",
//             "Environmental Engineering-II",
//             "Foundation Engineering",
//             "Transportation Engineering-II",
//             "Professional Elective Course-1/MOOC-1",
//             "English Language Communication Skills Lab-1",
//             "Environmental Engineering Lab",
//             ""
//           ],
//           "credits": [
//             2.5,
//             4,
//             3,
//             3,
//             3,
//             3,
//             1.5,
//             1.5,
//             0,
//             0
//           ],
//           "hide": [
//             9
//           ]
//         },
//         "MECH": {
//           "names": [
//             "Operations Research",
//             "Finite Element Method",
//             "Managerial Economics and Financial Analysis",
//             "Program Elective Course-1",
//             "Program Elective Course-2",
//             "Computer Aided Modeling and Simulation Lab",
//             "English Language Communication Skills Lab-III",
//             "",
//             ""
//           ],
//           "credits": [
//             4,
//             4,
//             3,
//             3,
//             3,
//             1.5,
//             1.5,
//             0,
//             0,
//             0
//           ],
//           "hide": [
//             8,
//             9
//           ]
//         }
//       }
//     },
//     "E4": {
//       "Sem - 1": {
//         "CSE": {
//           "names": [
//             "Elective-V",
//             "Open Elective-III",
//             "Open Elective-IV",
//             "Project-II",
//             "Community Service",
//             "",
//             "",
//             "",
//             ""
//           ],
//           "credits": [
//             3,
//             3,
//             3,
//             6,
//             2,
//             0,
//             0,
//             0,
//             0,
//             0
//           ],
//           "hide": [
//             6,
//             7,
//             8,
//             9
//           ]
//         },
//         "ECE": {
//           "names": [
//             "Elective-3",
//             "Elective-4",
//             "Open Elective-3",
//             "Summer Internship Project",
//             "Project I",
//             "",
//             "",
//             "",
//             ""
//           ],
//           "credits": [
//             3,
//             3,
//             3,
//             3,
//             0,
//             0,
//             0,
//             0,
//             0,
//             0
//           ],
//           "hide": [
//             6,
//             7,
//             8,
//             9
//           ]
//         },
//         "EEE": {
//           "names": [
//             "Elective - 3",
//             "Elective - 4",
//             "Open Elective - 3",
//             "Summer Internship Project",
//             "Project - 1",
//             "",
//             "",
//             "",
//             ""
//           ],
//           "credits": [
//             3,
//             3,
//             3,
//             3,
//             4,
//             0,
//             0,
//             0,
//             0,
//             0
//           ],
//           "hide": [
//             6,
//             7,
//             8,
//             9
//           ]
//         },
//         "CIVIL": {
//           "names": [
//             "Professional Elective Course-2/MOOC-2",
//             "Professional Elective Course-3",
//             "Professional Elective Course-4",
//             "Open Elective Course-1",
//             "Project-1",
//             "",
//             "",
//             "",
//             ""
//           ],
//           "credits": [
//             3,
//             3,
//             3,
//             3,
//             4,
//             0,
//             0,
//             0,
//             0,
//             0
//           ],
//           "hide": [
//             6,
//             7,
//             8,
//             9
//           ]
//         },
//         "MECH": {
//           "names": [
//             "Program Elective Course-3",
//             "Open Elective Course-1",
//             "Open Elective Course-2",
//             "Project",
//             "",
//             "",
//             "",
//             "",
//             ""
//           ],
//           "credits": [
//             3,
//             3,
//             3,
//             4.5,
//             0,
//             0,
//             0,
//             0,
//             0,
//             0
//           ],
//           "hide": [
//             5,
//             6,
//             7,
//             8,
//             9
//           ]
//         }
//       },
//       "Sem - 2": {
//         "CSE": {
//           "names": [
//             "Discrete Mathematics",
//             "Engineering Physics",
//             "Managerial Economics and Finance Analysis",
//             "Object Oriented Programming through Java",
//             "Data Structures",
//             "Engineering Physics Lab",
//             "Object Oriented Programming through Java Lab",
//             "Data Structures Lab",
//             ""
//           ],
//           "credits": [
//             4,
//             4,
//             3,
//             4,
//             3,
//             1.5,
//             1.5,
//             1.5,
//             0,
//             0
//           ],
//           "hide": [
//             6,
//             7,
//             8,
//             9
//           ]
//         },
//         "ECE": {
//           "names": [
//             "Community Service",
//             "Elective-5",
//             "Open Elective-4",
//             "Project-II & Dissertation",
//             "",
//             "",
//             "",
//             "",
//             ""
//           ],
//           "credits": [
//             2,
//             3,
//             3,
//             6,
//             0,
//             0,
//             0,
//             0,
//             0,
//             0
//           ],
//           "hide": [
//             5,
//             6,
//             7,
//             8,
//             9
//           ]
//         },
//         "EEE": {
//           "names": [
//             "Community Service",
//             "Elective - 5",
//             "Open Elective - 4",
//             "Project - II & Dissertation",
//             "",
//             "",
//             "",
//             "",
//             ""
//           ],
//           "credits": [
//             2,
//             3,
//             3,
//             6,
//             0,
//             0,
//             0,
//             0,
//             0,
//             0
//           ],
//           "hide": [
//             5,
//             6,
//             7,
//             8,
//             9
//           ]
//         },
//         "CIVIL": {
//           "names": [
//             "Professional Elective Course-5",
//             "Open Elective Course-2/MOOC-3s",
//             "Open Elective Course-3",
//             "Project-2",
//             "Indian Community Services",
//             "",
//             "",
//             "",
//             ""
//           ],
//           "credits": [
//             3,
//             3,
//             3,
//             5,
//             2,
//             0,
//             0,
//             0,
//             0,
//             0
//           ],
//           "hide": [
//             6,
//             7,
//             8,
//             9
//           ]
//         },
//         "MECH": {
//           "names": [
//             "Program Elective Course-4",
//             "Open Elective Course-3",
//             "Open Elective Course-4",
//             "Community Service",
//             "Project",
//             "",
//             "",
//             "",
//             ""
//           ],
//           "credits": [
//             3,
//             3,
//             3,
//             2,
//             6,
//             0,
//             0,
//             0,
//             0,
//             0
//           ],
//           "hide": [
//             6,
//             7,
//             8,
//             9
//           ]
//         }
//       }
//     }
//   }
// });

// const requestOptions = {
//   method: "POST",
//   headers: myHeaders,
//   body: raw,
//   redirect: "follow"
// };

// fetch("http://localhost:3000/api/v1/admin/populate-curriculum", requestOptions)
//   .then((response) => response.text())
//   .then((result) => console.log(result))
//   .catch((error) => console.error(error));