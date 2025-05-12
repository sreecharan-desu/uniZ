import { Router } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from "@prisma/client";
import { fetchAdmin, validateSigninInputs } from "./middlewares/middlewares";
import { authMiddleware, validateResetPassInputs } from "../student/middlewares/middlewares";
const client = new PrismaClient();
import {
  addStudent,
  approveOuting,
  approveOutpass,
  convertLetterToNumericGrade,
  getOutingRequests,
  getOutPassRequests,
  getStudentDetails,
  getStudentsOutsideCampus,
  getUsers,
  rejectOuting,
  rejectOutpass,
  sendEmail,
  subjectsData,
  updateAdminPassword,
  updateUserPrescence,
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

adminRouter.get("/getoutpassrequests", authMiddleware, async (req, res) => {
  try {
    const requests = await getOutPassRequests();
    res.json({ outpasses: requests, success: true });
  } catch (e) {
    res.json({ msg: "Error : Fething requests Try again!", success: true });
  }
});

adminRouter.get("/getoutingrequests", authMiddleware, async (req, res) => {
  try {
    const requests = await getOutingRequests();
    res.json({ outings: requests, success: true });
  } catch (e) {
    res.json({ msg: "Error : Fething requests Try again!", success: true });
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

//  ----------------------------------------------------------------------------------   //  Outpass and Outing Approvals  ----------------------------------------------------------------------------------   //
adminRouter.post("/approveoutpass", authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const outpass = await approveOutpass(id);
    if (outpass?.success) {
      const outpassData = await client.outpass.findFirst({ where: { id }, select: { Student: { select: { Email: true } }, ToDay: true } });
      const email = outpassData?.Student.Email;
      if (email) {
        const outPassEmailBody = `<!DOCTYPE html><html><head><style>body {font-family: Arial, sans-serif;color: #333;background-color: #f4f4f4;margin: 0;padding: 20px;}.container {background-color: #ffffff;border-radius: 8px;padding: 20px;max-width: 600px;margin: 0 auto;box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);}h1 {color: #4CAF50;font-size: 24px;margin-top: 0;}p {font-size: 16px;line-height: 1.6;margin: 10px 0;}.details {margin-top: 20px;padding: 15px;border: 1px solid #ddd;border-radius: 5px;background-color: #f9f9f9;}.details p {margin: 5px 0;}.footer {margin-top: 20px;font-size: 14px;color: #888;}</style></head><body><div class="container"><h1>Your Outpass Request Has been Approved!</h1><p>Your outpass request with ID: <strong>${id}</strong> has been Approved!</p><div class="details"><p><strong> You should return to campus on ${outpassData.ToDay.toLocaleDateString()}</strong></p></div><div class="footer"><p>Thank you for your patience.</p><p>Best regards,<br>uniZ</p></div></div></body></html>`;
        await sendEmail(email, "Regarding your OutpassRequest", outPassEmailBody);
      }
    }
    res.json({ msg: outpass.msg, success: outpass.success });
  } catch (e) {
    res.json({ msg: "Error approving outpass Please Try again!", success: false });
  }
});

adminRouter.post("/approveouting", authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const outing = await approveOuting(id);
    if (outing?.success) {
      const outingData = await client.outing.findFirst({ where: { id }, select: { Student: { select: { Email: true } }, ToTime: true } });
      const email = outingData?.Student.Email;
      if (email) {
        const outPassEmailBody = `<!DOCTYPE html><html><head><style>body {font-family: Arial, sans-serif;color: #333;background-color: #f4f4f4;margin: 0;padding: 20px;}.container {background-color: #ffffff;border-radius: 8px;padding: 20px;max-width: 600px;margin: 0 auto;box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);}h1 {color: #4CAF50;font-size: 24px;margin-top: 0;}p {font-size: 16px;line-height: 1.6;margin: 10px 0;}.details {margin-top: 20px;padding: 15px;border: 1px solid #ddd;border-radius: 5px;background-color: #f9f9f9;}.details p {margin: 5px 0;}.footer {margin-top: 20px;font-size: 14px;color: #888;}</style></head><body><div class="container"><h1>Your Outing Request Has been Approved!</h1><p>Your outing request with ID: <strong>${id}</strong> has been Approved!</p><div class="details"><p><strong> You should return to campus by ${outingData.ToTime.toLocaleTimeString()}</strong></p></div><div class="footer"><p>Thank you for your patience.</p><p>Best regards,<br>uniZ</p></div></div></body></html>`;
        await sendEmail(email, "Regarding your OutingRequest", outPassEmailBody);
      }
    }
    res.json({ msg: outing.msg, success: outing.success });
  } catch (e) {
    res.json({ msg: "Error approving outing Please Try again!", success: false });
  }
});

