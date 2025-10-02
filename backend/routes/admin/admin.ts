import { Router } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from "@prisma/client";
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

interface UploadProgress {
  totalRecords: number;
  processedRecords: number;
  failedRecords: { id: string }[];
  status: 'pending' | 'completed' | 'failed';
  startTime: Date;
  errors : any[]
}

const progressStore: Map<string, UploadProgress> = new Map();
// Helper to chunk arrays
const chunkArrayForAddGrades = (array, size) => {
  const chunks:any = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Cache for subjects
const subjectCache = new Map();
async function getOrCreateSubject(subjectName, semesterId, branchId, subjectData, isElective) {
  const cacheKey = `${subjectName}_${semesterId}_${branchId}`;
  if (subjectCache.has(cacheKey)) {
    return subjectCache.get(cacheKey);
  }
  let subject = await client.subject.findFirst({
    where: { name: subjectName, semesterId, branchId },
    select: { id: true },
  });
  if (!subject && isElective) {
    const creditIndex = subjectData.names.indexOf(subjectName);
    const credits = creditIndex !== -1 ? subjectData.credits[creditIndex] : 3;
    subject = await client.subject.create({
      data: { id: uuidv4(), name: subjectName, credits, branchId, semesterId },
      select: { id: true },
    });
  }
  subjectCache.set(cacheKey, subject);
  return subject;
}

function chunkArray(array, size) {
  const chunks:any = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}


adminRouter.get("/getstudents", authMiddleware, async (req, res) => {
  try {
    const filter = req.query.filter as string;

    // Check if filter is provided
    if (!filter) {
      return res.json({ msg: "Filter is required", success: false });
    }

    if (filter === "all") {
      const students = await getUsers(); // Assumes getUsers() is defined elsewhere
      res.json({ students, msg: `Successfully fetched ${students.length} students`, success: true });
    } else if (filter === "names") {
      const students = await client.student.findMany({ select: { id: true, Name: true } });
      res.json({ students, msg: `Successfully fetched ${students.length} students`, success: true });
    } else {
      // Treat filter as a student ID
      const student = await client.student.findUnique({ where: { id: filter }, select: { id: true, Name: true } });
      if (student) {
        res.json({ student, msg: `Successfully fetched student ${student.Name}`, success: true });
      } else {
        res.json({ msg: `Student with ID ${filter} not found`, success: false });
      }
    }
  } catch (e) {
    console.log(e);
    res.json({ msg: "Error: Fetching students. Please try again!", success: false });
  }
});

adminRouter.post('/searchstudent', authMiddleware, async (req, res) => {
  try {
    const { username } = req.body;
    // Return matching students for suggestions (case-insensitive, startsWith)
    const suggestions = await getStudentSuggestions(username);
    if (suggestions.length === 0) {
      return res.json({ msg: "No student found with id starting: " + username, success: false });
    }

    // If exact match exists, also return full student details
    const exactStudent = await getStudentDetails(username);

    res.json({
      success: true,
      suggestions, // list of students with basic info: username, name
      student: exactStudent || null,
    });
  } catch (e) {
    console.error(e);
    res.json({ msg: "Error fetching students", success: false });
  }
});


adminRouter.get("/updatestudents-progress", authMiddleware, async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId || typeof processId !== 'string') return res.status(400).json({ msg: "Missing or invalid processId", success: false });
    const progress = progressStore.get(processId);
    if (!progress) return res.status(404).json({ msg: `No upload process found for processId: ${processId}`, success: false });
    const percentage = progress.totalRecords > 0 ? ((progress.processedRecords / progress.totalRecords) * 100).toFixed(2) : 0;
    //@ts-ignore
    res.status(200).json({ processId, totalRecords: progress.totalRecords, processedRecords: progress.processedRecords, failedRecords: progress.failedRecords, percentage: parseFloat(percentage), status: progress.status, success: true });
  } catch (error) {
    console.error("Error in /updatestudents-progress route:", error);
    res.status(500).json({ msg: "Unexpected error", success: false });
  }
});

