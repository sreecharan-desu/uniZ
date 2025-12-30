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
exports.mainRoute = void 0;
const express_1 = __importDefault(require("express"));
const student_1 = require("./student");
const admin_1 = require("./admin");
const prisma_service_1 = __importDefault(require("./services/prisma.service"));
const redis_service_1 = __importDefault(require("./services/redis.service"));
exports.mainRoute = express_1.default.Router();
exports.mainRoute.use("/student", student_1.studentRouter);
exports.mainRoute.use("/admin", admin_1.adminRouter);
exports.mainRoute.get('/banners', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const onlyPublished = req.query.published === 'true';
        const cacheKey = `banners:${onlyPublished}`;
        try {
            const cached = yield redis_service_1.default.get(cacheKey);
            if (cached) {
                return res.json({ banners: JSON.parse(cached), success: true });
            }
        }
        catch (e) {
            console.warn('Redis cache read failed, falling back to db');
        }
        const banners = yield prisma_service_1.default.banner.findMany({
            where: onlyPublished ? { isPublished: true } : {},
            orderBy: { createdAt: 'desc' },
        });
        try {
            yield redis_service_1.default.set(cacheKey, JSON.stringify(banners), 'EX', 60 * 60); // 1 hour
        }
        catch (e) {
            console.warn('Redis cache write failed');
        }
        res.json({ banners, success: true });
    }
    catch (err) {
        console.error('Get banners error', err);
        res.status(500).json({ msg: 'Error fetching banners', success: false });
    }
}));
