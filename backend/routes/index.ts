import express from "express";
import { studentRouter } from "./student/student";
import { adminRouter } from "./admin/admin";
import { updateDB } from "./helper-functions";

updateDB();

export const mainRoute = express.Router();
mainRoute.use("/student",studentRouter);
mainRoute.use("/admin",adminRouter);


