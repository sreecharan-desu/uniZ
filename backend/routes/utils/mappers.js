"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapStudentSuggestionToLegacy = exports.mapStudentOutsideToLegacy = exports.mapOutingToLegacy = exports.mapOutpassToLegacy = exports.mapStudentToLegacy = void 0;
const mapStudentToLegacy = (user) => {
    var _a, _b;
    if (!user)
        return null;
    return {
        id: user.id || user._id,
        username: user.Username,
        name: user.Name,
        gender: user.Gender,
        email: user.Email,
        year: user.Year,
        branch: user.Branch,
        section: user.Section,
        roomno: user.Roomno,
        has_pending_requests: user.isApplicationPending,
        is_in_campus: user.isPresentInCampus,
        grades: ((_a = user.grades) === null || _a === void 0 ? void 0 : _a.map((g) => {
            var _a, _b;
            return ({
                subject: (_a = g.subject) === null || _a === void 0 ? void 0 : _a.name,
                credits: (_b = g.subject) === null || _b === void 0 ? void 0 : _b.credits,
                grade: g.grade,
                semester: g.semester ? `${g.semester.year} ${g.semester.name}` : "",
            });
        })) || [],
        attendance: ((_b = user.attendance) === null || _b === void 0 ? void 0 : _b.map((a) => {
            var _a;
            return ({
                subject: (_a = a.subject) === null || _a === void 0 ? void 0 : _a.name,
                attendedClasses: a.attendedClasses,
                totalClasses: a.totalClasses,
                semester: a.semester ? `${a.semester.year} ${a.semester.name}` : "",
            });
        })) || [],
        blood_group: user.BloodGroup,
        phone_number: user.PhoneNumber,
        count: user._count,
        created_at: user.createdAt,
        date_of_birth: user.DateOfBirth,
        updated_at: user.updatedAt,
        father_address: user.FatherAddress,
        father_name: user.FatherName,
        father_phonenumber: user.FatherPhoneNumber,
        mother_address: user.MotherAddress,
        mother_name: user.MotherName,
        mother_phonenumber: user.MotherPhoneNumber,
        father_email: user.FatherEmail,
        mother_email: user.MotherEmail,
        father_occupation: user.FatherOccupation,
        mother_occupation: user.MotherOccupation,
        is_disabled: user.isDisabled,
        _id: user.id, // Legacy compatibility
    };
};
exports.mapStudentToLegacy = mapStudentToLegacy;
const mapOutpassToLegacy = (o) => {
    var _a, _b;
    return ({
        _id: o.id,
        student_id: o.StudentId,
        reason: o.Reason,
        from_day: new Date(o.FromDay).toLocaleDateString("en-IN"),
        to_day: new Date(o.ToDay).toLocaleDateString("en-IN"),
        no_of_days: o.Days,
        requested_time: o.RequestedTime.toString().split("GMT")[0],
        is_expired: o.isExpired,
        is_approved: o.isApproved,
        username: (_a = o.Student) === null || _a === void 0 ? void 0 : _a.Username,
        email: (_b = o.Student) === null || _b === void 0 ? void 0 : _b.Email,
        issued_by: o.issuedBy,
        issued_time: o.issuedTime ? new Date(o.issuedTime).toLocaleTimeString("en-IN") : null,
        message: o.Message,
        is_rejected: o.isRejected,
        rejected_by: o.rejectedBy,
        rejected_time: o.rejectedTime ? new Date(o.rejectedTime).toLocaleTimeString("en-IN") : null,
        in_time: o.inTime,
    });
};
exports.mapOutpassToLegacy = mapOutpassToLegacy;
const mapOutingToLegacy = (o) => {
    var _a, _b;
    return ({
        _id: o.id,
        student_id: o.StudentId,
        reason: o.reason,
        from_time: new Date(o.FromTime).toLocaleTimeString("en-IN"),
        to_time: new Date(o.ToTime).toLocaleTimeString("en-IN"),
        requested_time: o.RequestedTime.toString().split("GMT")[0],
        is_expired: o.isExpired,
        is_approved: o.isApproved,
        username: (_a = o.Student) === null || _a === void 0 ? void 0 : _a.Username,
        email: (_b = o.Student) === null || _b === void 0 ? void 0 : _b.Email,
        no_of_hours: o.Hours,
        issued_by: o.issuedBy,
        issued_time: o.issuedTime ? new Date(o.issuedTime).toLocaleTimeString("en-IN") : null,
        message: o.Message,
        is_rejected: o.isRejected,
        rejected_by: o.rejectedBy,
        rejected_time: o.rejectedTime ? new Date(o.rejectedTime).toLocaleTimeString("en-IN") : null,
        in_time: o.inTime ? new Date(o.inTime).toLocaleTimeString("en-IN") : null,
    });
};
exports.mapOutingToLegacy = mapOutingToLegacy;
const mapStudentOutsideToLegacy = (user) => {
    var _a, _b;
    return (Object.assign(Object.assign({}, (0, exports.mapStudentToLegacy)(user)), { outings_list: ((_a = user.Outing) === null || _a === void 0 ? void 0 : _a.map(exports.mapOutingToLegacy)) || [], outpasses_list: ((_b = user.Outpass) === null || _b === void 0 ? void 0 : _b.map(exports.mapOutpassToLegacy)) || [] }));
};
exports.mapStudentOutsideToLegacy = mapStudentOutsideToLegacy;
const mapStudentSuggestionToLegacy = (student) => ({
    id: student.id,
    username: student.Username,
    name: student.Name,
    branch: student.Branch,
    year: student.Year,
});
exports.mapStudentSuggestionToLegacy = mapStudentSuggestionToLegacy;
