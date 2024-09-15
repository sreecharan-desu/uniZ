import { NextFunction, Request, Response } from "express"; import zod from "zod";
import { addAdmin, currentAdminByUsername, currentUserByUsername, findAdminByUsername, findUserByUsername, updateDB } from "../../helper-functions";
import bcrypt from "bcrypt";

export const validateSigninInputs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  addAdmin('admin','1234567890');
  const { username, password } = req.body;
  const zodUsernameSchema = zod
    .string()
    .min(4, "Your username should contain minimum 4 characters")
    .max(7, "Your username should contain maximum 7 characters");
  const zodPasswordSchema = zod
    .string()
    .min(8, "Your password should contain minimum 8 characters")
    .max(10, "Your password should contain maximum 10 characters");

  const isUsernameValidated = zodUsernameSchema.safeParse(username);
  const isPasswordValidated = zodPasswordSchema.safeParse(password);

  const usernameError = isUsernameValidated.error?.issues[0].message;
  const passwordError = isPasswordValidated.error?.issues[0].message;

  if (isUsernameValidated.success && isPasswordValidated.success) {
    next();
  } else if (
    usernameError ||
    passwordError ||
    (usernameError && passwordError)
  ) {
    if (!isUsernameValidated.success && !isPasswordValidated.success) {
      res.json({
        msg: `${usernameError} and ${passwordError}`,
        success: false,
      });
    } else if (!isUsernameValidated.success) {
      res.json({
        msg: usernameError,
        success: false,
      });
    } else if (!isPasswordValidated.success) {
      res.json({
        msg: passwordError,
        success: false,
      });
    } else {
      res.json({
        msg: "Invalid Inputs Please Try again",
        success: false,
      });
    }
  }
};

export const fetchAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body;
  const isUserPresent = await findAdminByUsername(username);
  if (isUserPresent) {
    const admin = await currentAdminByUsername(username);
    if (admin && admin.success) {
      const adminPassword = admin.admin?.Password;
      if (adminPassword) {
        const isMatch = await bcrypt.compare(password, adminPassword);
        if (isMatch) {
          next();
        } else {
          res.json({
            msg: "Invalid credentials Please Try again or reset your password now!",
            success: false,
          });
        }
      } else {
        res.json({
          msg: "Error fetching user details please try again!",
          success: false,
        });
      }
    } else {
      res.json({
        msg: "Invalid credentials Please Try again!",
        success: false,
      });
    }
  } else {
    res.json({
      msg: `Seems like you dont have an account yet!`,
      success: false,
    });
    }
};