adminRouter.post('/updatestudents', authMiddleware, async (req, res) => {
  const students: any = req.body;
  if (!Array.isArray(students)) return res.json({ msg: 'Input JSON format does not match required structure', success: false });
  const requiredKeys = ['ID NUMBER', 'NAME OF THE STUDENT', 'GENDER', 'BRANCH', 'BATCH', 'MOBILE NUMBER', "FATHER'S NAME", "MOTHER'S NAME", "PARENT'S NUMBER", 'BLOOD GROUP', 'ADDRESS'];
  for (const student of students) {
    if (typeof student !== 'object' || !requiredKeys.every(key => student[key] && typeof student[key] === 'string')) return res.json({ msg: 'Input JSON format does not match required structure', success: false });
  }
  if (!students.length) return res.json({ msg: 'Input data is empty', success: false });
  try {
    const processId = uuidv4();
    //@ts-ignore
    progressStore.set(processId, { totalRecords: students.length, processedRecords: 0, failedRecords: [], status: 'pending', startTime: new Date() });
    (async () => {
      let records = 0;
      const failedRecords: any = [];
      for (const student of students) {
        try {
          await addStudent(student['ID NUMBER'], student['NAME OF THE STUDENT'], student['GENDER'], student['BRANCH'], student['BATCH'], student['MOBILE NUMBER'], student["FATHER'S NAME"], student["MOTHER'S NAME"], student["PARENT'S NUMBER"], student['BLOOD GROUP'], student['ADDRESS']);
          records++;
          const progress = progressStore.get(processId);
          if (progress) progress.processedRecords = records;
        } catch (err) {
          console.error(`Failed to insert record (ID: ${student['ID NUMBER']}):`, err);
          failedRecords.push({ id: student['ID NUMBER'], reason: err });
          const progress = progressStore.get(processId);
          if (progress) progress.failedRecords = failedRecords;
        }
      }
      const progress = progressStore.get(processId);
      if (progress) {
        progress.processedRecords = records;
        progress.failedRecords = failedRecords;
        progress.status = 'completed';
        setTimeout(() => progressStore.delete(processId), 10 * 60 * 1000);
      }
      console.log(`Process completed: ${records} successful, ${failedRecords.length} failed`);
    })();
    res.status(202).json({ msg: `Processing ${students.length} student(s) in the background`, processId, success: true });
  } catch (error) {
    console.error('Unexpected error in /updatestudents route:', error);
    res.status(500).json({ msg: 'Unexpected error', success: false });
  }
});

