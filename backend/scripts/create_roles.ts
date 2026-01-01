
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const users = [
  { username: 'caretaker@uniz', password: '12345678', role: 'caretaker' },
  { username: 'warden@uniz', password: '12345678', role: 'warden' },
    { username: 'dsw@yuniz', password: '12345678', role: 'dsw' },
    { username: 'admin@uniz', password: '12345678', role: 'admin' },
    { username: 'student@uniz', password: '12345678', role: 'student' },
    { username: 'director@uniz', password: '12345678', role: 'director' },
    { username: 'dean@uniz', password: '12345678', role: 'dean' },
    { username: 'hod@uniz', password: '12345678', role: 'hod' },
    { username: 'faculty@uniz', password: '12345678', role: 'faculty' },
];

async function main() {
  console.log('Start seeding admins...');

  for (const u of users) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(u.password, salt);

    await prisma.admin.upsert({
      where: { Username: u.username },
      update: {
        Password: hashedPassword,
        role: u.role,
        Email: u.username,
      },
      create: {
        id: uuidv4(),
        Username: u.username,
        Password: hashedPassword,
        role: u.role,
        Email: u.username,
      },
    });
    console.log(`Created/Updated user: ${u.username} with role ${u.role}`);
  }
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
