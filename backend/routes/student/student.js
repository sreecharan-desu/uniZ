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
exports.studentRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const middlewares_1 = require("./middlewares/middlewares");
const helper_functions_1 = require("../helper-functions");
exports.studentRouter = (0, express_1.Router)();
dotenv_1.default.config();
const client_1 = require("@prisma/client");
const emails_1 = require("./emails");
const client = new client_1.PrismaClient();
exports.studentRouter.post("/signin", middlewares_1.validateSigninInputs, middlewares_1.fetchStudent, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    const token = yield jsonwebtoken_1.default.sign(username, 'a74d9ff8f6c0638b05c21de570d57805'); //SECURITY_KEY IS HARDCODED (POTENTIAL)
    res.json({ student_token: token, success: true, });
}));
exports.studentRouter.put("/resetpass", middlewares_1.validateResetPassInputs, middlewares_1.fetchStudent, middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, new_password } = req.body;
    try {
        // Update the student's password
        const isUpdated = yield (0, helper_functions_1.updateStudentPassword)(username, new_password);
        if (!isUpdated) {
            const user = yield client.student.findFirst({
                where: { Username: username },
                select: { Email: true, Username: true },
            });
            if (user)
                yield (0, helper_functions_1.sendEmail)(user.Email, "Regarding Reset-Password", emails_1.passwordResetFailed);
            return res.status(400).json({
                msg: "Invalid credentials! Password update failed.",
                success: false,
            });
        }
        // Fetch the student details (fetchStudent middleware could pass it)
        const user = yield client.student.findFirst({
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
        yield (0, helper_functions_1.sendEmail)(user.Email, "Regarding Reset-Password", emails_1.passwordResetSuccess);
        return res.status(200).json({
            msg: "Password updated successfully! Sign in again with your new password.",
            success: true,
        });
    }
    catch (error) {
        console.error("Error updating password:", error); // Log error for debugging
        return res.status(500).json({
            msg: "An unexpected error occurred. Please try again later.",
            success: false,
        });
    }
}));
exports.studentRouter.post('/requestoutpass', middlewares_1.isPresentInCampus, middlewares_1.isApplicationPending, middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reason, userId, from_date, to_date } = req.body;
    // console.log("requestBody : ",req.body);
    try {
        const outpass = yield (0, helper_functions_1.requestOutpass)(reason, userId, new Date(from_date), new Date(to_date));
        //conosole.log("requestedOutpass : ",outpass)
        if (outpass === null || outpass === void 0 ? void 0 : outpass.success) {
            const user = yield client.student.findFirst({ where: { id: userId }, select: { Email: true, Username: true }, });
            const studentOutpassEmail = yield (0, emails_1.getOutpassMailFormatForStudent)(outpass);
            const wardenOutpassEmail = yield (0, emails_1.getOutpassMailFormatForWarden)(outpass, user);
            if (user === null || user === void 0 ? void 0 : user.Email) {
                yield (0, helper_functions_1.sendEmail)(user === null || user === void 0 ? void 0 : user.Email, "Regarding your OutpassRequest", studentOutpassEmail);
                yield (0, helper_functions_1.sendEmail)('sreecharan309@gmail.com', "New Outpass Request", wardenOutpassEmail);
                res.json({
                    msg: outpass === null || outpass === void 0 ? void 0 : outpass.msg,
                    success: outpass === null || outpass === void 0 ? void 0 : outpass.success,
                });
            }
            else {
                res.json({
                    msg: outpass === null || outpass === void 0 ? void 0 : outpass.msg,
                    success: outpass === null || outpass === void 0 ? void 0 : outpass.success,
                });
            }
        }
        //Handle Invalid Outpass requests here 
        else {
            res.json({
                msg: outpass === null || outpass === void 0 ? void 0 : outpass.msg,
                success: outpass === null || outpass === void 0 ? void 0 : outpass.success,
            });
        }
    }
    catch (error) {
        console.error("Error requesting password : ", error); // Log error for debugging
        return res.status(500).json({
            msg: "An unexpected error occurred. Please try again later.",
            success: false,
        });
    }
}));
exports.studentRouter.post('/requestouting', middlewares_1.isPresentInCampus, middlewares_1.isApplicationPending, middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reason, userId, from_time, to_time } = req.body;
    const outing = yield (0, helper_functions_1.requestOuting)(reason, userId, from_time, to_time);
    if (outing === null || outing === void 0 ? void 0 : outing.success) {
        const user = yield client.student.findFirst({ where: { id: userId } });
        const studentOutingEmailBody = yield (0, emails_1.getOutingMailFormatForStudent)(outing);
        const wardenOutingEmailBody = yield (0, emails_1.getOutingMailFormatForWarden)(outing, user);
        if (user === null || user === void 0 ? void 0 : user.Email) {
            yield (0, helper_functions_1.sendEmail)(user.Email, "Regarding your OutingRequest", studentOutingEmailBody);
            yield (0, helper_functions_1.sendEmail)('sreecharan309@gmail.com', "New Outing Request", wardenOutingEmailBody);
            res.json({
                msg: outing === null || outing === void 0 ? void 0 : outing.msg,
                success: outing === null || outing === void 0 ? void 0 : outing.success,
            });
        }
        else {
            res.json({
                msg: outing === null || outing === void 0 ? void 0 : outing.msg,
                success: outing === null || outing === void 0 ? void 0 : outing.success,
            });
        }
    }
    else {
        res.json({
            msg: outing === null || outing === void 0 ? void 0 : outing.msg,
            success: outing === null || outing === void 0 ? void 0 : outing.success,
        });
    }
}));
exports.studentRouter.post("/getdetails", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    if (username) {
        const user = yield (0, helper_functions_1.getStudentDetails)(username);
        res.json({
            student: user,
            success: true,
        });
    }
    else {
        res.json({
            msg: "Internal Server Error Please Try again!",
            success: false,
        });
    }
}));
