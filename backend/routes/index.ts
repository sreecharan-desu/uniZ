import express from "express";
import { client, studentRouter } from "./student/student";
import { adminRouter } from "./admin/admin";

export const mainRoute = express.Router();
mainRoute.use("/student",studentRouter);
mainRoute.use("/admin",adminRouter);

mainRoute.get('/banners', async (req, res) => {
  try {
    const onlyPublished = req.query.published === 'true';
    const banners = await client.banner.findMany({
      where: onlyPublished ? { isPublished: true } : {},
      orderBy: { createdAt: 'desc' },
    });
    res.json({ banners, success: true });
  } catch (err:any) {
    console.error('Get banners error', err);
    res.status(500).json({ msg: 'Error fetching banners', success: false });
  }
});