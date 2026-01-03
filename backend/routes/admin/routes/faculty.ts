import { Router } from "express";
import prisma from "../../services/prisma.service";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { authMiddleware } from "../../student/middlewares/middlewares";
import { logger } from "../../../utils/logger";

export const facultyRouter = Router();

// Create Faculty (By Dean/Director)
facultyRouter.post("/create", authMiddleware, async (req, res) => {
  try {
    const admin = (req as any).admin;
    // Strictly checking for academic dean or director role
    if (!admin || !['dean', 'director', 'webmaster'].includes(admin.role)) {
       return res.status(403).json({ success: false, msg: "Unauthorized" });
    }

    const { username, password, name, email, department, designation, role, contact } = req.body;

    if (!username || !password || !name || !email || !department) {
        return res.status(400).json({ success: false, msg: "Missing required fields" });
    }

    const existing = await prisma.faculty.findFirst({
        where: { OR: [{ Username: username }, { Email: email }] }
    });

    if (existing) {
        return res.status(409).json({ success: false, msg: "Faculty with this ID or Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newFaculty = await prisma.faculty.create({
        data: {
            Username: username,
            Password: hashedPassword,
            Name: name,
            Email: email,
            Department: department,
            Designation: designation || "Assistant Professor",
            Role: role || "teacher",
            Contact: contact || ""
        }
    });

    return res.json({ success: true, msg: "Faculty created successfully", facultyId: newFaculty.id });

  } catch (e: any) {
    logger.error(`Create Faculty Error: ${e.message || e}`);
    return res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
});

// Get Faculty List
facultyRouter.get("/", authMiddleware, async (req, res) => {
    try {
        const { department } = req.query;
        const whereClause = department ? { Department: String(department) } : {};
        
        const faculty = await prisma.faculty.findMany({
            where: whereClause,
            select: {
                id: true, Username: true, Name: true, Email: true, 
                Department: true, Designation: true, Role: true, Contact: true, ProfileUrl: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return res.json({ success: true, faculty });
    } catch (e: any) {
        return res.status(500).json({ success: false, msg: "Failed to fetch faculty" });
    }
});

// Assign Subject to Faculty
facultyRouter.post("/assign-subject", authMiddleware, async (req, res) => {
    try {
        const { facultyId, subjectId } = req.body;
        
        // Find existing assignment
        const exists = await prisma.facultySubject.findUnique({
            where: { facultyId_subjectId: { facultyId, subjectId } }
        });

        if (exists) {
            return res.status(200).json({ success: true, msg: "Subject already assigned" });
        }

        await prisma.facultySubject.create({
            data: { facultyId, subjectId }
        });

        return res.json({ success: true, msg: "Subject assigned successfully" });

    } catch (e: any) {
        logger.error(`Assign Subject Error: ${e.message}`);
        return res.status(500).json({ success: false, msg: "Failed to assign subject" });
    }
});
