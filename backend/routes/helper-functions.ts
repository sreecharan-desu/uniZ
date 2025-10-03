import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();
const client = new PrismaClient();

const formatTime = (date: Date) => new Date(date).toLocaleString("en-IN").split(",")[1];
const formatDate = (date: Date) => date.toLocaleDateString("en-IN");
const formatDateTime = (date: Date) => new Date(date).toLocaleString("en-IN");
const formatTimeOnly = (date: Date) => date.toLocaleTimeString("en-IN");

export const isStudentPresentInCampus = async (id: string) => {
  const student = await client.student.findFirst({ where: { id }, select: { isPresentInCampus: true } });
  return student ? student.isPresentInCampus : { msg: "Invalid id", success: false };
};

export const isPendingApplication = async (id: string) => {
  const student = await client.student.findFirst({ where: { id }, select: { isApplicationPending: true } });
  return student ? { isPending: student.isApplicationPending, success: true } : { msg: "Invalid id", success: false };
};

export const currentUserByUsername = async (username: string) => {
  const user = await client.student.findFirst({ where: { Username: username }, select: { id: true, Username: true, Password: true, Email: true } });
  return user ? { user, success: true } : (console.log(`The user with username: ${username} doesn't exist`), { success: false });
};

export const currentAdminByUsername = async (adminname: string) => {
  const admin = await client.admin.findFirst({ where: { Username: adminname }, select: { id: true, Username: true, Password: true } });
  return admin ? { admin, success: true } : (console.log(`The admin with adminname: ${adminname} doesn't exist`), { success: false });
};

export const findUserById = async (userId: string) => {
  try {
    return (await client.student.findFirst({ where: { id: userId } })) ? true : false;
  } catch (e) {
    console.log(e, "Error finding user");
  }
};

export const findUserByUsername = async (username: string) => {
  try {
    console.log(username);
    return (await client.student.findFirst({ where: { Username: username } })) ? true : false;
  } catch (e) {
    console.log(e)
    console.log("Error finding user");
  }
};

export const hashPassword = async (password: string) => {
  try {
    return { password: await bcrypt.hash(password, 4), success: true };
  } catch {
    return { success: false };
  }
};

function parseExcelSerialDate(serial: number | string): Date {
  if (typeof serial === 'string') return new Date(serial) || (console.warn(`Invalid DOB string: ${serial}, defaulting to now`), new Date());
  const excelEpoch = new Date(1899, 11, 30);
  const days = Math.floor(serial);
  const ms = (serial - days) * 86400000;
  const date = new Date(excelEpoch.getTime() + days * 86400000 + ms);
  return isNaN(date.getTime()) ? (console.warn(`Invalid DOB serial: ${serial}, defaulting to now`), new Date()) : date;
}

export async function addStudent(idNumber: string, name: string, gender: string | undefined, branch: string, batch: string, mobileNumber: string | number, fatherName: string, motherName: string, parentNumber: string | number, bloodGroup: string, address: string) {
  try {
    if (!idNumber || !name) throw new Error(`Missing required fields for student ${idNumber}`);
    const currentYear = new Date().getFullYear();
    const batchYear = parseInt(batch.replace('O', '20'), 10);
    const yearsSinceBatch = isNaN(batchYear) ? -1 : currentYear - batchYear;
    const yearMapping = ['P1', 'P2', 'E1', 'E2', 'E3', 'E4'];
    const year = (isNaN(batchYear) || yearsSinceBatch < 0 || yearsSinceBatch > 5) ? (console.warn(`Invalid batch ${batch} (year ${batchYear}, yearsSinceBatch ${yearsSinceBatch}) for student ${idNumber}, defaulting to E3`), 'E3') : yearMapping[yearsSinceBatch];
    const normalizedBranch = branch?.replace(/-\d+$/, '').toUpperCase() || '';
    const validBranches = ['CSE', 'ECE', 'EEE', 'CIVIL', 'MECH'];
    if (branch && !validBranches.includes(normalizedBranch)) throw new Error(`Invalid branch ${branch} for student ${idNumber}`);
    const hashedPasswordResult = await hashPassword(`${idNumber.toLowerCase()}@rguktong`);
    if (!hashedPasswordResult.success || !hashedPasswordResult.password) throw new Error(`Failed to hash password for student ${idNumber}`);
    const studentData = {
      Username: idNumber.toLowerCase(),
      Password: hashedPasswordResult.password,
      Name: name,
      Email: `${idNumber}@rguktong.ac.in`,
      Gender: gender || 'Male',
      FatherName: fatherName || '',
      MotherName: motherName || '',
      FatherPhoneNumber: parentNumber ? String(parentNumber) : '',
      MotherPhoneNumber: '',
      BloodGroup: bloodGroup || '',
      DateOfBirth: parseExcelSerialDate(0),
      PhoneNumber: mobileNumber ? String(mobileNumber) : '',
      Address: address || '',
      Year: year,
      Branch: normalizedBranch,
      Section: '',
      Roomno: '',
      isDisabled: false,
      isPresentInCampus: true,
      isApplicationPending: false,
    };
    return await client.student.upsert({
      where: { Username: idNumber.toLowerCase() },
      update: studentData,
      create: { id: idNumber.toLowerCase(), ...studentData, createdAt: new Date(), updatedAt: new Date() },
    });
  } catch (error) {
    console.error(`Error adding student ${idNumber}:`, error);
    throw error;
  }
}

