import { v4 as uuidv4 } from "uuid";
import prisma from "../../services/prisma.service";

/**
 * subjectCache holds Promise<{id: string} | null> to avoid race conditions across concurrent requests
 * key: `${name}_${semesterId}_${branchId}`
 */
const subjectCache = new Map<string, Promise<{ id: string } | null>>();

export async function getOrCreateSubject(
  subjectName: string,
  semesterId: string,
  branchId: string,
  subjectData: { names: string[]; credits: number[] },
  isElective: boolean
) {
  const key = `${subjectName}_${semesterId}_${branchId}`;
  if (subjectCache.has(key)) return subjectCache.get(key)!;

  const p = (async () => {
    try {
      const creditIndex = subjectData?.names?.indexOf(subjectName) ?? -1;
      const credits = creditIndex !== -1 && subjectData?.credits ? subjectData.credits[creditIndex] : 3;
      
      const subj = await prisma.subject.upsert({
        where: { name_branchId_semesterId: { name: subjectName, branchId, semesterId } },
        update: { name: subjectName, credits, branchId, semesterId },
        create: { id: uuidv4(), name: subjectName, credits, branchId, semesterId },
        select: { id: true },
      });
      return subj;
    } catch (err) {
      try {
        const found = await prisma.subject.findFirst({
          where: { name: subjectName, semesterId, branchId },
          select: { id: true },
        });
        if (found) return found;
        if (!isElective) return null;
        const created = await prisma.subject.create({
          data: { id: uuidv4(), name: subjectName, credits: 3, branchId, semesterId },
          select: { id: true },
        });
        return created;
      } catch (err2) {
        console.error("getOrCreateSubject fallback error:", err2);
        return null;
      }
    }
  })();

  subjectCache.set(key, p);
  p.then((v) => {
    if (!v) subjectCache.delete(key);
  }).catch(() => {
    subjectCache.delete(key);
  });

  return p;
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

export const convertLetterToNumericGrade = (letterGrade: string) => {
  const gradeMap: { [key: string]: number } = { 'EX': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'R': 0 };
  return gradeMap[letterGrade.toUpperCase()] || null;
};

export const validateGradesInput = (data: any) => {
  const errors: any = [];
  if (typeof data !== 'object' || data === null) return [{ message: 'Input must be a non-null object' }];
  if (!data.SemesterName || typeof data.SemesterName !== 'string') errors.push({ message: 'SemesterName must be a non-empty string' });
  
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

export const validateAttendanceInput = (data: any) => {
  const errors: any = [];
  if (typeof data !== 'object' || data === null) return [{ message: 'Input must be a non-null object' }];
  if (!data.SemesterName || typeof data.SemesterName !== 'string') errors.push({ message: 'SemesterName must be a non-empty string' });

  if (!Array.isArray(data.Students)) errors.push({ message: 'Students must be an array' });
  else if (data.Students.length === 0) errors.push({ message: 'Students array is empty' });
  else {
    data.Students.forEach((record: any, index: number) => {
      if (typeof record !== 'object' || record === null) errors.push({ recordIndex: index, message: 'Student record must be a non-null object' });
      if (!record.IdNumber || typeof record.IdNumber !== 'string') errors.push({ recordIndex: index, message: 'IdNumber must be a non-empty string' });
      if (!Array.isArray(record.Attendance)) errors.push({ recordIndex: index, message: 'Attendance must be an array' });
      else record.Attendance.forEach((att: any, attIndex: number) => {
        if (typeof att !== 'object' || att === null) errors.push({ recordIndex: index, attIndex, message: 'Attendance entry must be a non-null object' });
        if (!att.SubjectName || typeof att.SubjectName !== 'string') errors.push({ recordIndex: index, attIndex, message: 'SubjectName must be a non-empty string' });
        if (typeof att.ClassesHappened !== 'number' || att.ClassesHappened < 0) errors.push({ recordIndex: index, attIndex, message: 'ClassesHappened must be a non-negative integer' });
        if (typeof att.ClassesAttended !== 'number' || att.ClassesAttended < 0) errors.push({ recordIndex: index, attIndex, message: 'ClassesAttended must be a non-negative integer' });
      });
    });
  }
  return errors;
};
