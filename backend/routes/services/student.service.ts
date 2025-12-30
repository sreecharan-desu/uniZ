import prisma from "./prisma.service";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

import { mapStudentToLegacy } from "../utils/mappers";

export const getStudentDetails = async (username: string) => {
  const user = await prisma.student.findUnique({
    where: { Username: username.toLowerCase() },
  });
  return mapStudentToLegacy(user);
};

export const updateStudentPassword = async (username: string, password: string) => {
  const hashedPassword = await hashPassword(password);
  await prisma.student.update({
    where: { Username: username.toLowerCase() },
    data: { Password: hashedPassword },
  });
  return { msg: "Password updated successfully!", success: true };
};

export const isStudentPresentInCampus = async (id: string) => {
  const student = await prisma.student.findUnique({ where: { id }, select: { isPresentInCampus: true } });
  return student ? student.isPresentInCampus : false;
};

export const isPendingApplication = async (id: string) => {
  const student = await prisma.student.findUnique({ where: { id }, select: { isApplicationPending: true } });
  return student ? { isPending: student.isApplicationPending, success: true } : { isPending: false, success: false };
};

export const requestOutpass = async (studentId: string, reason: string, fromDate: string, toDate: string) => {
  try {
    const res = await prisma.outpass.create({
      data: {
        id: uuidv4(),
        StudentId: studentId,
        Reason: reason,
        FromDay: new Date(fromDate),
        ToDay: new Date(toDate),
      }
    });
    return { ...res, success: true, msg: "Outpass requested successfully!" };
  } catch (e) {
    return { success: false, msg: "Error requesting outpass" };
  }
};

export const requestOuting = async (studentId: string, reason: string, fromTime: string, toTime: string) => {
  try {
    const res = await prisma.outing.create({
      data: {
        id: uuidv4(),
        StudentId: studentId,
        reason: reason,
        FromTime: new Date(fromTime),
        ToTime: new Date(toTime),
      }
    });
    return { ...res, success: true, msg: "Outing requested successfully!" };
  } catch (e) {
    return { success: false, msg: "Error requesting outing" };
  }
};
