import { Request, Response, NextFunction } from "express";
import zod from "zod"; import bcrypt from "bcrypt"; import jwt from "jsonwebtoken";
import { currentUserByUsername, findUserByUsername, isPendingApplication, isStudentPresentInCampus } from "../../helper-functions";
import dotenv from "dotenv";
dotenv.config();

export const validateSigninInputs = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    const zodUsernameSchema = zod.string().min(7, "Your username should contain minimum 7 characters").max(7, "Your username should contain maximum 7 characters")
    const zodPasswordSchema = zod.string().min(8, "Your password should contain minimum 8 characters").max(20, "Your password should contain maximum 20 characters");

    const isUsernameValidated = zodUsernameSchema.safeParse(username)
    const isPasswordValidated = zodPasswordSchema.safeParse(password)

    const usernameError = isUsernameValidated.error?.issues[0].message
    const passwordError = isPasswordValidated.error?.issues[0].message;

    if (isUsernameValidated.success && isPasswordValidated.success) {
        next()
    } else if(usernameError || passwordError || usernameError && passwordError){
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
}

export const validateResetPassInputs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password,new_password} = req.body;
  const zodUsernameSchema = zod
    .string()
    .min(7, "Your username should contain minimum 7 characters")
    .max(7, "Your username should contain maximum 7 characters");
  const zodPasswordSchema = zod
    .string()
    .min(
      8,
      "Your password including(new_password) should contain minimum 8 characters"
    )
    .max(
      20,
      "Your password including(new_password) should contain maximum 10 characters"
    );

  const isUsernameValidated = zodUsernameSchema.safeParse(username);
  const isPasswordValidated = zodPasswordSchema.safeParse(password);
  const isNewPasswordValidated = zodPasswordSchema.safeParse(new_password);

  const usernameError = isUsernameValidated.error?.issues[0].message;
  const passwordError = isPasswordValidated.error?.issues[0].message;
  const newpasswordError = isNewPasswordValidated.error?.issues[0].message;

  if (isUsernameValidated.success && isPasswordValidated.success && isNewPasswordValidated.success) {
    next();
  } else if (
    usernameError ||
    passwordError ||
    (usernameError && passwordError) || (usernameError && newpasswordError && passwordError) ||
    newpasswordError || (newpasswordError && passwordError)
  ) {
    if (!isUsernameValidated.success && !isPasswordValidated.success && !isNewPasswordValidated.success) {
      res.json({
        msg: `${usernameError} and ${passwordError} and ${newpasswordError}`,
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
    } else if (!isNewPasswordValidated.success) {
      res.json({
        msg: newpasswordError,
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

export const fetchStudent = async (req: Request, res: Response, next: NextFunction) => {
    const { username,password } = req.body;
    const isUserPresent = await findUserByUsername(username);
    if (isUserPresent) {
        const user = await currentUserByUsername(username);
        if (user && user.success) {
            const userPassword = user.user?.Password;
            if (userPassword) {
                const isMatch = await bcrypt.compare(password, userPassword);
                if (isMatch) {
                    next()
                } else {
                    res.json({
                      msg: "Invalid credentials Please Try again or Contact your Administrator now!",
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
          msg: `Seems like you dont have an account yet! Consult your Warden!`,
          success: false,
        });
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  if (authorization && process.env.JWTSECRETKEY) {
    try {
      const token = authorization.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWTSECRETKEY);
      if (verified) {
        next();
      } else {
        res.json({
          msg: "AUTH_ERROR : Invalid token",
          success: false
        })
      }
    } catch (e) {
      res.json({
        msg: "AUTH_ERROR : Missing authorization headers!",
        success: false,
      });
    }
  };
}

export const isPresentInCampus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    const isPresent = await isStudentPresentInCampus(userId);
    if (!isPresent) {
      res.json({
        msg: "You cannot request an outpass from Outside College Broo!",
        success : false
      })
    } else {
      next()
    }
  } catch (e) {
    res.json({
      e,
      success : false
    })
  }

}

export const isApplicationPending = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;
    const isPending = await isPendingApplication(userId);
    if (!isPending.isPending){
      next();
    } else if (isPending.isPending){
        res.json({
        msg: "You cannot request an outpass/outing now because you have a pending request!",
        success: false,
      });
    }
  } catch (e) {
    res.json({
      e,
      success: false,
    });
  }
};