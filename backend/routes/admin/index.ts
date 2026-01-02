import { Router } from "express";
import jwt from "jsonwebtoken";
import prisma from "../services/prisma.service";
import { fetchAdmin, validateSigninInputs } from "./middlewares/middlewares";
import { authMiddleware } from "../student/middlewares/middlewares";

import { attendanceRouter } from "./routes/attendance";
import { gradesRouter } from "./routes/grades";
import { studentAdminRouter } from "./routes/student";
import { passRouter } from "./routes/pass";
import { bannerRouter } from "./routes/banner";
import { curriculumRouter } from "./routes/curriculum";
import { staffRouter } from "./routes/staff";
import { notificationsRouter } from "./routes/notifications";
import progressStore from "./utils/progress";

export const adminRouter = Router();

// Admin Signin
adminRouter.post("/signin", validateSigninInputs, fetchAdmin, async (req, res) => {
  try {
    const admin = (req as any).admin;
    if (!process.env.JWT_SECURITY_KEY) throw new Error("JWT_SECURITY_KEY is not defined");
    const token = jwt.sign({ username: admin.Username, role: admin.role || 'webmaster' }, process.env.JWT_SECURITY_KEY);
    res.json({ admin_token: token, role: admin.role || 'webmaster', success: true });
  } catch (e) {
    res.status(500).json({ msg: "Internal Server Error", success: false });
  }
});

// Progress Tracking (Generic for admin tasks)
adminRouter.get("/progress", authMiddleware, (req, res) => {
  const { processId } = req.query;
  if (!processId || typeof processId !== "string") return res.status(400).json({ msg: "processId required", success: false });
  const progress = progressStore.get(processId);
  if (!progress) return res.status(404).json({ msg: "Process not found", success: false });
  res.json({ ...progress, success: true });
});

// Register Sub-routers
adminRouter.use("/attendance", attendanceRouter);
adminRouter.use("/grades", gradesRouter);
adminRouter.use("/students", studentAdminRouter);
adminRouter.use("/student", studentAdminRouter);
adminRouter.use("/pass", passRouter);
adminRouter.use("/banners", bannerRouter);
adminRouter.use("/curriculum", curriculumRouter);
adminRouter.use("/staff", staffRouter);
adminRouter.use("/notify", notificationsRouter);

// Legacy/Compatibility Routes
adminRouter.get("/getstudents", (req, res, next) => { req.url = "/getstudents"; studentAdminRouter(req, res, next); });
adminRouter.post("/searchstudent", (req, res, next) => { req.url = "/searchstudent"; studentAdminRouter(req, res, next); });
adminRouter.post("/addgrades", (req, res, next) => { req.url = "/addgrades"; gradesRouter(req, res, next); });
adminRouter.post("/grades/template", (req, res, next) => { req.url = "/template"; gradesRouter(req, res, next); });
adminRouter.post("/addattendance", (req, res, next) => { req.url = "/addattendance"; attendanceRouter(req, res, next); });
adminRouter.post("/updatestudents", (req, res, next) => { req.url = "/updatestudents"; studentAdminRouter(req, res, next); });
adminRouter.all("/students/template", (req, res, next) => { req.url = "/template"; studentAdminRouter(req, res, next); });
adminRouter.get("/get-curriculum", (req, res, next) => { req.url = "/get-curriculum"; curriculumRouter(req, res, next); });
adminRouter.post("/populate-curriculum", (req, res, next) => { req.url = "/populate-curriculum"; curriculumRouter(req, res, next); });
adminRouter.put("/resetpass", (req, res, next) => { req.url = "/resetpass"; staffRouter(req, res, next); });
adminRouter.get("/getadmins", (req, res, next) => { req.url = "/getadmins"; staffRouter(req, res, next); });
adminRouter.get("/roles", (req, res, next) => { req.url = "/roles"; staffRouter(req, res, next); });
adminRouter.put("/assign-role", (req, res, next) => { req.url = "/assign-role"; staffRouter(req, res, next); });
adminRouter.post("/addadmin", (req, res, next) => { req.url = "/addadmin"; staffRouter(req, res, next); });
adminRouter.get("/notifications-progress", (req, res, next) => { req.url = "/notifications-progress"; notificationsRouter(req, res, next); }); 
adminRouter.put("/roles/:role/permissions", (req, res, next) => { req.url = `/roles/${req.params.role}/permissions`; staffRouter(req, res, next); });