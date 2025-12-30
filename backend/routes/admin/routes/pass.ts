import { Router } from "express";
import prisma from "../../services/prisma.service";
import { 
  approveOuting, rejectOuting, approveOutpass, rejectOutpass, 
  getStudentsOutsideCampus, updateStudentPresence
} from "../../services/admin.service";
import { authMiddleware } from "../../student/middlewares/middlewares";
import { sendEmail } from "../../services/email.service";

export const passRouter = Router();

passRouter.get("/getrequests", authMiddleware, async (req, res) => {
  try {
    const type = req.query.type;
    if (type === "outpass") {
      const requests = await prisma.outpass.findMany({
        where: { isApproved: false, isRejected: false, isExpired: false },
        include: { Student: true },
      });
      return res.json({ requests, success: true });
    } else if (type === "outing") {
      const requests = await prisma.outing.findMany({
        where: { isApproved: false, isRejected: false, isExpired: false },
        include: { Student: true },
      });
      return res.json({ requests, success: true });
    }
    res.status(400).json({ msg: "Invalid type", success: false });
  } catch (e) {
    res.status(500).json({ msg: "Error fetching requests", success: false });
  }
});

passRouter.post("/approveoutpass", authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const result = await approveOutpass(id);
    if (result.success) {
      const data = await prisma.outpass.findUnique({ where: { id }, include: { Student: true } });
      if (data?.Student.Email) {
        await sendEmail(data.Student.Email, "Outpass Approved", `Your outpass ${id} is approved. Return by ${data.ToDay.toLocaleDateString()}.`);
      }
    }
    res.json(result);
  } catch (e) {
    res.status(500).json({ msg: "Error approving outpass", success: false });
  }
});

passRouter.post("/rejectoutpass", authMiddleware, async (req, res) => {
  try {
    const { id, message } = req.body;
    const result = await rejectOutpass(id, "Administration", message);
    if (result.success) {
      const data = await prisma.outpass.findUnique({ where: { id }, include: { Student: true } });
      if (data?.Student.Email) {
        await sendEmail(data.Student.Email, "Outpass Rejected", `Your outpass ${id} was rejected. Reason: ${message}`);
      }
    }
    res.json(result);
  } catch (e) {
    res.status(500).json({ msg: "Error rejecting outpass", success: false });
  }
});

passRouter.post("/approveouting", authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const result = await approveOuting(id);
    if (result.success) {
      const data = await prisma.outing.findUnique({ where: { id }, include: { Student: true } });
      if (data?.Student.Email) {
        await sendEmail(data.Student.Email, "Outing Approved", `Your outing ${id} is approved. Return by ${data.ToTime.toLocaleTimeString()}.`);
      }
    }
    res.json(result);
  } catch (e) {
    res.status(500).json({ msg: "Error approving outing", success: false });
  }
});

passRouter.post("/rejectouting", authMiddleware, async (req, res) => {
  try {
    const { id, message } = req.body;
    const result = await rejectOuting(id, "Administration", message);
    if (result.success) {
      const data = await prisma.outing.findUnique({ where: { id }, include: { Student: true } });
      if (data?.Student.Email) {
        await sendEmail(data.Student.Email, "Outing Rejected", `Your outing ${id} was rejected. Reason: ${message}`);
      }
    }
    res.json(result);
  } catch (e) {
    res.status(500).json({ msg: "Error rejecting outing", success: false });
  }
});

passRouter.get("/getstudentsoutsidecampus", authMiddleware, async (req, res) => {
  try {
    const students = await getStudentsOutsideCampus();
    res.json({ students, success: true });
  } catch (e) {
    res.status(500).json({ msg: "Error fetching students", success: false });
  }
});

passRouter.post("/updatestudentstatus", authMiddleware, async (req, res) => {
  try {
    const { userId, id } = req.body;
    const result = await updateStudentPresence(userId, id);
    res.json(result);
  } catch (e) {
    res.status(500).json({ msg: "Error updating status", success: false });
  }
});
