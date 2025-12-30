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
exports.attendanceRouter = void 0;
const express_1 = require("express");
const uuid_1 = require("uuid");
const prisma_service_1 = __importDefault(require("../../services/prisma.service"));
const progress_1 = __importDefault(require("../utils/progress"));
const utils_1 = require("../utils/utils");
const middlewares_1 = require("../../student/middlewares/middlewares");
exports.attendanceRouter = (0, express_1.Router)();
exports.attendanceRouter.post("/addattendance", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const validationErrors = (0, utils_1.validateAttendanceInput)(data);
        if (validationErrors === null || validationErrors === void 0 ? void 0 : validationErrors.length)
            return res.status(400).json({ msg: "Invalid input", success: false, errors: validationErrors });
        const { year, SemesterName } = data;
        // Format: Sem-1 or Sem - 1
        const [semWord, dashOrNum, semNumber] = SemesterName.replace("-", " - ").split(/\s+/).filter(Boolean);
        const formattedSemName = `${semWord} - ${semNumber || dashOrNum}`;
        const semester = yield prisma_service_1.default.semester.findFirst({
            where: { year, name: formattedSemName },
            select: { id: true },
        });
        if (!semester)
            return res.status(400).json({ msg: `Semester "${year} ${formattedSemName}" not found`, success: false });
        const studentsInput = data.Students;
        const processId = (0, uuid_1.v4)();
        progress_1.default.set(processId, {
            totalRecords: studentsInput.length,
            processedRecords: 0,
            errors: [],
            status: "pending",
            startTime: new Date(),
        });
        (() => __awaiter(void 0, void 0, void 0, function* () {
            let processedRecords = 0;
            const errors = [];
            for (const [index, studentData] of studentsInput.entries()) {
                try {
                    const student = yield prisma_service_1.default.student.findFirst({
                        where: { Username: studentData.IdNumber.toLowerCase() },
                        select: { id: true, Branch: true },
                    });
                    if (!student) {
                        errors.push({ recordIndex: index, message: `Student "${studentData.IdNumber}" not found` });
                        updateProgress(processedRecords, errors, processId);
                        continue;
                    }
                    const branch = yield prisma_service_1.default.branch.findFirst({ where: { name: student.Branch } });
                    if (!branch) {
                        errors.push({ recordIndex: index, message: `Branch "${student.Branch}" not found` });
                        updateProgress(processedRecords, errors, processId);
                        continue;
                    }
                    const existingSubjects = yield prisma_service_1.default.subject.findMany({ where: { semesterId: semester.id, branchId: branch.id } });
                    const subjMap = new Map(existingSubjects.map((s) => [s.name, s.id]));
                    for (const record of studentData.Attendance) {
                        const { SubjectName, ClassesHappened, ClassesAttended } = record;
                        if (!SubjectName || ClassesHappened == null || ClassesAttended == null)
                            continue;
                        let subjectId = subjMap.get(SubjectName);
                        if (!subjectId) {
                            const subj = yield (0, utils_1.getOrCreateSubject)(SubjectName, semester.id, branch.id, { names: [], credits: [] }, true);
                            if (!subj)
                                continue;
                            subjectId = subj.id;
                            subjMap.set(SubjectName, subjectId);
                        }
                        yield prisma_service_1.default.attendance.upsert({
                            where: { studentId_subjectId_semesterId: { studentId: student.id, subjectId, semesterId: semester.id } },
                            update: { attendedClasses: ClassesAttended, totalClasses: ClassesHappened },
                            create: { studentId: student.id, subjectId, semesterId: semester.id, attendedClasses: ClassesAttended, totalClasses: ClassesHappened },
                        });
                    }
                    processedRecords++;
                    updateProgress(processedRecords, errors, processId);
                }
                catch (err) {
                    errors.push({ recordIndex: index, message: err.message });
                    updateProgress(processedRecords, errors, processId);
                }
            }
            const p = progress_1.default.get(processId);
            if (p) {
                p.status = "completed";
                p.endTime = new Date();
                setTimeout(() => progress_1.default.delete(processId), 10 * 60 * 1000);
            }
        }))();
        return res.status(202).json({ msg: `Processing ${studentsInput.length} records`, processId, success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal Server Error", success: false });
    }
}));
function updateProgress(processedRecords, errors, processId) {
    const p = progress_1.default.get(processId);
    if (p) {
        p.processedRecords = processedRecords;
        p.errors = [...errors];
        p.failedRecords = errors.map((e) => ({ id: e.recordIndex, reason: e.message }));
    }
}
