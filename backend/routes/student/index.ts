import { Router } from "express";
import jwt from "jsonwebtoken";
import {
  authMiddleware,
  fetchStudent,
  isApplicationPending,
  isPresentInCampus,
  validateResetPassInputs,
  validateSigninInputs,
} from "./middlewares/middlewares";
import {
  getStudentDetails,
  hashPassword,
  requestOuting,
  requestOutpass,
  updateStudentPassword,
} from "../services/student.service";
import prisma from "../services/prisma.service";
import { sendEmail } from "../services/email.service";
import { subjectsData } from "../constants/subjects";
import {
  getOutingMailFormatForStudent,
  getOutingMailFormatForAdministration,
  getOutpassMailFormatForStudent,
  getOutpassMailFormatForAdministration,
  passwordResetFailed,
  passwordResetSuccess,
} from "./emails/email_templates";
import { logger } from "../../utils/logger";
import { broadcast } from "../../utils/websocket";

export const studentRouter = Router();

// Student Signin
studentRouter.post("/signin", validateSigninInputs, fetchStudent, async (req, res) => {

  const { username } = req.body;
  try {
    if (!process.env.JWT_SECURITY_KEY) throw new Error("JWT_SECURITY_KEY is not defined");
    
    const token = jwt.sign({ username, role: 'student' }, process.env.JWT_SECURITY_KEY);
    return res.json({ student_token: token, success: true });
  } catch (e) {
    console.error("Signin Error:", e);
    return res.status(500).json({ msg: "Internal server error", success: false });
  }
});

// STEP 1: Request OTP for Forgot Password
studentRouter.all("/forgotpass", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ msg: "Username is required", success: false });

  const name = username.split("@")[0].toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const now = new Date();

  try {
    const updated = await prisma.student.update({
      where: { Username: name },
      data: { OTP: otp, updatedAt: now },
      select: { Email: true, Username: true },
    });

    sendEmail(
      updated.Email,
      "Password Reset OTP",
      `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`
    ).catch((err) => logger.error(`Error sending OTP email: ${err.message || err}`));

    return res.status(200).json({ msg: "OTP sent to your registered email", success: true });
  } catch (error: any) {
    if (error?.code === "P2025") return res.status(404).json({ msg: "User not found", success: false });
    logger.error(`Error sending OTP: ${error.message || error}`);
    return res.status(500).json({ msg: "Unexpected error. Try again later.", success: false });
  }
});

// Standalone OTP Verification
studentRouter.all("/verifyotp", async (req, res) => {
  const { username, otp } = req.body;
  if (!username || !otp) return res.status(400).json({ msg: "Username and OTP are required", success: false });

  const name = username.split("@")[0].toLowerCase();
  try {
    const user = await prisma.student.findUnique({ where: { Username: name }, select: { OTP: true, updatedAt: true } });
    if (!user || user.OTP !== otp) return res.status(400).json({ msg: "Invalid OTP", success: false });
    
    const otpAgeMs = Date.now() - user.updatedAt.getTime();
    if (otpAgeMs > 10 * 60 * 1000) return res.status(400).json({ msg: "OTP expired", success: false });

    return res.status(200).json({ msg: "OTP verified", success: true });
  } catch (error) {
    return res.status(500).json({ msg: "Verification failed", success: false });
  }
});

// STEP 2: Set New Password (after OTP verification)
studentRouter.all("/setnewpass", async (req, res) => {
  const { username, new_password, otp } = req.body;
  if (!username || !new_password || !otp) {
    return res.status(400).json({ msg: "Username, OTP, and new password are required", success: false });
  }

  const name = username.split("@")[0].toLowerCase();

  try {
    const user = await prisma.student.findUnique({
      where: { Username: name },
      select: { OTP: true, updatedAt: true, Email: true },
    });

    if (!user || !user.OTP) return res.status(404).json({ msg: "No OTP found. Request again.", success: false });

    const otpAgeMs = Date.now() - user.updatedAt.getTime();
    if (otpAgeMs > 10 * 60 * 1000 || user.OTP !== otp) {
      return res.status(400).json({ msg: "OTP expired or invalid", success: false });
    }

    const hashResult:any = await hashPassword(new_password);
    if (!hashResult.success || !hashResult.password) throw new Error("Password hashing failed");

    await prisma.student.update({
      where: { Username: name },
      data: { Password: hashResult.password, OTP: "" },
    });

    sendEmail(user.Email, "Password Reset Successful", "Your password has been updated successfully.").catch((err) =>
      logger.error(`Error sending success email: ${err.message || err}`)
    );

    return res.status(200).json({ msg: "Password updated successfully! Please log in.", success: true });
  } catch (error: any) {
    logger.error(`Error setting new password: ${error.message || error}`);
    return res.status(500).json({ msg: "Unexpected error. Try again later.", success: false });
  }
});

