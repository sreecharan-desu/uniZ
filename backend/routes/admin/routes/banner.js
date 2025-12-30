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
exports.bannerRouter = void 0;
const express_1 = require("express");
const uuid_1 = require("uuid");
const prisma_service_1 = __importDefault(require("../../services/prisma.service"));
const requirePermission_1 = require("../middlewares/requirePermission");
const middlewares_1 = require("../../student/middlewares/middlewares");
exports.bannerRouter = (0, express_1.Router)();
exports.bannerRouter.post("/", middlewares_1.authMiddleware, (0, requirePermission_1.requirePermission)("manage_banners"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, text, imageUrl, isPublished = false } = req.body;
        if (!title)
            return res.status(400).json({ msg: "Title is required", success: false });
        const createdBy = ((_a = req.admin) === null || _a === void 0 ? void 0 : _a.username) || null;
        const banner = yield prisma_service_1.default.banner.create({
            data: { id: (0, uuid_1.v4)(), title, text: text !== null && text !== void 0 ? text : "", imageUrl: imageUrl !== null && imageUrl !== void 0 ? imageUrl : null, isPublished, createdBy },
        });
        res.json({ banner, success: true, msg: "Banner created" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error creating banner", success: false });
    }
}));
exports.bannerRouter.get("/", middlewares_1.authMiddleware, (0, requirePermission_1.requirePermission)("manage_banners"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const onlyPublished = req.query.published === "true";
        const banners = yield prisma_service_1.default.banner.findMany({
            where: onlyPublished ? { isPublished: true } : {},
            orderBy: { createdAt: "desc" },
        });
        res.json({ banners, success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error fetching banners", success: false });
    }
}));
exports.bannerRouter.put("/:id", middlewares_1.authMiddleware, (0, requirePermission_1.requirePermission)("manage_banners"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, text, imageUrl } = req.body;
        const banner = yield prisma_service_1.default.banner.update({
            where: { id },
            data: { title, text, imageUrl, updatedAt: new Date() },
        });
        res.json({ banner, success: true, msg: "Banner updated" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error updating banner", success: false });
    }
}));
exports.bannerRouter.delete("/:id", middlewares_1.authMiddleware, (0, requirePermission_1.requirePermission)("manage_banners"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_service_1.default.banner.delete({ where: { id } });
        res.json({ msg: "Banner deleted", success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error deleting banner", success: false });
    }
}));
exports.bannerRouter.post("/:id/publish", middlewares_1.authMiddleware, (0, requirePermission_1.requirePermission)("manage_banners"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { publish } = req.body;
        const banner = yield prisma_service_1.default.banner.update({ where: { id }, data: { isPublished: !!publish } });
        res.json({ banner, success: true, msg: publish ? "Banner published" : "Banner unpublished" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error changing status", success: false });
    }
}));
