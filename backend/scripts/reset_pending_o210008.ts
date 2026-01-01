
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetPendingStatus() {
    const studentId = "o210008"; // Assuming lowercase based on previous context

    console.log(`Resetting pending status for student: ${studentId}...`);

    try {
        // 1. Reset the flag on Student model
        const updateStudent = await prisma.student.update({
            where: { Username: studentId }, // Using Username to be safe, or unique ID
            data: { isApplicationPending: false }
        });

        await prisma.outing.deleteMany();
        console.log(`Updated Student 'has_pending_requests' to false for ${updateStudent.Username}.`);

        // 2. Reject any currently pending Outings for this student (to maintain consistency)
        const updatedOutings = await prisma.outing.updateMany({
            where: {
                StudentId: updateStudent.id,
                isApproved: false,
                isRejected: false
            },
            data: {
                isRejected: true,
                rejectedBy: 'manual_reset',
                Message: 'Manually cleared pending status'
            }
        });
        console.log(`Marked ${updatedOutings.count} pending Outings as rejected.`);

        // 3. Reject any currently pending Outpasses for this student
        const updatedOutpasses = await prisma.outpass.updateMany({
            where: {
                StudentId: updateStudent.id,
                isApproved: false,
                isRejected: false
            },
            data: {
                isRejected: true,
                rejectedBy: 'manual_reset',
                Message: 'Manually cleared pending status'
            }
        });
        console.log(`Marked ${updatedOutpasses.count} pending Outpasses as rejected.`);

    } catch (error) {
        console.error("Error resetting pending status:", error);
    } finally {
        await prisma.$disconnect();
    }
}

resetPendingStatus();