// Reset Password (Authenticated)
studentRouter.put("/resetpass", validateResetPassInputs, fetchStudent, authMiddleware, async (req, res) => {
  const { username, new_password } = req.body;
  try {
    const isUpdated = await updateStudentPassword(username, new_password);
    const user = await prisma.student.findFirst({ where: { Username: username }, select: { Email: true } });
    
    if (!user) return res.status(404).json({ msg: "User not found.", success: false });
    
    if (!isUpdated) {
      await sendEmail(user.Email, "Regarding Reset-Password", passwordResetFailed);
      return res.status(400).json({ msg: "Invalid credentials! Password update failed.", success: false });
    }
    
    await sendEmail(user.Email, "Regarding Reset-Password", passwordResetSuccess);
    res.status(200).json({ msg: "Password updated successfully!", success: true });
  } catch (error: any) {
    logger.error(`Error updating password: ${error.message || error}`);
    res.status(500).json({ msg: "An unexpected error occurred.", success: false });
  }
});

// Outpass Request
studentRouter.post("/requestoutpass", isPresentInCampus, isApplicationPending, authMiddleware, async (req, res) => {
  const { reason, userId, from_date, to_date } = req.body;
  try {
    const result = await requestOutpass(userId, reason, from_date, to_date);
    if (result?.success) {
      const user = await prisma.student.findFirst({ where: { id: userId }, select: { Email: true, Username: true } });
      const emailForStudent = await getOutpassMailFormatForStudent(result);
      const emailForAdmin = await getOutpassMailFormatForAdministration(result, user);
      
      if (user?.Email) {
        await sendEmail(user.Email, "Regarding your Outpass Request", emailForStudent);
        await sendEmail(process.env.ADMIN_EMAIL || "sreecharan309@gmail.com", `New Outpass Request From ${user.Username}`, emailForAdmin);
      }
      broadcast({ type: 'REFRESH_REQUESTS', payload: { userId, type: 'outpass', status: 'created' } });
    }
    return res.json({ msg: result.msg, success: result.success });
  } catch (error: any) {
    logger.error(`Outpass Request Error: ${error.message || error}`);
    return res.status(500).json({ msg: "Internal Server Error", success: false });
  }
});

// Outing Request
studentRouter.post("/requestouting", isPresentInCampus, isApplicationPending, authMiddleware, async (req, res) => {
  const { reason, userId, from_time, to_time } = req.body;
  try {
    const result = await requestOuting(userId, reason, from_time, to_time);
    if (result?.success) {
      const user = await prisma.student.findFirst({ where: { id: userId }, select: { Email: true, Username: true } });
      const emailForStudent = await getOutingMailFormatForStudent(result);
      const emailForAdmin = await getOutingMailFormatForAdministration(result, user);
      
      if (user?.Email) {
        await sendEmail(user.Email, "Regarding your Outing Request", emailForStudent);
        await sendEmail(process.env.ADMIN_EMAIL || "sreecharan309@gmail.com", `New Outing Request From ${user.Username}`, emailForAdmin);
      }
      broadcast({ type: 'REFRESH_REQUESTS', payload: { userId, type: 'outing', status: 'created' } });
    }
    return res.json({ msg: result.msg, success: result.success });
  } catch (error: any) {
    logger.error(`Outing Request Error: ${error.message || error}`);
    return res.status(500).json({ msg: "Internal Server Error", success: false });
  }
});

// Get Student Details
// Get Student Details
studentRouter.get("/getdetails", authMiddleware, async (req, res) => {
  const username = (req as any).user?.username || req.body.username;
  if (!username) return res.json({ msg: "Username is required", success: false });

  try {
    const user = await getStudentDetails(username);
    if (user) {
      return res.json({ student: user, success: true });
    } else {
      return res.json({ msg: "Student not found", success: false });
    }
  } catch {
    return res.status(500).json({ msg: "Internal Server Error", success: false });
  }
});

