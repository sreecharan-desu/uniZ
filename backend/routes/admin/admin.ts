import { Router } from "express";
import jwt from "jsonwebtoken";
import xlsx from "xlsx";import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { fetchAdmin, validateSigninInputs } from "./middlewares/middlewares";
import { authMiddleware, validateResetPassInputs } from "../student/middlewares/middlewares";
const client = new PrismaClient();
import {
  addStudent,
  approveOuting,
  approveOutpass,
  getOutingRequests,
  getOutPassRequests,
  getStudentDetails,
  getStudentsOutsideCampus,
  getUsers,
  rejectOuting,
  rejectOutpass,
  sendEmail,
  updateAdminPassword,
  updateDB,
  updateStudentPassword,
  updateUserPrescence,
} from "../helper-functions";
export const adminRouter = Router();

adminRouter.post(
  "/signin",
  validateSigninInputs,
  fetchAdmin,
  async (req, res) => {
    try{
      updateDB();
      const { username } = req.body;
        const token = await jwt.sign(username, 'a74d9ff8f6c0638b05c21de570d57805');
        res.json({
          admin_token: token,
          success: true,
        });
    }catch(e){
      res.json({
        msg: "Internal Server Error Please Try again!",
        success: false,
      });
    }
  }
);


adminRouter.put("/resetpass", validateResetPassInputs, fetchAdmin, authMiddleware, async (req, res) => {
  const { username, new_password } = req.body;
  try {
      const isUpdated = await updateAdminPassword(username, new_password);
      if (isUpdated) {
          res.json({
              msg: "Password updated successfully! Signin again with your new Password for authentication!",
              success: true,
          });
      } else {
          res.json({
              msg: "Error updating password Please try again!",
              success: false,
          });
      }
  } catch (e) {
      res.json({
          msg: "Error updating password Please try again!",
          success: false,
      });
  }
});

adminRouter.get("/getoutpassrequests", authMiddleware, async (req, res) => {
  try {
    const requests = await getOutPassRequests();
    res.json({
      outpasses: requests,
      success: true,
    });
  } catch (e) {
    res.json({
      msg: "Error : Fething requests Try again!",
      success: true,
    });
  }
});

adminRouter.get("/getoutingrequests", authMiddleware, async (req, res) => {
  try {
    const requests = await getOutingRequests();
    res.json({
      outings : requests,
      success: true,
    });
  } catch (e) {
    res.json({
      msg: "Error : Fething requests Try again!",
      success: true,
    });
  }
});

adminRouter.get("/getstudents", authMiddleware, async (req, res) => {
  try {
    const students = await getUsers();
    res.json({
      students,
      msg : `Successfully Fetched ${students.length} students`,
      success: true,
    });
  } catch (e) {
    res.json({
      msg: "Error : Fething Students Try again!",
      success: true,
    });
  }
});

adminRouter.post("/approveoutpass", authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const outpass = await approveOutpass(id);
    if (outpass?.success) {
      const outpass = await client.outpass.findFirst({
        where: { id: id },
        select: { Student: { select: { Email: true } }, ToDay: true },
      });
      const email = outpass?.Student.Email;
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
                        <h1>Your Outpass Request Has been Approved!</h1>
                        <p>Your outpass request with ID: <strong>${id}</strong> has been Approved!</p>
                        
                        <div class="details">
                            <p><strong> You should return to campus on ${outpass.ToDay.toLocaleDateString()}</strong></p>
                        </div>
                        
                        <div class="footer">
                            <p>Thank you for your patience.</p>
                            <p>Best regards,<br>uniZ</p>
                        </div>
                    </div>
                </body>
                </html>
                `;
          await sendEmail(
            email,
            "Regarding your OutpassRequest",
            outPassEmailBody
          );
      }
    }     res.json({
      msg: outpass.msg,
      success: outpass.success,
    });
  } catch (e) {
    res.json({
      msg: "Error approving outpass Please Try again!",
      success: false,
    });
  }
});

adminRouter.post("/approveouting", authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const outing = await approveOuting(id);
    if (outing?.success) {
      const outing = await client.outing.findFirst({
        where: { id: id },
        select: { Student: { select: { Email: true } }, ToTime: true },
      });
      const email = outing?.Student.Email;
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
                    <h1>Your Outing Request Has been Approved!</h1>
                    <p>Your outing request with ID: <strong>${id}</strong> has been Approved!</p>
                    
                    <div class="details">
                        <p><strong> You should return to campus by ${outing.ToTime.toLocaleTimeString()}</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>Thank you for your patience.</p>
                        <p>Best regards,<br>uniZ</p>
                    </div>
                </div>
            </body>
            </html>
            `;
        await sendEmail(
          email,
          "Regarding your OutingRequest",
          outPassEmailBody
        );
      }
    }     res.json({
      msg: outing.msg,
      success: outing.success,
    });
  } catch (e) {
    res.json({
      msg: "Error approving outing Please Try again!",
      success: false,
    });
  }
});

