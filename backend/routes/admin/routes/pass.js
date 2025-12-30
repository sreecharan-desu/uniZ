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
exports.passRouter = void 0;
const express_1 = require("express");
const prisma_service_1 = __importDefault(require("../../services/prisma.service"));
const admin_service_1 = require("../../services/admin.service");
const middlewares_1 = require("../../student/middlewares/middlewares");
const email_service_1 = require("../../services/email.service");
exports.passRouter = (0, express_1.Router)();
exports.passRouter.get("/getrequests", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const type = req.query.type;
        if (type === "outpass") {
            const requests = yield prisma_service_1.default.outpass.findMany({
                where: { isApproved: false, isRejected: false, isExpired: false },
                include: { Student: true },
            });
            return res.json({ requests, success: true });
        }
        else if (type === "outing") {
            const requests = yield prisma_service_1.default.outing.findMany({
                where: { isApproved: false, isRejected: false, isExpired: false },
                include: { Student: true },
            });
            return res.json({ requests, success: true });
        }
        res.status(400).json({ msg: "Invalid type", success: false });
    }
    catch (e) {
        res.status(500).json({ msg: "Error fetching requests", success: false });
    }
}));
exports.passRouter.post("/approveoutpass", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const result = yield (0, admin_service_1.approveOutpass)(id);
        if (result.success) {
            const data = yield prisma_service_1.default.outpass.findUnique({ where: { id }, include: { Student: true } });
            if (data === null || data === void 0 ? void 0 : data.Student.Email) {
                yield (0, email_service_1.sendEmail)(data.Student.Email, "Outpass Approved", `Your outpass ${id} is approved. Return by ${data.ToDay.toLocaleDateString()}.`);
            }
        }
        res.json(result);
    }
    catch (e) {
        res.status(500).json({ msg: "Error approving outpass", success: false });
    }
}));
exports.passRouter.post("/rejectoutpass", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, message } = req.body;
        const result = yield (0, admin_service_1.rejectOutpass)(id, "Administration", message);
        if (result.success) {
            const data = yield prisma_service_1.default.outpass.findUnique({ where: { id }, include: { Student: true } });
            if (data === null || data === void 0 ? void 0 : data.Student.Email) {
                yield (0, email_service_1.sendEmail)(data.Student.Email, "Outpass Rejected", `Your outpass ${id} was rejected. Reason: ${message}`);
            }
        }
        res.json(result);
    }
    catch (e) {
        res.status(500).json({ msg: "Error rejecting outpass", success: false });
    }
}));
exports.passRouter.post("/approveouting", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const result = yield (0, admin_service_1.approveOuting)(id);
        if (result.success) {
            const data = yield prisma_service_1.default.outing.findUnique({ where: { id }, include: { Student: true } });
            if (data === null || data === void 0 ? void 0 : data.Student.Email) {
                yield (0, email_service_1.sendEmail)(data.Student.Email, "Outing Approved", `Your outing ${id} is approved. Return by ${data.ToTime.toLocaleTimeString()}.`);
            }
        }
        res.json(result);
    }
    catch (e) {
        res.status(500).json({ msg: "Error approving outing", success: false });
    }
}));
exports.passRouter.post("/rejectouting", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, message } = req.body;
        const result = yield (0, admin_service_1.rejectOuting)(id, "Administration", message);
        if (result.success) {
            const data = yield prisma_service_1.default.outing.findUnique({ where: { id }, include: { Student: true } });
            if (data === null || data === void 0 ? void 0 : data.Student.Email) {
                yield (0, email_service_1.sendEmail)(data.Student.Email, "Outing Rejected", `Your outing ${id} was rejected. Reason: ${message}`);
            }
        }
        res.json(result);
    }
    catch (e) {
        res.status(500).json({ msg: "Error rejecting outing", success: false });
    }
}));
exports.passRouter.get("/getstudentsoutsidecampus", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const students = yield (0, admin_service_1.getStudentsOutsideCampus)();
        res.json({ students, success: true });
    }
    catch (e) {
        res.status(500).json({ msg: "Error fetching students", success: false });
    }
}));
exports.passRouter.post("/updatestudentstatus", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, id } = req.body;
        const result = yield (0, admin_service_1.updateStudentPresence)(userId, id);
        res.json(result);
    }
    catch (e) {
        res.status(500).json({ msg: "Error updating status", success: false });
    }
}));
