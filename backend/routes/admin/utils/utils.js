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
exports.validateAttendanceInput = exports.validateGradesInput = exports.convertLetterToNumericGrade = void 0;
exports.getOrCreateSubject = getOrCreateSubject;
exports.chunkArray = chunkArray;
const uuid_1 = require("uuid");
const prisma_service_1 = __importDefault(require("../../services/prisma.service"));
/**
 * subjectCache holds Promise<{id: string} | null> to avoid race conditions across concurrent requests
 * key: `${name}_${semesterId}_${branchId}`
 */
const subjectCache = new Map();
function getOrCreateSubject(subjectName, semesterId, branchId, subjectData, isElective) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = `${subjectName}_${semesterId}_${branchId}`;
        if (subjectCache.has(key))
            return subjectCache.get(key);
        const p = (() => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const creditIndex = (_b = (_a = subjectData === null || subjectData === void 0 ? void 0 : subjectData.names) === null || _a === void 0 ? void 0 : _a.indexOf(subjectName)) !== null && _b !== void 0 ? _b : -1;
                const credits = creditIndex !== -1 && (subjectData === null || subjectData === void 0 ? void 0 : subjectData.credits) ? subjectData.credits[creditIndex] : 3;
                const subj = yield prisma_service_1.default.subject.upsert({
                    where: { name_branchId_semesterId: { name: subjectName, branchId, semesterId } },
                    update: { name: subjectName, credits, branchId, semesterId },
                    create: { id: (0, uuid_1.v4)(), name: subjectName, credits, branchId, semesterId },
                    select: { id: true },
                });
                return subj;
            }
            catch (err) {
                try {
                    const found = yield prisma_service_1.default.subject.findFirst({
                        where: { name: subjectName, semesterId, branchId },
                        select: { id: true },
                    });
                    if (found)
                        return found;
                    if (!isElective)
                        return null;
                    const created = yield prisma_service_1.default.subject.create({
                        data: { id: (0, uuid_1.v4)(), name: subjectName, credits: 3, branchId, semesterId },
                        select: { id: true },
                    });
                    return created;
                }
                catch (err2) {
                    console.error("getOrCreateSubject fallback error:", err2);
                    return null;
                }
            }
        }))();
        subjectCache.set(key, p);
        p.then((v) => {
            if (!v)
                subjectCache.delete(key);
        }).catch(() => {
            subjectCache.delete(key);
        });
        return p;
    });
}
function chunkArray(array, size) {
    const out = [];
    for (let i = 0; i < array.length; i += size)
        out.push(array.slice(i, i + size));
    return out;
}
const convertLetterToNumericGrade = (letterGrade) => {
    const gradeMap = { 'EX': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'R': 0 };
    return gradeMap[letterGrade.toUpperCase()] || null;
};
exports.convertLetterToNumericGrade = convertLetterToNumericGrade;
const validateGradesInput = (data) => {
    const errors = [];
    if (typeof data !== 'object' || data === null)
        return [{ message: 'Input must be a non-null object' }];
    if (!data.SemesterName || typeof data.SemesterName !== 'string')
        errors.push({ message: 'SemesterName must be a non-empty string' });
    if (!Array.isArray(data.Students))
        errors.push({ message: 'Students must be an array' });
    else if (data.Students.length === 0)
        errors.push({ message: 'Students array is empty' });
    else {
        data.Students.forEach((record, index) => {
            if (typeof record !== 'object' || record === null)
                errors.push({ recordIndex: index, message: 'Student record must be a non-null object' });
            if (!record.Username || typeof record.Username !== 'string')
                errors.push({ recordIndex: index, message: 'Username must be a non-empty string' });
            if (!Array.isArray(record.Grades))
                errors.push({ recordIndex: index, message: 'Grades must be an array' });
            else
                record.Grades.forEach((grade, gradeIndex) => {
                    if (typeof grade !== 'object' || grade === null)
                        errors.push({ recordIndex: index, gradeIndex, message: 'Grade entry must be a non-null object' });
                    if (!grade.SubjectName || typeof grade.SubjectName !== 'string')
                        errors.push({ recordIndex: index, gradeIndex, message: 'SubjectName must be a non-empty string' });
                    if (!grade.Grade || typeof grade.Grade !== 'string' || (0, exports.convertLetterToNumericGrade)(grade.Grade) === null)
                        errors.push({ recordIndex: index, gradeIndex, message: 'Grade must be a valid letter grade (Ex, A, B, C, D, E, R)' });
                });
        });
    }
    return errors;
};
exports.validateGradesInput = validateGradesInput;
const validateAttendanceInput = (data) => {
    const errors = [];
    if (typeof data !== 'object' || data === null)
        return [{ message: 'Input must be a non-null object' }];
    if (!data.SemesterName || typeof data.SemesterName !== 'string')
        errors.push({ message: 'SemesterName must be a non-empty string' });
    if (!Array.isArray(data.Students))
        errors.push({ message: 'Students must be an array' });
    else if (data.Students.length === 0)
        errors.push({ message: 'Students array is empty' });
    else {
        data.Students.forEach((record, index) => {
            if (typeof record !== 'object' || record === null)
                errors.push({ recordIndex: index, message: 'Student record must be a non-null object' });
            if (!record.IdNumber || typeof record.IdNumber !== 'string')
                errors.push({ recordIndex: index, message: 'IdNumber must be a non-empty string' });
            if (!Array.isArray(record.Attendance))
                errors.push({ recordIndex: index, message: 'Attendance must be an array' });
            else
                record.Attendance.forEach((att, attIndex) => {
                    if (typeof att !== 'object' || att === null)
                        errors.push({ recordIndex: index, attIndex, message: 'Attendance entry must be a non-null object' });
                    if (!att.SubjectName || typeof att.SubjectName !== 'string')
                        errors.push({ recordIndex: index, attIndex, message: 'SubjectName must be a non-empty string' });
                    if (typeof att.ClassesHappened !== 'number' || att.ClassesHappened < 0)
                        errors.push({ recordIndex: index, attIndex, message: 'ClassesHappened must be a non-negative integer' });
                    if (typeof att.ClassesAttended !== 'number' || att.ClassesAttended < 0)
                        errors.push({ recordIndex: index, attIndex, message: 'ClassesAttended must be a non-negative integer' });
                });
        });
    }
    return errors;
};
exports.validateAttendanceInput = validateAttendanceInput;
