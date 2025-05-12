import { NextFunction, Request, Response } from "express";
import zod from "zod";
import { addAdmin, currentAdminByUsername } from "../../helper-functions";
import bcrypt from "bcrypt";

export const validateSigninInputs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    addAdmin(req.body.username, req.body.password);
  const { username, password } = req.body;
  const zodUsernameSchema = zod
    .string()
    .min(4, "Your username should contain minimum 4 characters")
    .max(14, "Your username should contain maximum 7 characters");
  const zodPasswordSchema = zod
    .string()
    .min(8, "Your password should contain minimum 8 characters")
    .max(20, "Your password should contain maximum 20 characters");

  const isUsernameValidated = zodUsernameSchema.safeParse(username);
  const isPasswordValidated = zodPasswordSchema.safeParse(password);

  const usernameError = isUsernameValidated.error?.issues[0].message;
  const passwordError = isPasswordValidated.error?.issues[0].message;

  if (usernameError && passwordError) {
    return res.json({ msg: `${usernameError} and ${passwordError}`, success: false });
  }
  if (usernameError) {
    return res.json({ msg: usernameError, success: false });
  }
  if (passwordError) {
    return res.json({ msg: passwordError, success: false });
  }
  next();
};

export const fetchAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body;
  const adminResult = await currentAdminByUsername(username);
  if (!adminResult.success || !adminResult.admin) {
    return res.json({ msg: "Seems like you dont have an account yet!", success: false });
  }
  const admin = adminResult.admin;
  if (!admin.Password) {
    return res.json({ msg: "Error fetching user details please try again!", success: false });
  }
  const isMatch = await bcrypt.compare(password, admin.Password);
  if (!isMatch) {
    return res.json({ msg: "Invalid credentials Please Try again or reset your password now!", success: false });
  }
  next();
};