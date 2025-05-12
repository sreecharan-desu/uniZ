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
    var _a, _b, _c, _d;
    const { username, password } = req.body;
    const zodUsernameSchema = zod_1.default.string().min(7, "Your username should contain minimum 7 characters").max(7, "Your username should contain maximum 7 characters");
    const zodPasswordSchema = zod_1.default.string().min(8, "Your password should contain minimum 8 characters").max(20, "Your password should contain maximum 20 characters");
    const isUsernameValidated = zodUsernameSchema.safeParse(username);
    const isPasswordValidated = zodPasswordSchema.safeParse(password);
    if (!isUsernameValidated.success || !isPasswordValidated.success)
        return res.json({
            msg: !isUsernameValidated.success && !isPasswordValidated.success
                ? `${(_a = isUsernameValidated.error) === null || _a === void 0 ? void 0 : _a.issues[0].message} and ${(_b = isPasswordValidated.error) === null || _b === void 0 ? void 0 : _b.issues[0].message}`
                : ((_c = isUsernameValidated.error) === null || _c === void 0 ? void 0 : _c.issues[0].message) || ((_d = isPasswordValidated.error) === null || _d === void 0 ? void 0 : _d.issues[0].message),
            success: false
        });
    next();
});
exports.validateSigninInputs = validateSigninInputs;
const validateResetPassInputs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f, _g, _h, _j, _k;
    const { username, password, new_password } = req.body;
    const zodUsernameSchema = zod_1.default.string().min(7, "Your username should contain minimum 7 characters").max(16, "Your username should contain maximum 16 characters");
    const zodPasswordSchema = zod_1.default.string().min(8, "Your password including(new_password) should contain minimum 8 characters").max(20, "Your password including(new_password) should contain maximum 10 characters");
    const isUsernameValidated = zodUsernameSchema.safeParse(username);
    const isPasswordValidated = zodPasswordSchema.safeParse(password);
    const isNewPasswordValidated = zodPasswordSchema.safeParse(new_password);
    if (!isUsernameValidated.success || !isPasswordValidated.success || !isNewPasswordValidated.success)
        return res.json({
            msg: !isUsernameValidated.success && !isPasswordValidated.success && !isNewPasswordValidated.success
                ? `${(_e = isUsernameValidated.error) === null || _e === void 0 ? void 0 : _e.issues[0].message} and ${(_f = isPasswordValidated.error) === null || _f === void 0 ? void 0 : _f.issues[0].message} and ${(_g = isNewPasswordValidated.error) === null || _g === void 0 ? void 0 : _g.issues[0].message}`
                : ((_h = isUsernameValidated.error) === null || _h === void 0 ? void 0 : _h.issues[0].message) || ((_j = isPasswordValidated.error) === null || _j === void 0 ? void 0 : _j.issues[0].message) || ((_k = isNewPasswordValidated.error) === null || _k === void 0 ? void 0 : _k.issues[0].message),
            success: false,
        });
    next();
});
exports.validateResetPassInputs = validateResetPassInputs;
const fetchStudent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const isUserPresent = yield (0, helper_functions_1.findUserByUsername)(username);
    if (!isUserPresent)
        return res.json({ msg: "Seems like you dont have an account yet! Consult your Warden!", success: false });
    const userResult = yield (0, helper_functions_1.currentUserByUsername)(username);
    if (!userResult.success || !userResult.user)
        return res.json({ msg: "Invalid credentials Please Try again!", success: false });
    const user = userResult.user;
    if (!user.Password)
        return res.json({ msg: "Error fetching user details please try again!", success: false });
    if (!(yield bcrypt_1.default.compare(password, user.Password)))
        return res.json({ msg: "Invalid credentials Please Try again or Contact your Administrator now!", success: false });
    next();
});
exports.fetchStudent = fetchStudent;
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authorization = req.headers.authorization;
    if (!authorization || !process.env.JWT_SECURITY_KEY)
        return res.json({ msg: "AUTH_ERROR : Missing authorization headers!", success: false });
    try {
        const token = authorization.split(" ")[1];
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECURITY_KEY) ? next() : res.json({ msg: "AUTH_ERROR : Invalid token", success: false });
    }
    catch (e) {
        res.json({ msg: "AUTH_ERROR : Missing authorization headers!", success: false });
    }
});
exports.authMiddleware = authMiddleware;
const isPresentInCampus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        if (!(yield (0, helper_functions_1.isStudentPresentInCampus)(userId)))
            return res.json({ msg: "You cannot request an outpass from Outside College Broo!", success: false });
        next();
    }
    catch (e) {
        res.json({ e, success: false });
    }
});
exports.isPresentInCampus = isPresentInCampus;
const isApplicationPending = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const isPending = yield (0, helper_functions_1.isPendingApplication)(userId);
        if (isPending.isPending)
            return res.json({ msg: "You cannot request an outpass/outing now because you have a pending request!", success: false });
        next();
    }
    catch (e) {
        res.json({ e, success: false });
    }
});
exports.isApplicationPending = isApplicationPending;
