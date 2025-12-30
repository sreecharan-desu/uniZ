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
exports.requestOuting = exports.requestOutpass = exports.isPendingApplication = exports.isStudentPresentInCampus = exports.updateStudentPassword = exports.getStudentDetails = exports.hashPassword = void 0;
const prisma_service_1 = __importDefault(require("./prisma.service"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcrypt_1.default.genSalt(10);
    return yield bcrypt_1.default.hash(password, salt);
});
exports.hashPassword = hashPassword;
const mappers_1 = require("../utils/mappers");
const getStudentDetails = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_service_1.default.student.findUnique({
        where: { Username: username.toLowerCase() },
    });
    return (0, mappers_1.mapStudentToLegacy)(user);
});
exports.getStudentDetails = getStudentDetails;
const updateStudentPassword = (username, password) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield (0, exports.hashPassword)(password);
    yield prisma_service_1.default.student.update({
        where: { Username: username.toLowerCase() },
        data: { Password: hashedPassword },
    });
    return { msg: "Password updated successfully!", success: true };
});
exports.updateStudentPassword = updateStudentPassword;
const isStudentPresentInCampus = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const student = yield prisma_service_1.default.student.findUnique({ where: { id }, select: { isPresentInCampus: true } });
    return student ? student.isPresentInCampus : false;
});
exports.isStudentPresentInCampus = isStudentPresentInCampus;
const isPendingApplication = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const student = yield prisma_service_1.default.student.findUnique({ where: { id }, select: { isApplicationPending: true } });
    return student ? { isPending: student.isApplicationPending, success: true } : { isPending: false, success: false };
});
exports.isPendingApplication = isPendingApplication;
const requestOutpass = (studentId, reason, fromDate, toDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield prisma_service_1.default.outpass.create({
            data: {
                id: (0, uuid_1.v4)(),
                StudentId: studentId,
                Reason: reason,
                FromDay: new Date(fromDate),
                ToDay: new Date(toDate),
            }
        });
        return Object.assign(Object.assign({}, res), { success: true, msg: "Outpass requested successfully!" });
    }
    catch (e) {
        return { success: false, msg: "Error requesting outpass" };
    }
});
exports.requestOutpass = requestOutpass;
const requestOuting = (studentId, reason, fromTime, toTime) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield prisma_service_1.default.outing.create({
            data: {
                id: (0, uuid_1.v4)(),
                StudentId: studentId,
                reason: reason,
                FromTime: new Date(fromTime),
                ToTime: new Date(toTime),
            }
        });
        return Object.assign(Object.assign({}, res), { success: true, msg: "Outing requested successfully!" });
    }
    catch (e) {
        return { success: false, msg: "Error requesting outing" };
    }
});
exports.requestOuting = requestOuting;
