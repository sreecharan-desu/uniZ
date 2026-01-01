import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../../services/prisma.service";
import redis from "../../services/redis.service";
import { requirePermission } from "../middlewares/requirePermission";
import { authMiddleware } from "../../student/middlewares/middlewares";

export const bannerRouter = Router();

const invalidateBannerCache = async () => {
  await redis.del("banners:true");
  await redis.del("banners:false");
};

bannerRouter.post("/", authMiddleware, requirePermission("manage_banners"), async (req, res) => {
  try {
    const { title, text, imageUrl, isPublished = false } = req.body;
    if (!title) return res.status(400).json({ msg: "Title is required", success: false });
    const createdBy = (req as any).admin?.username || null;
    const banner = await prisma.banner.create({
      data: { id: uuidv4(), title, text: text ?? "", imageUrl: imageUrl ?? null, isPublished, createdBy },
    });
    await invalidateBannerCache();
    res.json({ banner, success: true, msg: "Banner created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error creating banner", success: false });
  }
});

bannerRouter.get("/", authMiddleware, requirePermission("manage_banners"), async (req, res) => {
  try {
    const onlyPublished = req.query.published === "true";
    const banners = await prisma.banner.findMany({
      where: onlyPublished ? { isPublished: true } : {},
      orderBy: { createdAt: "desc" },
    });
    res.json({ banners, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching banners", success: false });
  }
});

bannerRouter.put("/:id", authMiddleware, requirePermission("manage_banners"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, text, imageUrl } = req.body;
    const banner = await prisma.banner.update({
      where: { id },
      data: { title, text, imageUrl, updatedAt: new Date() },
    });
    await invalidateBannerCache();
    res.json({ banner, success: true, msg: "Banner updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error updating banner", success: false });
  }
});

bannerRouter.delete("/:id", authMiddleware, requirePermission("manage_banners"), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { id } });
    await invalidateBannerCache();
    res.json({ msg: "Banner deleted", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error deleting banner", success: false });
  }
});

bannerRouter.post("/:id/publish", authMiddleware, requirePermission("manage_banners"), async (req, res) => {
  try {
    const { id } = req.params;
    const { publish } = req.body;
    const banner = await prisma.banner.update({ where: { id }, data: { isPublished: !!publish } });
    await invalidateBannerCache();
    res.json({ banner, success: true, msg: publish ? "Banner published" : "Banner unpublished" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error changing status", success: false });
  }
});
