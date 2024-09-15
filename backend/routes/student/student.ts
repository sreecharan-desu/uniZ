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
const client = new PrismaClient();

studentRouter.post("/signin", validateSigninInputs, fetchStudent, async (req, res) => {
    const { username } = req.body;
    const token = await jwt.sign(username,'a74d9ff8f6c0638b05c21de570d57805');
    res.json({
        student_token: token,
        success: true,
    });
});

studentRouter.put("/resetpass", validateResetPassInputs, fetchStudent, authMiddleware, async (req, res) => {
    const { username,new_password } = req.body;
    try {
        const isUpdated = await updateStudentPassword(username, new_password);
        if (isUpdated) {

            const user = await client.student.findFirst({
                where: { Username : username },
                select: { Email: true, Username: true },
            });
            const email = user?.Email;
        if (email) {
                const outPassEmailBody = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            color: #333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 20px;
                        }
                        .container {
                            background-color: #ffffff;
                            border-radius: 8px;
                            padding: 20px;
                            max-width: 600px;
                            margin: 0 auto;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            color: #4CAF50;
                            font-size: 24px;
                            margin-top: 0;
                        }
                        p {
                            font-size: 16px;
                            line-height: 1.6;
                            margin: 10px 0;
                        }
                        .details {
                            margin-top: 20px;
                            padding: 15px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            background-color: #f9f9f9;
                        }
                        .details p {
                            margin: 5px 0;
                        }
                        .footer {
                            margin-top: 20px;
                            font-size: 14px;
                            color: #888;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Your Outpass Request</h1>
                        <div class="details">
                           <p>Your Password has been changed! We processed this on your request on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} through uniZ website</p>
                           <p><strong>If this is not you Complaint about this to warden!</strong></p>

                           <p>**Kindly ignore this if it is done by you!</p>
                        </div>
                        <div class="footer">
                            <p>Thank you for your patience.</p>
                            <p>Best regards,<br>uniZ</p>
                        </div>
                    </div>
                </body>
                </html>
                `;
                await sendEmail(email, "Regarding Reset-Password", outPassEmailBody);
            res.json({
                msg: "Password updated successfully! Signin again with your new Password for authentication!",
                success: true,
            });
        } else {



            const user = await client.student.findFirst({
                where: { Username : username },
                select: { Email: true, Username: true },
            });
            const email = user?.Email;
        if (email) {
                const outPassEmailBody = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            color: #333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 20px;
                        }
                        .container {
                            background-color: #ffffff;
                            border-radius: 8px;
                            padding: 20px;
                            max-width: 600px;
                            margin: 0 auto;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            color: #4CAF50;
                            font-size: 24px;
                            margin-top: 0;
                        }
                        p {
                            font-size: 16px;
                            line-height: 1.6;
                            margin: 10px 0;
                        }
                        .details {
                            margin-top: 20px;
                            padding: 15px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            background-color: #f9f9f9;
                        }
                        .details p {
                            margin: 5px 0;
                        }
                        .footer {
                            margin-top: 20px;
                            font-size: 14px;
                            color: #888;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Your Outpass Request</h1>
                        <div class="details">
                           <p>An attempt to change your password has been notices on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} through uniZ website</p>
                           <p><strong>If this is not you Immediately Change your password or Complaint about this to warden!</strong></p>

                           <p>**Kindly ignore this if it is done by you!</p>
                        </div>
                        <div class="footer">
                            <p>Thank you for your patience.</p>
                            <p>Best regards,<br>uniZ</p>
                        </div>
                    </div>
                </body>
                </html>
                `;
                await sendEmail(email, "Regarding Reset-Password", outPassEmailBody);

            res.json({
                msg: "Error updating password Please try again!",
                success: false,
            });
        }
    }}}catch (e) {
        res.json({
            msg: "Error updating password Please try again!",
            success: false,
        });
    }
});

