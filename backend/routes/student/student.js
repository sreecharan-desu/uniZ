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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middlewares_1 = require("./middlewares/middlewares");
const helper_functions_1 = require("../helper-functions");
const client_1 = require("@prisma/client");
const emails_1 = require("./emails");
const client = new client_1.PrismaClient();
exports.studentRouter = (0, express_1.Router)();
exports.studentRouter.post("/signin", middlewares_1.validateSigninInputs, middlewares_1.fetchStudent, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    if (!process.env.JWT_SECURITY_KEY)
        throw new Error('JWT_SECURITY_KEY is not defined');
    const token = jsonwebtoken_1.default.sign(username, process.env.JWT_SECURITY_KEY);
    res.json({ student_token: token, success: true });
}));
exports.studentRouter.put("/resetpass", middlewares_1.validateResetPassInputs, middlewares_1.fetchStudent, middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, new_password } = req.body;
    try {
        const isUpdated = yield (0, helper_functions_1.updateStudentPassword)(username, new_password);
        const user = yield client.student.findFirst({ where: { Username: username }, select: { Email: true, Username: true } });
        if (!user)
            return res.status(404).json({ msg: "User not found. Password update failed.", success: false });
        if (!isUpdated) {
            yield (0, helper_functions_1.sendEmail)(user.Email, "Regarding Reset-Password", emails_1.passwordResetFailed);
            return res.status(400).json({ msg: "Invalid credentials! Password update failed.", success: false });
        }
        yield (0, helper_functions_1.sendEmail)(user.Email, "Regarding Reset-Password", emails_1.passwordResetSuccess);
        res.status(200).json({ msg: "Password updated successfully! Sign in again with your new password.", success: true });
    }
    catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ msg: "An unexpected error occurred. Please try again later.", success: false });
    }
}));
exports.studentRouter.post('/requestoutpass', middlewares_1.isPresentInCampus, middlewares_1.isApplicationPending, middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reason, userId, from_date, to_date } = req.body;
    try {
        const outpass = yield (0, helper_functions_1.requestOutpass)(reason, userId, new Date(from_date), new Date(to_date));
        if (outpass === null || outpass === void 0 ? void 0 : outpass.success) {
            const user = yield client.student.findFirst({ where: { id: userId }, select: { Email: true, Username: true } });
            const studentOutpassEmail = yield (0, emails_1.getOutpassMailFormatForStudent)(outpass);
            const wardenOutpassEmail = yield (0, emails_1.getOutpassMailFormatForWarden)(outpass, user);
            if (user === null || user === void 0 ? void 0 : user.Email) {
                yield (0, helper_functions_1.sendEmail)(user.Email, "Regarding your OutpassRequest", studentOutpassEmail);
                yield (0, helper_functions_1.sendEmail)('sreecharan309@gmail.com', `New Outpass Request From ${user.Username}`, wardenOutpassEmail);
            }
            res.json({ msg: outpass.msg, success: outpass.success });
        }
        else {
            res.json({ msg: outpass === null || outpass === void 0 ? void 0 : outpass.msg, success: outpass === null || outpass === void 0 ? void 0 : outpass.success });
        }
    }
    catch (error) {
        console.error("Error requesting outpass:", error);
        res.status(500).json({ msg: "An unexpected error occurred. Please try again later.", success: false });
    }
}));
exports.studentRouter.post('/requestouting', middlewares_1.isPresentInCampus, middlewares_1.isApplicationPending, middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reason, userId, from_time, to_time } = req.body;
    const outing = yield (0, helper_functions_1.requestOuting)(reason, userId, from_time, to_time);
    if (outing === null || outing === void 0 ? void 0 : outing.success) {
        const user = yield client.student.findFirst({ where: { id: userId }, select: { Email: true, Username: true } });
        const studentOutingEmailBody = yield (0, emails_1.getOutingMailFormatForStudent)(outing);
        const wardenOutingEmailBody = yield (0, emails_1.getOutingMailFormatForWarden)(outing, user);
        if (user && user.Email && user.Username) {
            yield (0, helper_functions_1.sendEmail)(user.Email, "Regarding your OutingRequest", studentOutingEmailBody);
            yield (0, helper_functions_1.sendEmail)('sreecharan309@gmail.com', `New Outing Request From ${user.Username}`, wardenOutingEmailBody);
        }
        res.json({ msg: outing.msg, success: outing.success });
    }
    else {
        res.json({ msg: outing.msg, success: outing.success });
    }
}));
exports.studentRouter.post("/getdetails", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    if (!username)
        return res.json({ msg: "Username is required", success: false });
    try {
        const user = yield (0, helper_functions_1.getStudentDetails)(username);
        res.json(user ? { student: user, success: true } : { msg: "Student not found", success: false });
    }
    catch (error) {
        res.json({ msg: "Internal Server Error Please Try again!", success: false });
    }
}));
exports.studentRouter.put("/updatedetails", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, name, gender, fatherName, motherName, fatherOccupation, motherOccupation, fatherEmail, motherEmail, fatherAddress, motherAddress, bloodGroup, dateOfBirth, isDisabled, password, phoneNumber, fatherPhoneNumber, motherPhoneNumber, address, year, branch, section, roomno, } = req.body;
    if (!username)
        return res.json({ msg: "Username is required", success: false });
    try {
        // Fetch current student to check if username is changing
        const currentStudent = yield client.student.findUnique({
            where: { Username: username.toLowerCase() },
            select: { Username: true, Email: true },
        });
        if (!currentStudent)
            return res.json({ msg: "Student not found", success: false });
        // Prepare update data, mapping camelCase to PascalCase schema fields
        const updateData = {};
        if (name !== undefined && name !== null)
            updateData.Name = name;
        if (gender !== undefined && gender !== null)
            updateData.Gender = gender;
        if (fatherName !== undefined && fatherName !== null)
            updateData.FatherName = fatherName;
        if (motherName !== undefined && motherName !== null)
            updateData.MotherName = motherName;
        if (fatherOccupation !== undefined && fatherOccupation !== null)
            updateData.FatherOccupation = fatherOccupation;
        if (motherOccupation !== undefined && motherOccupation !== null)
            updateData.MotherOccupation = motherOccupation;
        if (fatherEmail !== undefined && fatherEmail !== null)
            updateData.FatherEmail = fatherEmail;
        if (motherEmail !== undefined && motherEmail !== null)
            updateData.MotherEmail = motherEmail;
        if (fatherAddress !== undefined && fatherAddress !== null)
            updateData.FatherAddress = fatherAddress;
        if (motherAddress !== undefined && motherAddress !== null)
            updateData.MotherAddress = motherAddress;
        if (bloodGroup !== undefined && bloodGroup !== null)
            updateData.BloodGroup = bloodGroup;
        if (dateOfBirth !== undefined && dateOfBirth !== null)
            updateData.DateOfBirth = new Date(dateOfBirth);
        if (isDisabled !== undefined && isDisabled !== null)
            updateData.isDisabled = isDisabled;
        if (password !== undefined && password !== null)
            updateData.Password = password;
        if (phoneNumber !== undefined && phoneNumber !== null)
            updateData.PhoneNumber = phoneNumber;
        if (fatherPhoneNumber !== undefined && fatherPhoneNumber !== null)
            updateData.FatherPhoneNumber = fatherPhoneNumber;
        if (motherPhoneNumber !== undefined && motherPhoneNumber !== null)
            updateData.MotherPhoneNumber = motherPhoneNumber;
        if (address !== undefined && address !== null)
            updateData.Address = address;
        if (year !== undefined && year !== null)
            updateData.Year = year;
        if (branch !== undefined && branch !== null)
            updateData.Branch = branch;
        if (section !== undefined && section !== null)
            updateData.Section = section;
        if (roomno !== undefined && roomno !== null)
            updateData.Roomno = roomno;
        // Handle username change and email sync
        let newEmail = currentStudent.Email;
        if (username !== currentStudent.Username) {
            // Check if new username is unique
            const existingUser = yield client.student.findUnique({
                where: { Username: username.toLowerCase() },
            });
            if (existingUser && existingUser.Username !== currentStudent.Username) {
                return res.json({ msg: "Username already taken", success: false });
            }
            updateData.Username = username.toLowerCase();
            newEmail = `${username.toLowerCase()}@rguktong.ac.in`;
            updateData.Email = newEmail;
        }
        // Perform the update
        const user = yield client.student.update({
            where: { Username: currentStudent.Username },
            data: updateData,
            select: { id: true, Username: true, Email: true, Name: true },
        });
        // Send email notification
        yield (0, helper_functions_1.sendEmail)(user.Email, "Account details updated", `Your account details have been updated successfully. (now)`);
        res.json({
            student: { _id: user.id, username: user.Username, email: user.Email, name: user.Name },
            success: true,
        });
    }
    catch (error) {
        console.error(error);
        res.json({ msg: "Internal Server Error. Please try again!", success: false });
    }
}));
exports.studentRouter.post('/getgrades', middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { username, semesterId } = req.body;
    if (!username || !semesterId)
        return res.json({ msg: 'Username and semesterId are required', success: false });
    try {
        const user = yield client.student.findFirst({
            where: { Username: username.toLowerCase() },
            select: { id: true, Username: true, Year: true, Branch: true, grades: { where: { semesterId }, include: { subject: { select: { name: true } } } } }
        });
        if (!user)
            return res.json({ msg: 'Student not found', success: false });
        const semester = yield client.semester.findUnique({
            where: { id: semesterId },
            select: { name: true, year: true }
        });
        // console.log('semester:', semester);
        if (!semester)
            return res.json({ msg: 'Semester not found', success: false });
        const subjects = yield client.subject.findMany({
            where: { semesterId, branch: { name: user.Branch } },
            select: { name: true }
        });
        const gradeToLetter = (grade) => grade == 10 ? 'Ex' : grade == 9 ? 'A' : grade == 8 ? 'B' : grade == 7 ? 'C' : grade == 6 ? 'D' : grade == 5 ? 'E' : 'R';
        const gradeToPoints = { 'Ex': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'R': 0 };
        // console.log(user.grades)
        // Map grades to letter grades
        const gradeData = Object.fromEntries(subjects.map(subject => {
            var _a;
            return [
                subject.name,
                ((_a = user.grades.find(g => g.subject.name === subject.name)) === null || _a === void 0 ? void 0 : _a.grade)
                    //@ts-ignore
                    ? gradeToLetter(user.grades.find(g => g.subject.name === subject.name).grade)
                    : ''
            ];
        }));
        // GPA Calculation
        let gpaResult;
        const yearKey = semester.year; // e.g., 'E1'
        const semesterKey = semester.name; // e.g., 'Sem - 1'
        const branchKey = user.Branch; // e.g., 'CSE'
        if ((_b = (_a = helper_functions_1.subjectsData[yearKey]) === null || _a === void 0 ? void 0 : _a[semesterKey]) === null || _b === void 0 ? void 0 : _b[branchKey]) {
            const data = helper_functions_1.subjectsData[yearKey][semesterKey][branchKey];
            console.log('data:', data);
            let totalCreditsObtained = 0;
            let totalCredits = 0;
            let hasRemedial = null;
            subjects.forEach((subject, index) => {
                const gradeLetter = gradeData[subject.name];
                const credit = data.credits[index] || 0;
                if (gradeLetter === 'R') {
                    hasRemedial = subject.name;
                }
                if (gradeLetter && gradeLetter !== '' && gradeLetter !== 'R') {
                    totalCreditsObtained += (gradeToPoints[gradeLetter] || 0) * credit;
                    totalCredits += credit;
                }
            });
            if (hasRemedial) {
                gpaResult = `You have a remedial in ${hasRemedial}`;
            }
            else if (totalCredits > 0) {
                const gpa = (totalCreditsObtained / totalCredits).toFixed(2);
                gpaResult = parseFloat(gpa);
            }
            else {
                gpaResult = null; // No grades available
            }
        }
        else {
            gpaResult = null; // Invalid year/semester/branch
        }
        res.json({
            year: semester.year,
            semester: semester.name,
            grade_data: gradeData,
            gpa: gpaResult,
            success: true
        });
    }
    catch (error) {
        console.error(error);
        res.json({ msg: 'Internal Server Error', success: false });
    }
}));
exports.studentRouter.post('/getattendance', middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    if (!username || typeof username !== 'string')
        return res.status(400).json({ msg: 'Username is required and must be a string', success: false });
    try {
        const user = yield client.student.findFirst({
            where: { Username: username.toLowerCase() },
            select: {
                id: true,
                Username: true,
                Branch: true,
                attendance: { include: { subject: { select: { name: true } }, semester: { select: { id: true, name: true, year: true } } } }
            }
        });
        if (!user)
            return res.status(404).json({ msg: 'Student not found', success: false });
        const semesters = yield client.semester.findMany({ select: { id: true, name: true, year: true } });
        const subjectsBySemester = yield client.subject.findMany({ where: { branch: { name: user.Branch } }, select: { id: true, name: true, semesterId: true } });
        const subjectsMap = subjectsBySemester.reduce((acc, subject) => (Object.assign(Object.assign({}, acc), { [subject.semesterId]: [...(acc[subject.semesterId] || []), subject] })), {});
        const attendanceData = semesters.reduce((acc, semester) => {
            var _a, _b;
            const year = semester.year;
            const semName = semester.name;
            if (!acc[year])
                acc[year] = {};
            const subjectData = (_b = (_a = helper_functions_1.subjectsData[year]) === null || _a === void 0 ? void 0 : _a[semName]) === null || _b === void 0 ? void 0 : _b[user.Branch];
            const expectedSubjects = subjectData ? subjectData.names.map((name, i) => ({ name, index: i })).filter((subject, i) => subject.name && (!subjectData.hide || !subjectData.hide.includes(i + 1))).map(subject => subject.name) : [];
            const semesterSubjects = (subjectsMap[semester.id] || []).filter(subject => expectedSubjects.includes(subject.name));
            const subjectAttendanceData = semesterSubjects.reduce((subAcc, subject) => {
                const subjectAttendance = user.attendance.find(att => att.subject.name === subject.name && att.semesterId === semester.id);
                const totalClasses = subjectAttendance ? subjectAttendance.totalClasses : 0;
                const classesAttended = subjectAttendance ? subjectAttendance.attendedClasses : 0;
                const attendancePercentage = totalClasses > 0 ? ((classesAttended / totalClasses) * 100).toFixed(1) : '0.0';
                return Object.assign(Object.assign({}, subAcc), { [subject.name]: { totalClasses, classesAttended, attendancePercentage } });
            }, {});
            //@ts-ignore
            const semesterTotalClasses = Object.values(subjectAttendanceData).reduce((sum, data) => sum + data.totalClasses, 0);
            //@ts-ignore
            const semesterClassesAttended = Object.values(subjectAttendanceData).reduce((sum, data) => sum + data.classesAttended, 0);
            //@ts-ignore
            const semesterAttendancePercentage = semesterTotalClasses > 0 ? ((semesterClassesAttended / semesterTotalClasses) * 100).toFixed(1) : '0.0';
            acc[year][semName] = { subjects: subjectAttendanceData, totalClasses: semesterTotalClasses, classesAttended: semesterClassesAttended, attendancePercentage: semesterAttendancePercentage };
            return acc;
        }, {});
        res.status(200).json({ attendance_data: attendanceData, success: true });
    }
    catch (error) {
        console.error('Error in /getattendance route:', error);
        res.status(500).json({ msg: 'Internal Server Error', success: false, error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
}));