adminRouter.post('/addgrades', authMiddleware, async (req, res) => {
  const data = req.body;
  const validationErrors = validateInput(data);
  if (validationErrors.length > 0) {
    return res.status(400).json({ msg: 'Invalid input', success: false, errors: validationErrors });
  }

  try {
    const processId = uuidv4();
    //@ts-ignore
    progressStore.set(processId, {
      totalRecords: data.Students.length,
      processedRecords: 0,
      errors: [],
      status: 'pending',
      startTime: new Date(),
    });

    const [year, name] = data.SemesterName.split('*');
    const semester = await client.semester.findFirst({
      where: { year, name },
      select: { id: true },
    });
    if (!semester) {
      return res.status(400).json({ msg: `Semester "${data.SemesterName}" not found`, success: false });
    }

    // Validate usernames
    const usernames = data.Students.map(record => record.Username.toLowerCase());
    const existingStudents = await client.student.findMany({
      where: { Username: { in: usernames, mode: 'insensitive' } }, // Case-insensitive for PostgreSQL
      select: { Username: true },
    });
    const existingUsernames = new Set(existingStudents.map(s => s.Username.toLowerCase()));
    const invalidUsernames = usernames.filter(u => !existingUsernames.has(u));
    if (invalidUsernames.length > 0) {
      return res.status(400).json({
        msg: `Invalid usernames: ${invalidUsernames.join(', ')}`,
        success: false,
      });
    }

    // Background processing
    (async () => {
      let processedRecords = 0;
      const errors:any = [];
      const chunks:any = chunkArrayForAddGrades(data.Students, 50);

      for (const chunk of chunks) {
        const startChunk = Date.now();
        const usernames = chunk.map(record => record.Username.toLowerCase());
        const students = await client.student.findMany({
          where: { Username: { in: usernames, mode: 'insensitive' } },
          select: { id: true, Username: true, Branch: true },
        });
        const studentMap = new Map(students.map(s => [s.Username.toLowerCase(), s]));

        const branchNames = [...new Set(students.map(s => s.Branch))];
        const branches = await client.branch.findMany({
          where: { name: { in: branchNames } },
          select: { id: true, name: true },
        });
        const branchMap = new Map(branches.map(b => [b.name, b.id]));

        for (const [index, record] of chunk.entries()) {
          const startRecord = Date.now();
          try {
            const { Username, Grades } = record;
            const student = studentMap.get(Username.toLowerCase());
            if (!student) {
              errors.push({ recordIndex: index, username: Username, message: 'Student not found' });
              continue;
            }

            const subjectData = subjectsData[year]?.[name]?.[student.Branch];
            if (!subjectData) {
              errors.push({
                recordIndex: index,
                username: Username,
                message: `No subject data for ${student.Branch} in ${data.SemesterName}`,
              });
              continue;
            }

            const expectedSubjects = subjectData.names
              .map((name, i) => ({ name, index: i }))
              .filter((subject, i) => subject.name && (!subjectData.hide || !subjectData.hide.includes(i + 1)));
            const gradeSubjectNames = Grades.map(grade => grade.SubjectName);
            const missingSubjects = expectedSubjects.filter(subject => !gradeSubjectNames.includes(subject.name));
            if (missingSubjects.length > 0) {
              errors.push({
                recordIndex: index,
                username: Username,
                message: `Missing grades for subjects: ${missingSubjects.map(s => s.name).join(', ')}`,
              });
              continue;
            }

            const branchId = branchMap.get(student.Branch);
            if (!branchId) {
              errors.push({
                recordIndex: index,
                username: Username,
                message: `Branch ${student.Branch} not found`,
              });
              continue;
            }

            for (const { SubjectName, Grade } of Grades) {
              const numericGrade = convertLetterToNumericGrade(Grade);
              if (numericGrade === null) {
                errors.push({
                  recordIndex: index,
                  username: Username,
                  message: `Invalid grade "${Grade}" for "${SubjectName}"`,
                });
                continue;
              }

              const isElective = SubjectName.includes('Elective') || SubjectName.includes('MOOC');
              const subject = await getOrCreateSubject(SubjectName, semester.id, branchId, subjectData, isElective);
              if (!subject) {
                errors.push({
                  recordIndex: index,
                  username: Username,
                  message: `Subject "${SubjectName}" not found`,
                });
                continue;
              }

              try {
                await client.grade.upsert({
                  where: {
                    studentId_subjectId_semesterId: {
                      studentId: student.id,
                      subjectId: subject.id,
                      semesterId: semester.id,
                    },
                  },
                  update: { grade: numericGrade },
                  create: {
                    studentId: student.id,
                    subjectId: subject.id,
                    semesterId: semester.id,
                    grade: numericGrade,
                  },
                });
              } catch (error:any) {
                errors.push({
                  recordIndex: index,
                  username: Username,
                  message: `Failed to upsert grade for "${SubjectName}": ${error.message}`,
                });
                continue;
              }
            }

            processedRecords++;
          } catch (error:any) {
            console.error(`Error processing record ${index} for ${record.Username}:`, error);
            errors.push({
              recordIndex: index,
              username: record.Username,
              message: error.message || 'Unexpected error',
            });
          }
          console.log(`Processed record ${index} in ${Date.now() - startRecord}ms`);
        }

        const progress = progressStore.get(processId);
        if (progress) {
          progress.processedRecords = processedRecords;
          progress.errors = errors;
        }
        console.log(`Processed chunk in ${Date.now() - startChunk}ms`);
      }

      const progress:any = progressStore.get(processId);
      if (progress) {
        progress.status = errors.length === data.Students.length ? 'failed' : 'completed';
        progress.endTime = new Date();
        setTimeout(() => progressStore.delete(processId), 10 * 60 * 1000);
      }

      console.log(`Process ${processId} completed: ${processedRecords} successful, ${errors.length} failed`);
    })();

    res.status(202).json({
      msg: `Processing ${data.Students.length} student grade records in the background`,
      processId,
      success: true,
    });
  } catch (error) {
    console.error('Error in /addgrades:', error);
    res.status(500).json({ msg: 'Internal Server Error', success: false });
  }
});

