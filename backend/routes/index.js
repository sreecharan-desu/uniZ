"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainRoute = void 0;
const express_1 = __importDefault(require("express"));
const student_1 = require("./student/student");
const admin_1 = require("./admin/admin");
exports.mainRoute = express_1.default.Router();
exports.mainRoute.use("/student", student_1.studentRouter);
exports.mainRoute.use("/admin", admin_1.adminRouter);
