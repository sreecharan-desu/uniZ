import express from "express";
import { studentRouter } from "./student/student";
import { adminRouter } from "./admin/admin";
import { updateDB } from "./helper-functions";
// import { addAdmin } from "./helper-functions";

updateDB();

export const mainRoute = express.Router();
// addAdmin('admin','1234567890');
mainRoute.use("/student",studentRouter);
mainRoute.use("/admin",adminRouter);


