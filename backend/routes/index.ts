import express from "express";
import { studentRouter } from "./student/student";
import { adminRouter } from "./admin/admin";

export const mainRoute = express.Router();
mainRoute.use("/student",studentRouter);
mainRoute.use("/admin",adminRouter);


