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
exports.adminRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const client_1 = require("@prisma/client");
const middlewares_1 = require("./middlewares/middlewares");
const middlewares_2 = require("../student/middlewares/middlewares");
const client = new client_1.PrismaClient();
const helper_functions_1 = require("../helper-functions");
exports.adminRouter = (0, express_1.Router)();
exports.adminRouter.post("/signin", middlewares_1.validateSigninInputs, middlewares_1.fetchAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.body;
        if (!process.env.JWT_SECURITY_KEY)
            throw new Error("JWT_SECURITY_KEY is not defined");
        const token = jsonwebtoken_1.default.sign(username, process.env.JWT_SECURITY_KEY);
        res.json({ admin_token: token, success: true });
    }
    catch (e) {
        res.json({ msg: "Internal Server Error Please Try again!", success: false });
    }
}));
exports.adminRouter.put("/resetpass", middlewares_2.validateResetPassInputs, middlewares_1.fetchAdmin, middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, new_password } = req.body;
    try {
        const isUpdated = yield (0, helper_functions_1.updateAdminPassword)(username, new_password);
        res.json({
            msg: isUpdated ? "Password updated successfully! Signin again with your new Password for authentication!" : "Error updating password Please try again!",
            success: isUpdated,
        });
    }
    catch (e) {
        res.json({ msg: "Error updating password Please try again!", success: false });
    }
}));
exports.adminRouter.get("/getoutpassrequests", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield (0, helper_functions_1.getOutPassRequests)();
        res.json({ outpasses: requests, success: true });
    }
    catch (e) {
        res.json({ msg: "Error : Fething requests Try again!", success: true });
    }
}));
exports.adminRouter.get("/getoutingrequests", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield (0, helper_functions_1.getOutingRequests)();
        res.json({ outings: requests, success: true });
    }
    catch (e) {
        res.json({ msg: "Error : Fething requests Try again!", success: true });
    }
}));
exports.adminRouter.get("/getstudents", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = req.query.filter;
        // Check if filter is provided
        if (!filter) {
            return res.json({ msg: "Filter is required", success: false });
        }
        if (filter === "all") {
            const students = yield (0, helper_functions_1.getUsers)(); // Assumes getUsers() is defined elsewhere
            res.json({ students, msg: `Successfully fetched ${students.length} students`, success: true });
        }
        else if (filter === "names") {
            const students = yield client.student.findMany({ select: { id: true, Name: true } });
            res.json({ students, msg: `Successfully fetched ${students.length} students`, success: true });
        }
        else {
            // Treat filter as a student ID
            const student = yield client.student.findUnique({ where: { id: filter }, select: { id: true, Name: true } });
            if (student) {
                res.json({ student, msg: `Successfully fetched student ${student.Name}`, success: true });
            }
            else {
                res.json({ msg: `Student with ID ${filter} not found`, success: false });
            }
        }
    }
    catch (e) {
        console.log(e);
        res.json({ msg: "Error: Fetching students. Please try again!", success: false });
    }
}));
//  ----------------------------------------------------------------------------------   //  Outpass and Outing Approvals  ----------------------------------------------------------------------------------   //
exports.adminRouter.post("/approveoutpass", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const outpass = yield (0, helper_functions_1.approveOutpass)(id);
        if (outpass === null || outpass === void 0 ? void 0 : outpass.success) {
            const outpassData = yield client.outpass.findFirst({ where: { id }, select: { Student: { select: { Email: true } }, ToDay: true } });
            const email = outpassData === null || outpassData === void 0 ? void 0 : outpassData.Student.Email;
            if (email) {
                const outPassEmailBody = `<!DOCTYPE html><html><head><style>body {font-family: Arial, sans-serif;color: #333;background-color: #f4f4f4;margin: 0;padding: 20px;}.container {background-color: #ffffff;border-radius: 8px;padding: 20px;max-width: 600px;margin: 0 auto;box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);}h1 {color: #4CAF50;font-size: 24px;margin-top: 0;}p {font-size: 16px;line-height: 1.6;margin: 10px 0;}.details {margin-top: 20px;padding: 15px;border: 1px solid #ddd;border-radius: 5px;background-color: #f9f9f9;}.details p {margin: 5px 0;}.footer {margin-top: 20px;font-size: 14px;color: #888;}</style></head><body><div class="container"><h1>Your Outpass Request Has been Approved!</h1><p>Your outpass request with ID: <strong>${id}</strong> has been Approved!</p><div class="details"><p><strong> You should return to campus on ${outpassData.ToDay.toLocaleDateString()}</strong></p></div><div class="footer"><p>Thank you for your patience.</p><p>Best regards,<br>uniZ</p></div></div></body></html>`;
                yield (0, helper_functions_1.sendEmail)(email, "Regarding your OutpassRequest", outPassEmailBody);
            }
        }
        res.json({ msg: outpass.msg, success: outpass.success });
    }
    catch (e) {
        res.json({ msg: "Error approving outpass Please Try again!", success: false });
    }
}));
exports.adminRouter.post("/approveouting", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const outing = yield (0, helper_functions_1.approveOuting)(id);
        if (outing === null || outing === void 0 ? void 0 : outing.success) {
            const outingData = yield client.outing.findFirst({ where: { id }, select: { Student: { select: { Email: true } }, ToTime: true } });
            const email = outingData === null || outingData === void 0 ? void 0 : outingData.Student.Email;
            if (email) {
                const outPassEmailBody = `<!DOCTYPE html><html><head><style>body {font-family: Arial, sans-serif;color: #333;background-color: #f4f4f4;margin: 0;padding: 20px;}.container {background-color: #ffffff;border-radius: 8px;padding: 20px;max-width: 600px;margin: 0 auto;box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);}h1 {color: #4CAF50;font-size: 24px;margin-top: 0;}p {font-size: 16px;line-height: 1.6;margin: 10px 0;}.details {margin-top: 20px;padding: 15px;border: 1px solid #ddd;border-radius: 5px;background-color: #f9f9f9;}.details p {margin: 5px 0;}.footer {margin-top: 20px;font-size: 14px;color: #888;}</style></head><body><div class="container"><h1>Your Outing Request Has been Approved!</h1><p>Your outing request with ID: <strong>${id}</strong> has been Approved!</p><div class="details"><p><strong> You should return to campus by ${outingData.ToTime.toLocaleTimeString()}</strong></p></div><div class="footer"><p>Thank you for your patience.</p><p>Best regards,<br>uniZ</p></div></div></body></html>`;
                yield (0, helper_functions_1.sendEmail)(email, "Regarding your OutingRequest", outPassEmailBody);
            }
        }
        res.json({ msg: outing.msg, success: outing.success });
    }
    catch (e) {
        res.json({ msg: "Error approving outing Please Try again!", success: false });
    }
}));
exports.adminRouter.post("/rejectouting", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const outing = yield (0, helper_functions_1.rejectOuting)(id);
        if (outing === null || outing === void 0 ? void 0 : outing.success) {
            const outingData = yield client.outing.findFirst({ where: { id }, select: { Student: { select: { Email: true } }, Message: true, rejectedBy: true, rejectedTime: true } });
            const email = outingData === null || outingData === void 0 ? void 0 : outingData.Student.Email;
            if (email) {
                const outPassEmailBody = `<!DOCTYPE html><html><head><style>body {font-family: Arial, sans-serif;color: #333;background-color: #f4f4f4;margin: 0;padding: 20px;}.container {background-color: #ffffff;border-radius: 8px;padding: 20px;max-width: 600px;margin: 0 auto;box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);}h1 {color:red;font-size: 24px;margin-top: 0;}p {font-size: 16px;line-height: 1.6;margin: 10px 0;}.details {margin-top: 20px;padding: 15px;border: 1px solid #ddd;border-radius: 5px;background-color: #f9f9f9;}.details p {margin: 5px 0;}.footer {margin-top: 20px;font-size: 14px;color: #888;}</style></head><body><div class="container"><h1>Your Outing Request Has been Rejected!</h1><p>Your outing request with ID: <strong>${id}</strong> has been <b>Rejected!</b></p><div class="details"><p><strong>Rejected by : ${outingData.rejectedBy}</strong></p><p><strong>Rejected Time : ${outingData.rejectedTime}</strong></p><p><strong>Message : ${outingData.Message}</strong></p></div><div class="footer"><p>Thank you for your patience.</p><p>Best regards,<br>uniZ</p></div></div></body></html>`;
                yield (0, helper_functions_1.sendEmail)(email, "Regarding your OutingRequest", outPassEmailBody);
            }
        }
        res.json({ msg: outing.msg, success: outing.success });
    }
    catch (e) {
        res.json({ msg: "Error rejecting outing Please Try again!", success: false });
    }
}));
exports.adminRouter.post("/rejectoutpass", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const outpass = yield (0, helper_functions_1.rejectOutpass)(id);
        if (outpass === null || outpass === void 0 ? void 0 : outpass.success) {
            const outpassData = yield client.outpass.findFirst({ where: { id }, select: { Student: { select: { Email: true } }, Message: true, rejectedBy: true, rejectedTime: true } });
            const email = outpassData === null || outpassData === void 0 ? void 0 : outpassData.Student.Email;
            if (email) {
                const outPassEmailBody = `<!DOCTYPE html><html><head><style>body {font-family: Arial, sans-serif;color: #333;background-color: #f4f4f4;margin: 0;padding: 20px;}.container {background-color: #ffffff;border-radius: 8px;padding: 20px;max-width: 600px;margin: 0 auto;box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);}h1 {color: red;font-size: 24px;margin-top: 0;}p {font-size: 16px;line-height: 1.6;margin: 10px 0;}.details {margin-top: 20px;padding: 15px;border: 1px solid #ddd;border-radius: 5px;background-color: #f9f9f9;}.details p {margin: 5px 0;}.footer {margin-top: 20px;font-size: 14px;color: #888;}</style></head><body><div class="container"><h1>Your Outpass Request Has been Rejected!</h1><p>Your outpass request with ID: <strong>${id}</strong> has been <b>Rejected!</b></p><div class="details"><p><strong>Rejected by : ${outpassData.rejectedBy}</strong></p><p><strong>Rejected Time : ${outpassData.rejectedTime}</strong></p><p><strong>Message : ${outpassData.Message}</strong></p></div><div class="footer"><p>Thank you for your patience.</p><p>Best regards,<br>uniZ</p></div></div></body></html>`;
                yield (0, helper_functions_1.sendEmail)(email, "Regarding your OutPassRequest", outPassEmailBody);
            }
        }
        res.json({ msg: outpass.msg, success: outpass.success });
    }
    catch (e) {
        res.json({ msg: "Error rejecting outpass Please Try again!", success: false });
    }
}));
exports.adminRouter.get("/getstudentsoutsidecampus", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const students = yield (0, helper_functions_1.getStudentsOutsideCampus)();
        res.json({ students, success: true });
    }
    catch (e) {
        res.json({ msg: "Error fetching students", success: false });
    }
}));
exports.adminRouter.post("/updatestudentstatus", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, id } = req.body;
        const student = yield (0, helper_functions_1.updateUserPrescence)(userId, id);
        res.json({ msg: student.msg, success: student.success });
    }
    catch (e) {
        res.json({ msg: "Error fetching students", success: false });
    }
}));
const progressStore = new Map();
exports.adminRouter.post('/searchstudent', middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.body;
        const student = yield (0, helper_functions_1.getStudentDetails)(username);
        res.json(student ? { student, success: true } : { msg: "No student found with idnumber : " + username, success: false });
    }
    catch (e) {
        res.json({ msg: "Error fetching students", success: false });
    }
}));
exports.adminRouter.get("/updatestudents-progress", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { processId } = req.query;
        if (!processId || typeof processId !== 'string')
            return res.status(400).json({ msg: "Missing or invalid processId", success: false });
        const progress = progressStore.get(processId);
        if (!progress)
            return res.status(404).json({ msg: `No upload process found for processId: ${processId}`, success: false });
        const percentage = progress.totalRecords > 0 ? ((progress.processedRecords / progress.totalRecords) * 100).toFixed(2) : 0;
        //@ts-ignore
        res.status(200).json({ processId, totalRecords: progress.totalRecords, processedRecords: progress.processedRecords, failedRecords: progress.failedRecords, percentage: parseFloat(percentage), status: progress.status, success: true });
    }
    catch (error) {
        console.error("Error in /updatestudents-progress route:", error);
        res.status(500).json({ msg: "Unexpected error", success: false });
    }
}));
exports.adminRouter.post('/updatestudents', middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const students = req.body;
    if (!Array.isArray(students))
        return res.json({ msg: 'Input JSON format does not match required structure', success: false });
    const requiredKeys = ['ID NUMBER', 'NAME OF THE STUDENT', 'GENDER', 'BRANCH', 'BATCH', 'MOBILE NUMBER', "FATHER'S NAME", "MOTHER'S NAME", "PARENT'S NUMBER", 'BLOOD GROUP', 'ADDRESS'];
    for (const student of students) {
        if (typeof student !== 'object' || !requiredKeys.every(key => student[key] && typeof student[key] === 'string'))
            return res.json({ msg: 'Input JSON format does not match required structure', success: false });
    }
    if (!students.length)
        return res.json({ msg: 'Input data is empty', success: false });
    try {
        const processId = (0, uuid_1.v4)();
        progressStore.set(processId, { totalRecords: students.length, processedRecords: 0, failedRecords: [], status: 'pending', startTime: new Date() });
        (() => __awaiter(void 0, void 0, void 0, function* () {
            let records = 0;
            const failedRecords = [];
            for (const student of students) {
                try {
                    yield (0, helper_functions_1.addStudent)(student['ID NUMBER'], student['NAME OF THE STUDENT'], student['GENDER'], student['BRANCH'], student['BATCH'], student['MOBILE NUMBER'], student["FATHER'S NAME"], student["MOTHER'S NAME"], student["PARENT'S NUMBER"], student['BLOOD GROUP'], student['ADDRESS']);
                    records++;
                    const progress = progressStore.get(processId);
                    if (progress)
                        progress.processedRecords = records;
                }
                catch (err) {
                    console.error(`Failed to insert record (ID: ${student['ID NUMBER']}):`, err);
                    failedRecords.push({ id: student['ID NUMBER'], reason: err });
                    const progress = progressStore.get(processId);
                    if (progress)
                        progress.failedRecords = failedRecords;
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
        }))();
        res.status(202).json({ msg: `Processing ${students.length} student(s) in the background`, processId, success: true });
    }
    catch (error) {
        console.error('Unexpected error in /updatestudents route:', error);
        res.status(500).json({ msg: 'Unexpected error', success: false });
    }
}));
exports.adminRouter.post('/addgrades', middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const data = req.body;
    const validationErrors = (0, helper_functions_1.validateInput)(data);
    if (validationErrors.length > 0)
        return res.status(400).json({ msg: 'Input JSON format does not match required structure', success: false, errors: validationErrors });
    try {
        const processId = (0, uuid_1.v4)();
        progressStore.set(processId, { totalRecords: data.Students.length, processedRecords: 0, failedRecords: [], status: 'pending', startTime: new Date() });
        const [year, name] = data.SemesterName.split('*');
        const semester = yield client.semester.findFirst({ where: { year, name }, select: { id: true } });
        if (!semester)
            return res.status(400).json({ msg: `Semester "${data.SemesterName}" not found in database`, success: false });
        let processedRecords = 0;
        const failedRecords = [];
        const processingErrors = [];
        for (const [index, record] of data.Students.entries()) {
            try {
                const { Username, Grades } = record;
                const student = yield client.student.findFirst({ where: { Username: Username.toLowerCase() }, select: { id: true, Branch: true } });
                if (!student) {
                    failedRecords.push({ username: Username, recordIndex: index, reason: 'Student not found in database' });
                    processingErrors.push({ recordIndex: index, message: `Student "${Username}" not found in database` });
                    continue;
                }
                const subjectData = (_b = (_a = helper_functions_1.subjectsData[year]) === null || _a === void 0 ? void 0 : _a[name]) === null || _b === void 0 ? void 0 : _b[student.Branch];
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
                const branch = yield client.branch.findFirstOrThrow({ where: { name: student.Branch } });
                const branchId = branch.id;
                yield client.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                    for (const [gradeIndex, { SubjectName, Grade }] of Grades.entries()) {
                        const isElective = SubjectName.includes('Elective') || SubjectName.includes('MOOC');
                        let subject;
                        if (isElective) {
                            subject = yield tx.subject.findFirst({ where: { name: SubjectName, semesterId: semester.id, branchId }, select: { id: true } });
                            if (!subject) {
                                const creditIndex = subjectData.names.indexOf(SubjectName);
                                const credits = creditIndex !== -1 ? subjectData.credits[creditIndex] : 3;
                                subject = yield tx.subject.create({ data: { id: (0, uuid_1.v4)(), name: SubjectName, credits, branchId, semesterId: semester.id }, select: { id: true } });
                            }
                        }
                        else {
                            subject = yield tx.subject.findFirst({ where: { name: SubjectName, semesterId: semester.id, branchId }, select: { id: true } });
                            if (!subject) {
                                failedRecords.push({ username: Username, recordIndex: index, gradeIndex, reason: `Subject "${SubjectName}" not found for semester "${data.SemesterName}" and branch "${student.Branch}"` });
                                processingErrors.push({ recordIndex: index, gradeIndex, message: `Subject "${SubjectName}" not found for semester "${data.SemesterName}" and branch "${student.Branch}"` });
                                continue;
                            }
                        }
                        const numericGrade = (0, helper_functions_1.convertLetterToNumericGrade)(Grade);
                        if (numericGrade === null) {
                            failedRecords.push({ username: Username, recordIndex: index, gradeIndex, reason: `Invalid grade "${Grade}" for subject "${SubjectName}"` });
                            processingErrors.push({ recordIndex: index, gradeIndex, message: `Invalid grade "${Grade}" for subject "${SubjectName}"` });
                            continue;
                        }
                        yield tx.grade.upsert({ where: { studentId_subjectId_semesterId: { studentId: student.id, subjectId: subject.id, semesterId: semester.id } }, update: { grade: numericGrade }, create: { studentId: student.id, subjectId: subject.id, semesterId: semester.id, grade: numericGrade } });
                    }
                }));
                processedRecords++;
            }
            catch (error) {
                console.error(`Failed to process record ${index} for username ${record.Username}:`, error);
                failedRecords.push({ username: record.Username, recordIndex: index, reason: error.message || 'Unexpected error during processing' });
                processingErrors.push({ recordIndex: index, message: error.message || 'Unexpected error', stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
            }
            const progress = progressStore.get(processId);
            if (progress) {
                progress.processedRecords = processedRecords;
                progress.failedRecords = failedRecords;
                progress.errors = processingErrors;
            }
        }
        const progress = progressStore.get(processId);
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
    }
    catch (error) {
        console.error('Unexpected error in /addgrades route:', error);
        res.status(500).json({ msg: 'Internal Server Error', success: false, error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
}));
exports.adminRouter.post('/addattendance', middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const validationErrors = (0, helper_functions_1.validateInputForAttendance)(data);
    if (validationErrors.length > 0)
        return res.status(400).json({ msg: 'Input JSON format does not match required structure', success: false, errors: validationErrors });
    try {
        const processId = (0, uuid_1.v4)();
        progressStore.set(processId, { totalRecords: data.data.length, processedRecords: 0, failedRecords: [], status: 'pending', startTime: new Date() });
        const [year, name] = data.SemesterName.split('*');
        const semester = yield client.semester.findFirst({ where: { year, name }, select: { id: true } });
        if (!semester)
            return res.status(400).json({ msg: `Semester "${data.SemesterName}" not found in database`, success: false });
        (() => __awaiter(void 0, void 0, void 0, function* () {
            var _c, _d;
            let processedRecords = 0;
            const failedRecords = [];
            const processingErrors = [];
            for (const [index, record] of data.data.entries()) {
                try {
                    const { IdNumber, no_of_classes_happened, no_of_classes_attended } = record;
                    const student = yield client.student.findFirst({ where: { id: IdNumber.toLowerCase() }, select: { id: true, Branch: true } });
                    if (!student) {
                        failedRecords.push({ idNumber: IdNumber, recordIndex: index, reason: 'Student not found in database' });
                        processingErrors.push({ recordIndex: index, message: `Student "${IdNumber}" not found in database` });
                        continue;
                    }
                    const subjectData = (_d = (_c = helper_functions_1.subjectsData[year]) === null || _c === void 0 ? void 0 : _c[name]) === null || _d === void 0 ? void 0 : _d[student.Branch];
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
                    const branch = yield client.branch.findFirstOrThrow({ where: { name: student.Branch } });
                    const branchId = branch.id;
                    const happenedMap = new Map(no_of_classes_happened.map(cls => [cls.SubjectName, cls.Classes]));
                    const attendedMap = new Map(no_of_classes_attended.map(cls => [cls.SubjectName, cls.Classes]));
                    yield client.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                        for (const subjectName of happenedSubjectNames) {
                            const totalClasses = Number(happenedMap.get(subjectName)) || 0;
                            const attendedClasses = Number(attendedMap.get(subjectName)) || 0;
                            if (attendedClasses > totalClasses) {
                                failedRecords.push({ idNumber: IdNumber, recordIndex: index, reason: `Attended classes (${attendedClasses}) exceeds total classes (${totalClasses}) for subject "${subjectName}"` });
                                processingErrors.push({ recordIndex: index, message: `Attended classes (${attendedClasses}) exceeds total classes (${totalClasses}) for subject "${subjectName}"` });
                                continue;
                            }
                            const isElective = subjectName.includes('Elective') || subjectName.includes('MOOC');
                            let subject;
                            if (isElective) {
                                subject = yield tx.subject.findFirst({ where: { name: subjectName, semesterId: semester.id, branchId }, select: { id: true } });
                                if (!subject) {
                                    const creditIndex = subjectData.names.indexOf(subjectName);
                                    const credits = creditIndex !== -1 ? subjectData.credits[creditIndex] : 3;
                                    subject = yield tx.subject.create({ data: { id: (0, uuid_1.v4)(), name: subjectName, credits, branchId, semesterId: semester.id }, select: { id: true } });
                                }
                            }
                            else {
                                subject = yield tx.subject.findFirst({ where: { name: subjectName, semesterId: semester.id, branchId }, select: { id: true } });
                                if (!subject) {
                                    failedRecords.push({ idNumber: IdNumber, recordIndex: index, reason: `Subject "${subjectName}" not found for semester "${data.SemesterName}" and branch "${student.Branch}"` });
                                    processingErrors.push({ recordIndex: index, message: `Subject "${subjectName}" not found for semester "${data.SemesterName}" and branch "${student.Branch}"` });
                                    continue;
                                }
                            }
                            yield tx.attendance.upsert({ where: { studentId_subjectId_semesterId: { studentId: student.id, subjectId: subject.id, semesterId: semester.id } }, update: { totalClasses, attendedClasses }, create: { studentId: student.id, subjectId: subject.id, semesterId: semester.id, totalClasses, attendedClasses } });
                        }
                    }));
                    processedRecords++;
                }
                catch (error) {
                    console.error(`Failed to process record ${index} for idNumber ${record.IdNumber}:`, error);
                    failedRecords.push({ idNumber: record.IdNumber, recordIndex: index, reason: error.message || 'Unexpected error during processing' });
                    processingErrors.push({ recordIndex: index, message: error.message || 'Unexpected error', stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
                }
                const progress = progressStore.get(processId);
                if (progress) {
                    progress.processedRecords = processedRecords;
                    progress.failedRecords = failedRecords;
                    progress.errors = processingErrors;
                }
            }
            const progress = progressStore.get(processId);
            if (progress) {
                progress.processedRecords = processedRecords;
                progress.failedRecords = failedRecords;
                progress.errors = processingErrors;
                progress.status = failedRecords.length === data.data.length ? 'failed' : 'completed';
                progress.endTime = new Date();
                setTimeout(() => progressStore.delete(processId), 5 * 60 * 1000);
            }
            console.log(`Process completed: ${processedRecords} successful, ${failedRecords.length} failed`);
        }))();
        res.status(202).json({ msg: `Processing ${data.data.length} student attendance records in the background`, processId, success: true });
    }
    catch (error) {
        console.error('Unexpected error in /addattendance route:', error);
        res.status(500).json({ msg: 'Internal Server Error', success: false, error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
}));
exports.adminRouter.post('/populate-curriculum', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const branches = ['CSE', 'ECE', 'EEE', 'CIVIL', 'MECH'];
        for (const branchName of branches) {
            yield client.branch.upsert({ where: { name: branchName }, update: { name: branchName }, create: { name: branchName } });
        }
        for (const year in helper_functions_1.subjectsData) {
            for (const semesterName in helper_functions_1.subjectsData[year]) {
                const semester = yield client.semester.upsert({ where: { name_year: { name: semesterName, year } }, update: { name: semesterName, year }, create: { name: semesterName, year } });
                for (const branchName in helper_functions_1.subjectsData[year][semesterName]) {
                    const branch = yield client.branch.findUnique({ where: { name: branchName } });
                    if (!branch)
                        throw new Error(`Branch ${branchName} not found`);
                    const { names, credits } = helper_functions_1.subjectsData[year][semesterName][branchName];
                    for (let i = 0; i < names.length; i++) {
                        const subjectName = names[i];
                        const subjectCredits = credits[i];
                        if (!subjectName || subjectCredits === 0)
                            continue;
                        yield client.subject.upsert({ where: { name_branchId_semesterId: { name: subjectName, branchId: branch.id, semesterId: semester.id } }, update: { name: subjectName, credits: subjectCredits, branchId: branch.id, semesterId: semester.id }, create: { name: subjectName, credits: subjectCredits, branchId: branch.id, semesterId: semester.id } });
                    }
                }
            }
        }
        res.json({ msg: 'Curriculum data populated successfully', success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Internal Server Error', success: false });
    }
}));