studentRouter.post('/requestoutpass', isPresentInCampus, isApplicationPending, authMiddleware, async (req, res) => {
    const { reason, userId, from_date, to_date } = req.body;
    const outpass = await requestOutpass(reason, userId, new Date(from_date), new Date(to_date));
    if (outpass?.success) {
        const user = await client.student.findFirst({
            where: { id: userId },
            select: { Email: true, Username: true },
        });
        const email = user?.Email;
        if (email) {
const outPassEmailBody = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #4CAF50;
            font-size: 24px;
            margin-top: 0;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            margin: 10px 0;
        }
        .details {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        .details p {
            margin: 5px 0;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Your Outpass Request</h1>
        <p>Your outpass request with ID: <strong>${
          outpass.outpass_details?.id
        }</strong> is being sent to your warden. You will be notified via email once it is approved or rejected.</p>
        <div class="details">
            <p><strong>From Day:</strong> ${
              outpass.outpass_details?.FromDay.toLocaleString()
                .split("05:30:00")[0]
                .split(",")[0]
            }</p>
            <p><strong>To Day:</strong> ${
              outpass.outpass_details?.ToDay.toLocaleString()
                .split("05:30:00")[0]
                .split(",")[0]
            }</p>
            <p><strong>No. of Days:</strong> ${
              outpass.outpass_details?.Days
            }</p>
            <p><strong>Time Requested:</strong> ${
              outpass.outpass_details?.RequestedTime.toLocaleString().split(
                "GMT"
              )[0]
            }</p>
        </div>
        <div class="footer">
            <p>Thank you for your patience.</p>
            <p>Best regards,<br>uniZ</p>
        </div>
    </div>
</body>
</html>
`;
const wardenOutPassEmailBody = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #4CAF50;
            font-size: 24px;
            margin-top: 0;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            margin: 10px 0;
        }
        .details {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        .details p {
            margin: 5px 0;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>A New Outpass Request from ${user.Username}</h1>
        <p><strong>Here are the details:</strong></p>
        <div class="details">
            <p><strong>Reason:</strong> ${outpass.outpass_details?.Reason}</p>
            <p><strong>From Day:</strong> ${
              outpass.outpass_details?.FromDay.toLocaleString()
                .split("05:30:00")[0]
                .split(",")[0]
            }</p>
            <p><strong>To Day:</strong> ${
              outpass.outpass_details?.ToDay.toLocaleString()
                .split("05:30:00")[0]
                .split(",")[0]
            }</p>
            <p><strong>No. of Days:</strong> ${
              outpass.outpass_details?.Days
            }</p>
            <p><strong>Time Requested:</strong> ${
              outpass.outpass_details?.RequestedTime.toLocaleString().split(
                "GMT"
              )[0]
            }</p>
        </div>
        <p>Go to the website now to approve or reject requests...</p>
        <div class="footer">
            <p>Thank you for your patience.</p>
            <p>Best regards,<br>uniZ</p>
        </div>
    </div>
</body>
</html>
`;

            await sendEmail(email, "Regarding your OutpassRequest", outPassEmailBody);
            await sendEmail('sreecharan309@gmail.com', "New Outpass Request", wardenOutPassEmailBody);
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
    } else {
        res.json({
            msg: outpass?.msg,
            success: outpass?.success,
        });
    }
});

studentRouter.post('/requestouting', isPresentInCampus, isApplicationPending, authMiddleware, async (req, res) => {
    const { reason, userId, from_time, to_time } = req.body;
    const outing = await requestOuting(reason, userId, from_time, to_time);
    if (outing?.success) {
        const user = await client.student.findFirst({ where: { id: userId } });
        const email = user?.Email;
        if (email) {
                const studentOutingEmailBody = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            color: #333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 20px;
                        }
                        .container {
                            background-color: #ffffff;
                            border-radius: 8px;
                            padding: 20px;
                            max-width: 600px;
                            margin: 0 auto;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            color: #4CAF50;
                            font-size: 24px;
                            margin-top: 0;
                        }
                        p {
                            font-size: 16px;
                            line-height: 1.6;
                            margin: 10px 0;
                        }
                        .details {
                            margin-top: 20px;
                            padding: 15px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            background-color: #f9f9f9;
                        }
                        .details p {
                            margin: 5px 0;
                        }
                        .footer {
                            margin-top: 20px;
                            font-size: 14px;
                            color: #888;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Your Outing Request</h1>
                        <p>Your outing request with ID: <strong>${
                        outing.outing_details?.id
                        }</strong> is being sent to your warden. You will be notified via email once it is approved or rejected.</p>
                        <div class="details">
                            <p><strong>Reason:</strong> ${outing.outing_details?.reason}</p>
                            <p><strong>From Time:</strong> ${
                            outing.outing_details?.FromTime.toLocaleString()
                                .split("05:30:00")[0]
                                .split(",")[1]
                            }</p>
                            <p><strong>To Time:</strong> ${
                            outing.outing_details?.ToTime.toLocaleString()
                                .split("05:30:00")[0]
                                .split(",")[1]
                            }</p>
                            <p><strong>Time Requested:</strong> ${
                            outing.outing_details?.RequestedTime.toLocaleString().split(
                                "GMT"
                            )[0]
                            }</p>
                        </div>
                        <div class="footer">
                            <p>Thank you for your patience.</p>
                            <p>Best regards,<br>uniZ</p>
                        </div>
                    </div>
                </body>
                </html>
                `;

           const wardenOutingEmailBody = `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        color: #333;
                                        background-color: #f4f4f4;
                                        margin: 0;
                                        padding: 20px;
                                    }
                                    .container {
                                        background-color: #ffffff;
                                        border-radius: 8px;
                                        padding: 20px;
                                        max-width: 600px;
                                        margin: 0 auto;
                                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                    }
                                    h1 {
                                        color: #4CAF50;
                                        font-size: 24px;
                                        margin-top: 0;
                                    }
                                    p {
                                        font-size: 16px;
                                        line-height: 1.6;
                                        margin: 10px 0;
                                    }
                                    .details {
                                        margin-top: 20px;
                                        padding: 15px;
                                        border: 1px solid #ddd;
                                        border-radius: 5px;
                                        background-color: #f9f9f9;
                                    }
                                    .details p {
                                        margin: 5px 0;
                                    }
                                    .footer {
                                        margin-top: 20px;
                                        font-size: 14px;
                                        color: #888;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <h1>A New Outing Request from ${user.Username}</h1>
                                    <p><strong>Here are the details:</strong></p>
                                    <div class="details">
                                        <p><strong>Reason:</strong> ${outing.outing_details?.reason}</p>
                                        <p><strong>From Time:</strong> ${outing.outing_details?.FromTime.toLocaleString().split("05:30:00")[0].split(",")[1]}</p>
                                        <p><strong>To Time:</strong> ${outing.outing_details?.ToTime.toLocaleString().split("05:30:00")[0].split(",")[1]}</p>
                                        <p><strong>Time Requested:</strong> ${outing.outing_details?.RequestedTime.toLocaleString().split("GMT")[0]}</p>
                                    </div>
                                    <p>Go to the website now to approve or reject requests...</p>
                                    <div class="footer">
                                        <p>Thank you for your patience.</p>
                                        <p>Best regards,<br>uniZ</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                            `;


            await sendEmail(email, "Regarding your OutingRequest", studentOutingEmailBody);
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
    } else {
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