export const getUsers = async (skip = 0, take = 10) => {
  const users = await client.student.findMany({
    skip,
    take,
    select: {
      id: true,
      Username: true,
      Email: true,
      Name: true,
      Gender: true,
      isApplicationPending: true,
      isPresentInCampus: true,
      _count: true,
      Address: true,
      attendance: {
        select: {
          subject: { select: { name: true } },
          attendedClasses: true,
          totalClasses: true,
          semester: { select: { name: true, year: true } }
        }
      },
      grades: {
        select: {
          subject: { select: { name: true, credits: true } },
          grade: true,
          semester: { select: { name: true, year: true } }
        }
      },
      BloodGroup: true,
      PhoneNumber: true,
      DateOfBirth: true,
      FatherAddress: true,
      FatherName: true,
      FatherPhoneNumber: true,
      MotherAddress: true,
      MotherName: true,
      MotherPhoneNumber: true,
      FatherEmail: true,
      MotherEmail: true,
      FatherOccupation: true,
      MotherOccupation: true,
      isDisabled: true,
      Year: true,
      Branch: true,
      Section: true,
      Roomno: true,
      createdAt: true,
      updatedAt: true
    },
  });

  return users.map(user => ({
    id: user.id,
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
    grades: user.grades.map(g => ({
      subject: g.subject.name,
      credits: g.subject.credits,
      grade: g.grade,
      semester: `${g.semester.year} ${g.semester.name}`
    })),
    attendance: user.attendance.map(a => ({
      subject: a.subject.name,
      attendedClasses: a.attendedClasses,
      totalClasses: a.totalClasses,
      semester: `${a.semester.year} ${a.semester.name}`
    })),
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
  }));
};


export const requestOutpass = async (reason: string, id: string, from_date: Date, to_date: Date) => {
  if (from_date > to_date || from_date <= new Date()) {
    return from_date > to_date ? { msg: `Invalid input! You cannot request an outpass from ${from_date.toString().split("GMT")[0]} to ${to_date.toString().split("GMT")[0]}`, success: false } : { msg: `Invalid input! You cannot request an outpass for a completed day (including Today : ${from_date.toString().split("GMT")[0].split("05:30:00")[0]}) Since you are in campus) Enter tomorrow's date instead`, success: false };
  }
  const user = await findUserById(id);
  if (!user) return { msg: `The user with ID: ${id} doesn't exist`, success: false };
  const outpass_id = "id_" + (await crypto.randomBytes(12).toString("hex"));
  try {
    const outpass = await client.outpass.create({ data: { id: outpass_id, Reason: reason, FromDay: from_date, ToDay: to_date, StudentId: id, Days: to_date.getDate() - from_date.getDate(), isRejected: false, Message: "No message" }, select: { id: true, Reason: true, FromDay: true, ToDay: true, Days: true, RequestedTime: true } });
    await client.student.update({ where: { id }, data: { isApplicationPending: true } });
    return { outpass_details: outpass, msg: `OutpassRequest with id : ${outpass.id} sent Successfully You will notified via your college-mail about its status!`, success: true };
  } catch (e) {
    console.log(e);
    return { msg: "Error requesting an outpass, try again...", success: false };
  }
};

export const userDetailsById = async (id: string) => {
  const user = await client.student.findFirst({ where: { id }, select: { id: true, Username: true, Name: true, Email: true, Gender: true, Outpass: { select: { id: true, StudentId: true, isExpired: true, RequestedTime: true, FromDay: true, ToDay: true, Reason: true } }, Outing: { select: { id: true, StudentId: true, reason: true, FromTime: true, ToTime: true, isExpired: true, RequestedTime: true } } } });
  console.log(user);
};

export const updatePasses = async () => {
  const currentUTCDate = new Date();
  const outpasses = await client.outpass.findMany({ where: { isExpired: false }, select: { id: true, ToDay: true } });
  const outings = await client.outing.findMany({ where: { isExpired: false }, select: { id: true, ToTime: true } });
  const expiredOutpassIds = outpasses.filter(o => o.ToDay < currentUTCDate).map(o => o.id);
  const expiredOutingsIds = outings.filter(o => {
    const [h, m, s] = o.ToTime.toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).split(":").map(num => parseInt(num));
    const [ch, cm, cs] = [new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()];
    return ch > h || (ch === h && (cm > m || (cm === m && cs > s)));
  }).map(o => o.id);
  const expiredOutings = await Promise.all(expiredOutingsIds.map(id => client.outing.update({ where: { id }, data: { isExpired: true } })));
  const expiredPasses = await Promise.all(expiredOutpassIds.map(id => client.outpass.update({ where: { id }, data: { isExpired: true } })));
  expiredPasses.length ? console.log(`Outpasses with IDs: ${expiredPasses.map(p => p.id)} have expired at ${new Date().toLocaleTimeString("en-IN")}`) : console.log(`No outpasses were expired at ${new Date().toLocaleTimeString("en-IN")}`);
  expiredOutings.length ? console.log(`Outings with IDs: ${expiredOutings.map(p => p.id)} have expired at ${new Date().toLocaleTimeString("en-IN")}`) : console.log(`No outings were expired at ${new Date().toLocaleTimeString("en-IN")}`);
};

export const requestOuting = async (reason: string, id: string, from_time: string, to_time: string) => {
  const currentDate = new Date();
  const currentDateString = currentDate.toISOString().split("T")[0];
  const fromDateTime = new Date(`${currentDateString}T${from_time}`);
  const toDateTime = new Date(`${currentDateString}T${to_time}`);
  if (fromDateTime > toDateTime || fromDateTime < currentDate) return fromDateTime < currentDate ? { msg: "You cannot take Outing from Completed Timeperiod", success: false } : { msg: `Invalid Time!!You cannot take outing from ${from_time} to ${to_time}`, success: false };
  if (isNaN(fromDateTime.getTime()) || isNaN(toDateTime.getTime())) return { msg: "Invalid date or time format.", success: false };
  const hoursDifference = (toDateTime.getTime() - fromDateTime.getTime()) / 3600000;
  try {
    const outing_id = "id_" + (await crypto.randomBytes(12).toString("hex"));
    const outing = await client.outing.create({ data: { id: outing_id, StudentId: id, reason, FromTime: fromDateTime, ToTime: toDateTime, Hours: Math.floor(hoursDifference) }, select: { id: true, reason: true, FromTime: true, ToTime: true, RequestedTime: true } });
    await client.student.update({ where: { id }, data: { isApplicationPending: true } });
    return { outing_details: outing, msg: `Outing request with id ${outing_id} sent successfully...`, success: true };
  } catch {
    return { msg: "Error processing request please try again!", success: false };
  }
};

