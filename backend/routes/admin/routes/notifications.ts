import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../../services/prisma.service";
import { authMiddleware } from "../../student/middlewares/middlewares";
import { requirePermission } from "../middlewares/requirePermission";
import progressStore from "../utils/progress";
import { chunkArray } from "../utils/utils";
import { sendEmail } from "../../services/email.service";

export const notificationsRouter = Router();

notificationsRouter.post("/email", authMiddleware, requirePermission("send_notifications"), async (req, res) => {
  try {
    const { target, filter, subject, htmlBody } = req.body;
    if (!target || !subject || !htmlBody) {
      return res.status(400).json({ msg: "target, subject and htmlBody are required", success: false });
    }

    const processId = uuidv4();
    progressStore.set(processId, {
      totalRecords: 0,
      processedRecords: 0,
      failedRecords: [],
      status: "pending",
      startTime: new Date(),
      errors: [],
    });

    // Resolution in background
    (async () => {
      try {
        let students: any[] = [];
        if (target === "all") {
          students = await prisma.student.findMany({ select: { id: true, Email: true } });
        } else if (target === "branch" && filter?.branch) {
          students = await prisma.student.findMany({ where: { Branch: filter.branch }, select: { id: true, Email: true } });
        } else if (target === "batch" && filter?.batch) {
          students = await prisma.student.findMany({ where: { Year: filter.batch }, select: { id: true, Email: true } });
        } else if (target === "userIds" && Array.isArray(filter?.ids)) {
          students = await prisma.student.findMany({ where: { id: { in: filter.ids } }, select: { id: true, Email: true } });
        } else {
          const p = progressStore.get(processId);
          if (p) {
            p.status = "failed";
            p.errors = [{ message: "Invalid target or filter" }];
          }
          return;
        }

        const emails = students.map((s) => s.Email).filter(Boolean);
        const total = emails.length;
        const p = progressStore.get(processId);
        if (p) p.totalRecords = total;

        const emailChunks = chunkArray(emails, 50);
        let processed = 0;
        for (const chunk of emailChunks) {
          await Promise.all(
            chunk.map(async (to) => {
              try {
                await sendEmail(to, subject, htmlBody);
                processed++;
              } catch (err: any) {
                const prog :any = progressStore.get(processId);
                if (prog) prog.failedRecords.push({ email: to, reason: err.message || err });
              }
              const prog = progressStore.get(processId);
              if (prog) prog.processedRecords = processed;
            })
          );
        }

        const finalProg : any = progressStore.get(processId);
        if (finalProg) {
          finalProg.status = finalProg.failedRecords.length === finalProg.totalRecords ? "failed" : "completed";
          finalProg.endTime = new Date();
          setTimeout(() => progressStore.delete(processId), 10 * 60 * 1000);
        }
      } catch (err: any) {
        console.error("notify/email background error", err);
        const prog:any = progressStore.get(processId);
        if (prog) {
          prog.status = "failed";
          prog.errors.push(err);
          prog.endTime = new Date();
          setTimeout(() => progressStore.delete(processId), 10 * 60 * 1000);
        }
      }
    })();

    res.status(202).json({ msg: "Email sending started", processId, success: true });
  } catch (err) {
    console.error("notify/email error", err);
    res.status(500).json({ msg: "Error starting email notification", success: false });
  }
});

notificationsRouter.get("/progress", authMiddleware, requirePermission("send_notifications"), async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId || typeof processId !== "string") return res.status(400).json({ msg: "Missing processId", success: false });
    const progress = progressStore.get(processId);
    if (!progress) return res.status(404).json({ msg: "No process found", success: false });
    const percentage = progress.totalRecords > 0 ? ((progress.processedRecords / progress.totalRecords) * 100).toFixed(2) : "0.00";
    res.json({ ...progress, percentage: parseFloat(percentage), success: true });
  } catch (err) {
    console.error("notifications-progress error", err);
    res.status(500).json({ msg: "Error fetching progress", success: false });
  }
});
