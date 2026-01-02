import express from "express";
import { studentRouter } from "./student";
import { adminRouter } from "./admin";
import prisma from "./services/prisma.service";
import { logger } from "../utils/logger";

export const mainRoute = express.Router();
mainRoute.use("/student", studentRouter);
mainRoute.use("/admin", adminRouter);

mainRoute.get('/banners', async (req, res) => {
  try {
    const onlyPublished = req.query.published === 'true';
    const cacheKey = `banners:${onlyPublished}`;


    const banners = await prisma.banner.findMany({
      where: onlyPublished ? { isPublished: true } : {},
      orderBy: { createdAt: 'desc' },
    });

  
    res.json({ banners, success: true });
  } catch (err:any) {
    logger.error(`Get banners error: ${err.message || err}`);
    res.status(500).json({ msg: 'Error fetching banners', success: false });
  }
});