export const getOutpassExistsbyID = async (id: string) => {
  try {
    return (await client.outpass.findFirst({ where: { id } })) ? true : false;
  } catch {
    console.log("Error: Fetching outpasses");
    return false;
  }
};

export const getOutpassbyId = async (id: string) => {
  try {
    return await client.outpass.findFirst({ where: { id } });
  } catch {
    console.log("Error: Fetching outpasses");
    return false;
  }
};

export const findAdminByUsername = async (username: string) => {
  const admin = await client.admin.findFirst({ where: { Username: username }, select: { id: true } });
  return admin ? { admin, success: true } : { success: false };
};

export const addAdmin = async (username: string, password: string, role: string,email:string) => {
  const hashedPassword = await hashPassword(password);
  const id = "id_" + (await crypto.randomBytes(12).toString("hex"));
  if ((await findAdminByUsername(username)).success) return console.log("Admin already exists. Try a new username");
  if (hashedPassword.success && hashedPassword.password) try { await client.admin.create({ data: { id, Username: username, Password: hashedPassword.password, role: role, Email: email }, select: { id: true, Username: true } }); } catch { console.log("Error adding admin"); } else console.log("Error hashing password");
};

export const approveOutpass = async (id: string, adminName: string = "admin", message?: string) => {
  const outpassExists = await getOutpassExistsbyID(id);
  if (!outpassExists) return { msg: `OutpassRequest with ID: ${id} doesn't exist!`, success: false };
  const pass:any = await getOutpassbyId(id);
  if (!pass?.isApproved) {
    if (pass.isRejected) return { msg: `You cannot approve a Rejected OutpassRequestThe outpass with id ${id} is already rejected on ${pass.rejectedTime.toString().split("GMT")[0] + "IST"} by ${pass.rejectedBy || pass.Message}`, success: false };
    await client.outpass.update({ where: { id }, data: { isApproved: true, issuedBy: "Administration", Message: "Approved by Administration ", issuedTime: new Date(), Student: { update: { isApplicationPending: false, isPresentInCampus: false } } } });
    return { msg: `OutpassRequest with id : ${id} approved successfully...`, success: true };
  }
  return { msg: `The outpassRequest with id ${id} is already approved on ${pass.issuedTime} by ${pass.issuedBy || pass.Message}`, success: false };
};

export const rejectOutpass = async (id: string, adminName?: string, message?: string) => {
  const outpassExists = await getOutpassExistsbyID(id);
  if (!outpassExists) return { msg: `OutpassRequest with ID: ${id} doesn't exist!`, success: false };
  const pass:any = await getOutpassbyId(id);
  if (!pass?.isRejected) {
    if (pass.isApproved) return { msg: `You cannot reject an approved OutpassRequest The outpass with id ${id} is already approved on ${pass.issuedTime.toString().split("GMT")[0] + "IST"} by ${pass.issuedBy || pass.Message}`, success: false };
    await client.outpass.update({ where: { id }, data: { issuedTime: new Date(), isRejected: true, rejectedBy: adminName || "Administration", Message: message || "Rejected by Administration for not valid reason", rejectedTime: new Date(), Student: { update: { isApplicationPending: false } } } });
    return { msg: `OutpassRequest with id ${id} rejected successfully...`, success: true };
  }
  return { msg: `The OutpassRequest with id ${id} is already rejected on ${pass.rejectedTime.toString().split("GMT")[0] + "IST"} by ${pass.rejectedBy || pass.Message}`, success: false };
};

export const getOutingExistsbyID = async (id: string) => {
  try {
    return (await client.outing.findFirst({ where: { id } })) ? true : false;
  } catch {
    console.log("Error: Fetching outings");
    return false;
  }
};

export const getOutingbyId = async (id: string) => {
  try {
    return await client.outing.findFirst({ where: { id } });
  } catch {
    console.log("Error: Fetching outings");
    return false;
  }
};

export const approveOuting = async (id: string, adminName: string = "admin", message?: string) => {
  const outingExists = await getOutingExistsbyID(id);
  if (!outingExists) return { msg: `OutingRequest with ID: ${id} doesn't exist!`, success: false };
  const pass:any = await getOutingbyId(id);
  if (!pass?.isApproved) {
    if (pass.isRejected) return { msg: `You cannot approve a Rejected Outing RequestThe outpass with id ${id} is already rejected on ${pass.rejectedTime.toString().split("GMT")[0] + "IST"} by ${pass.rejectedBy || pass.Message}`, success: false };
    await client.outing.update({ where: { id }, data: { isApproved: true, issuedBy: "Administration", Message: "Approved by Administration ", issuedTime: new Date(), Student: { update: { isApplicationPending: false, isPresentInCampus: false } } } });
    return { msg: `OutingRequest with id : ${id} approved successfully...`, success: true };
  }
  return { msg: `The outingRequest with id ${id} is already approved on ${pass.issuedTime.toString().split("GMT")[0] + "IST"} by ${pass.issuedBy || pass.Message}`, success: false };
};