adminRouter.post("/rejectouting", authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const outing = await rejectOuting(id);
    if (outing?.success) {
      const outingData = await client.outing.findFirst({ where: { id }, select: { Student: { select: { Email: true } }, Message: true, rejectedBy: true, rejectedTime: true } });
      const email = outingData?.Student.Email;
      if (email) {
        const outPassEmailBody = `<!DOCTYPE html><html><head><style>body {font-family: Arial, sans-serif;color: #333;background-color: #f4f4f4;margin: 0;padding: 20px;}.container {background-color: #ffffff;border-radius: 8px;padding: 20px;max-width: 600px;margin: 0 auto;box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);}h1 {color:red;font-size: 24px;margin-top: 0;}p {font-size: 16px;line-height: 1.6;margin: 10px 0;}.details {margin-top: 20px;padding: 15px;border: 1px solid #ddd;border-radius: 5px;background-color: #f9f9f9;}.details p {margin: 5px 0;}.footer {margin-top: 20px;font-size: 14px;color: #888;}</style></head><body><div class="container"><h1>Your Outing Request Has been Rejected!</h1><p>Your outing request with ID: <strong>${id}</strong> has been <b>Rejected!</b></p><div class="details"><p><strong>Rejected by : ${outingData.rejectedBy}</strong></p><p><strong>Rejected Time : ${outingData.rejectedTime}</strong></p><p><strong>Message : ${outingData.Message}</strong></p></div><div class="footer"><p>Thank you for your patience.</p><p>Best regards,<br>uniZ</p></div></div></body></html>`;
        await sendEmail(email, "Regarding your OutingRequest", outPassEmailBody);
      }
    }
    res.json({ msg: outing.msg, success: outing.success });
  } catch (e) {
    res.json({ msg: "Error rejecting outing Please Try again!", success: false });
  }
});

adminRouter.post("/rejectoutpass", authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const outpass = await rejectOutpass(id);
    if (outpass?.success) {
      const outpassData = await client.outpass.findFirst({ where: { id }, select: { Student: { select: { Email: true } }, Message: true, rejectedBy: true, rejectedTime: true } });
      const email = outpassData?.Student.Email;
      if (email) {
        const outPassEmailBody = `<!DOCTYPE html><html><head><style>body {font-family: Arial, sans-serif;color: #333;background-color: #f4f4f4;margin: 0;padding: 20px;}.container {background-color: #ffffff;border-radius: 8px;padding: 20px;max-width: 600px;margin: 0 auto;box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);}h1 {color: red;font-size: 24px;margin-top: 0;}p {font-size: 16px;line-height: 1.6;margin: 10px 0;}.details {margin-top: 20px;padding: 15px;border: 1px solid #ddd;border-radius: 5px;background-color: #f9f9f9;}.details p {margin: 5px 0;}.footer {margin-top: 20px;font-size: 14px;color: #888;}</style></head><body><div class="container"><h1>Your Outpass Request Has been Rejected!</h1><p>Your outpass request with ID: <strong>${id}</strong> has been <b>Rejected!</b></p><div class="details"><p><strong>Rejected by : ${outpassData.rejectedBy}</strong></p><p><strong>Rejected Time : ${outpassData.rejectedTime}</strong></p><p><strong>Message : ${outpassData.Message}</strong></p></div><div class="footer"><p>Thank you for your patience.</p><p>Best regards,<br>uniZ</p></div></div></body></html>`;
        await sendEmail(email, "Regarding your OutPassRequest", outPassEmailBody);
      }
    }
    res.json({ msg: outpass.msg, success: outpass.success });
  } catch (e) {
    res.json({ msg: "Error rejecting outpass Please Try again!", success: false });
  }
});

adminRouter.get("/getstudentsoutsidecampus", authMiddleware, async (req, res) => {
  try {
    const students = await getStudentsOutsideCampus();
    res.json({ students, success: true });
  } catch (e) {
    res.json({ msg: "Error fetching students", success: false });
  }
});

