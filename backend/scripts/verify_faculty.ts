import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Verifying Faculty Model...');
  
  const username = "TEST_FAC_" + Math.floor(Math.random() * 1000);
  const password = await bcrypt.hash("password", 10);

  try {
      const faculty = await prisma.faculty.create({
        data: {
          id: uuidv4(),
          Username: username,
          Password: password,
          Name: "Test Faculty",
          Email: `${username}@test.com`,
          Department: "CSE",
          Designation: "Assistant Professor",
          Role: "teacher"
        }
      });
      console.log(`Faculty Created: ${faculty.Username} (${faculty.id})`);
      
      const found = await prisma.faculty.findUnique({ where: { id: faculty.id } });
      if (found) {
          console.log("Faculty Found in DB. Model is working.");
      } else {
          console.log("Faculty NOT found.");
      }

  } catch (e) {
      console.error(e);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
