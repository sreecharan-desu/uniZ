import express from "express";
import { studentRouter } from "./student";
import { adminRouter } from "./admin";
import prisma from "./services/prisma.service";
import redis from "./services/redis.service";

export const mainRoute = express.Router();
mainRoute.use("/student", studentRouter);
mainRoute.use("/admin", adminRouter);

mainRoute.get('/banners', async (req, res) => {
  try {
    const onlyPublished = req.query.published === 'true';
    const cacheKey = `banners:${onlyPublished}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json({ banners: JSON.parse(cached), success: true });
      }
    } catch (e) {
      console.warn('Redis cache read failed, falling back to db');
    }

    const banners = await prisma.banner.findMany({
      where: onlyPublished ? { isPublished: true } : {},
      orderBy: { createdAt: 'desc' },
    });

    try {
      await redis.set(cacheKey, JSON.stringify(banners), 'EX', 60 * 60); // 1 hour
    } catch (e) {
      console.warn('Redis cache write failed');
    }

    res.json({ banners, success: true });
  } catch (err:any) {
    console.error('Get banners error', err);
    res.status(500).json({ msg: 'Error fetching banners', success: false });
  }
});