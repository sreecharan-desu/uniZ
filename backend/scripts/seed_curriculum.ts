import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Curriculum...');
  
  const subjectsPath = path.join(__dirname, '../utils/subject.json');
  const subjectsData = JSON.parse(fs.readFileSync(subjectsPath, 'utf8'));

  const branches = ["CSE", "ECE", "EEE", "CIVIL", "MECH"];
  await Promise.all(branches.map(name => prisma.branch.upsert({ where: { name }, update: { name }, create: { name } })));
  console.log('Branches synced.');

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
        
        let count = 0;
        for (let i = 0; i < names.length; i++) {
           const subjectName = names[i];
           const credit = credits[i];
           
           if (!subjectName || !subjectName.trim()) continue;

           await prisma.subject.upsert({
              where: { name_branchId_semesterId: { name: subjectName, branchId: branch.id, semesterId: semester.id } },
              update: { credits: credit },
              create: { id: uuidv4(), name: subjectName, credits: credit, branchId: branch.id, semesterId: semester.id },
           });
           count++;
        }
        console.log(`Synced ${count} subjects for ${branchName} - ${year} - ${semesterName}`);
      }
    }
  }

  console.log('Curriculum seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
