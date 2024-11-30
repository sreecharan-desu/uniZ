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
exports.getStudentDetails = exports.updateUserPrescence = exports.getStudentsOutsideCampus = exports.getOutingRequests = exports.getOutPassRequests = exports.updateAdminPassword = exports.updateStudentPassword = exports.sendEmail = exports.updateDB = exports.rejectOuting = exports.approveOuting = exports.getOutingbyId = exports.getOutingExistsbyID = exports.rejectOutpass = exports.approveOutpass = exports.addAdmin = exports.findAdminByUsername = exports.getOutpassbyId = exports.getOutpassExistsbyID = exports.requestOuting = exports.updatePasses = exports.userDetailsById = exports.requestOutpass = exports.getUsers = exports.addStudent = exports.hashPassword = exports.findUserByUsername = exports.findUserById = exports.currentAdminByUsername = exports.currentUserByUsername = exports.isPendingApplication = exports.isStudentPresentInCampus = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = new client_1.PrismaClient();
const isStudentPresentInCampus = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const student = yield client.student.findFirst({
        where: {
            id: id,
        },
        select: {
            isPresentInCampus: true,
        },
    });
    if (student != null) {
        return student.isPresentInCampus;
    }
    else {
        return {
            msg: "Invalid id",
            success: false,
        };
    }
});
exports.isStudentPresentInCampus = isStudentPresentInCampus;
const isPendingApplication = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const student = yield client.student.findFirst({
        where: {
            id: id,
        },
        select: {
            isApplicationPending: true,
        },
    });
    if (student) {
        return {
            isPending: student.isApplicationPending,
            success: true,
        };
    }
    else {
        return {
            msg: "Invalid id",
            success: false,
        };
    }
});
exports.isPendingApplication = isPendingApplication;
// Fetch the current user by username
const currentUserByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield client.student.findFirst({
            where: { Username: username },
            select: { id: true, Username: true, Password: true, Email: true },
        });
        if (user != null) {
            return { user, success: true };
        }
        else {
            console.log(`The user with username: ${username} doesn't exist`);
            return { success: false };
        }
    }
    catch (e) {
        console.log(`Error: The user with username: ${username} doesn't exist`);
        return { success: false };
    }
});
exports.currentUserByUsername = currentUserByUsername;
const currentAdminByUsername = (adminname) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = yield client.admin.findFirst({
            where: { Username: adminname },
            select: { id: true, Username: true, Password: true },
        });
        if (admin != null) {
            return { admin, success: true };
        }
        else {
            console.log(`The admin with adminname: ${adminname} doesn't exist`);
            return { success: false };
        }
    }
    catch (e) {
        console.log(`Error: The admin with adminname: ${adminname} doesn't exist`);
        return { success: false };
    }
});
exports.currentAdminByUsername = currentAdminByUsername;
// Check if user exists by ID
const findUserById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield client.student.findFirst({ where: { id: userId } });
        return user ? true : false;
    }
    catch (e) {
        console.log(e);
        console.log("Error finding user");
    }
});
exports.findUserById = findUserById;
// Check if user exists by username
const findUserByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield client.student.findFirst({
            where: { Username: username },
        });
        return user ? true : false;
    }
    catch (e) {
        console.log("Error finding user");
    }
});
exports.findUserByUsername = findUserByUsername;
// Hash a password using bcrypt
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 4);
        return { password: hashedPassword, success: true };
    }
    catch (e) {
        return { success: false };
    }
});
exports.hashPassword = hashPassword;
// Add a new student to the database
const addStudent = (username, password, gender, name) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield (0, exports.hashPassword)(password);
    const id = "id_" + (yield crypto_1.default.randomBytes(4).toString("hex"));
    const isUserPresent = yield (0, exports.findUserByUsername)(username);
    if (isUserPresent) {
        console.log("User already exists. Try a new username");
        return;
    }
    if (hashedPassword.success && hashedPassword.password && !isUserPresent) {
        try {
            const user = yield client.student.create({
                data: {
                    id,
                    Username: username,
                    Password: hashedPassword.password,
                    Email: `${username}@rguktong.ac.in`,
                    Gender: gender,
                    Name: name
                },
                select: { id: true, Username: true },
            });
        }
        catch (e) {
            console.log(e);
            console.log("Error adding user");
        }
    }
    else {
        console.log("Error hashing password");
    }
});
exports.addStudent = addStudent;
// Fetch all users and their outpasses/outing details
const getUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield client.student.findMany({
        select: {
            id: true,
            Username: true,
            Email: true,
            Name: true,
            Gender: true,
            isApplicationPending: true,
            isPresentInCampus: true,
            Outing: {
                select: {
                    id: true,
                    StudentId: true,
                    reason: true,
                    FromTime: true,
                    ToTime: true,
                    isExpired: true,
                    RequestedTime: true,
                    Hours: true,
                    isApproved: true,
                    isRejected: true,
                    issuedBy: true,
                    issuedTime: true,
                    Message: true,
                    rejectedBy: true,
                    rejectedTime: true,
                    inTime: true
                },
            },
            Outpass: {
                select: {
                    id: true,
                    StudentId: true,
                    Reason: true,
                    FromDay: true,
                    ToDay: true,
                    isExpired: true,
                    RequestedTime: true,
                    Days: true,
                    isApproved: true,
                    isRejected: true,
                    issuedBy: true,
                    issuedTime: true,
                    Message: true,
                    rejectedBy: true,
                    rejectedTime: true,
                    inTime: true
                },
            },
        },
    });
    const updatedUsersListAcctoLocaleTimeZone = yield Promise.all(users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            _id: user.id,
            username: user.Username,
            email: user.Email,
            name: user.Name,
            gender: user.Gender,
            has_pending_requests: user.isApplicationPending,
            is_in_campus: user.isPresentInCampus,
            outings_list: yield Promise.all(user.Outing.map((outing) => __awaiter(void 0, void 0, void 0, function* () {
                return {
                    _id: outing.id,
                    student_id: outing.StudentId,
                    reason: outing.reason,
                    from_time: new Date(outing.FromTime)
                        .toLocaleString("en-IN")
                        .split(",")[1],
                    to_time: new Date(outing.ToTime).toLocaleString("en-IN").split(",")[1],
                    no_of_hours: outing.Hours,
                    requested_time: new Date(outing.RequestedTime).toLocaleString("en-IN"),
                    is_expired: outing.isExpired,
                    is_approved: outing.isApproved,
                    issued_by: outing.issuedBy,
                    issued_time: new Date(outing.issuedTime).toLocaleString("en-IN"),
                    message: outing.Message,
                    is_rejected: outing.isRejected,
                    rejected_by: outing.rejectedBy,
                    rejected_time: new Date(outing.rejectedTime).toLocaleString("en-IN"),
                    in_time: new Date(outing.inTime).toLocaleString("en-IN").split(",")[1],
                };
            }))),
            outpasses_list: yield Promise.all(user.Outpass.map((outpass) => __awaiter(void 0, void 0, void 0, function* () {
                return {
                    _id: outpass.id,
                    student_id: outpass.StudentId,
                    reason: outpass.Reason,
                    from_day: outpass.FromDay.toLocaleDateString("en-IN"),
                    to_day: outpass.ToDay.toLocaleDateString("en-IN"),
                    no_of_days: outpass.Days,
                    requested_time: outpass.RequestedTime.toLocaleTimeString("en-IN"),
                    is_expired: outpass.isExpired,
                    is_approved: outpass.isApproved,
                    issued_by: outpass.issuedBy,
                    issued_time: outpass.issuedTime.toLocaleTimeString("en-IN"),
                    message: outpass.Message,
                    is_rejected: outpass.isRejected,
                    rejected_by: outpass.rejectedBy,
                    rejected_time: outpass.rejectedTime.toLocaleTimeString("en-IN"),
                    in_time: outpass.inTime.toLocaleString("en-IN"),
                };
            }))),
        };
    })));
    return updatedUsersListAcctoLocaleTimeZone;
});
exports.getUsers = getUsers;
// Request an outpass for a student
const requestOutpass = (reason, id, from_date, to_date) => __awaiter(void 0, void 0, void 0, function* () {
    if (from_date > to_date ||
        from_date < new Date() ||
        from_date == new Date()) {
        if (from_date > to_date)
            return {
                msg: `Invalid input! You cannot request an outpass from ${from_date.toString().split("GMT")[0]} to ${to_date.toString().split("GMT")[0]}`,
                success: false,
            };
        else if (from_date <= new Date())
            return {
                msg: `Invalid input! You cannot request an outpass for a completed day (including Today : ${from_date.toString().split("GMT")[0].split("05:30:00")[0]} Since you are in campus) Enter tomorrow's date instead `,
                success: false,
            };
        return;
    }
    else {
        const user = yield (0, exports.findUserById)(id);
        if (user) {
            const outpass_id = "id_" + (yield crypto_1.default.randomBytes(12).toString("hex"));
            try {
                const outpass = yield client.outpass.create({
                    data: {
                        id: outpass_id,
                        Reason: reason,
                        FromDay: from_date,
                        ToDay: to_date,
                        StudentId: id,
                        Days: to_date.getDate() - from_date.getDate(),
                        isRejected: false,
                        Message: "No message",
                    },
                    select: {
                        id: true,
                        Reason: true,
                        FromDay: true,
                        ToDay: true,
                        Days: true,
                        RequestedTime: true,
                    },
                });
                yield client.student.update({
                    where: {
                        id: id,
                    },
                    data: {
                        isApplicationPending: true,
                    },
                });
                return {
                    outpass_details: outpass,
                    msg: `OutpassRequest with id : ${outpass.id} sent Successfully You will notified via your  college-mail about its status!`,
                    success: true,
                };
            }
            catch (e) {
                console.log(e);
                return {
                    msg: "Error requesting an outpass, try again...",
                    success: false,
                };
            }
        }
        else {
            return {
                msg: `The user with ID: ${id} doesn't exist`,
                success: false,
            };
        }
    }
});
exports.requestOutpass = requestOutpass;
// Get user details by ID
const userDetailsById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield client.student.findFirst({
        where: { id },
        select: {
            id: true,
            Username: true,
            Name: true,
            Email: true,
            Gender: true,
            Outpass: {
                select: {
                    id: true,
                    StudentId: true,
                    isExpired: true,
                    RequestedTime: true,
                    FromDay: true,
                    ToDay: true,
                    Reason: true,
                },
            },
            Outing: {
                select: {
                    id: true,
                    StudentId: true,
                    reason: true,
                    FromTime: true,
                    ToTime: true,
                    isExpired: true,
                    RequestedTime: true,
                },
            },
        },
    });
    console.log(user);
});
exports.userDetailsById = userDetailsById;
// Update expired outpasses
const updatePasses = () => __awaiter(void 0, void 0, void 0, function* () {
    const currentUTCDate = new Date(); // Current UTC date and time
    // Fetch non-expired outpasses (date-based)
    const outpasses = yield client.outpass.findMany({
        where: { isExpired: false },
        select: { id: true, ToDay: true }, // Assuming ToDay is a Date object
    });
    // Fetch non-expired outings (time-based)
    const outings = yield client.outing.findMany({
        where: { isExpired: false },
        select: { id: true, ToTime: true }, // Assuming ToTime is stored as a Date
    });
    // Find expired outpasses based on the current UTC date
    const expiredOutpassIds = outpasses
        .filter((outpass) => outpass.ToDay < currentUTCDate) // Compare using UTC date
        .map((outpass) => outpass.id);
    // Since ToTime is already a Date object, directly compare it
    const expiredOutingsIds = outings
        .filter((outing) => {
        let isExpired = false;
        const currentDateString = new Date().toISOString().split("T")[0];
        const [h, m, s] = outing.ToTime.toLocaleString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        })
            .split(":")
            .map((num) => parseInt(num));
        // Get current hours, minutes, and seconds
        const [c_hours, c_mins, c_secs] = [
            new Date().getHours(),
            new Date().getMinutes(),
            new Date().getSeconds(),
        ];
        // Time comparison logic
        if (c_hours > h ||
            (c_hours === h && (c_mins > m || (c_mins === m && c_secs > s)))) {
            isExpired = true;
        }
        return isExpired; // Compare ToTime (Date) with current UTC date
    })
        .map((outing) => outing.id);
    // Update expired outings
    const expiredOutings = yield Promise.all(expiredOutingsIds.map((outing_id) => __awaiter(void 0, void 0, void 0, function* () {
        return yield client.outing.update({
            where: { id: outing_id },
            data: { isExpired: true }, // Mark outing as expired
        });
    })));
    // Update expired outpasses
    const expiredPasses = yield Promise.all(expiredOutpassIds.map((outpass_id) => __awaiter(void 0, void 0, void 0, function* () {
        return yield client.outpass.update({
            where: { id: outpass_id },
            data: { isExpired: true }, // Mark outpass as expired
        });
    })));
    // Logging the results
    if (expiredPasses.length) {
        console.log(`Outpasses with IDs: ${expiredPasses.map((pass) => pass.id)} have expired at ${new Date().toLocaleTimeString("en-IN")}`);
    }
    else {
        console.log(`No outpasses were expired at ${new Date().toLocaleTimeString("en-IN")}`);
    }
    if (expiredOutings.length) {
        console.log(`Outings with IDs: ${expiredOutings.map((pass) => pass.id)} have expired at ${new Date().toLocaleTimeString("en-IN")}`);
    }
    else {
        console.log(`No outings were expired at ${new Date().toLocaleTimeString("en-IN")}`);
    }
});
exports.updatePasses = updatePasses;
// Request an outing for a student
const requestOuting = (reason, id, from_time, to_time) => __awaiter(void 0, void 0, void 0, function* () {
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split("T")[0];
    const fromDateTime = new Date(`${currentDateString}T${from_time}`);
    const toDateTime = new Date(`${currentDateString}T${to_time}`);
    if (fromDateTime > toDateTime || fromDateTime < currentDate) {
        if (fromDateTime < currentDate) {
            return {
                msg: "You cannot take Outing from Completed Timeperiod",
                success: false,
            };
        }
        else {
            return {
                msg: `Invalid Time!!You cannot take outing from ${from_time} to ${to_time}`,
                success: false,
            };
        }
    }
    if (isNaN(fromDateTime.getTime()) || isNaN(toDateTime.getTime())) {
        return {
            msg: "Invalid date or time format.",
            success: false,
        };
    }
    const hoursDifference = (toDateTime.getTime() - fromDateTime.getTime()) / (1000 * 60 * 60);
    try {
        const outing_id = "id_" + (yield crypto_1.default.randomBytes(12).toString("hex"));
        const outing = yield client.outing.create({
            data: {
                id: outing_id,
                StudentId: id,
                reason,
                FromTime: fromDateTime,
                ToTime: toDateTime,
                Hours: Math.floor(hoursDifference),
            },
            select: {
                id: true,
                reason: true,
                FromTime: true,
                ToTime: true,
                RequestedTime: true,
            },
        });
        yield client.student.update({
            where: {
                id: id,
            },
            data: {
                isApplicationPending: true,
            },
        });
        return {
            outing_details: outing,
            msg: `Outing request with id ${outing_id} sent successfully...`,
            success: true,
        };
    }
    catch (e) {
        return {
            msg: "Error processing request please try again!",
            success: false,
        };
    }
});
exports.requestOuting = requestOuting;
// Get an outpass by ID
const getOutpassExistsbyID = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const outpass = yield client.outpass.findFirst({ where: { id } });
        return outpass ? true : false;
    }
    catch (e) {
        console.log("Error: Fetching outpasses");
        return false;
    }
});
exports.getOutpassExistsbyID = getOutpassExistsbyID;
const getOutpassbyId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const outpass = yield client.outpass.findFirst({ where: { id } });
        return outpass;
    }
    catch (e) {
        console.log("Error: Fetching outpasses");
        return false;
    }
});
exports.getOutpassbyId = getOutpassbyId;
// Fetch the current user by username
const findAdminByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = yield client.admin.findFirst({
            where: { Username: username },
            select: { id: true },
        });
        if (admin != null) {
            return { admin, success: true };
        }
        else {
            return { success: false };
        }
    }
    catch (e) {
        return { success: false };
    }
});
exports.findAdminByUsername = findAdminByUsername;
// Add a new student to the database
const addAdmin = (username, password) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield (0, exports.hashPassword)(password);
    const id = "id_" + (yield crypto_1.default.randomBytes(12).toString("hex"));
    const isUserPresent = (yield (0, exports.findAdminByUsername)(username)).success;
    if (isUserPresent) {
        console.log("Admin already exists. Try a new username");
        return;
    }
    if (hashedPassword.success && hashedPassword.password && !isUserPresent) {
        try {
            yield client.admin.create({
                data: { id, Username: username, Password: hashedPassword.password },
                select: { id: true, Username: true },
            });
        }
        catch (e) {
            console.log("Error adding admin");
        }
    }
    else {
        console.log("Error hashing password");
    }
});
exports.addAdmin = addAdmin;
// Approve an outpass
const approveOutpass = (id_1, ...args_1) => __awaiter(void 0, [id_1, ...args_1], void 0, function* (id, adminName = "admin", message) {
    const outpassExists = yield (0, exports.getOutpassExistsbyID)(id);
    if (outpassExists) {
        const pass = yield (0, exports.getOutpassbyId)(id);
        if (pass && !pass.isApproved) {
            if (pass.isRejected) {
                return {
                    msg: `You cannot approve a Rejected OutpassRequestThe outpass with id ${id} is already rejected on ${pass ? pass.rejectedTime.toString().split("GMT")[0] + "IST" : ""} by ${pass ? pass.rejectedBy || pass.Message : ""}  `,
                    success: false,
                };
            }
            else {
                const outpass = yield client.outpass.update({
                    where: { id },
                    data: {
                        isApproved: true,
                        issuedBy: "Warden",
                        Message: "Approved by Warden ",
                        issuedTime: new Date(),
                        Student: {
                            update: {
                                isApplicationPending: false,
                                isPresentInCampus: false,
                            },
                        },
                    },
                });
                return {
                    msg: `OutpassRequest with id : ${id} approved successfully...`,
                    success: true,
                };
            }
        }
        else {
            return {
                msg: `The outpassRequest with id ${id} is already approved on ${pass ? pass.issuedTime : ""} by ${pass ? pass.issuedBy || pass.Message : ""}  `,
                success: false,
            };
        }
    }
    else {
        return {
            msg: `OutpassRequest with ID: ${id} doesn't exist!`,
            success: false,
        };
    }
});
exports.approveOutpass = approveOutpass;
const rejectOutpass = (id, adminName, message) => __awaiter(void 0, void 0, void 0, function* () {
    const outpassExists = yield (0, exports.getOutpassExistsbyID)(id);
    const pass = yield (0, exports.getOutpassbyId)(id);
    if (outpassExists) {
        if (pass && !pass.isRejected) {
            if (!pass.isApproved) {
                const outpass = yield client.outpass.update({
                    where: { id },
                    data: {
                        issuedTime: new Date(),
                        isRejected: true,
                        rejectedBy: `${adminName ? adminName : "Warden"}`,
                        Message: `${message ? message : "Rejected by Warden for not valid reason"}`,
                        rejectedTime: new Date(),
                        Student: {
                            update: {
                                isApplicationPending: false,
                            },
                        },
                    },
                });
                return {
                    msg: `OutpassRequest with id ${id} rejected successfully...`,
                    success: true,
                };
            }
            else {
                return {
                    msg: `You cannot reject an approved OutpassRequest The outpass with id ${id} is already approved on ${pass ? pass.issuedTime.toString().split("GMT")[0] + "IST" : ""} by ${pass ? pass.issuedBy || pass.Message : ""}  `,
                    success: false,
                };
            }
        }
        else {
            return {
                msg: `The OutpassRequest with id ${id} is already rejected on ${pass ? pass.rejectedTime.toString().split("GMT")[0] + "IST" : ""} by ${pass ? pass.rejectedBy || pass.Message : ""}  `,
                success: false,
            };
        }
    }
    else {
        return {
            msg: `OutpassRequest with ID: ${id} doesn't exist!`,
            success: false,
        };
    }
});
exports.rejectOutpass = rejectOutpass;
// Get an outpass by ID
const getOutingExistsbyID = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const outing = yield client.outing.findFirst({ where: { id } });
        return outing ? true : false;
    }
    catch (e) {
        console.log("Error: Fetching outings");
        return false;
    }
});
exports.getOutingExistsbyID = getOutingExistsbyID;
const getOutingbyId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const outing = yield client.outing.findFirst({ where: { id } });
        return outing;
    }
    catch (e) {
        console.log("Error: Fetching outings");
        return false;
    }
});
exports.getOutingbyId = getOutingbyId;
// Approve an outpass
const approveOuting = (id_1, ...args_1) => __awaiter(void 0, [id_1, ...args_1], void 0, function* (id, adminName = "admin", message) {
    const outingExists = yield (0, exports.getOutingExistsbyID)(id);
    if (outingExists) {
        const pass = yield (0, exports.getOutingbyId)(id);
        if (pass && !pass.isApproved) {
            if (pass.isRejected) {
                return {
                    msg: `You cannot approve a Rejected Outing RequestThe outpass with id ${id} is already rejected on ${pass ? pass.rejectedTime.toString().split("GMT")[0] + "IST" : ""} by ${pass ? pass.rejectedBy || pass.Message : ""}  `,
                    success: false,
                };
            }
            else {
                yield client.outing.update({
                    where: { id },
                    data: {
                        isApproved: true,
                        issuedBy: "Warden",
                        Message: "Approved by Warden ",
                        issuedTime: new Date(),
                        Student: {
                            update: {
                                isApplicationPending: false,
                                isPresentInCampus: false,
                            },
                        },
                    },
                });
                return {
                    msg: `OutingRequest with id : ${id} approved successfully...`,
                    success: true,
                };
            }
        }
        else {
            return {
                msg: `The outingRequest with id ${id} is already approved on ${pass ? pass.issuedTime.toString().split("GMT")[0] + "IST" : ""} by ${pass ? pass.issuedBy || pass.Message : ""}  `,
                success: false,
            };
        }
    }
    else {
        return {
            msg: `OutingRequest with ID: ${id} doesn't exist!`,
            success: false,
        };
    }
});
exports.approveOuting = approveOuting;
const rejectOuting = (id, adminName, message) => __awaiter(void 0, void 0, void 0, function* () {
    const outingExists = yield (0, exports.getOutingExistsbyID)(id);
    const pass = yield (0, exports.getOutingbyId)(id);
    if (outingExists) {
        if (pass && !pass.isRejected) {
            if (!pass.isApproved) {
                yield client.outing.update({
                    where: { id },
                    data: {
                        issuedTime: new Date(),
                        isRejected: true,
                        rejectedBy: `${adminName ? adminName : "Warden"}`,
                        Message: `${message ? message : "Rejected by Warden for not valid reason"}`,
                        rejectedTime: new Date(),
                        Student: {
                            update: {
                                isApplicationPending: false,
                            },
                        },
                    },
                });
                return {
                    msg: `OutingRequest with id ${id} rejected successfully...`,
                    success: true,
                };
            }
            else {
                return {
                    msg: `You cannot reject an approved OutingRequest The outingRequest with id ${id} is already approved on ${pass ? pass.issuedTime.toString().split("GMT")[0] + "IST" : ""} by ${pass ? pass.issuedBy || pass.Message : ""}  `,
                    success: false,
                };
            }
        }
        else {
            return {
                msg: `The outingRequest with id ${id} is already rejected on ${pass ? pass.rejectedTime.toString().split("GMT")[0] + "IST" : ""} by ${pass ? pass.rejectedBy || pass.Message : ""}  `,
                success: false,
            };
        }
    }
    else {
        return {
            msg: `OutingRequest with ID: ${id} doesn't exist!`,
            success: false,
        };
    }
});
exports.rejectOuting = rejectOuting;
//Function that runs every 1 minute to update the Expired Passes
const updateDB = () => {
    (0, exports.updatePasses)();
    setInterval(() => {
        (0, exports.updatePasses)();
    }, 5 * 1000);
};
exports.updateDB = updateDB;
const sendEmail = (email, subject, body) => __awaiter(void 0, void 0, void 0, function* () {
    var transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: 'noreply.uniz@gmail.com',
            pass: 'xihr obwi mcpy rspg',
        },
    });
    var mailOptions = {
        from: 'noreply.uniz@gmail.com',
        to: email,
        subject: subject,
        html: body,
    };
    try {
        const info = yield transporter.sendMail(mailOptions);
        return {
            info,
            success: true,
        };
    }
    catch (error) {
        return {
            info: "Error sending email !!",
            success: true,
        };
    }
});
exports.sendEmail = sendEmail;
const updateStudentPassword = (username, password) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = yield (0, exports.hashPassword)(password);
    if (hash && hash.success) {
        yield client.student.update({
            where: {
                Username: username,
            },
            data: {
                Password: hash.password,
            },
        });
        return true;
    }
    else {
        return false;
    }
});
exports.updateStudentPassword = updateStudentPassword;
const updateAdminPassword = (username, password) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = yield (0, exports.hashPassword)(password);
    if (hash && hash.success) {
        yield client.admin.update({
            where: {
                Username: username,
            },
            data: {
                Password: hash.password,
            },
        });
        return true;
    }
    else {
        return false;
    }
});
exports.updateAdminPassword = updateAdminPassword;
const getOutPassRequests = () => __awaiter(void 0, void 0, void 0, function* () {
    const requests = yield client.outpass.findMany({
        where: {
            isApproved: false,
            isRejected: false,
            isExpired: false,
        },
        select: {
            id: true,
            StudentId: true,
            Reason: true,
            FromDay: true,
            ToDay: true,
            Days: true,
            RequestedTime: true,
            isExpired: true,
            isApproved: true,
            Student: true
        },
    });
    const updatedRequests = yield Promise.all(requests.map((outpass) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            _id: outpass.id,
            student_id: outpass.StudentId,
            reason: outpass.Reason,
            from_day: outpass.FromDay.toLocaleDateString("en-IN"),
            to_day: outpass.ToDay.toLocaleDateString("en-IN"),
            no_of_days: outpass.Days,
            requested_time: outpass.RequestedTime.toLocaleString("en-IN").split("GMT")[0],
            is_expired: outpass.isExpired,
            is_approved: outpass.isApproved,
            username: outpass.Student.Username,
            email: outpass.Student.Email
        };
    })));
    return updatedRequests;
});
exports.getOutPassRequests = getOutPassRequests;
const getOutingRequests = () => __awaiter(void 0, void 0, void 0, function* () {
    const requests = yield client.outing.findMany({
        where: {
            isApproved: false,
            isRejected: false,
            isExpired: false,
        },
        select: {
            id: true,
            StudentId: true,
            reason: true,
            FromTime: true,
            ToTime: true,
            RequestedTime: true,
            isExpired: true,
            isApproved: true,
            Student: true
        },
    });
    const updatedRequests = yield Promise.all(requests.map((outing) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            _id: outing.id,
            student_id: outing.StudentId,
            reason: outing.reason,
            from_time: outing.FromTime.toLocaleTimeString("en-IN"),
            to_time: outing.ToTime.toLocaleTimeString("en-IN"),
            requested_time: outing.RequestedTime.toLocaleString("en-IN").split("GMT")[0],
            is_expired: outing.isExpired,
            is_approved: outing.isApproved,
            username: outing.Student.Username,
            email: outing.Student.Email
        };
    })));
    return updatedRequests;
});
exports.getOutingRequests = getOutingRequests;
const getStudentsOutsideCampus = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield client.student.findMany({
        where: {
            isPresentInCampus: false,
        },
        select: {
            id: true,
            Username: true,
            Email: true,
            Name: true,
            Gender: true,
            isApplicationPending: true,
            isPresentInCampus: true,
            Outing: {
                select: {
                    id: true,
                    StudentId: true,
                    reason: true,
                    FromTime: true,
                    ToTime: true,
                    isExpired: true,
                    RequestedTime: true,
                    Hours: true,
                    isApproved: true,
                    isRejected: true,
                    issuedBy: true,
                    issuedTime: true,
                    Message: true,
                    rejectedBy: true,
                    rejectedTime: true,
                    inTime: true
                },
            },
            Outpass: {
                select: {
                    id: true,
                    StudentId: true,
                    Reason: true,
                    FromDay: true,
                    ToDay: true,
                    isExpired: true,
                    RequestedTime: true,
                    Days: true,
                    isApproved: true,
                    isRejected: true,
                    issuedBy: true,
                    issuedTime: true,
                    Message: true,
                    rejectedBy: true,
                    rejectedTime: true,
                    inTime: true
                },
            },
        },
    });
    const updatedUsersListAcctoLocaleTimeZone = yield Promise.all(users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            _id: user.id,
            username: user.Username,
            name: user.Name,
            gender: user.Gender,
            email: user.Email,
            has_pending_requests: user.isApplicationPending,
            is_in_campus: user.isPresentInCampus,
            outings_list: yield Promise.all(user.Outing.map((outing) => __awaiter(void 0, void 0, void 0, function* () {
                return {
                    _id: outing.id,
                    student_id: outing.StudentId,
                    reason: outing.reason,
                    from_time: new Date(outing.FromTime)
                        .toLocaleString("en-IN")
                        .split(",")[1],
                    to_time: new Date(outing.ToTime).toLocaleString("en-IN").split(",")[1],
                    no_of_hours: outing.Hours,
                    requested_time: new Date(outing.RequestedTime).toLocaleString("en-IN"),
                    is_expired: outing.isExpired,
                    is_approved: outing.isApproved,
                    issued_by: outing.issuedBy,
                    issued_time: new Date(outing.issuedTime).toLocaleString("en-IN"),
                    message: outing.Message,
                    is_rejected: outing.isRejected,
                    rejected_by: outing.rejectedBy,
                    rejected_time: new Date(outing.rejectedTime).toLocaleString("en-IN"),
                    in_time: new Date(outing.inTime).toLocaleString("en-IN").split(",")[1],
                };
            }))),
            outpasses_list: yield Promise.all(user.Outpass.map((outpass) => __awaiter(void 0, void 0, void 0, function* () {
                return {
                    _id: outpass.id,
                    student_id: outpass.StudentId,
                    reason: outpass.Reason,
                    from_day: outpass.FromDay.toLocaleDateString("en-IN"),
                    to_day: outpass.ToDay.toLocaleDateString("en-IN"),
                    no_of_days: outpass.Days,
                    requested_time: outpass.RequestedTime.toLocaleTimeString("en-IN"),
                    is_expired: outpass.isExpired,
                    is_approved: outpass.isApproved,
                    issued_by: outpass.issuedBy,
                    issued_time: outpass.issuedTime.toLocaleTimeString("en-IN"),
                    message: outpass.Message,
                    is_rejected: outpass.isRejected,
                    rejected_by: outpass.rejectedBy,
                    rejected_time: outpass.rejectedTime.toLocaleTimeString("en-IN"),
                    in_time: outpass.inTime,
                };
            }))),
        };
    })));
    return updatedUsersListAcctoLocaleTimeZone;
});
exports.getStudentsOutsideCampus = getStudentsOutsideCampus;
const updateUserPrescence = (userId, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const student = yield client.student.update({
            where: {
                id: userId,
            },
            data: {
                isPresentInCampus: true,
            },
        });
        try {
            yield client.outing.update({
                where: {
                    id: id
                }, data: {
                    inTime: new Date(),
                    isExpired: true
                }
            });
        }
        catch (e) {
            yield client.outpass.update({
                where: {
                    id: id
                }, data: {
                    inTime: new Date(),
                    isExpired: true
                }
            });
        }
        return {
            msg: `Successfully updated student prescence with ID Number : ${student.Username}`,
            success: true,
        };
    }
    catch (e) {
        console.log(e);
        return {
            msg: `Error updating student prescence Try again!`,
            success: false,
        };
    }
});
exports.updateUserPrescence = updateUserPrescence;
const getStudentDetails = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield client.student.findFirst({
        where: {
            Username: username.toLowerCase()
        },
        select: {
            id: true,
            Username: true,
            Email: true,
            isApplicationPending: true,
            isPresentInCampus: true,
            Name: true,
            Gender: true,
            Outing: {
                select: {
                    id: true,
                    StudentId: true,
                    reason: true,
                    FromTime: true,
                    ToTime: true,
                    isExpired: true,
                    RequestedTime: true,
                    Hours: true,
                    isApproved: true,
                    isRejected: true,
                    issuedBy: true,
                    issuedTime: true,
                    Message: true,
                    rejectedBy: true,
                    rejectedTime: true,
                    inTime: true
                },
            },
            Outpass: {
                select: {
                    id: true,
                    StudentId: true,
                    Reason: true,
                    FromDay: true,
                    ToDay: true,
                    isExpired: true,
                    RequestedTime: true,
                    Days: true,
                    isApproved: true,
                    isRejected: true,
                    issuedBy: true,
                    issuedTime: true,
                    Message: true,
                    rejectedBy: true,
                    rejectedTime: true,
                    inTime: true,
                },
            },
        },
    });
    if (user) {
        const updatedUserListAcctoLocaleTimeZone = {
            _id: user.id,
            username: user.Username,
            name: user.Name,
            gender: user.Gender,
            email: user.Email,
            has_pending_requests: user.isApplicationPending,
            is_in_campus: user.isPresentInCampus,
            outings_list: yield Promise.all(user.Outing.map((outing) => __awaiter(void 0, void 0, void 0, function* () {
                return {
                    _id: outing.id,
                    student_id: outing.StudentId,
                    reason: outing.reason,
                    from_time: new Date(outing.FromTime)
                        .toLocaleString("en-IN")
                        .split(",")[1],
                    to_time: new Date(outing.ToTime).toLocaleString("en-IN").split(",")[1],
                    no_of_hours: outing.Hours,
                    requested_time: new Date(outing.RequestedTime).toLocaleString("en-IN"),
                    is_expired: outing.isExpired,
                    is_approved: outing.isApproved,
                    issued_by: outing.issuedBy,
                    issued_time: new Date(outing.issuedTime).toLocaleString("en-IN"),
                    message: outing.Message,
                    is_rejected: outing.isRejected,
                    rejected_by: outing.rejectedBy,
                    rejected_time: new Date(outing.rejectedTime).toLocaleString("en-IN"),
                    in_time: new Date(outing.inTime).toLocaleString("en-IN").split(",")[1],
                };
            }))),
            outpasses_list: yield Promise.all(user.Outpass.map((outpass) => __awaiter(void 0, void 0, void 0, function* () {
                return {
                    _id: outpass.id,
                    student_id: outpass.StudentId,
                    reason: outpass.Reason,
                    from_day: outpass.FromDay.toLocaleDateString("en-IN"),
                    to_day: outpass.ToDay.toLocaleDateString("en-IN"),
                    no_of_days: outpass.Days,
                    requested_time: outpass.RequestedTime.toLocaleString("en-IN"),
                    is_expired: outpass.isExpired,
                    is_approved: outpass.isApproved,
                    issued_by: outpass.issuedBy,
                    issued_time: outpass.issuedTime.toLocaleTimeString("en-IN"),
                    message: outpass.Message,
                    is_rejected: outpass.isRejected,
                    rejected_by: outpass.rejectedBy,
                    rejected_time: outpass.rejectedTime.toLocaleTimeString("en-IN"),
                    in_time: outpass.inTime.toLocaleString("en-IN"),
                };
            }))),
        };
        return updatedUserListAcctoLocaleTimeZone;
    }
    else {
        return null;
    }
});
exports.getStudentDetails = getStudentDetails;
