import { Router } from "express";
import prisma from "../../services/prisma.service";
import { 
  approveOuting, rejectOuting, approveOutpass, rejectOutpass, 
  forwardOuting, forwardOutpass,
  getStudentsOutsideCampus, updateStudentPresence
} from "../../services/admin.service";
import { authMiddleware } from "../../student/middlewares/middlewares";
import { sendEmail } from "../../services/email.service";

export const passRouter = Router();

passRouter.get("/getrequests", authMiddleware, async (req, res) => {
  try {
    const type = req.query.type;
    const admin = (req as any).admin;
    const role = (admin?.role === 'webmaster' || admin?.role === 'admin' || !admin?.role) ? 'caretaker' : admin.role;

    if (type === "outpass") {
      const dbRequests = await prisma.outpass.findMany({
        where: { isApproved: false, isRejected: false, isExpired: false, currentLevel: role },
        include: { Student: true },
      });
      
      const outpasses = dbRequests.map(req => ({
        _id: req.id,
        username: req.Student.Username,
        email: req.Student.Email,
        from_day: req.FromDay,
        to_day: req.ToDay,
        reason: req.Reason,
        requested_time: req.RequestedTime,
        is_approved: req.isApproved,
        is_rejected: req.isRejected,
        is_expired: req.isExpired,
        current_level: req.currentLevel,
        approval_logs: req.approvalLogs
      }));

      return res.json({ outpasses, success: true });
    } else if (type === "outing") {
      const dbRequests = await prisma.outing.findMany({
        where: { isApproved: false, isRejected: false, isExpired: false, currentLevel: role },
        include: { Student: true },
      });

      const outings = dbRequests.map(req => ({
        _id: req.id,
        username: req.Student.Username,
        email: req.Student.Email,
        from_time: req.FromTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        to_time: req.ToTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        reason: req.reason,
        requested_time: req.RequestedTime,
        is_approved: req.isApproved,
        is_rejected: req.isRejected,
        is_expired: req.isExpired,
        current_level: req.currentLevel
      }));
      
      return res.json({ outings, success: true });
    }
    res.status(400).json({ msg: "Invalid type", success: false });
  } catch (e) {
    res.status(500).json({ msg: "Error fetching requests", success: false });
  }
});

passRouter.post("/approveoutpass", authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const admin = (req as any).admin;
    const result = await approveOutpass(id, admin?.username || "Admin", admin?.role || "webmaster");
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
    const admin = (req as any).admin;
    const result = await rejectOutpass(id, admin?.username || "Admin", admin?.role || "webmaster", message);
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

passRouter.post("/forwardoutpass", authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const admin = (req as any).admin;
    const result = await forwardOutpass(id, admin?.username || "Admin", admin?.role || "webmaster");
    res.json(result);
  } catch (e) {
    res.status(500).json({ msg: "Error forwarding outpass", success: false });
  }
});

passRouter.post("/approveouting", authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const admin = (req as any).admin;
    const result = await approveOuting(id, admin?.username || "Admin", admin?.role || "webmaster");
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
    const admin = (req as any).admin;
    const result = await rejectOuting(id, admin?.username || "Admin", admin?.role || "webmaster", message);
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

passRouter.post("/forwardouting", authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const admin = (req as any).admin;
    const result = await forwardOuting(id, admin?.username || "Admin", admin?.role || "webmaster");
    res.json(result);
  } catch (e) {
    res.status(500).json({ msg: "Error forwarding outing", success: false });
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
