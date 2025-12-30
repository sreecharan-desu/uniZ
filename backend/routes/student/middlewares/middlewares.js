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
const prisma_service_1 = __importDefault(require("../../services/prisma.service"));
const student_service_1 = require("../../services/student.service");
const validateSigninInputs = (req, res, next) => {
    const schema = zod_1.default.object({
        username: zod_1.default.string().length(7, "Username must be exactly 7 characters"),
        password: zod_1.default.string().min(8, "Password must be at least 8 characters").max(20, "Password must not exceed 20 characters"),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            msg: parsed.error.issues.map(i => i.message).join(" and "),
            success: false
        });
    }
    next();
};
exports.validateSigninInputs = validateSigninInputs;
const validateResetPassInputs = (req, res, next) => {
    const schema = zod_1.default.object({
        username: zod_1.default.string().min(7).max(16),
        password: zod_1.default.string().min(8).max(20),
        new_password: zod_1.default.string().min(8).max(20),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            msg: "Invalid input fields",
            success: false,
        });
    }
    next();
};
exports.validateResetPassInputs = validateResetPassInputs;
const fetchStudent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const user = yield prisma_service_1.default.student.findUnique({ where: { Username: username.toLowerCase() } });
        if (!user)
            return res.status(404).json({ msg: "Account not found. Consult administration.", success: false });
        if (!user.Password || !(yield bcrypt_1.default.compare(password, user.Password))) {
            return res.status(401).json({ msg: "Invalid credentials.", success: false });
        }
        next();
    }
    catch (error) {
        res.status(500).json({ msg: "Internal Server Error", success: false });
    }
});
exports.fetchStudent = fetchStudent;
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authorization = req.headers.authorization;
    if (!authorization || !process.env.JWT_SECURITY_KEY)
        return res.status(401).json({ msg: "Authentication required", success: false });
    try {
        const token = authorization.split(" ")[1];
        const decoded_username = jsonwebtoken_1.default.verify(token, process.env.JWT_SECURITY_KEY);
        const [admin, student] = yield Promise.all([
            prisma_service_1.default.admin.findUnique({ where: { Username: decoded_username }, select: { id: true, Username: true, role: true } }),
            prisma_service_1.default.student.findUnique({ where: { Username: decoded_username }, select: { id: true, Username: true } })
        ]);
        if (admin) {
            req.admin = { _id: admin.id, username: admin.Username, role: admin.role };
        }
        else if (!student) {
            return res.status(401).json({ msg: "Invalid token", success: false });
        }
        next();
    }
    catch (err) {
        res.status(401).json({ msg: "Authentication failed", success: false });
    }
});
exports.authMiddleware = authMiddleware;
const isPresentInCampus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const isPresent = yield (0, student_service_1.isStudentPresentInCampus)(userId);
        if (!isPresent)
            return res.status(403).json({ msg: "You must be in campus to make this request.", success: false });
        next();
    }
    catch (e) {
        res.status(500).json({ msg: "Server error checking campus status", success: false });
    }
});
exports.isPresentInCampus = isPresentInCampus;
const isApplicationPending = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const result = yield (0, student_service_1.isPendingApplication)(userId);
        if (result.success && result.isPending) {
            return res.status(403).json({ msg: "You already have a pending request.", success: false });
        }
        next();
    }
    catch (e) {
        res.status(500).json({ msg: "Server error checking request status", success: false });
    }
});
exports.isApplicationPending = isApplicationPending;
