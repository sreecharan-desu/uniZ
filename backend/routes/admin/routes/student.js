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
exports.studentAdminRouter = void 0;
const express_1 = require("express");
const uuid_1 = require("uuid");
const exceljs_1 = __importDefault(require("exceljs"));
const prisma_service_1 = __importDefault(require("../../services/prisma.service"));
const middlewares_1 = require("../../student/middlewares/middlewares");
const progress_1 = __importDefault(require("../utils/progress"));
const admin_service_1 = require("../../services/admin.service");
const student_service_1 = require("../../services/student.service");
exports.studentAdminRouter = (0, express_1.Router)();
exports.studentAdminRouter.get("/getstudents", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = String(req.query.filter || "").trim();
        if (!filter)
            return res.status(400).json({ msg: "Filter is required", success: false });
        if (filter === "all") {
            const page = Math.max(parseInt(String(req.query.page || "1")), 1);
            const limit = Math.max(parseInt(String(req.query.limit || "5")), 1);
            const skip = (page - 1) * limit;
            const total = yield prisma_service_1.default.student.count();
            const students = yield (0, admin_service_1.getUsers)(skip, limit);
            return res.json({
                students,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
                msg: `Fetched ${students.length} students`,
                success: true,
            });
        }
        else if (filter === "names") {
            const students = yield prisma_service_1.default.student.findMany({ select: { id: true, Name: true } });
            return res.json({ students, msg: `Fetched ${students.length} students`, success: true });
        }
        else {
            const student = yield prisma_service_1.default.student.findUnique({
                where: { id: filter },
                select: {
                    id: true, Name: true, _count: true, Address: true, grades: true, attendance: true,
                    BloodGroup: true, Branch: true, createdAt: true, DateOfBirth: true, Email: true,
                    FatherAddress: true, FatherEmail: true, FatherName: true, FatherOccupation: true,
                },
            });
            if (!student)
                return res.status(404).json({ msg: `Student with ID ${filter} not found`, success: false });
            return res.json({ student, msg: `Fetched student ${student.Name}`, success: true });
        }
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ msg: "Error fetching students", success: false });
    }
}));
exports.studentAdminRouter.post("/searchstudent", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const username = String(req.body.username || "").trim();
        if (!username)
            return res.status(400).json({ msg: "username required", success: false });
        const suggestions = yield (0, admin_service_1.getStudentSuggestions)(username);
        const exactStudent = yield (0, student_service_1.getStudentDetails)(username);
        if (!suggestions.length && !exactStudent)
            return res.json({ success: false, msg: "No student found" });
        return res.json({ success: true, suggestions, student: exactStudent || null });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ msg: "Error fetching students", success: false });
    }
}));
exports.studentAdminRouter.get("/template", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const headers = [
            "ID NUMBER", "NAME OF THE STUDENT", "GENDER", "BRANCH", "BATCH",
            "MOBILE NUMBER", "FATHER'S NAME", "MOTHER'S NAME", "PARENT'S NUMBER",
            "BLOOD GROUP", "ADDRESS",
        ];
        const wb = new exceljs_1.default.Workbook();
        const ws = wb.addWorksheet("Student Template");
        ws.addRow(headers);
        ws.getRow(1).font = { bold: true };
        ws.getRow(1).alignment = { horizontal: "center" };
        ws.addRow(["RGUKT1234", "John Doe", "Male", "CSE", "2023", "9876543210", "Mr. Doe", "Mrs. Doe", "9123456789", "O+", "Ongole, AP"]);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=student_template.xlsx");
        yield wb.xlsx.write(res);
        res.end();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Failed to generate template", success: false });
    }
}));
exports.studentAdminRouter.post("/updatestudents", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const studentsInput = req.body;
        if (!Array.isArray(studentsInput) || !studentsInput.length)
            return res.status(400).json({ msg: "Invalid input", success: false });
        const processId = (0, uuid_1.v4)();
        progress_1.default.set(processId, {
            totalRecords: studentsInput.length,
            processedRecords: 0,
            failedRecords: [],
            status: "pending",
            startTime: new Date(),
        });
        (() => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            let processed = 0;
            const failed = [];
            for (const studentData of studentsInput) {
                try {
                    yield (0, admin_service_1.addStudent)(studentData);
                    processed++;
                }
                catch (err) {
                    failed.push({ id: studentData["ID NUMBER"], reason: (_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : err });
                }
                const p = progress_1.default.get(processId);
                if (p) {
                    p.processedRecords = processed;
                    p.failedRecords = failed;
                }
            }
            const p = progress_1.default.get(processId);
            if (p) {
                p.status = "completed";
                p.endTime = new Date();
                setTimeout(() => progress_1.default.delete(processId), 10 * 60 * 1000);
            }
        }))();
        return res.status(202).json({
            msg: `Processing ${studentsInput.length} students`,
            processId,
            success: true,
            templateDownload: "/api/v1/admin/students/template",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Unexpected error", success: false });
    }
}));
