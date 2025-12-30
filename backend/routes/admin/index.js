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
exports.adminRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middlewares_1 = require("./middlewares/middlewares");
const middlewares_2 = require("../student/middlewares/middlewares");
const attendance_1 = require("./routes/attendance");
const grades_1 = require("./routes/grades");
const student_1 = require("./routes/student");
const pass_1 = require("./routes/pass");
const banner_1 = require("./routes/banner");
const curriculum_1 = require("./routes/curriculum");
const staff_1 = require("./routes/staff");
const notifications_1 = require("./routes/notifications");
const progress_1 = __importDefault(require("./utils/progress"));
exports.adminRouter = (0, express_1.Router)();
// Admin Signin
exports.adminRouter.post("/signin", middlewares_1.validateSigninInputs, middlewares_1.fetchAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.body;
        if (!process.env.JWT_SECURITY_KEY)
            throw new Error("JWT_SECURITY_KEY is not defined");
        const token = jsonwebtoken_1.default.sign(username, process.env.JWT_SECURITY_KEY);
        res.json({ admin_token: token, success: true });
    }
    catch (e) {
        res.status(500).json({ msg: "Internal Server Error", success: false });
    }
}));
// Progress Tracking (Generic for admin tasks)
exports.adminRouter.get("/progress", middlewares_2.authMiddleware, (req, res) => {
    const { processId } = req.query;
    if (!processId || typeof processId !== "string")
        return res.status(400).json({ msg: "processId required", success: false });
    const progress = progress_1.default.get(processId);
    if (!progress)
        return res.status(404).json({ msg: "Process not found", success: false });
    res.json(Object.assign(Object.assign({}, progress), { success: true }));
});
// Register Sub-routers
exports.adminRouter.use("/attendance", attendance_1.attendanceRouter);
exports.adminRouter.use("/grades", grades_1.gradesRouter);
exports.adminRouter.use("/students", student_1.studentAdminRouter);
exports.adminRouter.use("/pass", pass_1.passRouter);
exports.adminRouter.use("/banners", banner_1.bannerRouter);
exports.adminRouter.use("/curriculum", curriculum_1.curriculumRouter);
exports.adminRouter.use("/staff", staff_1.staffRouter);
exports.adminRouter.use("/notify", notifications_1.notificationsRouter);
// Legacy/Compatibility Routes
exports.adminRouter.get("/getstudents", student_1.studentAdminRouter);
exports.adminRouter.post("/searchstudent", student_1.studentAdminRouter);
exports.adminRouter.post("/addgrades", grades_1.gradesRouter);
exports.adminRouter.post("/grades/template", grades_1.gradesRouter);
exports.adminRouter.post("/addattendance", attendance_1.attendanceRouter);
exports.adminRouter.post("/updatestudents", student_1.studentAdminRouter);
exports.adminRouter.get("/students/template", student_1.studentAdminRouter);
exports.adminRouter.get("/get-curriculum", curriculum_1.curriculumRouter);
exports.adminRouter.post("/populate-curriculum", curriculum_1.curriculumRouter);
exports.adminRouter.put("/resetpass", staff_1.staffRouter);
exports.adminRouter.get("/getadmins", staff_1.staffRouter);
exports.adminRouter.get("/roles", staff_1.staffRouter);
exports.adminRouter.put("/assign-role", staff_1.staffRouter);
exports.adminRouter.post("/addadmin", staff_1.staffRouter);
exports.adminRouter.get("/notifications-progress", notifications_1.notificationsRouter); // Redirect to notifications router
exports.adminRouter.put("/roles/:role/permissions", staff_1.staffRouter);