export const rejectOuting = async (id: string, adminName?: string, message?: string) => {
  const outingExists = await getOutingExistsbyID(id);
  if (!outingExists) return { msg: `OutingRequest with ID: ${id} doesn't exist!`, success: false };
  const pass:any = await getOutingbyId(id);
  if (!pass?.isRejected) {
    if (pass.isApproved) return { msg: `You cannot reject an approved OutingRequest The outingRequest with id ${id} is already approved on ${pass.issuedTime.toString().split("GMT")[0] + "IST"} by ${pass.issuedBy || pass.Message}`, success: false };
    await client.outing.update({ where: { id }, data: { issuedTime: new Date(), isRejected: true, rejectedBy: adminName || "Administration", Message: message || "Rejected by Administration for not valid reason", rejectedTime: new Date(), Student: { update: { isApplicationPending: false } } } });
    return { msg: `OutingRequest with id ${id} rejected successfully...`, success: true };
  }
  return { msg: `The outingRequest with id ${id} is already rejected on ${pass.rejectedTime.toString().split("GMT")[0] + "IST"} by ${pass.rejectedBy || pass.Message}`, success: false };
};

export const sendEmail = async (email: string, subject: string, body: string) => {
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: 'noreply.uniz@gmail.com', pass: 'xihr obwi mcpy rspg' } });
  const mailOptions = { from: 'noreply.uniz@gmail.com', to: email, subject, html: body };
  try {
    const info = await transporter.sendMail(mailOptions);
    return { info, success: true };
  } catch {
    return { info: "Error sending email !!", success: true };
  }
};

export const updateStudentPassword = async (username: string, password: string) => {
  const hash = await hashPassword(password);
  return hash.success ? (await client.student.update({ where: { Username: username }, data: { Password: hash.password } }), true) : false;
};

export const updateAdminPassword = async (username: string, password: string) => {
  const hash = await hashPassword(password);
  return hash.success ? (await client.admin.update({ where: { Username: username }, data: { Password: hash.password } }), true) : false;
};

export const getOutPassRequests = async () => {
  const requests = await client.outpass.findMany({ where: { isApproved: false, isRejected: false, isExpired: false }, select: { id: true, StudentId: true, Reason: true, FromDay: true, ToDay: true, Days: true, RequestedTime: true, isExpired: true, isApproved: true, Student: true } });
  return Promise.all(requests.map(async o => ({ _id: o.id, student_id: o.StudentId, reason: o.Reason, from_day: formatDate(o.FromDay), to_day: formatDate(o.ToDay), no_of_days: o.Days, requested_time: formatDateTime(o.RequestedTime).split("GMT")[0], is_expired: o.isExpired, is_approved: o.isApproved, username: o.Student.Username, email: o.Student.Email })));
};

export const getOutingRequests = async () => {
  const requests = await client.outing.findMany({ where: { isApproved: false, isRejected: false, isExpired: false }, select: { id: true, StudentId: true, reason: true, FromTime: true, ToTime: true, RequestedTime: true, isExpired: true, isApproved: true, Student: true } });
  return Promise.all(requests.map(async o => ({ _id: o.id, student_id: o.StudentId, reason: o.reason, from_time: formatTimeOnly(o.FromTime), to_time: formatTimeOnly(o.ToTime), requested_time: formatDateTime(o.RequestedTime).split("GMT")[0], is_expired: o.isExpired, is_approved: o.isApproved, username: o.Student.Username, email: o.Student.Email })));
};

export const getStudentsOutsideCampus = async () => {
  const users = await client.student.findMany({ where: { isPresentInCampus: false }, select: { id: true, Username: true, Email: true, Name: true, Gender: true, isApplicationPending: true, isPresentInCampus: true, Outing: { select: { id: true, StudentId: true, reason: true, FromTime: true, ToTime: true, isExpired: true, RequestedTime: true, Hours: true, isApproved: true, isRejected: true, issuedBy: true, issuedTime: true, Message: true, rejectedBy: true, rejectedTime: true, inTime: true } }, Outpass: { select: { id: true, StudentId: true, Reason: true, FromDay: true, ToDay: true, isExpired: true, RequestedTime: true, Days: true, isApproved: true, isRejected: true, issuedBy: true, issuedTime: true, Message: true, rejectedBy: true, rejectedTime: true, inTime: true } } } });
  return Promise.all(users.map(async user => ({
    _id: user.id,
    username: user.Username,
    name: user.Name,
    gender: user.Gender,
    email: user.Email,
    has_pending_requests: user.isApplicationPending,
    is_in_campus: user.isPresentInCampus,
    outings_list: await Promise.all(user.Outing.map(async o => ({ _id: o.id, student_id: o.StudentId, reason: o.reason, from_time: formatTime(o.FromTime), to_time: formatTime(o.ToTime), no_of_hours: o.Hours, requested_time: formatDateTime(o.RequestedTime), is_expired: o.isExpired, is_approved: o.isApproved, issued_by: o.issuedBy, issued_time: formatDateTime(o.issuedTime), message: o.Message, is_rejected: o.isRejected, rejected_by: o.rejectedBy, rejected_time: formatDateTime(o.rejectedTime), in_time: formatTime(o.inTime) }))),
    outpasses_list: await Promise.all(user.Outpass.map(async o => ({ _id: o.id, student_id: o.StudentId, reason: o.Reason, from_day: formatDate(o.FromDay), to_day: formatDate(o.ToDay), no_of_days: o.Days, requested_time: formatTimeOnly(o.RequestedTime), is_expired: o.isExpired, is_approved: o.isApproved, issued_by: o.issuedBy, issued_time: formatTimeOnly(o.issuedTime), message: o.Message, is_rejected: o.isRejected, rejected_by: o.rejectedBy, rejected_time: formatTimeOnly(o.rejectedTime), in_time: o.inTime }))),
  })));
};

