
export const mapStudentToLegacy = (user: any) => {
  if (!user) return null;
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
    grades: user.grades?.map((g: any) => ({
      subject: g.subject?.name,
      credits: g.subject?.credits,
      grade: g.grade,
      semester: g.semester ? `${g.semester.year} ${g.semester.name}` : "",
    })) || [],
    attendance: user.attendance?.map((a: any) => ({
      subject: a.subject?.name,
      attendedClasses: a.attendedClasses,
      totalClasses: a.totalClasses,
      semester: a.semester ? `${a.semester.year} ${a.semester.name}` : "",
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

export const mapOutpassToLegacy = (o: any) => ({
  _id: o.id,
  student_id: o.StudentId,
  reason: o.Reason,
  from_day: new Date(o.FromDay).toLocaleDateString("en-IN"),
  to_day: new Date(o.ToDay).toLocaleDateString("en-IN"),
  no_of_days: o.Days,
  requested_time: o.RequestedTime.toString().split("GMT")[0],
  is_expired: o.isExpired,
  is_approved: o.isApproved,
  username: o.Student?.Username,
  email: o.Student?.Email,
  issued_by: o.issuedBy,
  issued_time: o.issuedTime ? new Date(o.issuedTime).toLocaleTimeString("en-IN") : null,
  message: o.Message,
  is_rejected: o.isRejected,
  rejected_by: o.rejectedBy,
  rejected_time: o.rejectedTime ? new Date(o.rejectedTime).toLocaleTimeString("en-IN") : null,
  in_time: o.inTime,
});

export const mapOutingToLegacy = (o: any) => ({
  _id: o.id,
  student_id: o.StudentId,
  reason: o.reason,
  from_time: new Date(o.FromTime).toLocaleTimeString("en-IN"),
  to_time: new Date(o.ToTime).toLocaleTimeString("en-IN"),
  requested_time: o.RequestedTime.toString().split("GMT")[0],
  is_expired: o.isExpired,
  is_approved: o.isApproved,
  username: o.Student?.Username,
  email: o.Student?.Email,
  no_of_hours: o.Hours,
  issued_by: o.issuedBy,
  issued_time: o.issuedTime ? new Date(o.issuedTime).toLocaleTimeString("en-IN") : null,
  message: o.Message,
  is_rejected: o.isRejected,
  rejected_by: o.rejectedBy,
  rejected_time: o.rejectedTime ? new Date(o.rejectedTime).toLocaleTimeString("en-IN") : null,
  in_time: o.inTime ? new Date(o.inTime).toLocaleTimeString("en-IN") : null,
});

export const mapStudentOutsideToLegacy = (user: any) => ({
  ...mapStudentToLegacy(user),
  outings_list: user.Outing?.map(mapOutingToLegacy) || [],
  outpasses_list: user.Outpass?.map(mapOutpassToLegacy) || [],
});

export const mapStudentSuggestionToLegacy = (student: any) => ({
  id: student.id,
  username: student.Username,
  name: student.Name,
  branch: student.Branch,
  year: student.Year,
});
