import prisma from "./prisma.service";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "./email.service";
import { getForwardedMailFormatForStudent } from "../student/emails/email_templates";

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const findAdminByUsername = async (username: string) => {
  return await prisma.admin.findUnique({ where: { Username: username } });
};

export const updateAdminPassword = async (username: string, password: string) => {
  const hashedPassword = await hashPassword(password);
  await prisma.admin.update({
    where: { Username: username },
    data: { Password: hashedPassword },
  });
  return true;
};

// --- Outpass/Outing Approvals ---

export const getOutpassById = async (id: string) => {
  return await prisma.outpass.findUnique({ where: { id }, include: { Student: true } });
};

export const getOutingById = async (id: string) => {
  return await prisma.outing.findUnique({ where: { id }, include: { Student: true } });
};

const appendLog = (currentLogs: any, action: string, by: string, role: string) => {
  const logs = Array.isArray(currentLogs) ? currentLogs : [];
  logs.push({ action, by, role, time: new Date() });
  return logs;
};

export const approveOutpass = async (id: string, adminName: string, adminRole: string) => {
  const pass : any = await getOutpassById(id);
  if (!pass) return { success: false, msg: "Outpass not found" };
  if (pass.isApproved) return { success: false, msg: "Already approved" };
  if (pass.isRejected) return { success: false, msg: "Already rejected" };
  
  if (pass.currentLevel !== adminRole && adminRole !== 'webmaster') {
      return { success: false, msg: `Unauthorized. Request is at ${pass.currentLevel} level.` };
  }

  await prisma.outpass.update({
    where: { id },
    data: {
      isApproved: true,
      issuedBy: adminName,
      issuedTime: new Date(),
      Student: { update: { isApplicationPending: false, isPresentInCampus: false } },
      approvalLogs: appendLog(pass.approvalLogs, 'approve', adminName, adminRole),
      currentLevel: 'completed'
    }
  });

  if (pass.Student?.Email) {
      await sendEmail(pass.Student.Email, "Outpass Approved", `Your outpass request has been approved by ${adminName}.`);
  }
  return { success: true, msg: "Outpass approved" };
};

export const rejectOutpass = async (id: string, adminName: string, adminRole: string, message: string) => {
  const pass : any  = await getOutpassById(id);
  if (!pass) return { success: false, msg: "Outpass not found" };
  if (pass.isApproved) return { success: false, msg: "Already approved" };
  
  if (pass.currentLevel !== adminRole && adminRole !== 'webmaster') {
      return { success: false, msg: `Unauthorized. Request is at ${pass.currentLevel} level.` };
  }
  
  await prisma.outpass.update({
    where: { id },
    data: {
      isRejected: true,
      rejectedBy: adminName,
      rejectedTime: new Date(),
      Message: message,
      Student: { update: { isApplicationPending: false } },
      approvalLogs: appendLog(pass.approvalLogs, 'reject', adminName, adminRole),
      currentLevel: 'completed'
    }
  });

  if (pass.Student?.Email) {
      await sendEmail(pass.Student.Email, "Outpass Rejected", `Your outpass request has been rejected by ${adminName}. Reason: ${message}`);
  }
  return { success: true, msg: "Outpass rejected" };
};

export const forwardOutpass = async (id: string, adminName: string, adminRole: string) => {
  const pass : any  = await getOutpassById(id);
  if (!pass) return { success: false, msg: "Outpass not found" };
  if (pass.isApproved || pass.isRejected) return { success: false, msg: "Request already finalized" };
  
  if (pass.currentLevel !== adminRole && adminRole !== 'webmaster') {
      return { success: false, msg: `Unauthorized. Request is at ${pass.currentLevel} level.` };
  }

  let nextLevel = "";
  if (pass.currentLevel === 'caretaker') nextLevel = 'warden';
  else if (pass.currentLevel === 'warden') nextLevel = 'dsw';
  else return { success: false, msg: "Cannot forward further" };

  await prisma.outpass.update({
      where: { id },
      data: {
          currentLevel: nextLevel,
          approvalLogs: appendLog(pass.approvalLogs, 'forward', adminName, adminRole)
      }
  });

  if (pass.Student?.Email) {
      await sendEmail(
          pass.Student.Email,
          "Outpass Request Forwarded",
          getForwardedMailFormatForStudent("Outpass", id, adminRole, nextLevel)
      );
  }

  return { success: true, msg: `Forwarded to ${nextLevel}` };
};

export const approveOuting = async (id: string, adminName: string, adminRole: string) => {
  const outing = await getOutingById(id);
  if (!outing) return { success: false, msg: "Outing not found" };
  if (outing.isApproved) return { success: false, msg: "Already approved" };
  if (outing.isRejected) return { success: false, msg: "Already rejected" };

  if (outing.currentLevel !== adminRole && adminRole !== 'webmaster') {
      return { success: false, msg: `Unauthorized. Request is at ${outing.currentLevel} level.` };
  }
  
  await prisma.outing.update({
    where: { id },
    data: {
      isApproved: true,
      issuedBy: adminName,
      issuedTime: new Date(),
      Student: { update: { isApplicationPending: false, isPresentInCampus: false } },
      approvalLogs: appendLog(outing.approvalLogs, 'approve', adminName, adminRole),
      currentLevel: 'completed'
    }
  });

  if (outing.Student?.Email) {
      await sendEmail(outing.Student.Email, "Outing Approved", `Your outing request has been approved by ${adminName}.`);
  }
  return { success: true, msg: "Outing approved" };
};

