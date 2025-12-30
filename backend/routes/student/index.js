"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middlewares_1 = require("./middlewares/middlewares");
const student_service_1 = require("../services/student.service");
const prisma_service_1 = __importDefault(require("../services/prisma.service"));
const redis_service_1 = __importDefault(require("../services/redis.service"));
const email_service_1 = require("../services/email.service");
const subjects_1 = require("../constants/subjects");
const email_templates_1 = require("./emails/email_templates");
exports.studentRouter = (0, express_1.Router)();
// Student Signin
exports.studentRouter.post("/signin", middlewares_1.validateSigninInputs, middlewares_1.fetchStudent, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    if (!process.env.JWT_SECURITY_KEY)
        throw new Error("JWT_SECURITY_KEY is not defined");
    const token = jsonwebtoken_1.default.sign(username, process.env.JWT_SECURITY_KEY);
    res.json({ student_token: token, success: true });
}));
// STEP 1: Request OTP for Forgot Password
exports.studentRouter.post("/forgotpass", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    if (!username)
        return res.status(400).json({ msg: "Username is required", success: false });
    const name = username.split("@")[0].toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    try {
        const updated = yield prisma_service_1.default.student.update({
            where: { Username: name },
            data: { OTP: otp, updatedAt: now },
            select: { Email: true, Username: true },
        });
        (0, email_service_1.sendEmail)(updated.Email, "Password Reset OTP", `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`).catch((err) => console.error("Error sending OTP email:", err));
        return res.status(200).json({ msg: "OTP sent to your registered email", success: true });
    }
    catch (error) {
        if ((error === null || error === void 0 ? void 0 : error.code) === "P2025")
            return res.status(404).json({ msg: "User not found", success: false });
        console.error("Error sending OTP:", error);
        return res.status(500).json({ msg: "Unexpected error. Try again later.", success: false });
    }
}));
// STEP 2: Set New Password (after OTP verification)
exports.studentRouter.post("/setnewpass", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, new_password, otp } = req.body;
    if (!username || !new_password || !otp) {
        return res.status(400).json({ msg: "Username, OTP, and new password are required", success: false });
    }
    const name = username.split("@")[0].toLowerCase();
    try {
        const user = yield prisma_service_1.default.student.findUnique({
            where: { Username: name },
            select: { OTP: true, updatedAt: true, Email: true },
        });
        if (!user || !user.OTP)
            return res.status(404).json({ msg: "No OTP found. Request again.", success: false });
        const otpAgeMs = Date.now() - user.updatedAt.getTime();
        if (otpAgeMs > 10 * 60 * 1000 || user.OTP !== otp) {
            return res.status(400).json({ msg: "OTP expired or invalid", success: false });
        }
        const hashResult = yield (0, student_service_1.hashPassword)(new_password);
        if (!hashResult.success || !hashResult.password)
            throw new Error("Password hashing failed");
        yield prisma_service_1.default.student.update({
            where: { Username: name },
            data: { Password: hashResult.password, OTP: "" },
        });
        (0, email_service_1.sendEmail)(user.Email, "Password Reset Successful", "Your password has been updated successfully.").catch((err) => console.error("Error sending success email:", err));
        return res.status(200).json({ msg: "Password updated successfully! Please log in.", success: true });
    }
    catch (error) {
        console.error("Error setting new password:", error);
        return res.status(500).json({ msg: "Unexpected error. Try again later.", success: false });
    }
}));
// Reset Password (Authenticated)
exports.studentRouter.put("/resetpass", middlewares_1.validateResetPassInputs, middlewares_1.fetchStudent, middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, new_password } = req.body;
    try {
        const isUpdated = yield (0, student_service_1.updateStudentPassword)(username, new_password);
        const user = yield prisma_service_1.default.student.findFirst({ where: { Username: username }, select: { Email: true } });
        if (!user)
            return res.status(404).json({ msg: "User not found.", success: false });
        if (!isUpdated) {
            yield (0, email_service_1.sendEmail)(user.Email, "Regarding Reset-Password", email_templates_1.passwordResetFailed);
            return res.status(400).json({ msg: "Invalid credentials! Password update failed.", success: false });
        }
        yield (0, email_service_1.sendEmail)(user.Email, "Regarding Reset-Password", email_templates_1.passwordResetSuccess);
        res.status(200).json({ msg: "Password updated successfully!", success: true });
    }
    catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ msg: "An unexpected error occurred.", success: false });
    }
}));
// Outpass Request
exports.studentRouter.post("/requestoutpass", middlewares_1.isPresentInCampus, middlewares_1.isApplicationPending, middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reason, userId, from_date, to_date } = req.body;
    try {
        const result = yield (0, student_service_1.requestOutpass)(userId, reason, from_date, to_date);
        if (result === null || result === void 0 ? void 0 : result.success) {
            const user = yield prisma_service_1.default.student.findFirst({ where: { id: userId }, select: { Email: true, Username: true } });
            const emailForStudent = yield (0, email_templates_1.getOutpassMailFormatForStudent)(result);
            const emailForAdmin = yield (0, email_templates_1.getOutpassMailFormatForAdministration)(result, user);
            if (user === null || user === void 0 ? void 0 : user.Email) {
                yield (0, email_service_1.sendEmail)(user.Email, "Regarding your Outpass Request", emailForStudent);
                yield (0, email_service_1.sendEmail)(process.env.ADMIN_EMAIL || "sreecharan309@gmail.com", `New Outpass Request From ${user.Username}`, emailForAdmin);
            }
        }
        res.json({ msg: result.msg, success: result.success });
    }
    catch (error) {
        console.error("Outpass Request Error:", error);
        res.status(500).json({ msg: "Internal Server Error", success: false });
    }
}));
// Outing Request
exports.studentRouter.post("/requestouting", middlewares_1.isPresentInCampus, middlewares_1.isApplicationPending, middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reason, userId, from_time, to_time } = req.body;
    try {
        const result = yield (0, student_service_1.requestOuting)(userId, reason, from_time, to_time);
        if (result === null || result === void 0 ? void 0 : result.success) {
            const user = yield prisma_service_1.default.student.findFirst({ where: { id: userId }, select: { Email: true, Username: true } });
            const emailForStudent = yield (0, email_templates_1.getOutingMailFormatForStudent)(result);
            const emailForAdmin = yield (0, email_templates_1.getOutingMailFormatForAdministration)(result, user);
            if (user === null || user === void 0 ? void 0 : user.Email) {
                yield (0, email_service_1.sendEmail)(user.Email, "Regarding your Outing Request", emailForStudent);
                yield (0, email_service_1.sendEmail)(process.env.ADMIN_EMAIL || "sreecharan309@gmail.com", `New Outing Request From ${user.Username}`, emailForAdmin);
            }
        }
        res.json({ msg: result.msg, success: result.success });
    }
    catch (error) {
        console.error("Outing Request Error:", error);
        res.status(500).json({ msg: "Internal Server Error", success: false });
    }
}));
// Get Student Details
// Get Student Details
exports.studentRouter.post("/getdetails", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    if (!username)
        return res.json({ msg: "Username is required", success: false });
    const cacheKey = `student:profile:${username.toLowerCase()}`;
    try {
        const cached = yield redis_service_1.default.get(cacheKey);
        if (cached) {
            return res.json({ student: JSON.parse(cached), success: true });
        }
    }
    catch (e) {
        console.warn("Redis cache read error", e);
    }
    try {
        const user = yield (0, student_service_1.getStudentDetails)(username);
        if (user) {
            // Cache for 24 hours
            redis_service_1.default.set(cacheKey, JSON.stringify(user), "EX", 86400).catch((err) => console.warn("Redis set error", err));
            res.json({ student: user, success: true });
        }
        else {
            res.json({ msg: "Student not found", success: false });
        }
    }
    catch (_a) {
        res.status(500).json({ msg: "Internal Server Error", success: false });
    }
}));
// Update Student Details
exports.studentRouter.put("/updatedetails", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { username } = _a, updateDataRaw = __rest(_a, ["username"]);
    if (!username)
        return res.json({ msg: "Username is required", success: false });
    try {
        const current = yield prisma_service_1.default.student.findUnique({ where: { Username: username.toLowerCase() } });
        if (!current)
            return res.json({ msg: "Student not found", success: false });
        // Map fields and filter undefined
        const mapping = {
            name: "Name", gender: "Gender", fatherName: "FatherName", motherName: "MotherName",
            bloodGroup: "BloodGroup", phoneNumber: "PhoneNumber", address: "Address", year: "Year",
            branch: "Branch", section: "Section", roomno: "Roomno",
        };
        const data = {};
        Object.keys(updateDataRaw).forEach(k => {
            if (mapping[k] && updateDataRaw[k] !== undefined)
                data[mapping[k]] = updateDataRaw[k];
        });
        if (updateDataRaw.dateOfBirth)
            data.DateOfBirth = new Date(updateDataRaw.dateOfBirth);
        const updated = yield prisma_service_1.default.student.update({
            where: { Username: username.toLowerCase() },
            data,
            select: { id: true, Username: true, Email: true, Name: true },
        });
        // Invalidate cache
        redis_service_1.default.del(`student:profile:${username.toLowerCase()}`).catch((err) => console.warn("Redis del error", err));
        yield (0, email_service_1.sendEmail)(updated.Email, "Account details updated", "Your account details have been updated successfully.");
        res.json({
            student: { _id: updated.id, username: updated.Username, email: updated.Email, name: updated.Name },
            success: true,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server Error", success: false });
    }
}));
// Academic: Get Grades
exports.studentRouter.post("/getgrades", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { username, semesterId } = req.body;
    if (!username || !semesterId)
        return res.json({ msg: "Username and semesterId are required", success: false });
    const cacheKey = `student:grades:${username.toLowerCase()}:${semesterId}`;
    try {
        const cached = yield redis_service_1.default.get(cacheKey);
        if (cached)
            return res.json(JSON.parse(cached));
    }
    catch (e) {
        console.warn("Redis read error", e);
    }
    try {
        const user = yield prisma_service_1.default.student.findFirst({
            where: { Username: username.toLowerCase() },
            select: { Branch: true, grades: { where: { semesterId }, include: { subject: { select: { name: true } } } } },
        });
        if (!user)
            return res.json({ msg: "Student not found", success: false });
        const sem = yield prisma_service_1.default.semester.findUnique({ where: { id: semesterId } });
        if (!sem)
            return res.json({ msg: "Semester not found", success: false });
        const subjects = yield prisma_service_1.default.subject.findMany({ where: { semesterId, branch: { name: user.Branch } } });
        const gradeToLetter = (g) => (g === 10 ? "Ex" : g === 9 ? "A" : g === 8 ? "B" : g === 7 ? "C" : g === 6 ? "D" : g === 5 ? "E" : "R");
        const gradeToPoints = { Ex: 10, A: 9, B: 8, C: 7, D: 6, E: 5, R: 0 };
        const gradeData = Object.fromEntries(subjects.map(s => {
            var _a;
            return [
                s.name,
                ((_a = user.grades.find(g => g.subject.name === s.name)) === null || _a === void 0 ? void 0 : _a.grade) ? gradeToLetter(user.grades.find(g => g.subject.name === s.name).grade) : "",
            ];
        }));
        let totalCreditsObtained = 0, totalCredits = 0, hasRemedial = null;
        let weakSubjects = [], strongSubjects = [];
        let calculationDetails = [];
        let gradeDistribution = { Ex: 0, A: 0, B: 0, C: 0, D: 0, E: 0, R: 0 };
        const data = (_b = (_a = subjects_1.subjectsData[sem.year]) === null || _a === void 0 ? void 0 : _a[sem.name]) === null || _b === void 0 ? void 0 : _b[user.Branch];
        if (data) {
            subjects.forEach((s, i) => {
                const letter = gradeData[s.name];
                const credit = data.credits[i] || 0;
                if (letter)
                    gradeDistribution[letter]++;
                if (["R", "E"].includes(letter))
                    weakSubjects.push(s.name);
                else if (["Ex", "A"].includes(letter))
                    strongSubjects.push(s.name);
                if (letter === "R")
                    hasRemedial = s.name;
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
        redis_service_1.default.set(cacheKey, JSON.stringify(responsePayload), "EX", 604800).catch((err) => console.warn("Redis set error", err));
        res.json(responsePayload);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server Error", success: false });
    }
}));
// Academic: Get Attendance
exports.studentRouter.post("/getattendance", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, semesterId } = req.body;
    if (!username)
        return res.status(400).json({ msg: "Username is required", success: false });
    const cacheKey = `student:attendance:${username.toLowerCase()}:${semesterId || 'all'}`;
    try {
        const cached = yield redis_service_1.default.get(cacheKey);
        if (cached)
            return res.json(JSON.parse(cached));
    }
    catch (e) {
        console.warn("Redis read error", e);
    }
    try {
        const user = yield prisma_service_1.default.student.findFirst({
            where: { Username: username.toLowerCase() },
            include: {
                attendance: {
                    where: semesterId ? { semesterId } : {},
                    include: { subject: { select: { name: true } }, semester: true }
                },
            },
        });
        if (!user)
            return res.status(404).json({ msg: "Student not found", success: false });
        // Only fetch relevant semesters to reduce overhead
        const semesters = yield prisma_service_1.default.semester.findMany({
            where: semesterId ? { id: semesterId } : {}
        });
        const subjects = yield prisma_service_1.default.subject.findMany({ where: { branch: { name: user.Branch }, semesterId: semesterId || undefined } });
        const attendanceData = {};
        semesters.forEach(sem => {
            if (!attendanceData[sem.year])
                attendanceData[sem.year] = {};
            const semSubjects = subjects.filter(s => s.semesterId === sem.id);
            const subAttendance = Object.fromEntries(semSubjects.map(s => {
                const record = user.attendance.find(a => a.subject.name === s.name && a.semesterId === sem.id);
                const total = (record === null || record === void 0 ? void 0 : record.totalClasses) || 0, attended = (record === null || record === void 0 ? void 0 : record.attendedClasses) || 0;
                return [s.name, { totalClasses: total, classesAttended: attended, attendancePercentage: total > 0 ? ((attended / total) * 100).toFixed(1) : "0.0" }];
            }));
            const total = Object.values(subAttendance).reduce((s, d) => s + d.totalClasses, 0);
            const attended = Object.values(subAttendance).reduce((s, d) => s + d.classesAttended, 0);
            attendanceData[sem.year][sem.name] = {
                subjects: subAttendance,
                totalClasses: total,
                classesAttended: attended,
                attendancePercentage: total > 0 ? ((attended / total) * 100).toFixed(1) : "0.0",
            };
        });
        const response = { attendance_data: attendanceData, success: true };
        redis_service_1.default.set(cacheKey, JSON.stringify(response), "EX", 3600).catch((err) => console.warn("Redis set error", err)); // 1 hour
        res.json(response);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server Error", success: false });
    }
}));
