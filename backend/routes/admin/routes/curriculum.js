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
exports.curriculumRouter = void 0;
const express_1 = require("express");
const uuid_1 = require("uuid");
const prisma_service_1 = __importDefault(require("../../services/prisma.service"));
const middlewares_1 = require("../../student/middlewares/middlewares");
exports.curriculumRouter = (0, express_1.Router)();
exports.curriculumRouter.get("/get-curriculum", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [branches, semesters, subjects] = yield Promise.all([
            prisma_service_1.default.branch.findMany({ select: { id: true, name: true } }),
            prisma_service_1.default.semester.findMany({ select: { id: true, name: true, year: true } }),
            prisma_service_1.default.subject.findMany({ select: { id: true, name: true, credits: true, branchId: true, semesterId: true } }),
        ]);
        const subjectsData = {};
        for (const sem of semesters) {
            if (!subjectsData[sem.year])
                subjectsData[sem.year] = {};
            if (!subjectsData[sem.year][sem.name])
                subjectsData[sem.year][sem.name] = {};
            for (const branch of branches) {
                const branchSubs = subjects.filter(s => s.branchId === branch.id && s.semesterId === sem.id);
                subjectsData[sem.year][sem.name][branch.name] = {
                    names: branchSubs.map(s => s.name),
                    credits: branchSubs.map(s => s.credits),
                };
            }
        }
        res.json({ msg: "Curriculum fetched successfully", success: true, subjectsData });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal Server Error", success: false });
    }
}));
exports.curriculumRouter.post("/populate-curriculum", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subjectsData } = req.body;
        if (!subjectsData)
            return res.status(400).json({ msg: "subjectsData is required", success: false });
        const branches = ["CSE", "ECE", "EEE", "CIVIL", "MECH"];
        yield Promise.all(branches.map(name => prisma_service_1.default.branch.upsert({ where: { name }, update: { name }, create: { name } })));
        for (const year of Object.keys(subjectsData)) {
            for (const semesterName of Object.keys(subjectsData[year])) {
                const semester = yield prisma_service_1.default.semester.upsert({
                    where: { name_year: { name: semesterName, year } },
                    update: { name: semesterName, year },
                    create: { name: semesterName, year },
                });
                const branchesData = subjectsData[year][semesterName];
                for (const branchName of Object.keys(branchesData)) {
                    const branch = yield prisma_service_1.default.branch.findUnique({ where: { name: branchName } });
                    if (!branch)
                        continue;
                    const { names, credits } = branchesData[branchName];
                    yield Promise.all(names.map((subjectName, i) => {
                        if (!subjectName || credits[i] === 0)
                            return null;
                        return prisma_service_1.default.subject.upsert({
                            where: { name_branchId_semesterId: { name: subjectName, branchId: branch.id, semesterId: semester.id } },
                            update: { credits: credits[i] },
                            create: { id: (0, uuid_1.v4)(), name: subjectName, credits: credits[i], branchId: branch.id, semesterId: semester.id },
                        });
                    }));
                }
            }
        }
        res.json({ msg: "Curriculum data populated successfully", success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal Server Error", success: false });
    }
}));
