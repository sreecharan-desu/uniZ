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
exports.staffRouter = void 0;
const express_1 = require("express");
const prisma_service_1 = __importDefault(require("../../services/prisma.service"));
const middlewares_1 = require("../../student/middlewares/middlewares");
const requirePermission_1 = require("../middlewares/requirePermission");
const roles_1 = require("../constants/roles");
const admin_service_1 = require("../../services/admin.service");
const uuid_1 = require("uuid");
exports.staffRouter = (0, express_1.Router)();
exports.staffRouter.put("/resetpass", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, new_password } = req.body;
    try {
        const isUpdated = yield (0, admin_service_1.updateAdminPassword)(username, new_password);
        res.json({
            msg: isUpdated ? "Password updated successfully!" : "Error updating password",
            success: isUpdated,
        });
    }
    catch (e) {
        res.status(500).json({ msg: "Error updating password", success: false });
    }
}));
exports.staffRouter.get("/getadmins", middlewares_1.authMiddleware, (0, requirePermission_1.requireAnyRole)("dean", "director", "webmaster"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield prisma_service_1.default.admin.findMany({ select: { id: true, Username: true, role: true } });
        res.json({ admins, success: true });
    }
    catch (err) {
        res.status(500).json({ msg: "Error fetching admins", success: false });
    }
}));
exports.staffRouter.delete("/deleteadmin/:username", middlewares_1.authMiddleware, (0, requirePermission_1.requireAnyRole)("director"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.params;
        const deleted = yield prisma_service_1.default.admin.deleteMany({ where: { Username: username } });
        if (deleted.count === 0)
            return res.status(404).json({ msg: "Admin not found", success: false });
        res.json({ msg: `${username} removed`, success: true });
    }
    catch (err) {
        res.status(500).json({ msg: "Error deleting admin", success: false });
    }
}));
exports.staffRouter.get("/roles", middlewares_1.authMiddleware, (0, requirePermission_1.requireAnyRole)("dean", "director", "webmaster"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ roles: roles_1.ROLE_PERMISSIONS, success: true });
}));
exports.staffRouter.put("/assign-role", middlewares_1.authMiddleware, (0, requirePermission_1.requirePermission)("assign_roles"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, role } = req.body;
        if (!username || !role)
            return res.status(400).json({ msg: "username and role required", success: false });
        const updated = yield prisma_service_1.default.admin.updateMany({ where: { Username: username }, data: { role } });
        if (updated.count === 0)
            return res.status(404).json({ msg: "Admin not found", success: false });
        res.json({ msg: `Assigned role ${role} to ${username}`, success: true });
    }
    catch (err) {
        res.status(500).json({ msg: "Error assigning role", success: false });
    }
}));
exports.staffRouter.post("/addadmin", middlewares_1.authMiddleware, (0, requirePermission_1.requireAnyRole)("director", "webmaster"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, role } = req.body;
        if (!username || !password || !role)
            return res.status(400).json({ msg: "username, password, and role required", success: false });
        if (!["webmaster", "dean", "director"].includes(role))
            return res.status(400).json({ msg: "Invalid role", success: false });
        const existing = yield prisma_service_1.default.admin.findUnique({ where: { Username: username } });
        if (existing)
            return res.status(409).json({ msg: "Admin already exists", success: false });
        const hashedPassword = yield (0, admin_service_1.hashPassword)(password);
        const admin = yield prisma_service_1.default.admin.create({
            data: { id: (0, uuid_1.v4)(), Username: username, Password: hashedPassword, role },
        });
        res.json({ msg: `Admin ${username} added successfully`, admin, success: true });
    }
    catch (err) {
        res.status(500).json({ msg: "Error adding admin", success: false });
    }
}));
exports.staffRouter.put("/admin/:username/permissions", middlewares_1.authMiddleware, (0, requirePermission_1.requireAnyRole)("director", "webmaster"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.params;
        const { permissions } = req.body;
        if (!Array.isArray(permissions))
            return res.status(400).json({ msg: "Invalid permissions", success: false });
        const admin = yield prisma_service_1.default.admin.updateMany({ where: { Username: username }, data: {} });
        if (admin.count === 0)
            return res.status(404).json({ msg: "Admin not found", success: false });
        res.json({ msg: `Permissions updated for ${username}`, success: true });
    }
    catch (err) {
        res.status(500).json({ msg: "Error updating permissions", success: false });
    }
}));
exports.staffRouter.get("/searchadmin", middlewares_1.authMiddleware, (0, requirePermission_1.requireAnyRole)("director", "webmaster"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const q = req.query.q || "";
        const admins = yield prisma_service_1.default.admin.findMany({
            where: { Username: { contains: q, mode: "insensitive" } },
            select: { id: true, Username: true, role: true },
        });
        res.json({ admins, success: true });
    }
    catch (err) {
        res.status(500).json({ msg: "Error searching admins", success: false });
    }
}));
exports.staffRouter.put("/roles/:role/permissions", middlewares_1.authMiddleware, (0, requirePermission_1.requireAnyRole)("webmaster"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { role } = req.params;
    const { permissions } = req.body;
    if (!roles_1.ROLE_PERMISSIONS[role]) {
        return res.status(404).json({ msg: "Role not found", success: false });
    }
    if (!Array.isArray(permissions)) {
        return res.status(400).json({ msg: "Permissions must be an array", success: false });
    }
    // Update in-memory permissions (Note: identifying this limitation if server restarts)
    roles_1.ROLE_PERMISSIONS[role] = permissions;
    res.json({
        msg: `Permissions updated for role ${role}`,
        permissions: roles_1.ROLE_PERMISSIONS[role],
        success: true
    });
}));