export const rejectOuting = async (id: string, adminName: string, adminRole: string, message: string) => {
  const outing = await getOutingById(id);
  if (!outing) return { success: false, msg: "Outing not found" };
  if (outing.isApproved) return { success: false, msg: "Already approved" };
  
  if (outing.currentLevel !== adminRole && adminRole !== 'webmaster') {
      return { success: false, msg: `Unauthorized. Request is at ${outing.currentLevel} level.` };
  }

  await prisma.outing.update({
    where: { id },
    data: {
      isRejected: true,
      rejectedBy: adminName,
      rejectedTime: new Date(),
      Message: message,
      Student: { update: { isApplicationPending: false } },
      approvalLogs: appendLog(outing.approvalLogs, 'reject', adminName, adminRole),
      currentLevel: 'completed'
    }
  });

  if (outing.Student?.Email) {
      await sendEmail(outing.Student.Email, "Outing Rejected", `Your outing request has been rejected by ${adminName}. Reason: ${message}`);
  }
  return { success: true, msg: "Outing rejected" };
};

export const forwardOuting = async (id: string, adminName: string, adminRole: string) => {
  const outing = await getOutingById(id);
  if (!outing) return { success: false, msg: "Outing not found" };
  if (outing.isApproved || outing.isRejected) return { success: false, msg: "Request already finalized" };

  if (outing.currentLevel !== adminRole && adminRole !== 'webmaster') {
      return { success: false, msg: `Unauthorized. Request is at ${outing.currentLevel} level.` };
  }

  let nextLevel = "";
  if (outing.currentLevel === 'caretaker') nextLevel = 'warden';
  else if (outing.currentLevel === 'warden') nextLevel = 'dsw';
  else return { success: false, msg: "Cannot forward further" };

  await prisma.outing.update({
      where: { id },
      data: {
          currentLevel: nextLevel,
          approvalLogs: appendLog(outing.approvalLogs, 'forward', adminName, adminRole)
      }
  });

  if (outing.Student?.Email) {
      await sendEmail(
          outing.Student.Email,
          "Outing Request Forwarded",
          getForwardedMailFormatForStudent("Outing", id, adminRole, nextLevel)
      );
  }

  return { success: true, msg: `Forwarded to ${nextLevel}` };
};

import { mapOutingToLegacy, mapOutpassToLegacy, mapStudentOutsideToLegacy, mapStudentToLegacy } from "../utils/mappers";

export const getOutPassRequests = async () => {
  const requests = await prisma.outpass.findMany({
    where: { isApproved: false, isRejected: false, isExpired: false },
    include: { Student: { select: { Username: true, Email: true } } },
  });
  return requests.map(mapOutpassToLegacy);
};

export const getOutingRequests = async () => {
  const requests = await prisma.outing.findMany({
    where: { isApproved: false, isRejected: false, isExpired: false },
    include: { Student: { select: { Username: true, Email: true } } },
  });
  return requests.map(mapOutingToLegacy);
};

export const getStudentsOutsideCampus = async () => {
  const students = await prisma.student.findMany({
    where: { isPresentInCampus: false },
    select: {
      id: true,
      Username: true,
      Name: true,
      Email: true,
      Gender: true,
      isPresentInCampus: true,
      isApplicationPending: true,
      Outpass: { orderBy: { RequestedTime: 'desc' }, take: 1 },
      Outing: { orderBy: { RequestedTime: 'desc' }, take: 1 },
    }
  });
  return students.map(mapStudentOutsideToLegacy);
};

export const updateStudentPresence = async (userId: string, requestId: string) => {
  try {
    await prisma.student.update({ where: { id: userId }, data: { isPresentInCampus: true } });
    // Try to update either outing or outpass
    try {
      await prisma.outing.update({ where: { id: requestId }, data: { inTime: new Date(), isExpired: true } });
    } catch {
      await prisma.outpass.update({ where: { id: requestId }, data: { inTime: new Date(), isExpired: true } });
    }
    return { success: true, msg: "Student is now back in campus" };
  } catch (e) {
    return { success: false, msg: "Error updating presence" };
  }
};

// --- Student Management ---

function parseExcelSerialDate(serial: number | string): Date {
  if (typeof serial === 'string') return new Date(serial);
  const excelEpoch = new Date(1899, 11, 30);
  const date = new Date(excelEpoch.getTime() + (serial as number) * 86400000);
  return isNaN(date.getTime()) ? new Date() : date;
}

export async function addStudent(data: any) {
  const idNumber = data["ID NUMBER"];
  const name = data["NAME OF THE STUDENT"];
  const gender = data["GENDER"] || "Male";
  const branch = data["BRANCH"]?.toUpperCase() || "";
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

  const hashedPassword = await bcrypt.hash(`${idNumber.toLowerCase()}@rguktong`, 10);

  return await prisma.student.upsert({
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
}

export const getUsers = async (skip: number, take: number) => {
  const users = await prisma.student.findMany({
    skip,
    take,
    orderBy: { Username: 'asc' },
    include: {
      grades: { include: { subject: true, semester: true } },
      attendance: { include: { subject: true, semester: true } },
    }
  });
  return users.map(mapStudentToLegacy);
};

import { mapStudentSuggestionToLegacy } from "../utils/mappers";


export const getStudentSuggestions = async (q: string) => {
  const students = await prisma.student.findMany({
    where: { Username: { contains: q.toLowerCase(), mode: 'insensitive' } },
    take: 10,
    select: { id: true, Username: true, Name: true, Branch: true, Year: true }
  });
  return students.map(mapStudentSuggestionToLegacy);
};