// Update Student Details
studentRouter.put("/updatedetails", authMiddleware, async (req, res) => {
  const username = (req as any).user?.username || req.body.username;
  const updateDataRaw = req.body;
  
  if (!username) return res.json({ msg: "Username is required", success: false });

  try {
    const current = await prisma.student.findUnique({ where: { Username: username.toLowerCase() } });
    if (!current) return res.json({ msg: "Student not found", success: false });

    // Map fields and filter undefined
    const mapping: Record<string, string> = {
      name: "Name", gender: "Gender", fatherName: "FatherName", motherName: "MotherName",
      fatherOccupation: "FatherOccupation", motherOccupation: "MotherOccupation",
      fatherEmail: "FatherEmail", motherEmail: "MotherEmail",
      fatherAddress: "FatherAddress", motherAddress: "MotherAddress",
      fatherPhoneNumber: "FatherPhoneNumber", motherPhoneNumber: "MotherPhoneNumber",
      bloodGroup: "BloodGroup", phoneNumber: "PhoneNumber", address: "Address", year: "Year",
      branch: "Branch", section: "Section", roomno: "Roomno", profileUrl: "ProfileUrl",
    };

    const data: any = {};
    Object.keys(updateDataRaw).forEach(k => {
      if (mapping[k] && updateDataRaw[k] !== undefined) data[mapping[k]] = updateDataRaw[k];
    });

    if (updateDataRaw.dateOfBirth) data.DateOfBirth = new Date(updateDataRaw.dateOfBirth);

    const updated = await prisma.student.update({
      where: { Username: username.toLowerCase() },
      data,
      select: { id: true, Username: true, Email: true, Name: true, ProfileUrl: true },
    });

    await sendEmail(updated.Email, "Account details updated", "Your account details have been updated successfully.");

    return res.json({
      student: { 
        _id: updated.id, 
        username: updated.Username, 
        email: updated.Email, 
        name: updated.Name,
        profile_url: updated.ProfileUrl 
      },
      success: true,
    });
  } catch (error: any) {
    logger.error(`Update Details Error: ${error.message || error}`);
    return res.status(500).json({ msg: error.message || "Internal Server Error", success: false });
  }
});

// New Paginated History for Student
studentRouter.get("/history", authMiddleware, async (req, res) => {
  try {
    const studentId = (req as any).user?.username; // Username is used as ID in this system
    if (!studentId) return res.status(401).json({ success: false, msg: "Unauthorized" });

    const page = Math.max(Number(req.query.page || "1"), 1);
    const limit = Math.max(Number(req.query.limit || "5"), 1);
    const skip = (page - 1) * limit;

    const [outings, outpasses, totalOutings, totalOutpasses] = await Promise.all([
      prisma.outing.findMany({ where: { StudentId: studentId }, skip, take: limit, orderBy: { RequestedTime: 'desc' } }),
      prisma.outpass.findMany({ where: { StudentId: studentId }, skip, take: limit, orderBy: { RequestedTime: 'desc' } }),
      prisma.outing.count({ where: { StudentId: studentId } }),
      prisma.outpass.count({ where: { StudentId: studentId } })
    ]);

    const { mapOutingToLegacy, mapOutpassToLegacy } = await import("../utils/mappers");

    const history = [
      ...outings.map(o => ({ ...mapOutingToLegacy(o), type: 'outing' })),
      ...outpasses.map(o => ({ ...mapOutpassToLegacy(o), type: 'outpass' }))
    ].sort((a: any, b: any) => new Date(b.requested_time).getTime() - new Date(a.requested_time).getTime());

    return res.json({
      success: true,
      history: history.slice(0, limit), // Slice because we merged two paginated lists
      pagination: {
        page,
        limit,
        total: totalOutings + totalOutpasses,
        totalPages: Math.ceil((totalOutings + totalOutpasses) / limit)
      }
    });
  } catch (e: any) {
    logger.error(`Student History Error: ${e.message || e}`);
    return res.status(500).json({ success: false, msg: "Failed to fetch history" });
  }
});

// Get Semesters List
studentRouter.get("/getsemesters", async (req, res) => {
  try {
    const semesters = await prisma.semester.findMany({
      select: { id: true, name: true, year: true },
      orderBy: [{ year: 'asc' }, { name: 'asc' }]
    });
    return res.json({ semesters, success: true });
  } catch (error: any) {
    logger.error(`Get Semesters Error: ${error.message || error}`);
    return res.status(500).json({ msg: "Internal Server Error", success: false });
  }
});

