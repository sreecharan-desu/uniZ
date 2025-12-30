import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../../services/prisma.service";
import { authMiddleware } from "../../student/middlewares/middlewares";

export const curriculumRouter = Router();

curriculumRouter.get("/get-curriculum", authMiddleware, async (req, res) => {
  try {
    const [branches, semesters, subjects] = await Promise.all([
      prisma.branch.findMany({ select: { id: true, name: true } }),
      prisma.semester.findMany({ select: { id: true, name: true, year: true } }),
      prisma.subject.findMany({ select: { id: true, name: true, credits: true, branchId: true, semesterId: true } }),
    ]);

    const subjectsData: any = {};
    for (const sem of semesters) {
      if (!subjectsData[sem.year]) subjectsData[sem.year] = {};
      if (!subjectsData[sem.year][sem.name]) subjectsData[sem.year][sem.name] = {};

      for (const branch of branches) {
        const branchSubs = subjects.filter(s => s.branchId === branch.id && s.semesterId === sem.id);
        subjectsData[sem.year][sem.name][branch.name] = {
          names: branchSubs.map(s => s.name),
          credits: branchSubs.map(s => s.credits),
        };
      }
    }
    res.json({ msg: "Curriculum fetched successfully", success: true, subjectsData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error", success: false });
  }
});

curriculumRouter.post("/populate-curriculum", async (req, res) => {
  try {
    const { subjectsData } = req.body;
    if (!subjectsData) return res.status(400).json({ msg: "subjectsData is required", success: false });

    const branches = ["CSE", "ECE", "EEE", "CIVIL", "MECH"];
    await Promise.all(branches.map(name => prisma.branch.upsert({ where: { name }, update: { name }, create: { name } })));

    for (const year of Object.keys(subjectsData)) {
      for (const semesterName of Object.keys(subjectsData[year])) {
        const semester = await prisma.semester.upsert({
          where: { name_year: { name: semesterName, year } },
          update: { name: semesterName, year },
          create: { name: semesterName, year },
        });

        const branchesData = subjectsData[year][semesterName];
        for (const branchName of Object.keys(branchesData)) {
          const branch = await prisma.branch.findUnique({ where: { name: branchName } });
          if (!branch) continue;

          const { names, credits } = branchesData[branchName];
          await Promise.all(names.map((subjectName: string, i: number) => {
            if (!subjectName || credits[i] === 0) return null;
            return prisma.subject.upsert({
              where: { name_branchId_semesterId: { name: subjectName, branchId: branch.id, semesterId: semester.id } },
              update: { credits: credits[i] },
              create: { id: uuidv4(), name: subjectName, credits: credits[i], branchId: branch.id, semesterId: semester.id },
            });
          }));
        }
      }
    }
    res.json({ msg: "Curriculum data populated successfully", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error", success: false });
  }
});
