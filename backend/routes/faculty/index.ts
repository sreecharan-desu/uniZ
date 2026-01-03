import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../services/prisma.service";
import { authMiddleware } from "../student/middlewares/middlewares";
import { logger } from "../../utils/logger";

export const facultyRouterPublic = Router();

// Faculty Signin
facultyRouterPublic.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ msg: "Username and password required", success: false });

    // Validate if it's a faculty
    const faculty = await prisma.faculty.findFirst({
        where: { OR: [{ Username: username }, { Email: username }] }
    });

    if (!faculty) {
        return res.status(404).json({ msg: "Faculty not found", success: false });
    }

    const isMatch = await bcrypt.compare(password, faculty.Password);
    if (!isMatch) {
         return res.status(401).json({ msg: "Invalid credentials", success: false });
    }

    if (!process.env.JWT_SECURITY_KEY) throw new Error("JWT_SECURITY_KEY is not defined");
    
    const token = jwt.sign({ 
        username: faculty.Username, 
        role: faculty.Role, // 'teacher' or 'hod'
        id: faculty.id 
    }, process.env.JWT_SECURITY_KEY);

    // Return as admin_token compatible or specific faculty_token
    // Using faculty_token for clarity, but frontend might need adjustment
    return res.json({ 
        success: true, 
        token: token,
        role: faculty.Role,
        username: faculty.Username,
        name: faculty.Name
    });

  } catch (e: any) {
    logger.error(`Faculty Signin Error: ${e.message}`);
    return res.status(500).json({ msg: "Internal Server Error", success: false });
  }
});

// Get Faculty Profile
facultyRouterPublic.get("/me", authMiddleware, async (req, res) => {
    try {
        const faculty = (req as any).faculty;
        if (!faculty) return res.status(404).json({ success: false, msg: "Faculty not found" });
        
        // Fetch full details including subjects
        const fullFaculty = await prisma.faculty.findUnique({
            where: { id: faculty.id },
            include: {
                subjects: {
                    include: { subject: true }
                }
            }
        });
        
        return res.json({ success: true, faculty: fullFaculty });
    } catch (e: any) {
        return res.status(500).json({ success: false, msg: "Error fetching profile" });
    }
});

// Update Faculty Profile
facultyRouterPublic.put("/update-profile", authMiddleware, async (req, res) => {
    try {
        const faculty = (req as any).faculty;
        const { contact, email, profileUrl } = req.body;

        await prisma.faculty.update({
            where: { id: faculty.id },
            data: {
                Contact: contact,
                Email: email,
                ProfileUrl: profileUrl
            }
        });

        return res.json({ success: true, msg: "Profile updated successfully" });
    } catch (e: any) {
        logger.error(`Update Faculty Error: ${e.message}`);
        return res.status(500).json({ success: false, msg: "Failed to update profile" });
    }
});