// Academic: Get Grades
studentRouter.post("/getgrades", authMiddleware, async (req, res) => {
  const { username, semesterId } = req.body;
  if (!username || !semesterId) return res.json({ msg: "Username and semesterId are required", success: false });

  try {
    const user = await prisma.student.findFirst({
      where: { Username: username.toLowerCase() },
      select: { Branch: true, grades: { where: { semesterId }, include: { subject: { select: { name: true } } } } },
    });
    if (!user) return res.json({ msg: "Student not found", success: false });

    const sem = await prisma.semester.findUnique({ where: { id: semesterId } });
    if (!sem) return res.json({ msg: "Semester not found", success: false });

    const subjects = await prisma.subject.findMany({ where: { semesterId, branch: { name: user.Branch } } });

    const gradeToLetter = (g: number) => (g === 10 ? "Ex" : g === 9 ? "A" : g === 8 ? "B" : g === 7 ? "C" : g === 6 ? "D" : g === 5 ? "E" : "R");
    const gradeToPoints: Record<string, number> = { Ex: 10, A: 9, B: 8, C: 7, D: 6, E: 5, R: 0 };

    const gradeData = Object.fromEntries(
      subjects.map(s => [
        s.name,
        user.grades.find(g => g.subject.name === s.name)?.grade ? gradeToLetter(user.grades.find(g => g.subject.name === s.name)!.grade) : "",
      ])
    );

    let totalCreditsObtained = 0, totalCredits = 0, hasRemedial: string | null = null;
    let weakSubjects: string[] = [], strongSubjects: string[] = [];
    let calculationDetails: { subject: string; grade: string; points: number; credits: number; contribution: number; }[] = [];
    let gradeDistribution: Record<string, number> = { Ex: 0, A: 0, B: 0, C: 0, D: 0, E: 0, R: 0 };

    const data = subjectsData[sem.year]?.[sem.name]?.[user.Branch];
    if (data) {
      subjects.forEach((s, i) => {
        const letter = gradeData[s.name];
        const credit = data.credits[i] || 0;
        if (letter) gradeDistribution[letter]++;
        
        if (["R", "E"].includes(letter)) weakSubjects.push(s.name);
        else if (["Ex", "A"].includes(letter)) strongSubjects.push(s.name);
        
        if (letter === "R") hasRemedial = s.name;
        
        if (letter && letter !== "R") {
          const pts = gradeToPoints[letter] || 0;
          totalCreditsObtained += pts * credit;
          totalCredits += credit;
          calculationDetails.push({ subject: s.name, grade: letter, points: pts, credits: credit, contribution: pts * credit });
        }
      });
    }

    const gpa = hasRemedial ? `Remedial in ${hasRemedial}` : totalCredits > 0 ? (totalCreditsObtained / totalCredits).toFixed(2) : null;

    const responsePayload = {
      year: sem.year,
      semester: sem.name,
      grade_data: gradeData,
      gpa,
      calculation_details: calculationDetails,
      visualization_data: { pieChart: { labels: Object.keys(gradeDistribution), data: Object.values(gradeDistribution) }, barChart: calculationDetails.map(d => ({ subject: d.subject, points: d.points })) },
      success: true,
    };

    return res.json(responsePayload);
  } catch (error: any) {
    logger.error(`Get Grades Error: ${error.message || error}`);
    return res.status(500).json({ msg: "Internal Server Error", success: false });
  }
});

// Academic: Get Attendance
studentRouter.post("/getattendance", authMiddleware, async (req, res) => {
  const { username, semesterId } = req.body;
  if (!username) return res.status(400).json({ msg: "Username is required", success: false });

  try {
    const user = await prisma.student.findFirst({
      where: { Username: username.toLowerCase() },
      include: {
        attendance: { 
          where: semesterId ? { semesterId } : {},
          include: { subject: { select: { name: true } }, semester: true } 
        },
      },
    });
    if (!user) return res.status(404).json({ msg: "Student not found", success: false });

    // Only fetch relevant semesters to reduce overhead
    const semesters = await prisma.semester.findMany({
       where: semesterId ? { id: semesterId } : {}
    });
    const subjects = await prisma.subject.findMany({ where: { branch: { name: user.Branch }, semesterId: semesterId || undefined } });

    const attendanceData: any = {};
    semesters.forEach(sem => {
      if (!attendanceData[sem.year]) attendanceData[sem.year] = {};
      
      const semSubjects = subjects.filter(s => s.semesterId === sem.id);
      const subAttendance = Object.fromEntries(
        semSubjects.map(s => {
          const record = user.attendance.find(a => a.subject.name === s.name && a.semesterId === sem.id);
          const total = record?.totalClasses || 0, attended = record?.attendedClasses || 0;
          return [s.name, { totalClasses: total, classesAttended: attended, attendancePercentage: total > 0 ? ((attended / total) * 100).toFixed(1) : "0.0" }];
        })
      );

      const total = Object.values(subAttendance).reduce((s, d: any) => s + d.totalClasses, 0);
      const attended = Object.values(subAttendance).reduce((s, d: any) => s + d.classesAttended, 0);
      
      attendanceData[sem.year][sem.name] = {
        subjects: subAttendance,
        totalClasses: total,
        classesAttended: attended,
        attendancePercentage: total > 0 ? ((attended / total) * 100).toFixed(1) : "0.0",
      };
    });

    const response = { attendance_data: attendanceData, success: true };
    return res.json(response);
  } catch (error: any) {
    logger.error(`Get Attendance Error: ${error.message || error}`);
    return res.status(500).json({ msg: "Internal Server Error", success: false });
  }
});