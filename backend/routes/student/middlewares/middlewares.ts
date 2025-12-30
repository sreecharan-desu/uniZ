import { Request, Response, NextFunction } from "express";
import zod from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../services/prisma.service";
import { isPendingApplication, isStudentPresentInCampus } from "../../services/student.service";

export const validateSigninInputs = (req: Request, res: Response, next: NextFunction) => {
  const schema = zod.object({
    username: zod.string().length(7, "Username must be exactly 7 characters"),
    password: zod.string().min(8, "Password must be at least 8 characters").max(20, "Password must not exceed 20 characters"),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      msg: parsed.error.issues.map(i => i.message).join(" and "),
      success: false
    });
  }
  next();
};

export const validateResetPassInputs = (req: Request, res: Response, next: NextFunction) => {
  const schema = zod.object({
    username: zod.string().min(7).max(16),
    password: zod.string().min(8).max(20),
    new_password: zod.string().min(8).max(20),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      msg: "Invalid input fields",
      success: false,
    });
  }
  next();
};

export const fetchStudent = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  
  try {
    const user = await prisma.student.findUnique({ where: { Username: username.toLowerCase() } });
    if (!user) return res.status(404).json({ msg: "Account not found. Consult administration.", success: false });

    if (!user.Password || !(await bcrypt.compare(password, user.Password))) {
      return res.status(401).json({ msg: "Invalid credentials.", success: false });
    }
    next();
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error", success: false });
  }
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  if (!authorization || !process.env.JWT_SECURITY_KEY)
    return res.status(401).json({ msg: "Authentication required", success: false });

  try {
    const token = authorization.split(" ")[1];
    const decoded_username = jwt.verify(token, process.env.JWT_SECURITY_KEY) as string;

    const [admin, student] = await Promise.all([
      prisma.admin.findUnique({ where: { Username: decoded_username }, select: { id: true, Username: true, role: true } }),
      prisma.student.findUnique({ where: { Username: decoded_username }, select: { id: true, Username: true } })
    ]);

    if (admin) {
      (req as any).admin = { _id: admin.id, username: admin.Username, role: admin.role };
    } else if (!student) {
      return res.status(401).json({ msg: "Invalid token", success: false });
    }

    next();
  } catch (err) {
    res.status(401).json({ msg: "Authentication failed", success: false });
  }
};

export const isPresentInCampus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    const isPresent = await isStudentPresentInCampus(userId);
    if (!isPresent) return res.status(403).json({ msg: "You must be in campus to make this request.", success: false });
    next();
  } catch (e) {
    res.status(500).json({ msg: "Server error checking campus status", success: false });
  }
};

export const isApplicationPending = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    const result = await isPendingApplication(userId);
    if (result.success && result.isPending) {
      return res.status(403).json({ msg: "You already have a pending request.", success: false });
    }
    next();
  } catch (e) {
    res.status(500).json({ msg: "Server error checking request status", success: false });
  }
};