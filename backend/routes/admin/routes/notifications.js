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
exports.notificationsRouter = void 0;
const express_1 = require("express");
const uuid_1 = require("uuid");
const prisma_service_1 = __importDefault(require("../../services/prisma.service"));
const middlewares_1 = require("../../student/middlewares/middlewares");
const requirePermission_1 = require("../middlewares/requirePermission");
const progress_1 = __importDefault(require("../utils/progress"));
const utils_1 = require("../utils/utils");
const email_service_1 = require("../../services/email.service");
exports.notificationsRouter = (0, express_1.Router)();
exports.notificationsRouter.post("/email", middlewares_1.authMiddleware, (0, requirePermission_1.requirePermission)("send_notifications"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { target, filter, subject, htmlBody } = req.body;
        if (!target || !subject || !htmlBody) {
            return res.status(400).json({ msg: "target, subject and htmlBody are required", success: false });
        }
        const processId = (0, uuid_1.v4)();
        progress_1.default.set(processId, {
            totalRecords: 0,
            processedRecords: 0,
            failedRecords: [],
            status: "pending",
            startTime: new Date(),
            errors: [],
        });
        // Resolution in background
        (() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let students = [];
                if (target === "all") {
                    students = yield prisma_service_1.default.student.findMany({ select: { id: true, Email: true } });
                }
                else if (target === "branch" && (filter === null || filter === void 0 ? void 0 : filter.branch)) {
                    students = yield prisma_service_1.default.student.findMany({ where: { Branch: filter.branch }, select: { id: true, Email: true } });
                }
                else if (target === "batch" && (filter === null || filter === void 0 ? void 0 : filter.batch)) {
                    students = yield prisma_service_1.default.student.findMany({ where: { Year: filter.batch }, select: { id: true, Email: true } });
                }
                else if (target === "userIds" && Array.isArray(filter === null || filter === void 0 ? void 0 : filter.ids)) {
                    students = yield prisma_service_1.default.student.findMany({ where: { id: { in: filter.ids } }, select: { id: true, Email: true } });
                }
                else {
                    const p = progress_1.default.get(processId);
                    if (p) {
                        p.status = "failed";
                        p.errors = [{ message: "Invalid target or filter" }];
                    }
                    return;
                }
                const emails = students.map((s) => s.Email).filter(Boolean);
                const total = emails.length;
                const p = progress_1.default.get(processId);
                if (p)
                    p.totalRecords = total;
                const emailChunks = (0, utils_1.chunkArray)(emails, 50);
                let processed = 0;
                for (const chunk of emailChunks) {
                    yield Promise.all(chunk.map((to) => __awaiter(void 0, void 0, void 0, function* () {
                        try {
                            yield (0, email_service_1.sendEmail)(to, subject, htmlBody);
                            processed++;
                        }
                        catch (err) {
                            const prog = progress_1.default.get(processId);
                            if (prog)
                                prog.failedRecords.push({ email: to, reason: err.message || err });
                        }
                        const prog = progress_1.default.get(processId);
                        if (prog)
                            prog.processedRecords = processed;
                    })));
                }
                const finalProg = progress_1.default.get(processId);
                if (finalProg) {
                    finalProg.status = finalProg.failedRecords.length === finalProg.totalRecords ? "failed" : "completed";
                    finalProg.endTime = new Date();
                    setTimeout(() => progress_1.default.delete(processId), 10 * 60 * 1000);
                }
            }
            catch (err) {
                console.error("notify/email background error", err);
                const prog = progress_1.default.get(processId);
                if (prog) {
                    prog.status = "failed";
                    prog.errors.push(err);
                    prog.endTime = new Date();
                    setTimeout(() => progress_1.default.delete(processId), 10 * 60 * 1000);
                }
            }
        }))();
        res.status(202).json({ msg: "Email sending started", processId, success: true });
    }
    catch (err) {
        console.error("notify/email error", err);
        res.status(500).json({ msg: "Error starting email notification", success: false });
    }
}));
exports.notificationsRouter.get("/progress", middlewares_1.authMiddleware, (0, requirePermission_1.requirePermission)("send_notifications"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { processId } = req.query;
        if (!processId || typeof processId !== "string")
            return res.status(400).json({ msg: "Missing processId", success: false });
        const progress = progress_1.default.get(processId);
        if (!progress)
            return res.status(404).json({ msg: "No process found", success: false });
        const percentage = progress.totalRecords > 0 ? ((progress.processedRecords / progress.totalRecords) * 100).toFixed(2) : "0.00";
        res.json(Object.assign(Object.assign({}, progress), { percentage: parseFloat(percentage), success: true }));
    }
    catch (err) {
        console.error("notifications-progress error", err);
        res.status(500).json({ msg: "Error fetching progress", success: false });
    }
}));
