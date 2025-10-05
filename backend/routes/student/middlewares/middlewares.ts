import { Request, Response, NextFunction } from "express";
import zod from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {currentUserByUsername, findUserByUsername, isPendingApplication, isStudentPresentInCampus } from "../../helper-functions";
import dotenv from "dotenv";
dotenv.config();

export const validateSigninInputs = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  const zodUsernameSchema = zod.string().min(7, "Your username should contain minimum 7 characters").max(7, "Your username should contain maximum 7 characters");
  const zodPasswordSchema = zod.string().min(8, "Your password should contain minimum 8 characters").max(20, "Your password should contain maximum 20 characters");

  const isUsernameValidated = zodUsernameSchema.safeParse(username);
  const isPasswordValidated = zodPasswordSchema.safeParse(password);

  if (!isUsernameValidated.success || !isPasswordValidated.success) 
    return res.json({ 
      msg: !isUsernameValidated.success && !isPasswordValidated.success 
        ? `${isUsernameValidated.error?.issues[0].message} and ${isPasswordValidated.error?.issues[0].message}` 
        : isUsernameValidated.error?.issues[0].message || isPasswordValidated.error?.issues[0].message, 
      success: false 
    });
    console.log("Validated Signin Inputs");
  next();
};

export const validateResetPassInputs = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password, new_password } = req.body;
  const zodUsernameSchema = zod.string().min(7, "Your username should contain minimum 7 characters").max(16, "Your username should contain maximum 16 characters");
  const zodPasswordSchema = zod.string().min(8, "Your password including(new_password) should contain minimum 8 characters").max(20, "Your password including(new_password) should contain maximum 10 characters");

  const isUsernameValidated = zodUsernameSchema.safeParse(username);
  const isPasswordValidated = zodPasswordSchema.safeParse(password);
  const isNewPasswordValidated = zodPasswordSchema.safeParse(new_password);

  if (!isUsernameValidated.success || !isPasswordValidated.success || !isNewPasswordValidated.success)
    return res.json({
      msg: !isUsernameValidated.success && !isPasswordValidated.success && !isNewPasswordValidated.success
        ? `${isUsernameValidated.error?.issues[0].message} and ${isPasswordValidated.error?.issues[0].message} and ${isNewPasswordValidated.error?.issues[0].message}`
        : isUsernameValidated.error?.issues[0].message || isPasswordValidated.error?.issues[0].message || isNewPasswordValidated.error?.issues[0].message,
      success: false,
    });
  next();
};

export const fetchStudent = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  const isUserPresent = await findUserByUsername(username);

  if (!isUserPresent) return res.json({ msg: "Seems like you dont have an account yet! Consult your Administration!", success: false });

  const userResult = await currentUserByUsername(username);
  if (!userResult.success || !userResult.user) return res.json({ msg: "Invalid credentials Please Try again!", success: false });

  const user = userResult.user;
  if (!user.Password) return res.json({ msg: "Error fetching user details please try again!", success: false });

  if (!(await bcrypt.compare(password, user.Password))) 
    return res.json({ msg: "Invalid credentials Please Try again or Contact your Administrator now!", success: false });
  next();
};


import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  if (!authorization || !process.env.JWT_SECURITY_KEY)
    return res.status(401).json({ msg: "AUTH_ERROR : Missing authorization headers!", success: false });

  try {
    const token = authorization.split(" ")[1];
    const decoded_username = jwt.verify(token, process.env.JWT_SECURITY_KEY) as string ;
    console.log('decoded_username JWT:', decoded_username);
    // fetch admin from DB
    const admin = await client.admin.findUnique({
      where: { Username: decoded_username },
      select: { id: true, Username: true, role: true },
    });

        // attach admin object to request
        if (admin) {
          (req as any).admin = {
            _id: admin.id,
            username: admin.Username,
            role: admin.role,
          };
        }

    if (!admin) {
        const student = await client.student.findUnique({
        where: { Username: decoded_username },
        select: { id: true, Username: true },
      });
      if (!student) return res.status(401).json({ msg: "AUTH_ERROR", success: false });
    }



    next();
  } catch (err) {
    console.error("AUTH_ERROR", err);
    res.status(401).json({ msg: "AUTH_ERROR : Invalid token", success: false });
  }
};


export const isPresentInCampus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    if (!(await isStudentPresentInCampus(userId))) 
      return res.json({ msg: "You cannot request an outpass from Outside College Broo!", success: false });
    next();
  } catch (e) {
    res.json({ e, success: false });
  }
};

export const isApplicationPending = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    const isPending = await isPendingApplication(userId);
    if (isPending.isPending) 
      return res.json({ msg: "You cannot request an outpass/outing now because you have a pending request!", success: false });
    next();
  } catch (e) {
    res.json({ e, success: false });
  }
};