adminRouter.post("/updatestudentstatus", authMiddleware, async (req, res) => {
  try {
    const { userId, id } = req.body;
    const student = await updateUserPrescence(userId, id);
    res.json({ msg: student.msg, success: student.success });
  } catch (e) {
    res.json({ msg: "Error fetching students", success: false });
  }
});
//  ----------------------------------------------------------------------------------   //  Outpass and Outing Approvals  ----------------------------------------------------------------------------------   //


interface UploadProgress {
  totalRecords: number;
  processedRecords: number;
  failedRecords: { id: string }[];
  status: 'pending' | 'completed' | 'failed';
  startTime: Date;
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
  if (validationErrors.length > 0) return res.status(400).json({ msg: 'Input JSON format does not match required structure', success: false, errors: validationErrors });
  try {
    const processId = uuidv4();
    progressStore.set(processId, { totalRecords: data.Students.length, processedRecords: 0, failedRecords: [], status: 'pending', startTime: new Date() });
    const [year, name] = data.SemesterName.split('*');
    const semester = await client.semester.findFirst({ where: { year, name }, select: { id: true } });
    if (!semester) return res.status(400).json({ msg: `Semester "${data.SemesterName}" not found in database`, success: false });
    let processedRecords = 0;
    const failedRecords: any = [];
    const processingErrors: any = [];
    for (const [index, record] of data.Students.entries()) {
      try {
        const { Username, Grades } = record;
        const student = await client.student.findFirst({ where: { Username: Username.toLowerCase() }, select: { id: true, Branch: true } });
        if (!student) {
          failedRecords.push({ username: Username, recordIndex: index, reason: 'Student not found in database' });
          processingErrors.push({ recordIndex: index, message: `Student "${Username}" not found in database` });
          continue;
        }
        const subjectData = subjectsData[year]?.[name]?.[student.Branch];
        if (!subjectData) {
          failedRecords.push({ username: Username, recordIndex: index, reason: `No subject data found for ${student.Branch} in ${data.SemesterName}` });
          processingErrors.push({ recordIndex: index, message: `No subject data found for ${student.Branch} in ${data.SemesterName}` });
          continue;
        }
        const expectedSubjects = subjectData.names.map((name, i) => ({ name, index: i })).filter((subject, i) => subject.name && (!subjectData.hide || !subjectData.hide.includes(i + 1)));
        const gradeSubjectNames = Grades.map(grade => grade.SubjectName);
        const missingSubjects = expectedSubjects.filter(subject => !gradeSubjectNames.includes(subject.name));
        if (missingSubjects.length > 0) {
          failedRecords.push({ username: Username, recordIndex: index, reason: `Missing grades for subjects: ${missingSubjects.map(s => s.name).join(', ')}` });
          processingErrors.push({ recordIndex: index, message: `Missing grades for subjects: ${missingSubjects.map(s => s.name).join(', ')}` });
          continue;
        }
        const branch = await client.branch.findFirstOrThrow({ where: { name: student.Branch } });
        const branchId = branch.id;
        await client.$transaction(async (tx) => {
          for (const [gradeIndex, { SubjectName, Grade }] of Grades.entries()) {
            const isElective = SubjectName.includes('Elective') || SubjectName.includes('MOOC');
            let subject;
            if (isElective) {
              subject = await tx.subject.findFirst({ where: { name: SubjectName, semesterId: semester.id, branchId }, select: { id: true } });
              if (!subject) {
                const creditIndex = subjectData.names.indexOf(SubjectName);
                const credits = creditIndex !== -1 ? subjectData.credits[creditIndex] : 3;
                subject = await tx.subject.create({ data: { id: uuidv4(), name: SubjectName, credits, branchId, semesterId: semester.id }, select: { id: true } });
              }
            } else {
              subject = await tx.subject.findFirst({ where: { name: SubjectName, semesterId: semester.id, branchId }, select: { id: true } });
              if (!subject) {
                failedRecords.push({ username: Username, recordIndex: index, gradeIndex, reason: `Subject "${SubjectName}" not found for semester "${data.SemesterName}" and branch "${student.Branch}"` });
                processingErrors.push({ recordIndex: index, gradeIndex, message: `Subject "${SubjectName}" not found for semester "${data.SemesterName}" and branch "${student.Branch}"` });
                continue;
              }
            }
            const numericGrade = convertLetterToNumericGrade(Grade);
            if (numericGrade === null) {
              failedRecords.push({ username: Username, recordIndex: index, gradeIndex, reason: `Invalid grade "${Grade}" for subject "${SubjectName}"` });
              processingErrors.push({ recordIndex: index, gradeIndex, message: `Invalid grade "${Grade}" for subject "${SubjectName}"` });
              continue;
            }
            await tx.grade.upsert({ where: { studentId_subjectId_semesterId: { studentId: student.id, subjectId: subject.id, semesterId: semester.id } }, update: { grade: numericGrade }, create: { studentId: student.id, subjectId: subject.id, semesterId: semester.id, grade: numericGrade } });
          }
        });
        processedRecords++;
      } catch (error: any) {
        console.error(`Failed to process record ${index} for username ${record.Username}:`, error);
        failedRecords.push({ username: record.Username, recordIndex: index, reason: error.message || 'Unexpected error during processing' });
        processingErrors.push({ recordIndex: index, message: error.message || 'Unexpected error', stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
      }
      const progress:any = progressStore.get(processId);
      if (progress) {
        progress.processedRecords = processedRecords;
        progress.failedRecords = failedRecords;
        progress.errors = processingErrors;
      }
    }
    const progress:any = progressStore.get(processId);
    if (progress) {
      progress.processedRecords = processedRecords;
      progress.failedRecords = failedRecords;
      progress.errors = processingErrors;
      progress.status = failedRecords.length === data.Students.length ? 'failed' : 'completed';
      progress.endTime = new Date();
      setTimeout(() => progressStore.delete(processId), 5 * 60 * 1000);
    }
    console.log(`Process completed: ${processedRecords} successful, ${failedRecords.length} failed`);
    res.status(200).json({
      msg: `Processed ${processedRecords} of ${data.Students.length} student grade records successfully`,
      success: failedRecords.length === 0,
      processId,
      totalRecords: data.Students.length,
      processedRecords,
      failedRecords,
      errors: processingErrors,
    });
  } catch (error: any) {
    console.error('Unexpected error in /addgrades route:', error);
    res.status(500).json({ msg: 'Internal Server Error', success: false, error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

adminRouter.post('/addattendance', authMiddleware, async (req, res) => {
  const data = req.body;
  const validationErrors = validateInputForAttendance(data);
  if (validationErrors.length > 0) return res.status(400).json({ msg: 'Input JSON format does not match required structure', success: false, errors: validationErrors });
  try {
    const processId = uuidv4();
    progressStore.set(processId, { totalRecords: data.data.length, processedRecords: 0, failedRecords: [], status: 'pending', startTime: new Date() });
    const [year, name] = data.SemesterName.split('*');
    const semester = await client.semester.findFirst({ where: { year, name }, select: { id: true } });
    if (!semester) return res.status(400).json({ msg: `Semester "${data.SemesterName}" not found in database`, success: false });
    (async () => {
      let processedRecords = 0;
      const failedRecords: any = [];
      const processingErrors: any = [];
      for (const [index, record] of data.data.entries()) {
        try {
          const { IdNumber, no_of_classes_happened, no_of_classes_attended } = record;
          const student = await client.student.findFirst({ where: { id: IdNumber.toLowerCase() }, select: { id: true, Branch: true } });
          if (!student) {
            failedRecords.push({ idNumber: IdNumber, recordIndex: index, reason: 'Student not found in database' });
            processingErrors.push({ recordIndex: index, message: `Student "${IdNumber}" not found in database` });
            continue;
          }
          const subjectData = subjectsData[year]?.[name]?.[student.Branch];
          if (!subjectData) {
            failedRecords.push({ idNumber: IdNumber, recordIndex: index, reason: `No subject data found for ${student.Branch} in ${data.SemesterName}` });
            processingErrors.push({ recordIndex: index, message: `No subject data found for ${student.Branch} in ${data.SemesterName}` });
            continue;
          }
          const expectedSubjects = subjectData.names.map((name, i) => ({ name, index: i })).filter((subject, i) => subject.name && (!subjectData.hide || !subjectData.hide.includes(i + 1)));
          const happenedSubjectNames = no_of_classes_happened.map(cls => cls.SubjectName);
          const attendedSubjectNames = no_of_classes_attended.map(cls => cls.SubjectName);
          const missingSubjects = expectedSubjects.filter(subject => !happenedSubjectNames.includes(subject.name) || !attendedSubjectNames.includes(subject.name));
          if (missingSubjects.length > 0) {
            failedRecords.push({ idNumber: IdNumber, recordIndex: index, reason: `Missing attendance for subjects: ${missingSubjects.map(s => s.name).join(', ')}` });
            processingErrors.push({ recordIndex: index, message: `Missing attendance for subjects: ${missingSubjects.map(s => s.name).join(', ')}` });
            continue;
          }
          const branch = await client.branch.findFirstOrThrow({ where: { name: student.Branch } });
          const branchId = branch.id;
          const happenedMap = new Map(no_of_classes_happened.map(cls => [cls.SubjectName, cls.Classes]));
          const attendedMap = new Map(no_of_classes_attended.map(cls => [cls.SubjectName, cls.Classes]));
          await client.$transaction(async (tx) => {
            for (const subjectName of happenedSubjectNames) {
              const totalClasses: number = Number(happenedMap.get(subjectName)) || 0;
              const attendedClasses: number = Number(attendedMap.get(subjectName)) || 0;
              if (attendedClasses > totalClasses) {
                failedRecords.push({ idNumber: IdNumber, recordIndex: index, reason: `Attended classes (${attendedClasses}) exceeds total classes (${totalClasses}) for subject "${subjectName}"` });
                processingErrors.push({ recordIndex: index, message: `Attended classes (${attendedClasses}) exceeds total classes (${totalClasses}) for subject "${subjectName}"` });
                continue;
              }
              const isElective = subjectName.includes('Elective') || subjectName.includes('MOOC');
              let subject;
              if (isElective) {
                subject = await tx.subject.findFirst({ where: { name: subjectName, semesterId: semester.id, branchId }, select: { id: true } });
                if (!subject) {
                  const creditIndex = subjectData.names.indexOf(subjectName);
                  const credits = creditIndex !== -1 ? subjectData.credits[creditIndex] : 3;
                  subject = await tx.subject.create({ data: { id: uuidv4(), name: subjectName, credits, branchId, semesterId: semester.id }, select: { id: true } });
                }
              } else {
                subject = await tx.subject.findFirst({ where: { name: subjectName, semesterId: semester.id, branchId }, select: { id: true } });
                if (!subject) {
                  failedRecords.push({ idNumber: IdNumber, recordIndex: index, reason: `Subject "${subjectName}" not found for semester "${data.SemesterName}" and branch "${student.Branch}"` });
                  processingErrors.push({ recordIndex: index, message: `Subject "${subjectName}" not found for semester "${data.SemesterName}" and branch "${student.Branch}"` });
                  continue;
                }
              }
              await tx.attendance.upsert({ where: { studentId_subjectId_semesterId: { studentId: student.id, subjectId: subject.id, semesterId: semester.id } }, update: { totalClasses, attendedClasses }, create: { studentId: student.id, subjectId: subject.id, semesterId: semester.id, totalClasses, attendedClasses } });
            }
          });
          processedRecords++;
        } catch (error: any) {
          console.error(`Failed to process record ${index} for idNumber ${record.IdNumber}:`, error);
          failedRecords.push({ idNumber: record.IdNumber, recordIndex: index, reason: error.message || 'Unexpected error during processing' });
          processingErrors.push({ recordIndex: index, message: error.message || 'Unexpected error', stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
        }
        const progress:any = progressStore.get(processId);
        if (progress) {
          progress.processedRecords = processedRecords;
          progress.failedRecords = failedRecords;
          progress.errors = processingErrors;
        }
      }
      const progress:any = progressStore.get(processId);
      if (progress) {
        progress.processedRecords = processedRecords;
        progress.failedRecords = failedRecords;
        progress.errors = processingErrors;
        progress.status = failedRecords.length === data.data.length ? 'failed' : 'completed';
        progress.endTime = new Date();
        setTimeout(() => progressStore.delete(processId), 5 * 60 * 1000);
      }
      console.log(`Process completed: ${processedRecords} successful, ${failedRecords.length} failed`);
    })();
    res.status(202).json({ msg: `Processing ${data.data.length} student attendance records in the background`, processId, success: true });
  } catch (error: any) {
    console.error('Unexpected error in /addattendance route:', error);
    res.status(500).json({ msg: 'Internal Server Error', success: false, error: process.env.NODE_ENV === 'development' ? error.message : undefined });
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