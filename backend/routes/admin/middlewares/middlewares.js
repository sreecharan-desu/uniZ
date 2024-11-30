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
exports.fetchAdmin = exports.validateSigninInputs = void 0;
const zod_1 = __importDefault(require("zod"));
const helper_functions_1 = require("../../helper-functions");
const bcrypt_1 = __importDefault(require("bcrypt"));
const validateSigninInputs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    (0, helper_functions_1.addAdmin)('admin', '1234567890');
    const { username, password } = req.body;
    const zodUsernameSchema = zod_1.default
        .string()
        .min(4, "Your username should contain minimum 4 characters")
        .max(7, "Your username should contain maximum 7 characters");
    const zodPasswordSchema = zod_1.default
        .string()
        .min(8, "Your password should contain minimum 8 characters")
        .max(20, "Your password should contain maximum 20 characters");
    const isUsernameValidated = zodUsernameSchema.safeParse(username);
    const isPasswordValidated = zodPasswordSchema.safeParse(password);
    const usernameError = (_a = isUsernameValidated.error) === null || _a === void 0 ? void 0 : _a.issues[0].message;
    const passwordError = (_b = isPasswordValidated.error) === null || _b === void 0 ? void 0 : _b.issues[0].message;
    if (isUsernameValidated.success && isPasswordValidated.success) {
        next();
    }
    else if (usernameError ||
        passwordError ||
        (usernameError && passwordError)) {
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
const fetchAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { username, password } = req.body;
    const isUserPresent = yield (0, helper_functions_1.findAdminByUsername)(username);
    if (isUserPresent) {
        const admin = yield (0, helper_functions_1.currentAdminByUsername)(username);
        if (admin && admin.success) {
            const adminPassword = (_a = admin.admin) === null || _a === void 0 ? void 0 : _a.Password;
            if (adminPassword) {
                const isMatch = yield bcrypt_1.default.compare(password, adminPassword);
                if (isMatch) {
                    next();
                }
                else {
                    res.json({
                        msg: "Invalid credentials Please Try again or reset your password now!",
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
            msg: `Seems like you dont have an account yet!`,
            success: false,
        });
    }
});
exports.fetchAdmin = fetchAdmin;
