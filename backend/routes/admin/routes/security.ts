import { Router } from "express";
import prisma from "../../services/prisma.service";
import { authMiddleware } from "../../student/middlewares/middlewares";
import { logger } from "../../../utils/logger";
import { broadcast } from "../../../utils/websocket";

export const securityRouter = Router();

securityRouter.post("/scan", authMiddleware, async (req, res) => {
  try {
    const { studentId, requestId } = req.body;
    const admin = (req as any).admin || (req as any).user;
    
    // Security check
    if (admin?.role !== 'security' && admin?.role !== 'webmaster') {
        return res.status(403).json({ success: false, msg: "Unauthorized. Security role required." });
    }

    if (!studentId) return res.status(400).json({ success: false, msg: "Student ID required" });

    const student = await prisma.student.findUnique({ 
        where: { Username: studentId.toLowerCase() },
        include: {
            Outing: { where: { isApproved: true, isExpired: false }, orderBy: { RequestedTime: 'desc' }, take: 1 },
            Outpass: { where: { isApproved: true, isExpired: false }, orderBy: { RequestedTime: 'desc' }, take: 1 }
        }
    });

    if (!student) return res.status(404).json({ success: false, msg: "Student not found" });

    const currentPresence = student.isPresentInCampus;
    const action = currentPresence ? "check-out" : "check-in";

    if (action === "check-out") {
        // Checking out: Must have an approved outpass/outing
        const activeOutpass = student.Outpass[0];
        const activeOuting = student.Outing[0];

        if (!activeOutpass && !activeOuting) {
            return res.status(400).json({ success: false, msg: "No approved outpass or outing found for checkout." });
        }

        await prisma.student.update({
            where: { Username: studentId.toLowerCase() },
            data: { isPresentInCampus: false }
        });

        logger.info(`Security: ${studentId} checked out by ${admin.username}`);
        broadcast({ type: 'PRESENCE_UPDATE', payload: { studentId, action: 'checkout' } });

        return res.json({ success: true, msg: `${studentId} checked out successfully.` });
    } else {
        // Checking in: Return to campus
        await prisma.student.update({
            where: { Username: studentId.toLowerCase() },
            data: { isPresentInCampus: true }
        });

        // Mark active outpass/outing as expired/completed
        const activeOutpass = student.Outpass[0];
        const activeOuting = student.Outing[0];

        if (activeOutpass) {
            await prisma.outpass.update({ where: { id: activeOutpass.id }, data: { inTime: new Date(), isExpired: true } });
        } else if (activeOuting) {
            await prisma.outing.update({ where: { id: activeOuting.id }, data: { inTime: new Date(), isExpired: true } });
        }

        logger.info(`Security: ${studentId} checked in by ${admin.username}`);
        broadcast({ type: 'PRESENCE_UPDATE', payload: { studentId, action: 'checkin' } });

        return res.json({ success: true, msg: `${studentId} checked in successfully.` });
    }
  } catch (error: any) {
    logger.error(`Security Scan Error: ${error.message || error}`);
    return res.status(500).json({ success: false, msg: "Internal server error during scan" });
  }
});
