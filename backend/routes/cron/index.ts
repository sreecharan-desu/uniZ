
import express, { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";
import redis from '../services/redis.service';

const router = express.Router();
const prisma = new PrismaClient();

// This endpoint will be hit by Vercel Cron
router.get('/expire-requests', async (req: Request, res: Response) => {
    // Basic security: Check for a secret key if set, or just allow it for now since Vercel protects it purely by path config usually, 
    // but best practice is to check a header.
    // For Vercel Cron, it sends a header `Authorization: Bearer <CRON_SECRET>` if you configure it, 
    // or you can just protect it with a simple env var check.
    
    // Check for Authorization header matching CRON_SECRET env var
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
         return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    console.log('Running expireRequestsJob: Checking for expired pending requests...');
    const now = new Date(); 

    try {
        // 1. Expire Pending Outings
        const expiredOutings = await prisma.outing.findMany({
            where: {
                isApproved: false,
                isRejected: false,
                ToTime: {
                    lt: now 
                }
            }
        });

        if (expiredOutings.length > 0) {
            console.log(`Found ${expiredOutings.length} expired pending outings.`);
            for (const outing of expiredOutings) {
                // Update Outing
                await prisma.outing.update({
                    where: { id: outing.id },
                    data: {
                        isRejected: true,
                        isExpired: true,
                        rejectedBy: 'system (auto-expired)',
                        Message: 'Request expired automatically due to date/time passing.'
                    }
                });

                // Update Student
                const updatedStudent = await prisma.student.update({
                    where: { id: outing.StudentId },
                    data: { isApplicationPending: false },
                    select: { Username: true }
                });

                if (updatedStudent.Username) {
                     await redis.del(`student:profile:${updatedStudent.Username.toLowerCase()}`).catch(err => console.error(`Redis del error: ${err}`));
                }

                console.log(`Auto-expired Outing ID: ${outing.id} and updated student status.`);
            }
        } else {
            console.log("No expired pending outings found.");
        }

        // 2. Expire Pending Outpasses
        const expiredOutpasses = await prisma.outpass.findMany({
            where: {
                isApproved: false,
                isRejected: false,
                ToDay: {
                    lt: now 
                }
            }
        });

        if (expiredOutpasses.length > 0) {
            console.log(`Found ${expiredOutpasses.length} expired pending outpasses.`);
            for (const outpass of expiredOutpasses) {
                // Update Outpass
                await prisma.outpass.update({
                    where: { id: outpass.id },
                    data: {
                        isRejected: true,
                        isExpired: true,
                        rejectedBy: 'system (auto-expired)',
                        Message: 'Request expired automatically due to date passing.'
                    }
                });

                // Update Student
                const updatedStudent = await prisma.student.update({
                    where: { id: outpass.StudentId },
                    data: { isApplicationPending: false },
                    select: { Username: true }
                });
                
                if (updatedStudent.Username) {
                     await redis.del(`student:profile:${updatedStudent.Username.toLowerCase()}`).catch(err => console.error(`Redis del error: ${err}`));
                }

                 console.log(`Auto-expired Outpass ID: ${outpass.id} and updated student status.`);
            }
        } else {
             console.log("No expired pending outpasses found.");
        }

        return res.status(200).json({ success: true, message: 'Cron job executed successfully' });

    } catch (error) {
        console.error("Error in expireRequestsJob:", error);
        return res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
});

export default router;