adminRouter.post("/rejectouting", authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const outing = await rejectOuting(id);
    if (outing?.success) {
      const outing = await client.outing.findFirst({
        where: { id: id },
        select: { Student: { select: { Email: true } },Message : true,rejectedBy : true,rejectedTime : true},
      });
      const email = outing?.Student.Email;
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
                        color:red;
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
                    <h1>Your Outing Request Has been Rejected!</h1>
                    <p>Your outing request with ID: <strong>${id}</strong> has been <b>Rejected!</b></p>
                    <div class="details">
                        <p>
                          <strong>
                            Rejected by : ${outing.rejectedBy}                            
                          </strong>
                        </p>
                        <p>
                          <strong>
                            Rejected Time : ${outing.rejectedTime}
                          </strong>
                        </p>
                        <p>
                          <strong>
                            Message : ${outing.Message}
                          </strong>
                        </p>
                    </div>
                    <div class="footer">
                        <p>Thank you for your patience.</p>
                        <p>Best regards,<br>uniZ</p>
                    </div>
                </div>
            </body>
            </html>
            `;
        await sendEmail(
          email,
          "Regarding your OutingRequest",
          outPassEmailBody
        );
      }
    }
    res.json({
      msg: outing.msg,
      success: outing.success,
    });
  } catch (e) {
    res.json({
      msg: "Error rejecting outing Please Try again!",
      success: false,
    });
  }
});

adminRouter.post("/rejectoutpass", authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const outpass = await rejectOutpass(id);
    if (outpass?.success) {
      const outpass = await client.outpass.findFirst({
        where: { id: id },
        select: {
          Student: { select: { Email: true } },
          Message: true,
          rejectedBy: true,
          rejectedTime: true,
        },
      });
      const email = outpass?.Student.Email;
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
                        color: red;
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
                    <h1>Your Outpass Request Has been Rejected!</h1>
                    <p>Your outpass request with ID: <strong>${id}</strong> has been <b>Rejected!</b></p>
                    <div class="details">
                        <p>
                          <strong>
                            Rejected by : ${outpass.rejectedBy}                            
                          </strong>
                        </p>
                        <p>
                          <strong>
                            Rejected Time : ${outpass.rejectedTime}
                          </strong>
                        </p>
                        <p>
                          <strong>
                            Message : ${outpass.Message}
                          </strong>
                        </p>
                    </div>
                    <div class="footer">
                        <p>Thank you for your patience.</p>
                        <p>Best regards,<br>uniZ</p>
                    </div>
                </div>
            </body>
            </html>
            `;
        await sendEmail(
          email,
          "Regarding your OutPassRequest",
          outPassEmailBody
        );
      }
    }
    res.json({
      msg: outpass.msg,
      success: outpass.success,
    });
  } catch (e) {
    res.json({
      msg: "Error rejecting outpass Please Try again!",
      success: false,
    });
  }
});

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
interface Student {
  IDNO: string;
  Email: string;
  Password: string;
  NAME: string;
  GENDER: string;
}

adminRouter.post("/updatestudents", authMiddleware,async (req,res) => {
  try {
    console.log("Adding data please hold on...");
    const filePath = "./data.xlsx";
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    let records = 0;
    const students: Student[] = xlsx.utils.sheet_to_json<Student>(sheet);
    for (const student of students) {
      await addStudent(student.IDNO.toLowerCase(),student.Password.toLowerCase(),student.GENDER,student.NAME);
      records++;
    }
    console.log(`Successfully added ${records} students from the Excel file`);
    res.json({
      msg: `Successfully added ${records} students from the Excel file`,
      success: true,
    });
  } catch (error) {
    console.error("Error adding students:", error);
    res.status(500).json({
      msg: "Error adding students",
      success: false,
    });
  }
});

adminRouter.get(
  "/getstudentsoutsidecampus",
  authMiddleware,
  async (req, res) => {
    try {
      const studens = await getStudentsOutsideCampus();
      res.json({
        studens,
        success: true,
      });
    } catch (e) {
      res.json({
        msg: "Error fetching stdudents",
        success: false,
      });
    }
  }
);

adminRouter.post("/updatestudentstatus", authMiddleware, async (req, res) => {
  try {
    const { userId,id } = req.body;
    const student = await updateUserPrescence(userId,id);
    res.json({
      msg: student.msg,
      success: student.success,
    });
  } catch (e) {
    res.json({
      msg: "Error fetching stdudents",
      success: false,
    });
  }
});


adminRouter.post('/searchstudent',authMiddleware,async(req,res)=>{
  try {
    const { username } = req.body;
    const student = await getStudentDetails(username);
    if(student==null){
      res.json({
        msg : "No student found with idnumber : " + username,success:false,
      });
    }else{
      res.json({
        student,success:true,
      });
    }
  } catch (e) {
    res.json({
      msg: "Error fetching stdudents",
      success: false,
    });
  }
})



