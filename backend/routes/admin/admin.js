"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const xlsx_1 = __importDefault(require("xlsx"));
const client_1 = require("@prisma/client");
const middlewares_1 = require("./middlewares/middlewares");
const middlewares_2 = require("../student/middlewares/middlewares");
const client = new client_1.PrismaClient();
const helper_functions_1 = require("../helper-functions");
exports.adminRouter = (0, express_1.Router)();
exports.adminRouter.post("/signin", middlewares_1.validateSigninInputs, middlewares_1.fetchAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, helper_functions_1.updateDB)();
        const { username } = req.body;
        const token = yield jsonwebtoken_1.default.sign(username, 'a74d9ff8f6c0638b05c21de570d57805');
        res.json({
            admin_token: token,
            success: true,
        });
    }
    catch (e) {
        res.json({
            msg: "Internal Server Error Please Try again!",
            success: false,
        });
    }
}));
exports.adminRouter.put("/resetpass", middlewares_2.validateResetPassInputs, middlewares_1.fetchAdmin, middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, new_password } = req.body;
    try {
        const isUpdated = yield (0, helper_functions_1.updateAdminPassword)(username, new_password);
        if (isUpdated) {
            res.json({
                msg: "Password updated successfully! Signin again with your new Password for authentication!",
                success: true,
            });
        }
        else {
            res.json({
                msg: "Error updating password Please try again!",
                success: false,
            });
        }
    }
    catch (e) {
        res.json({
            msg: "Error updating password Please try again!",
            success: false,
        });
    }
}));
exports.adminRouter.get("/getoutpassrequests", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield (0, helper_functions_1.getOutPassRequests)();
        res.json({
            outpasses: requests,
            success: true,
        });
    }
    catch (e) {
        res.json({
            msg: "Error : Fething requests Try again!",
            success: true,
        });
    }
}));
exports.adminRouter.get("/getoutingrequests", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield (0, helper_functions_1.getOutingRequests)();
        res.json({
            outings: requests,
            success: true,
        });
    }
    catch (e) {
        res.json({
            msg: "Error : Fething requests Try again!",
            success: true,
        });
    }
}));
exports.adminRouter.get("/getstudents", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const students = yield (0, helper_functions_1.getUsers)();
        res.json({
            students,
            msg: `Successfully Fetched ${students.length} students`,
            success: true,
        });
    }
    catch (e) {
        res.json({
            msg: "Error : Fething Students Try again!",
            success: true,
        });
    }
}));
exports.adminRouter.post("/approveoutpass", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const outpass = yield (0, helper_functions_1.approveOutpass)(id);
        if (outpass === null || outpass === void 0 ? void 0 : outpass.success) {
            const outpass = yield client.outpass.findFirst({
                where: { id: id },
                select: { Student: { select: { Email: true } }, ToDay: true },
            });
            const email = outpass === null || outpass === void 0 ? void 0 : outpass.Student.Email;
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
                yield (0, helper_functions_1.sendEmail)(email, "Regarding your OutpassRequest", outPassEmailBody);
            }
        }
        res.json({
            msg: outpass.msg,
            success: outpass.success,
        });
    }
    catch (e) {
        res.json({
            msg: "Error approving outpass Please Try again!",
            success: false,
        });
    }
}));
exports.adminRouter.post("/approveouting", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const outing = yield (0, helper_functions_1.approveOuting)(id);
        if (outing === null || outing === void 0 ? void 0 : outing.success) {
            const outing = yield client.outing.findFirst({
                where: { id: id },
                select: { Student: { select: { Email: true } }, ToTime: true },
            });
            const email = outing === null || outing === void 0 ? void 0 : outing.Student.Email;
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
                yield (0, helper_functions_1.sendEmail)(email, "Regarding your OutingRequest", outPassEmailBody);
            }
        }
        res.json({
            msg: outing.msg,
            success: outing.success,
        });
    }
    catch (e) {
        res.json({
            msg: "Error approving outing Please Try again!",
            success: false,
        });
    }
}));
exports.adminRouter.post("/rejectouting", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const outing = yield (0, helper_functions_1.rejectOuting)(id);
        if (outing === null || outing === void 0 ? void 0 : outing.success) {
            const outing = yield client.outing.findFirst({
                where: { id: id },
                select: { Student: { select: { Email: true } }, Message: true, rejectedBy: true, rejectedTime: true },
            });
            const email = outing === null || outing === void 0 ? void 0 : outing.Student.Email;
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
                yield (0, helper_functions_1.sendEmail)(email, "Regarding your OutingRequest", outPassEmailBody);
            }
        }
        res.json({
            msg: outing.msg,
            success: outing.success,
        });
    }
    catch (e) {
        res.json({
            msg: "Error rejecting outing Please Try again!",
            success: false,
        });
    }
}));
exports.adminRouter.post("/rejectoutpass", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const outpass = yield (0, helper_functions_1.rejectOutpass)(id);
        if (outpass === null || outpass === void 0 ? void 0 : outpass.success) {
            const outpass = yield client.outpass.findFirst({
                where: { id: id },
                select: {
                    Student: { select: { Email: true } },
                    Message: true,
                    rejectedBy: true,
                    rejectedTime: true,
                },
            });
            const email = outpass === null || outpass === void 0 ? void 0 : outpass.Student.Email;
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
                yield (0, helper_functions_1.sendEmail)(email, "Regarding your OutPassRequest", outPassEmailBody);
            }
        }
        res.json({
            msg: outpass.msg,
            success: outpass.success,
        });
    }
    catch (e) {
        res.json({
            msg: "Error rejecting outpass Please Try again!",
            success: false,
        });
    }
}));
exports.adminRouter.post("/updatestudents", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Adding data please hold on...");
        const filePath = "./data.xlsx";
        const workbook = xlsx_1.default.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let records = 0;
        const students = xlsx_1.default.utils.sheet_to_json(sheet);
        for (const student of students) {
            yield (0, helper_functions_1.addStudent)(student.IDNO.toLowerCase(), student.Password.toLowerCase(), student.GENDER, student.NAME);
            records++;
            if (records % 100) {
                console.log(`Completed ${records} records until ${new Date().toLocaleString()}`);
            }
        }
        console.log(`Successfully added ${records} students from the Excel file`);
        res.json({
            msg: `Successfully added ${records} students from the Excel file`,
            success: true,
        });
    }
    catch (error) {
        console.error("Error adding students:", error);
        res.status(500).json({
            msg: "Error adding students",
            success: false,
        });
    }
}));
exports.adminRouter.get("/getstudentsoutsidecampus", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const studens = yield (0, helper_functions_1.getStudentsOutsideCampus)();
        res.json({
            studens,
            success: true,
        });
    }
    catch (e) {
        res.json({
            msg: "Error fetching stdudents",
            success: false,
        });
    }
}));
exports.adminRouter.post("/updatestudentstatus", middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, id } = req.body;
        const student = yield (0, helper_functions_1.updateUserPrescence)(userId, id);
        res.json({
            msg: student.msg,
            success: student.success,
        });
    }
    catch (e) {
        res.json({
            msg: "Error fetching stdudents",
            success: false,
        });
    }
}));
exports.adminRouter.post('/searchstudent', middlewares_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.body;
        const student = yield (0, helper_functions_1.getStudentDetails)(username);
        if (student == null) {
            res.json({
                msg: "No student found with idnumber : " + username, success: false,
            });
        }
        else {
            res.json({
                student, success: true,
            });
        }
    }
    catch (e) {
        res.json({
            msg: "Error fetching stdudents",
            success: false,
        });
    }
}));