adminRouter.post('/addattendance', authMiddleware, async (req, res) => {
  const data = req.body;
  const validationErrors = validateInputForAttendance(data);
  if (validationErrors.length > 0) {
    return res.status(400).json({ msg: 'Input JSON format does not match required structure', success: false, errors: validationErrors });
  }

  try {
    const processId = uuidv4();
    //@ts-ignore
    progressStore.set(processId, {
      totalRecords: data.data.length,
      processedRecords: 0,
      errors: [],
      status: 'pending',
      startTime: new Date(),
    });

    const [year, name] = data.SemesterName.split('*');
    const semester = await client.semester.findFirst({ where: { year, name }, select: { id: true } });
    if (!semester) {
      return res.status(400).json({ msg: `Semester "${data.SemesterName}" not found in database`, success: false });
    }

    // Background processing
    (async () => {
      let processedRecords = 0;
      const errors:any = [];

      for (const [index, record] of data.data.entries()) {
        const startRecord = Date.now();
        try {
          const { IdNumber, no_of_classes_happened, no_of_classes_attended } = record;
          const student = await client.student.findFirst({
            where: { id: IdNumber.toLowerCase() },
            select: { id: true, Branch: true },
          });
          if (!student) {

            errors.push({ recordIndex: index, idNumber: IdNumber, message: `Student "${IdNumber}" not found in database` });
            continue;
          }

          const subjectData = subjectsData[year]?.[name]?.[student.Branch];
          if (!subjectData) {
            errors.push({
              recordIndex: index,
              idNumber: IdNumber,
              message: `No subject data found for ${student.Branch} in ${data.SemesterName}`,
            });
            continue;
          }

          const expectedSubjects = subjectData.names
            .map((name, i) => ({ name, index: i }))
            .filter((subject, i) => subject.name && (!subjectData.hide || !subjectData.hide.includes(i + 1)));
          const happenedSubjectNames = no_of_classes_happened.map(cls => cls.SubjectName);
          const attendedSubjectNames = no_of_classes_attended.map(cls => cls.SubjectName);
          const missingSubjects = expectedSubjects.filter(
            subject => !happenedSubjectNames.includes(subject.name) || !attendedSubjectNames.includes(subject.name)
          );
          if (missingSubjects.length > 0) {
            errors.push({
              recordIndex: index,
              idNumber: IdNumber,
              message: `Missing attendance for subjects: ${missingSubjects.map(s => s.name).join(', ')}`,
            });
            continue;
          }

          const branch = await client.branch.findFirstOrThrow({ where: { name: student.Branch } });
          const branchId = branch.id;
          const happenedMap = new Map(no_of_classes_happened.map(cls => [cls.SubjectName, cls.Classes]));
          const attendedMap = new Map(no_of_classes_attended.map(cls => [cls.SubjectName, cls.Classes]));

          // Process each subject without a transaction
          for (const subjectName of happenedSubjectNames) {
            const totalClasses = Number(happenedMap.get(subjectName)) || 0;
            const attendedClasses = Number(attendedMap.get(subjectName)) || 0;
            if (attendedClasses > totalClasses) {
              errors.push({
                recordIndex: index,
                idNumber: IdNumber,
                message: `Attended classes (${attendedClasses}) exceeds total classes (${totalClasses}) for subject "${subjectName}"`,
              });
              continue;
            }

            const isElective = subjectName.includes('Elective') || subjectName.includes('MOOC');
            let subject = await client.subject.findFirst({
              where: { name: subjectName, semesterId: semester.id, branchId },
              select: { id: true },
            });

            if (!subject && isElective) {
              const creditIndex = subjectData.names.indexOf(subjectName);
              const credits = creditIndex !== -1 ? subjectData.credits[creditIndex] : 3;
              try {
                subject = await client.subject.create({
                  data: { id: uuidv4(), name: subjectName, credits, branchId, semesterId: semester.id },
                  select: { id: true },
                });
              } catch (error:any) {
                errors.push({
                  recordIndex: index,
                  idNumber: IdNumber,
                  message: `Failed to create elective subject "${subjectName}": ${error.message}`,
                });
                continue;
              }
            }

            if (!subject) {
              errors.push({
                recordIndex: index,
                idNumber: IdNumber,
                message: `Subject "${subjectName}" not found for semester "${data.SemesterName}" and branch "${student.Branch}"`,
              });
              continue;
            }

            try {
              await client.attendance.upsert({
                where: {
                  studentId_subjectId_semesterId: {
                    studentId: student.id,
                    subjectId: subject.id,
                    semesterId: semester.id,
                  },
                },
                update: { totalClasses, attendedClasses },
                create: { studentId: student.id, subjectId: subject.id, semesterId: semester.id, totalClasses, attendedClasses },
              });
            } catch (error:any) {
              errors.push({
                recordIndex: index,
                idNumber: IdNumber,
                message: `Failed to upsert attendance for "${subjectName}": ${error.message}`,
              });
              continue;
            }
          }

          processedRecords++;
        } catch (error:any) {
          console.error(`Failed to process record ${index} for idNumber ${record.IdNumber}:`, error);
          errors.push({
            recordIndex: index,
            idNumber: record.IdNumber,
            message: error.message || 'Unexpected error during processing',
          });
        }

        // Update progress
        const progress = progressStore.get(processId);
        if (progress) {
          progress.processedRecords = processedRecords;
          progress.errors = errors;
        }

        console.log(`Processed record ${index} in ${Date.now() - startRecord}ms`);
      }

      // Finalize progress
      const progress:any = progressStore.get(processId);
      if (progress) {
        progress.processedRecords = processedRecords;
        progress.errors = errors;
        progress.status = errors.length === data.data.length ? 'failed' : 'completed';
        progress.endTime = new Date();
        setTimeout(() => progressStore.delete(processId), 10 * 60 * 1000);
      }

      console.log(`Process ${processId} completed: ${processedRecords} successful, ${errors.length} failed`);
    })();

    res.status(202).json({
      msg: `Processing ${data.data.length} student attendance records in the background`,
      processId,
      success: true,
    });
  } catch (error:any) {
    console.error('Unexpected error in /addattendance route:', error);
    res.status(500).json({
      msg: 'Internal Server Error',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

adminRouter.post('/populate-curriculum', async (req, res) => {
  try {
    const branches = ['CSE', 'ECE', 'EEE', 'CIVIL', 'MECH'];
    for (const branchName of branches) {
      await client.branch.upsert({ where: { name: branchName }, update: { name: branchName }, create: { name: branchName } });
    }
    for (const year in subjectsData) {
      for (const semesterName in subjectsData[year]) {
        const semester = await client.semester.upsert({ where: { name_year: { name: semesterName, year } }, update: { name: semesterName, year }, create: { name: semesterName, year } });
        for (const branchName in subjectsData[year][semesterName]) {
          const branch = await client.branch.findUnique({ where: { name: branchName } });
          if (!branch) throw new Error(`Branch ${branchName} not found`);
          const { names, credits } = subjectsData[year][semesterName][branchName];
          for (let i = 0; i < names.length; i++) {
            const subjectName = names[i];
            const subjectCredits = credits[i];
            if (!subjectName || subjectCredits === 0) continue;
            await client.subject.upsert({ where: { name_branchId_semesterId: { name: subjectName, branchId: branch.id, semesterId: semester.id } }, update: { name: subjectName, credits: subjectCredits, branchId: branch.id, semesterId: semester.id }, create: { name: subjectName, credits: subjectCredits, branchId: branch.id, semesterId: semester.id } });
          }
        }
      }
    }
    res.json({ msg: 'Curriculum data populated successfully', success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal Server Error', success: false });
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

// Middleware: ensure req.admin exists (fetchAdmin should set it). Then check role/permission
function requireRole(role: Role) {
  return (req, res, next) => {
    const admin = (req as any).admin;
    if (!admin) return res.status(401).json({ msg: 'Unauthorized', success: false });
    if (admin.role !== role) return res.status(403).json({ msg: 'Forbidden: role required', success: false });
    next();
  };
}

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

// --- Banner model assumptions ---
// Prisma model (for reference, add to schema.prisma if not present):
/*
model Banner {
  id         String   @id @default(uuid())
  title      String
  imageUrl   String?
  text       String?
  isPublished Boolean @default(false)
  createdBy  String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
*/

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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
    console.error('Update banner error', err);
    res.status(500).json({ msg: 'Error updating banner', success: false });
  }
});

adminRouter.delete('/banners/:id', authMiddleware, requirePermission('manage_banners'), async (req, res) => {
  try {
    const { id } = req.params;
    await client.banner.delete({ where: { id } });
    res.json({ msg: 'Banner deleted', success: true });
  } catch (err) {
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
