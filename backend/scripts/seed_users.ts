import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // 1. Admin
  const adminUsername = 'admin@uniz';
  const adminPassword = await bcrypt.hash('12345678', 10);
  
  console.log('Seeding Admin...');
  const admin = await prisma.admin.upsert({
    where: { Username: adminUsername },
    update: {
        Password: adminPassword,
        role: 'webmaster'
    },
    create: {
      id: uuidv4(),
      Username: adminUsername,
      Password: adminPassword,
      Email: 'admin@uniz.com', 
      role: 'webmaster'
    }
  });
  console.log('Admin seeded:', admin.Username);

  // 2. Student
  const studentUsername = 'o210008';
  const studentPassword = await bcrypt.hash('o210008@rguktong', 10);
  const profileUrl = "https://res.cloudinary.com/dy2fjgt46/image/upload/v1767357935/vi3m6fy1ltgqxaqfmsvr.jpg";

  console.log('Seeding Student...');
  const student = await prisma.student.upsert({
    where: { Username: studentUsername },
    update: {
        Password: studentPassword,
        ProfileUrl: profileUrl,
        Name: 'SREECHARAN DESU' // Ensure name is set too
    },
    create: {
      id: studentUsername,
      Username: studentUsername,
      Password: studentPassword,
      Email: `${studentUsername}@rguktong.ac.in`,
      Name: 'SREECHARAN DESU',
      Gender: 'Male',
      Year: 'E4',
      Branch: 'CSE', 
      ProfileUrl: profileUrl
    }
  });
   console.log('Student seeded:', student.Username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
