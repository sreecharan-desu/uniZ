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
exports.isApplicationPending = exports.isPresentInCampus = exports.authMiddleware = exports.fetchStudent = exports.validateResetPassInputs = exports.validateSigninInputs = void 0;
const zod_1 = __importDefault(require("zod"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const helper_functions_1 = require("../../helper-functions");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const validateSigninInputs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { username, password } = req.body;
    const zodUsernameSchema = zod_1.default.string().min(7, "Your username should contain minimum 7 characters").max(7, "Your username should contain maximum 7 characters");
    const zodPasswordSchema = zod_1.default.string().min(8, "Your password should contain minimum 8 characters").max(20, "Your password should contain maximum 20 characters");
    const isUsernameValidated = zodUsernameSchema.safeParse(username);
    const isPasswordValidated = zodPasswordSchema.safeParse(password);
    const usernameError = (_a = isUsernameValidated.error) === null || _a === void 0 ? void 0 : _a.issues[0].message;
    const passwordError = (_b = isPasswordValidated.error) === null || _b === void 0 ? void 0 : _b.issues[0].message;
    if (isUsernameValidated.success && isPasswordValidated.success) {
        next();
    }
    else if (usernameError || passwordError || usernameError && passwordError) {
        if (!isUsernameValidated.success && !isPasswordValidated.success) {
            res.json({
                msg: `${usernameError} and ${passwordError}`,
                success: false,
            });
        }
        else if (!isUsernameValidated.success) {
            res.json({
                msg: usernameError,
                success: false,
            });
        }
        else if (!isPasswordValidated.success) {
            res.json({
                msg: passwordError,
                success: false,
            });
        }
        else {
            res.json({
                msg: "Invalid Inputs Please Try again",
                success: false,
            });
        }
    }
});
exports.validateSigninInputs = validateSigninInputs;
const validateResetPassInputs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { username, password, new_password } = req.body;
    const zodUsernameSchema = zod_1.default
        .string()
        .min(7, "Your username should contain minimum 7 characters")
        .max(7, "Your username should contain maximum 7 characters");
    const zodPasswordSchema = zod_1.default
        .string()
        .min(8, "Your password including(new_password) should contain minimum 8 characters")
        .max(20, "Your password including(new_password) should contain maximum 10 characters");
    const isUsernameValidated = zodUsernameSchema.safeParse(username);
    const isPasswordValidated = zodPasswordSchema.safeParse(password);
    const isNewPasswordValidated = zodPasswordSchema.safeParse(new_password);
    const usernameError = (_a = isUsernameValidated.error) === null || _a === void 0 ? void 0 : _a.issues[0].message;
    const passwordError = (_b = isPasswordValidated.error) === null || _b === void 0 ? void 0 : _b.issues[0].message;
    const newpasswordError = (_c = isNewPasswordValidated.error) === null || _c === void 0 ? void 0 : _c.issues[0].message;
    if (isUsernameValidated.success && isPasswordValidated.success && isNewPasswordValidated.success) {
        next();
    }
    else if (usernameError ||
        passwordError ||
        (usernameError && passwordError) || (usernameError && newpasswordError && passwordError) ||
        newpasswordError || (newpasswordError && passwordError)) {
        if (!isUsernameValidated.success && !isPasswordValidated.success && !isNewPasswordValidated.success) {
            res.json({
                msg: `${usernameError} and ${passwordError} and ${newpasswordError}`,
                success: false,
            });
        }
        else if (!isUsernameValidated.success) {
            res.json({
                msg: usernameError,
                success: false,
            });
        }
        else if (!isPasswordValidated.success) {
            res.json({
                msg: passwordError,
                success: false,
            });
        }
        else if (!isNewPasswordValidated.success) {
            res.json({
                msg: newpasswordError,
                success: false,
            });
        }
        else {
            res.json({
                msg: "Invalid Inputs Please Try again",
                success: false,
            });
        }
    }
});
exports.validateResetPassInputs = validateResetPassInputs;
const fetchStudent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { username, password } = req.body;
    const isUserPresent = yield (0, helper_functions_1.findUserByUsername)(username);
    if (isUserPresent) {
        const user = yield (0, helper_functions_1.currentUserByUsername)(username);
        if (user && user.success) {
            const userPassword = (_a = user.user) === null || _a === void 0 ? void 0 : _a.Password;
            if (userPassword) {
                const isMatch = yield bcrypt_1.default.compare(password, userPassword);
                if (isMatch) {
                    next();
                }
                else {
                    res.json({
                        msg: "Invalid credentials Please Try again or Contact your Administrator now!",
                        success: false,
                    });
                }
            }
            else {
                res.json({
                    msg: "Error fetching user details please try again!",
                    success: false,
                });
            }
        }
        else {
            res.json({
                msg: "Invalid credentials Please Try again!",
                success: false,
            });
        }
    }
    else {
        res.json({
            msg: `Seems like you dont have an account yet! Consult your Warden!`,
            success: false,
        });
    }
});
exports.fetchStudent = fetchStudent;
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authorization = req.headers.authorization;
    if (authorization && 'a74d9ff8f6c0638b05c21de570d57805') {
        try {
            const token = authorization.split(" ")[1];
            const verified = jsonwebtoken_1.default.verify(token, 'a74d9ff8f6c0638b05c21de570d57805');
            if (verified) {
                next();
            }
            else {
                res.json({
                    msg: "AUTH_ERROR : Invalid token",
                    success: false
                });
            }
        }
        catch (e) {
            res.json({
                msg: "AUTH_ERROR : Missing authorization headers!",
                success: false,
            });
        }
    }
    ;
});
exports.authMiddleware = authMiddleware;
const isPresentInCampus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const isPresent = yield (0, helper_functions_1.isStudentPresentInCampus)(userId);
        if (!isPresent) {
            res.json({
                msg: "You cannot request an outpass from Outside College Broo!",
                success: false
            });
        }
        else {
            next();
        }
    }
    catch (e) {
        res.json({
            e,
            success: false
        });
    }
});
exports.isPresentInCampus = isPresentInCampus;
const isApplicationPending = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const isPending = yield (0, helper_functions_1.isPendingApplication)(userId);
        if (!isPending.isPending) {
            next();
        }
        else if (isPending.isPending) {
            res.json({
                msg: "You cannot request an outpass/outing now because you have a pending request!",
                success: false,
            });
        }
    }
    catch (e) {
        res.json({
            e,
            success: false,
        });
    }
});
exports.isApplicationPending = isApplicationPending;
