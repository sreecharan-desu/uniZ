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
  getUsers,

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


adminRouter.post('/searchstudent', authMiddleware, async (req, res) => {
  try {
    const { username } = req.body;
    const student = await getStudentDetails(username);
    res.json(student ? { student, success: true } : { msg: "No student found with idnumber : " + username, success: false });
  } catch (e) {
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
        setTimeout(() => progressStore.delete(processId), 5 * 60 * 1000);
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
    progressStore.set(processId, { totalRecords: data.Students.length, processedRecords: 0, errors: [], status: 'pending', startTime: new Date() });

    const [year, name] = data.SemesterName.split('*');
    const semester = await client.semester.findFirst({ where: { year, name }, select: { id: true } });
    if (!semester) {
      return res.status(400).json({ msg: `Semester "${data.SemesterName}" not found`, success: false });
    }

    const chunks:any = chunkArray(data.Students, 50);
    let processedRecords = 0;
    const errors:any = [];

    for (const chunk of chunks) {
      const usernames = chunk.map(record => record.Username.toLowerCase());
      const students = await client.student.findMany({
        where: { Username: { in: usernames } },
        select: { id: true, Branch: true },
      });
      const studentMap = new Map(students.map((s:any) => [s.Username, s]));

      await Promise.all(
        chunk.map(async (record, index) => {
          try {
            const { Username, Grades } = record;
            const student = studentMap.get(Username.toLowerCase());
            if (!student) {
              errors.push({ recordIndex: index, username: Username, message: 'Student not found' });
              return;
            }

            const subjectData = subjectsData[year]?.[name]?.[student.Branch];
            if (!subjectData) {
              errors.push({ recordIndex: index, username: Username, message: `No subject data for ${student.Branch} in ${data.SemesterName}` });
              return;
            }

            // Validate grades
            const expectedSubjects = subjectData.names
              .map((name, i) => ({ name, index: i }))
              .filter((subject, i) => subject.name && (!subjectData.hide || !subjectData.hide.includes(i + 1)));
            const gradeSubjectNames = Grades.map(grade => grade.SubjectName);
            const missingSubjects = expectedSubjects.filter(subject => !gradeSubjectNames.includes(subject.name));
            if (missingSubjects.length > 0) {
              errors.push({ recordIndexmetrics: index, username: Username, message: `Missing grades for subjects: ${missingSubjects.map(s => s.name).join(', ')}` });
              return;
            }

            const branch:any = await client.branch.findFirstOrThrow({ where: { name: student.Branch } });
            const gradeData:any = [];

            for (const { SubjectName, Grade } of Grades) {
              const isElective = SubjectName.includes('Elective') || SubjectName.includes('MOOC');
              let subject = await client.subject.findFirst({
                where: { name: SubjectName, semesterId: semester.id, branchId: branch.id },
                select: { id: true },
              });

              if (!subject && isElective) {
                const creditIndex = subjectData.names.indexOf(SubjectName);
                const credits = creditIndex !== -1 ? subjectData.credits[creditIndex] : 3;
                subject = await client.subject.create({
                  data: { id: uuidv4(), name: SubjectName, credits, branchId: branch.id, semesterId: semester.id },
                  select: { id: true },
                });
              }

              if (!subject) {
                errors.push({ recordIndex: index, username: Username, message: `Subject "${SubjectName}" not found` });
                continue;
              }

              const numericGrade = convertLetterToNumericGrade(Grade);
              if (numericGrade === null) {
                errors.push({ recordIndex: index, username: Username, message: `Invalid grade "${Grade}" for "${SubjectName}"` });
                continue;
              }

              gradeData.push({
                studentId: student.id,
                subjectId: subject.id,
                semesterId: semester.id,
                grade: numericGrade,
              });
            }

            // Bulk upsert grades
            await client.$transaction(
              gradeData.map(data =>
                client.grade.upsert({
                  where: { studentId_subjectId_semesterId: { studentId: data.studentId, subjectId: data.subjectId, semesterId: data.semesterId } },
                  update: { grade: data.grade },
                  create: data,
                })
              )
            );

            processedRecords++;
          } catch (error:any) {
            errors.push({ recordIndex: index, username: record.Username, message: error.message || 'Processing error' });
          }
        })
      );

      const progress = progressStore.get(processId);
      if (progress) {
        progress.processedRecords = processedRecords;
        progress.errors = errors;
      }
    }

    const progress:any = progressStore.get(processId);
    if (progress) {
      progress.status = errors.length === data.Students.length ? 'failed' : 'completed';
      progress.endTime = new Date();
      setTimeout(() => progressStore.delete(processId), 5 * 60 * 1000);
    }

    res.status(200).json({
      msg: `Processed ${processedRecords} of ${data.Students.length} records`,
      success: errors.length === 0,
      processId,
      totalRecords: data.Students.length,
      processedRecords,
      errors,
    });
  } catch (error) {
    res.status(500).json({ msg: 'Internal Server Error', success: false });
  }
});

function chunkArray(array, size) {
  const chunks:any = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}


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