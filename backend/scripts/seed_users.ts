import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function createAdmin(username: string, passwordRaw: string, role: string, email: string) {
  const password = await bcrypt.hash(passwordRaw, 10);
  return await prisma.admin.upsert({
    where: { Username: username },
    update: { Password: password, role: role },
    create: {
      id: uuidv4(),
      Username: username,
      Password: password,
      Email: email,
      role: role
    }
  });
}

async function main() {
  console.log('Seeding Administrative accounts...');
  
  await createAdmin('director', 'director123', 'director', 'director@uniz.com');
  await createAdmin('dean', 'dean123', 'dean', 'dean@uniz.com');
  await createAdmin('dsw', 'dsw123', 'dsw', 'dsw@uniz.com');
  await createAdmin('warden', 'warden123', 'warden', 'warden@uniz.com');
  await createAdmin('caretaker', 'caretaker123', 'caretaker', 'caretaker@uniz.com');
  await createAdmin('security', 'security123', 'security', 'security@uniz.com');
  await createAdmin('admin@uniz', '12345678', 'webmaster', 'admin@uniz.com');

  console.log('Administrative accounts seeded.');

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
        Name: 'SREECHARAN DESU'
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
