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
    const { username } = req.body;
    if (!process.env.JWT_SECURITY_KEY) throw new Error("JWT_SECURITY_KEY is not defined");
    const token = jwt.sign(username, process.env.JWT_SECURITY_KEY);
    res.json({ admin_token: token, success: true });
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
adminRouter.use("/pass", passRouter);
adminRouter.use("/banners", bannerRouter);
adminRouter.use("/curriculum", curriculumRouter);
adminRouter.use("/staff", staffRouter);
adminRouter.use("/notify", notificationsRouter);

// Legacy/Compatibility Routes
adminRouter.get("/getstudents", studentAdminRouter);
adminRouter.post("/searchstudent", studentAdminRouter);
adminRouter.post("/addgrades", gradesRouter);
adminRouter.post("/grades/template", gradesRouter);
adminRouter.post("/addattendance", attendanceRouter);
adminRouter.post("/updatestudents", studentAdminRouter);
adminRouter.get("/students/template", studentAdminRouter);
adminRouter.get("/get-curriculum", curriculumRouter);
adminRouter.post("/populate-curriculum", curriculumRouter);
adminRouter.put("/resetpass", staffRouter);
adminRouter.get("/getadmins", staffRouter);
adminRouter.get("/roles", staffRouter);
adminRouter.put("/assign-role", staffRouter);
adminRouter.post("/addadmin", staffRouter);
adminRouter.get("/notifications-progress", notificationsRouter); // Redirect to notifications router
adminRouter.put("/roles/:role/permissions", staffRouter);