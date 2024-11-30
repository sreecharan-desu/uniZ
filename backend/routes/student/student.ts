import { Router } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
    authMiddleware,
    fetchStudent,
    isApplicationPending,
    isPresentInCampus,
    validateResetPassInputs,
    validateSigninInputs,
} from "./middlewares/middlewares";
import {
    findUserByUsername,
    getStudentDetails,
    requestOuting,
    requestOutpass,
    sendEmail,
    updateStudentPassword,
} from "../helper-functions";

export const studentRouter = Router();
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { getOutingMailFormatForStudent, getOutingMailFormatForWarden, getOutpassMailFormatForStudent, getOutpassMailFormatForWarden, passwordResetFailed, passwordResetSuccess } from "./emails";
const client = new PrismaClient();

studentRouter.post("/signin", validateSigninInputs, fetchStudent, async (req, res) => {
    const { username } = req.body;
    const token = await jwt.sign(username,'a74d9ff8f6c0638b05c21de570d57805'); //SECURITY_KEY IS HARDCODED (POTENTIAL)
    res.json({ student_token: token, success: true, });
});

studentRouter.put("/resetpass",validateResetPassInputs,fetchStudent,authMiddleware, async (req, res) => {
      const { username, new_password } = req.body;
      try {
        // Update the student's password
        const isUpdated = await updateStudentPassword(username, new_password);
        if (!isUpdated) {
          const user = await client.student.findFirst({
              where: { Username: username },
              select: { Email: true, Username: true },
            });
          if(user) await sendEmail(user.Email, "Regarding Reset-Password", passwordResetFailed);
          return res.status(400).json({
            msg: "Invalid credentials! Password update failed.",
            success: false,
          });
        }
        // Fetch the student details (fetchStudent middleware could pass it)
        const user = await client.student.findFirst({
          where: { Username: username },
          select: { Email: true, Username: true },
        });
        if (!user) {
          return res.status(404).json({
            msg: "User not found. Password update failed.",
            success: false,
          });
        }
        // Send success email
        await sendEmail(user.Email, "Regarding Reset-Password", passwordResetSuccess);
        return res.status(200).json({
          msg: "Password updated successfully! Sign in again with your new password.",
          success: true,
        });
      } catch (error) {
        console.error("Error updating password:", error); // Log error for debugging
        return res.status(500).json({
          msg: "An unexpected error occurred. Please try again later.",
          success: false,
        });
      }
    }
);
  

studentRouter.post('/requestoutpass', isPresentInCampus, isApplicationPending, authMiddleware, async (req, res) => {
    const { reason, userId, from_date, to_date } = req.body;
    // console.log("requestBody : ",req.body);
    try{
        const outpass = await requestOutpass(reason, userId, new Date(from_date), new Date(to_date));
        //conosole.log("requestedOutpass : ",outpass)
        if (outpass?.success) {
            const user = await client.student.findFirst({ where: { id: userId }, select: { Email: true, Username: true }, });
            const studentOutpassEmail = await getOutpassMailFormatForStudent(outpass);
            const wardenOutpassEmail = await getOutpassMailFormatForWarden(outpass,user);
            if (user?.Email) {
                await sendEmail(user?.Email, "Regarding your OutpassRequest",studentOutpassEmail);
                await sendEmail('sreecharan309@gmail.com', "New Outpass Request", wardenOutpassEmail);
                res.json({
                    msg: outpass?.msg,
                    success: outpass?.success,
                });
            } else {
                res.json({
                    msg: outpass?.msg,
                    success: outpass?.success,
                });
            }
        }
        //Handle Invalid Outpass requests here 
        else {
            res.json({
                msg: outpass?.msg,
                success: outpass?.success,
            });
        }
    }
    catch(error){
        console.error("Error requesting password : ", error); // Log error for debugging
        return res.status(500).json({
          msg: "An unexpected error occurred. Please try again later.",
          success: false,
        });
    }
   
});

studentRouter.post('/requestouting', isPresentInCampus, isApplicationPending, authMiddleware, async (req, res) => {
    const { reason, userId, from_time, to_time } = req.body;
    const outing = await requestOuting(reason, userId, from_time, to_time);
    if (outing?.success) {
        const user = await client.student.findFirst({ where: { id: userId } });
        const studentOutingEmailBody = await getOutingMailFormatForStudent(outing);
        const wardenOutingEmailBody = await getOutingMailFormatForWarden(outing,user);
        if (user?.Email) {
           await sendEmail(user.Email, "Regarding your OutingRequest", studentOutingEmailBody);
           await sendEmail('sreecharan309@gmail.com', "New Outing Request", wardenOutingEmailBody);
            res.json({
                msg: outing?.msg,
                success: outing?.success,
            });
        } else {
            res.json({
                msg: outing?.msg,
                success: outing?.success,
            });
        }
    } 
    else {
        res.json({
            msg: outing?.msg,
            success: outing?.success,
        });
    }
});

studentRouter.post("/getdetails", authMiddleware, async (req, res) => {
    const { username } = req.body;
    if (username) {
        const user = await getStudentDetails(username);
        res.json({
            student : user,
            success: true,
        });
    } else {
        res.json({
            msg: "Internal Server Error Please Try again!",
            success: false,
        });
    }
});
