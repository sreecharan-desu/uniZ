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
exports.getStudentSuggestions = exports.getUsers = exports.updateStudentPresence = exports.getStudentsOutsideCampus = exports.getOutingRequests = exports.getOutPassRequests = exports.rejectOuting = exports.approveOuting = exports.rejectOutpass = exports.approveOutpass = exports.getOutingById = exports.getOutpassById = exports.updateAdminPassword = exports.findAdminByUsername = exports.hashPassword = void 0;
exports.addStudent = addStudent;
const prisma_service_1 = __importDefault(require("./prisma.service"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcrypt_1.default.genSalt(10);
    return yield bcrypt_1.default.hash(password, salt);
});
exports.hashPassword = hashPassword;
const findAdminByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_service_1.default.admin.findUnique({ where: { Username: username } });
});
exports.findAdminByUsername = findAdminByUsername;
const updateAdminPassword = (username, password) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield (0, exports.hashPassword)(password);
    yield prisma_service_1.default.admin.update({
        where: { Username: username },
        data: { Password: hashedPassword },
    });
    return true;
});
exports.updateAdminPassword = updateAdminPassword;
// --- Outpass/Outing Approvals ---
const getOutpassById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_service_1.default.outpass.findUnique({ where: { id }, include: { Student: true } });
});
exports.getOutpassById = getOutpassById;
const getOutingById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_service_1.default.outing.findUnique({ where: { id }, include: { Student: true } });
});
exports.getOutingById = getOutingById;
const approveOutpass = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const pass = yield (0, exports.getOutpassById)(id);
    if (!pass)
        return { success: false, msg: "Outpass not found" };
    if (pass.isApproved)
        return { success: false, msg: "Already approved" };
    if (pass.isRejected)
        return { success: false, msg: "Already rejected" };
    yield prisma_service_1.default.outpass.update({
        where: { id },
        data: {
            isApproved: true,
            issuedBy: "Administration",
            issuedTime: new Date(),
            Student: { update: { isApplicationPending: false, isPresentInCampus: false } },
        }
    });
    return { success: true, msg: "Outpass approved" };
});
exports.approveOutpass = approveOutpass;
const rejectOutpass = (id_1, ...args_1) => __awaiter(void 0, [id_1, ...args_1], void 0, function* (id, adminName = "Administration", message = "Rejected") {
    const pass = yield (0, exports.getOutpassById)(id);
    if (!pass)
        return { success: false, msg: "Outpass not found" };
    if (pass.isApproved)
        return { success: false, msg: "Already approved" };
    yield prisma_service_1.default.outpass.update({
        where: { id },
        data: {
            isRejected: true,
            rejectedBy: adminName,
            rejectedTime: new Date(),
            Message: message,
            Student: { update: { isApplicationPending: false } },
        }
    });
    return { success: true, msg: "Outpass rejected" };
});
exports.rejectOutpass = rejectOutpass;
const approveOuting = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const outing = yield (0, exports.getOutingById)(id);
    if (!outing)
        return { success: false, msg: "Outing not found" };
    if (outing.isApproved)
        return { success: false, msg: "Already approved" };
    yield prisma_service_1.default.outing.update({
        where: { id },
        data: {
            isApproved: true,
            issuedBy: "Administration",
            issuedTime: new Date(),
            Student: { update: { isApplicationPending: false, isPresentInCampus: false } },
        }
    });
    return { success: true, msg: "Outing approved" };
});
exports.approveOuting = approveOuting;
const rejectOuting = (id_1, ...args_1) => __awaiter(void 0, [id_1, ...args_1], void 0, function* (id, adminName = "Administration", message = "Rejected") {
    const outing = yield (0, exports.getOutingById)(id);
    if (!outing)
        return { success: false, msg: "Outing not found" };
    if (outing.isApproved)
        return { success: false, msg: "Already approved" };
    yield prisma_service_1.default.outing.update({
        where: { id },
        data: {
            isRejected: true,
            rejectedBy: adminName,
            rejectedTime: new Date(),
            Message: message,
            Student: { update: { isApplicationPending: false } },
        }
    });
    return { success: true, msg: "Outing rejected" };
});
exports.rejectOuting = rejectOuting;
const mappers_1 = require("../utils/mappers");
const getOutPassRequests = () => __awaiter(void 0, void 0, void 0, function* () {
    const requests = yield prisma_service_1.default.outpass.findMany({
        where: { isApproved: false, isRejected: false, isExpired: false },
        include: { Student: true },
    });
    return requests.map(mappers_1.mapOutpassToLegacy);
});
exports.getOutPassRequests = getOutPassRequests;
const getOutingRequests = () => __awaiter(void 0, void 0, void 0, function* () {
    const requests = yield prisma_service_1.default.outing.findMany({
        where: { isApproved: false, isRejected: false, isExpired: false },
        include: { Student: true },
    });
    return requests.map(mappers_1.mapOutingToLegacy);
});
exports.getOutingRequests = getOutingRequests;
const getStudentsOutsideCampus = () => __awaiter(void 0, void 0, void 0, function* () {
    const students = yield prisma_service_1.default.student.findMany({
        where: { isPresentInCampus: false },
        include: {
            Outpass: { orderBy: { RequestedTime: 'desc' }, take: 1 },
            Outing: { orderBy: { RequestedTime: 'desc' }, take: 1 },
        }
    });
    return students.map(mappers_1.mapStudentOutsideToLegacy);
});
exports.getStudentsOutsideCampus = getStudentsOutsideCampus;
const updateStudentPresence = (userId, requestId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_service_1.default.student.update({ where: { id: userId }, data: { isPresentInCampus: true } });
        // Try to update either outing or outpass
        try {
            yield prisma_service_1.default.outing.update({ where: { id: requestId }, data: { inTime: new Date(), isExpired: true } });
        }
        catch (_a) {
            yield prisma_service_1.default.outpass.update({ where: { id: requestId }, data: { inTime: new Date(), isExpired: true } });
        }
        return { success: true, msg: "Student is now back in campus" };
    }
    catch (e) {
        return { success: false, msg: "Error updating presence" };
    }
});
exports.updateStudentPresence = updateStudentPresence;
// --- Student Management ---
function parseExcelSerialDate(serial) {
    if (typeof serial === 'string')
        return new Date(serial);
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + serial * 86400000);
    return isNaN(date.getTime()) ? new Date() : date;
}
function addStudent(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const idNumber = data["ID NUMBER"];
        const name = data["NAME OF THE STUDENT"];
        const gender = data["GENDER"] || "Male";
        const branch = ((_a = data["BRANCH"]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "";
        const batch = data["BATCH"] || "";
        const mobile = String(data["MOBILE NUMBER"] || "");
        const fatherName = data["FATHER'S NAME"] || "";
        const motherName = data["MOTHER'S NAME"] || "";
        const parentMobile = String(data["PARENT'S NUMBER"] || "");
        const blood = data["BLOOD GROUP"] || "";
        const address = data["ADDRESS"] || "";
        // Batch to Year conversion (Simplified logic)
        const currentYear = new Date().getFullYear();
        const batchYear = parseInt(batch.replace('O', '20'), 10);
        const yearsSinceBatch = isNaN(batchYear) ? 2 : currentYear - batchYear;
        const yearMapping = ['P1', 'P2', 'E1', 'E2', 'E3', 'E4'];
        const year = yearMapping[yearsSinceBatch] || 'E4';
        const hashedPassword = yield bcrypt_1.default.hash(`${idNumber.toLowerCase()}@rguktong`, 10);
        return yield prisma_service_1.default.student.upsert({
            where: { Username: idNumber.toLowerCase() },
            update: {
                Name: name, Gender: gender, Branch: branch, Year: year, PhoneNumber: mobile,
                FatherName: fatherName, MotherName: motherName, FatherPhoneNumber: parentMobile,
                BloodGroup: blood, Address: address,
            },
            create: {
                id: idNumber.toLowerCase(),
                Username: idNumber.toLowerCase(),
                Password: hashedPassword,
                Name: name, Gender: gender, Branch: branch, Year: year, PhoneNumber: mobile,
                FatherName: fatherName, MotherName: motherName, FatherPhoneNumber: parentMobile,
                BloodGroup: blood, Address: address,
                Email: `${idNumber.toLowerCase()}@rguktong.ac.in`,
            }
        });
    });
}
const getUsers = (skip, take) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma_service_1.default.student.findMany({
        skip,
        take,
        orderBy: { Username: 'asc' },
        include: {
            grades: { include: { subject: true, semester: true } },
            attendance: { include: { subject: true, semester: true } },
        }
    });
    return users.map(mappers_1.mapStudentToLegacy);
});
exports.getUsers = getUsers;
const mappers_2 = require("../utils/mappers");
const getStudentSuggestions = (q) => __awaiter(void 0, void 0, void 0, function* () {
    const students = yield prisma_service_1.default.student.findMany({
        where: { Username: { contains: q.toLowerCase(), mode: 'insensitive' } },
        take: 10,
        select: { id: true, Username: true, Name: true, Branch: true, Year: true }
    });
    return students.map(mappers_2.mapStudentSuggestionToLegacy);
});
exports.getStudentSuggestions = getStudentSuggestions;