export const updateUserPrescence = async (userId: string, id: string) => {
  try {
    const student = await client.student.update({ where: { id: userId }, data: { isPresentInCampus: true } });
    try {
      await client.outing.update({ where: { id }, data: { inTime: new Date(), isExpired: true } });
    } catch {
      await client.outpass.update({ where: { id }, data: { inTime: new Date(), isExpired: true } });
    }
    return { msg: `Successfully updated student prescence with ID Number : ${student.Username}`, success: true };
  } catch (e) {
    console.log(e);
    return { msg: "Error updating student prescence Try again!", success: false };
  }
};

export const getStudentSuggestions = async (username: string) => {
  const students = await client.student.findMany({
    where: {
      Username: {
        startsWith: username.toLowerCase(),
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      Username: true,
      Name: true,
      Branch: true,
      Year: true,
    },
  });

  const suggestions = students.map((student) => ({
    id: student.id,
    username: student.Username,
    name: student.Name,
    branch: student.Branch,
    year: student.Year,
  }));
  return suggestions;
};

export const getStudentDetails = async (username: string) => {
  const user = await client.student.findFirst({ where: { Username: username.toLowerCase() }, 
    select: { id: true, Username: true, Email: true, Name: true, Gender: true, isApplicationPending: true, isPresentInCampus: true, Outing: { select: { id: true, StudentId: true, reason: true, FromTime: true, ToTime: true, isExpired: true, RequestedTime: true, Hours: true, isApproved: true, isRejected: true, issuedBy: true, issuedTime: true, Message: true, rejectedBy: true, rejectedTime: true, inTime: true } }, Outpass: { select: { id: true, StudentId: true, Reason: true, FromDay: true, ToDay: true, isExpired: true, RequestedTime: true, Days: true, isApproved: true, isRejected: true, issuedBy: true, issuedTime: true, Message: true, rejectedBy: true, rejectedTime: true, inTime: true } },
    _count : true,Address : true,attendance : {select : { subject : {select : {name : true}} ,attendedClasses : true, totalClasses : true, semester : {select : {name : true,year : true}}}},
    grades : { select : { subject : {select : {name : true,credits : true}} ,grade : true, semester : {select : {name : true,year : true}}}},
     BloodGroup : true, PhoneNumber : true, DateOfBirth : true, FatherAddress : true, FatherName : true, FatherPhoneNumber : true, MotherAddress : true, MotherName : true, MotherPhoneNumber : true, FatherEmail : true, MotherEmail : true, FatherOccupation : true, MotherOccupation : true, isDisabled: true,Year: true, Branch: true, Section: true, Roomno: true, createdAt: true, updatedAt: true },
    });
  return user ? {
    _id: user.id,
    username: user.Username,
    name: user.Name,
    gender: user.Gender,
    attendance : user.attendance,
    grades : user.grades,
    email: user.Email,
    year: user.Year,
    branch: user.Branch,
    section: user.Section,
    roomno: user.Roomno,
    has_pending_requests: user.isApplicationPending,
    is_in_campus: user.isPresentInCampus,
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
  } : null;
};

export const subjectsData = {
  'E1': {
    'Sem - 1': {
      'CSE': { names: ["Calculus & Linear Algebra", "Basic Electrical and Electronics Engg.", "Problem Solving and Programming Through C", "Engineering Graphics & Computer Drafting", "English-Language communication Skills Lab-I", "Basic Electrical and Electronics Engg. Lab", "Problem Solving and Programming Through C Lab", "", ""], credits: [4, 4, 4, 2.5, 2.5, 1.5, 1.5, 0, 0, 0], hide: [8, 9] },
      'ECE': { names: ["Differential Equations and Multivariable calculus", "Engineering Physics", "Engineering Physics Lab", "Engineering Graphics and Computer Drafting", "Electrical Technology", "Electrical Technology Lab", "Introduction to Latest Technical Advancements", "Programming & Data Structures", "Programming & Data Structures Lab"], credits: [4, 4, 1.5, 2.5, 4, 1.5, 1, 3, 1.5, 0] },
      'EEE': { names: ["Differential Equations and Multivariable Calculus", "Engineering Physics", "Engineering Physics Lab", "Engineering Graphics & Computer Drafting", "Electrical Technology", "Electrical Technology Lab", "Introduction to Latest Technical Advancements", "Programming & Data Structures", "Programming & Data Structures Lab"], credits: [4, 4, 1.5, 2.5, 4, 1.5, 1, 3, 1.5, 0] },
      'CIVIL': { names: ["Engineering Chemistry", "Differential Equations and Multivariable Calculus", "Basic Programming Language", "Engineering Graphics and Computer Drafting", "Computer Aided Drafting (CAD) Lab", "English Language Communication Skills Lab-I", "C Programming Lab", "", ""], credits: [3, 4, 4, 2.5, 1.5, 2.5, 1.5, 0, 0, 0], hide: [8, 9] },
      'MECH': { names: ["Differential Equations and Multivariable Calculus", "English Language Communication Skills Lab - 1", "Engineering Physics", "Basic Electrical and Electronics Engineering", "Engineering Chemistry", "Workshop Practice", "Basic Electrical & Electronics Engineering Lab", "Engineering Physics & Chemistry Lab", ""], credits: [4, 2.5, 4, 4, 3, 1.5, 1.5, 1.5, 0, 0], hide: [9] }
    },
    'Sem - 2': {
      'CSE': { names: ["Discrete Mathematics", "Engineering Physics", "Managerial Economics and Finance Analysis", "Object Oriented Programming through Java", "Data Structures", "Engineering Physics Lab", "Object Oriented Programming through Java Lab", "Data Structures Lab", ""], credits: [4, 4, 3, 4, 3, 1.5, 1.5, 1.5, 0, 0], hide: [9] },
      'ECE': { names: ["Mathematical Methods", "Object Oriented Programming", "Object Oriented Programming Laboratory", "Computational Lab", "English-Language Communication skills Lab-1", "Electronic Devices and Circuits", "Electronic Devices and Circuits Lab", "Network Theory", "Engineering Graphics and Design"], credits: [4, 2, 1.5, 1.5, 2.5, 4, 1.5, 4, 2.5, 0] },
      'EEE': { names: ["Mathematical Methods", "Digital Logic Design", "Digital Logic Design Lab", "Computational Lab", "English Language communication Skills Lab-1", "Electronic Devices and Circuits", "Electronic Devices and Circuits Lab", "Network Theory", "Introduction to AI"], credits: [4, 4, 1.5, 1.5, 2.5, 4, 1.5, 4, 1, 0] },
      'CIVIL': { names: ["Engineering Physics", "Mathematical Methods", "Basic Electrical and Electronics Engineering", "Engineering Mechanics", "Engineering Geology", "Engineering Physics Lab", "Workshop", "Environmental Science", ""], credits: [3, 4, 3, 4, 3, 1.5, 1.5, 0, 0, 0], hide: [9] },
      'MECH': { names: ["Mathematical Methods", "Engineering Mechanics", "Material Science & Metallurgy", "Programming and Data Structures", "Engineering Graphics and Computer Drafting", "Programming and Data Structures Lab", "Material Science and Metallurgy Lab", "", ""], credits: [4, 4, 3, 3, 2.5, 1.5, 1.5, 0, 0, 0], hide: [8, 9] }
    }
  },
  'E2': {
    'Sem - 1': {
      'CSE': { names: ["Probability and Statistics", "Digital Logic Design", "Design & Analysis of Algorithms", "Database Management Systems", "Formal Languages & Automata Theory", "Design & Analysis of Algorithms Lab", "Digital Logic Design Lab", "Database Management Systems Lab", ""], credits: [4, 3, 4, 3, 3, 1.5, 1.5, 1.5, 0, 0], hide: [9] },
      'ECE': { names: ["Probability & Random Variables", "Internet of Things Lab", "Analog Electronic Circuits", "Analog Electronic Circuits Lab", "Digital Logic Design", "Digital Logic Design Lab", "Digital Signal Processing", "Digital Signal Processing Lab", "Control Systems"], credits: [3, 1.5, 4, 1.5, 4, 1.5, 4, 1.5, 3, 0] },
      'EEE': { names: ["Probability & Random Variables", "Internet of Things Lab", "Analog Electronic Circuits", "Analog Electronic Circuits Lab", "Object Oriented Programming", "Object Oriented Programming Lab", "Signals & Systems", "Electrical Machines", "Electrical Machines Lab"], credits: [3, 1, 4, 1.5, 3, 1, 4, 4, 1.5, 0] },
      'CIVIL': { names: ["Management Economics and Financial Analysis", "Building Materials and Construction", "Concrete Technology", "Mechanics of Fluids", "Mechanics of Materials-I", "Surveying-I", "Mechanics of Materials Lab", "Surveying Lab", ""], credits: [3, 3, 3, 3, 3, 3, 1.5, 1.5, 0, 0], hide: [9] },
      'MECH': { names: ["Transform Calculus", "Kinematics of Machinery", "Thermodynamics", "Mechanics of Solids", "Manufacturing Processes", "Mechanics of Solids Lab", "Computer Aided Machine Drawing", "", ""], credits: [4, 4, 4, 4, 3, 1.5, 1.5, 0, 0, 0], hide: [8, 9] }
    },
    'Sem - 2': {
      'CSE': { names: ["Introduction to Operation Research", "Computer Organization & Architecture", "Data Science with Python", "Web Technologies", "Compiler Design", "Computer Organization & Architecture Lab", "Data Science with Python Lab", "Web Technologies Lab", ""], credits: [3, 3, 3, 3, 3, 1.5, 1.5, 1.5, 0, 0], hide: [9] },
      'ECE': { names: ["Robotics Laboratory", "Communication Systems-1", "Communication Systems-1 Lab", "Digital System Design", "Digital System Design Lab", "Linear Integrated Circuits", "Linear Integrated Circuits Lab", "Electromagnetic Waves & Guided Media", ""], credits: [2.5, 4, 1.5, 4, 1.5, 4, 1.5, 4, 0, 0], hide: [9] },
      'EEE': { names: ["Robotics Laboratory", "Power Systems - I", "Machine Learning", "Control Systems", "Control Systems Lab", "Linear Integrated Circuits", "Linear Integrated Circuits Lab", "Power Electronics", "Power Electronics Lab"], credits: [1, 4, 3, 4, 1.5, 4, 1.5, 4, 1.5, 0] },
      'CIVIL': { names: ["Hydraulics Engineering", "Mechanics of Materials-II", "Soil Mechanics", "Structural Analysis", "Surveying-II", "Water Resources Engineering", "Concrete Technology Lab", "Hydraulics Engineering Lab", ""], credits: [3, 3, 4, 4, 3, 3, 1.5, 1.5, 0, 0], hide: [9] },
      'MECH': { names: ["Design of Machine Elements", "Dynamics of Machinery", "Fluid Mechanics & Hydraulic Machinery", "Metal Cutting and Machine Tools", "Probability and Statistics", "Metal cutting and Machine Tools Lab", "Fluid Mechanics & Hydraulic Machinery Lab", "", ""], credits: [4, 4, 4, 4, 3, 1.5, 1.5, 0, 0, 0], hide: [8, 9] }
    }
  },
  'E3': {
    'Sem - 1': {
      'CSE': { names: ["Operating System", "Computer Networks", "Software Engineering", "Mathematical Foundations for Data Science", "Elective I", "Operating System Lab", "Computer Networks Lab", "Software Engineering Lab", "English-Language communication Skills Lab- II"], credits: [3, 3, 3, 3, 3, 1.5, 1.5, 1.5, 1.5, 0] },
      'ECE': { names: ["Computer Networks", "Computer Organization & Architecture", "English-Language Communication skills Lab-2", "Communication Systems- 2", "Communication Systems -2 Lab", "Microprocessors,Microcontrollers & Computer Networks Lab", "Radio Frequency & Microwave Engg. Lab", "Mini-Project-I (Socially Relevant Project)", ""], credits: [3, 4, 1.5, 4, 1.5, 1.5, 2.5, 1, 0, 0], hide: [9] },
      'EEE': { names: ["Digital Signal Processing", "Power Systems - II", "Power Systems Lab", "English Language Communication Skills Lab- 2", "Electrical Vehicles", "Electrical Vehicles Lab", "Embedded Systems", "Embedded Systems Lab", "Mini-Project-I", "Product Design & Innovation"], credits: [3, 4, 1.5, 1.5, 3, 1.5, 3, 1.5, 1, 1], show: [10] },
      'CIVIL': { names: ["Advanced Structural Analysis", "Design of Reinforced concrete Structures", "Environmental Engineering-I", "Estimation and Costing", "Transportation Engineering-I", "English Language Communication Skills Lab-II", "Soil Mechanics Lab", "Transportation Engineering Lab", ""], credits: [4, 4, 3, 3, 3, 1.5, 1.5, 1.5, 0, 0], hide: [9] },
      'MECH': { names: ["Heat Transfer", "Design of Transmission Elements", "Applied Thermodynamics", "Metrology and Mechanical Measurements", "Metrology and Mechanical Measurements Lab", "Heat Transfer Lab", "Applied Thermodynamics Lab", "English Language Communication Skills Lab-II", ""], credits: [4, 4, 4, 3, 1.5, 1.5, 1.5, 1.5, 0, 0], hide: [9] }
    },
    'Sem - 2': {
      'CSE': { names: ["Cryptography and Networks Security", "Artificial Intelligence", "Elective II", "Elective III", "Open Elective-I", "English-Language communication Skills Lab-I -III", "Mini Project", "", "Summer Internship"], credits: [4, 4, 3, 3, 3, 1.5, 3, 0, 3, 0], hide: [8] },
      'ECE': { names: ["English-Language Communication skills Lab-3", "Product Design & Innovation", "Elective-1", "Elective-2", "Open Elective-1", "Open Elective-2", "Mini Project-II", "", ""], credits: [1.5, 1, 3, 3, 3, 3, 1.5, 0, 0, 0], hide: [8, 9] },
      'EEE': { names: ["English-Language Communication skills Lab-3", "Elective-1", "Elective-2", "Open Elective-1", "Open Elective-2", "Mini Project-II", "", "", ""], credits: [1.5, 3, 3, 3, 3, 1, 0, 0, 0, 0], hide: [7, 8, 9] },
      'CIVIL': { names: ["Building Planning and Computer Aided Drawing Lab", "Design of Steel Structures", "Environmental Engineering-II", "Foundation Engineering", "Transportation Engineering-II", "Professional Elective Course-1/MOOC-1", "English Language Communication Skills Lab-1", "Environmental Engineering Lab", ""], credits: [2.5, 4, 3, 3, 3, 3, 1.5, 1.5, 0, 0], hide: [9] },
      'MECH': { names: ["Operations Research", "Finite Element Method", "Managerial Economics and Financial Analysis", "Program Elective Course-1", "Program Elective Course-2", "Computer Aided Modeling and Simulation Lab", "English Language Communication Skills Lab-III", "", ""], credits: [4, 4, 3, 3, 3, 1.5, 1.5, 0, 0, 0], hide: [8, 9] }
    }
  },
  'E4': {
    'Sem - 1': {
      'CSE': { names: ["Elective-V", "Open Elective-III", "Open Elective-IV", "Project-II", "Community Service", "", "", "", ""], credits: [3, 3, 3, 6, 2, 0, 0, 0, 0, 0], hide: [6, 7, 8, 9] },
      'ECE': { names: ["Elective-3", "Elective-4", "Open Elective-3", "Summer Internship Project", "Project I", "", "", "", ""], credits: [3, 3, 3, 3, 0, 0, 0, 0, 0, 0], hide: [6, 7, 8, 9] },
      'EEE': { names: ["Elective - 3", "Elective - 4", "Open Elective - 3", "Summer Internship Project", "Project - 1", "", "", "", ""], credits: [3, 3, 3, 3, 4, 0, 0, 0, 0, 0], hide: [6, 7, 8, 9] },
      'CIVIL': { names: ["Professional Elective Course-2/MOOC-2", "Professional Elective Course-3", "Professional Elective Course-4", "Open Elective Course-1", "Project-1", "", "", "", ""], credits: [3, 3, 3, 3, 4, 0, 0, 0, 0, 0], hide: [6, 7, 8, 9] },
      'MECH': { names: ["Program Elective Course-3", "Open Elective Course-1", "Open Elective Course-2", "Project", "", "", "", "", ""], credits: [3, 3, 3, 4.5, 0, 0, 0, 0, 0, 0], hide: [5, 6, 7, 8, 9] }
    },
    'Sem - 2': {
      'CSE': { names: ["Discrete Mathematics", "Engineering Physics", "Managerial Economics and Finance Analysis", "Object Oriented Programming through Java", "Data Structures", "Engineering Physics Lab", "Object Oriented Programming through Java Lab", "Data Structures Lab", ""], credits: [4, 4, 3, 4, 3, 1.5, 1.5, 1.5, 0, 0], hide: [6, 7, 8, 9] },
      'ECE': { names: ["Community Service", "Elective-5", "Open Elective-4", "Project-II & Dissertation", "", "", "", "", ""], credits: [2, 3, 3, 6, 0, 0, 0, 0, 0, 0], hide: [5, 6, 7, 8, 9] },
      'EEE': { names: ["Community Service", "Elective - 5", "Open Elective - 4", "Project - II & Dissertation", "", "", "", "", ""], credits: [2, 3, 3, 6, 0, 0, 0, 0, 0, 0], hide: [5, 6, 7, 8, 9] },
      'CIVIL': { names: ["Professional Elective Course-5", "Open Elective Course-2/MOOC-3s", "Open Elective Course-3", "Project-2", "Indian Community Services", "", "", "", ""], credits: [3, 3, 3, 5, 2, 0, 0, 0, 0, 0], hide: [6, 7, 8, 9] },
      'MECH': { names: ["Program Elective Course-4", "Open Elective Course-3", "Open Elective Course-4", "Community Service", "Project", "", "", "", ""], credits: [3, 3, 3, 2, 6, 0, 0, 0, 0, 0], hide: [6, 7, 8, 9] }
    }
  }
};


export const convertLetterToNumericGrade = (letterGrade: string) => {
  const gradeMap: { [key: string]: number } = { 'EX': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'R': 0 };
  return gradeMap[letterGrade.toUpperCase()] || null;
};

export const validateInput = (data: any) => {
  const errors: any = [];
  if (typeof data !== 'object' || data === null) return [{ message: 'Input must be a non-null object' }];
  if (!data.SemesterName || typeof data.SemesterName !== 'string') errors.push({ message: 'SemesterName must be a non-empty string' });
  else {
    const [year, name] = data.SemesterName.split(' ');
    if (!year || !name) errors.push({ message: `SemesterName "${data.SemesterName}" must be in format "year semester" (e.g., "E1 Sem-1")` });
  }
  if (!Array.isArray(data.Students)) errors.push({ message: 'Students must be an array' });
  else if (data.Students.length === 0) errors.push({ message: 'Students array is empty' });
  else {
    data.Students.forEach((record: any, index: number) => {
      if (typeof record !== 'object' || record === null) errors.push({ recordIndex: index, message: 'Student record must be a non-null object' });
      if (!record.Username || typeof record.Username !== 'string') errors.push({ recordIndex: index, message: 'Username must be a non-empty string' });
      if (!Array.isArray(record.Grades)) errors.push({ recordIndex: index, message: 'Grades must be an array' });
      else record.Grades.forEach((grade: any, gradeIndex: number) => {
        if (typeof grade !== 'object' || grade === null) errors.push({ recordIndex: index, gradeIndex, message: 'Grade entry must be a non-null object' });
        if (!grade.SubjectName || typeof grade.SubjectName !== 'string') errors.push({ recordIndex: index, gradeIndex, message: 'SubjectName must be a non-empty string' });
        if (!grade.Grade || typeof grade.Grade !== 'string' || convertLetterToNumericGrade(grade.Grade) === null) errors.push({ recordIndex: index, gradeIndex, message: 'Grade must be a valid letter grade (Ex, A, B, C, D, E, R)' });
      });
    });
  }
  return errors;
};

export const validateInputForAttendance = (data: any) => {
  const errors: any = [];
  if (typeof data !== 'object' || data === null) return [{ message: 'Input must be a non-null object' }];
  if (!data.SemesterName || typeof data.SemesterName !== 'string') errors.push({ message: 'SemesterName must be a non-empty string' });
  else {
    const [year, name] = data.SemesterName.split('*');
    if (!year || !name) errors.push({ message: `SemesterName "${data.SemesterName}" must be in format "year*name" (e.g., "E1*Sem - 1")` });
  }
  if (!Array.isArray(data.data)) errors.push({ message: 'data must be an array' });
  else if (data.data.length === 0) errors.push({ message: 'data array is empty' });
  else {
    data.data.forEach((record: any, index: number) => {
      if (typeof record !== 'object' || record === null) errors.push({ recordIndex: index, message: 'Student record must be a non-null object' });
      if (!record.IdNumber || typeof record.IdNumber !== 'string') errors.push({ recordIndex: index, message: 'IdNumber must be a non-empty string' });
      if (!Array.isArray(record.no_of_classes_happened)) errors.push({ recordIndex: index, message: 'no_of_classes_happened must be an array' });
      else record.no_of_classes_happened.forEach((cls: any, clsIndex: number) => {
        if (typeof cls !== 'object' || cls === null) errors.push({ recordIndex: index, clsIndex, message: 'Class entry must be a non-null object' });
        if (!cls.SubjectName || typeof cls.SubjectName !== 'string') errors.push({ recordIndex: index, clsIndex, message: 'SubjectName must be a non-empty string' });
        if (typeof cls.Classes !== 'number' || cls.Classes < 0 || !Number.isInteger(cls.Classes)) errors.push({ recordIndex: index, clsIndex, message: 'Classes must be a non-negative integer' });
      });
      if (!Array.isArray(record.no_of_classes_attended)) errors.push({ recordIndex: index, message: 'no_of_classes_attended must be an array' });
      else record.no_of_classes_attended.forEach((cls: any, clsIndex: number) => {
        if (typeof cls !== 'object' || cls === null) errors.push({ recordIndex: index, clsIndex, message: 'Class entry must be a non-null object' });
        if (!cls.SubjectName || typeof cls.SubjectName !== 'string') errors.push({ recordIndex: index, clsIndex, message: 'SubjectName must be a non-empty string' });
        if (typeof cls.Classes !== 'number' || cls.Classes < 0 || !Number.isInteger(cls.Classes)) errors.push({ recordIndex: index, clsIndex, message: 'Classes must be a non-negative integer' });
      });
    });
  }
  return errors;
};