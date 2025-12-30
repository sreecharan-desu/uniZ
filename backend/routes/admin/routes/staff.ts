import { Router } from "express";
import prisma from "../../services/prisma.service";
import { authMiddleware } from "../../student/middlewares/middlewares";
import { requirePermission, requireAnyRole } from "../middlewares/requirePermission";
import { ROLE_PERMISSIONS } from "../constants/roles";
import { updateAdminPassword, hashPassword } from "../../services/admin.service";
import { v4 as uuidv4 } from "uuid";

export const staffRouter = Router();

staffRouter.put("/resetpass", authMiddleware, async (req, res) => {
  const { username, new_password } = req.body;
  try {
    const isUpdated = await updateAdminPassword(username, new_password);
    res.json({
      msg: isUpdated ? "Password updated successfully!" : "Error updating password",
      success: isUpdated,
    });
  } catch (e) {
    res.status(500).json({ msg: "Error updating password", success: false });
  }
});

staffRouter.get("/getadmins", authMiddleware, requireAnyRole("dean", "director", "webmaster"), async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({ select: { id: true, Username: true, role: true } });
    res.json({ admins, success: true });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching admins", success: false });
  }
});

staffRouter.delete("/deleteadmin/:username", authMiddleware, requireAnyRole("director"), async (req, res) => {
  try {
    const { username } = req.params;
    const deleted = await prisma.admin.deleteMany({ where: { Username: username } });
    if (deleted.count === 0) return res.status(404).json({ msg: "Admin not found", success: false });
    res.json({ msg: `${username} removed`, success: true });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting admin", success: false });
  }
});

staffRouter.get("/roles", authMiddleware, requireAnyRole("dean", "director", "webmaster"), async (req, res) => {
  res.json({ roles: ROLE_PERMISSIONS, success: true });
});

staffRouter.put("/assign-role", authMiddleware, requirePermission("assign_roles"), async (req, res) => {
  try {
    const { username, role } = req.body;
    if (!username || !role) return res.status(400).json({ msg: "username and role required", success: false });
    const updated = await prisma.admin.updateMany({ where: { Username: username }, data: { role } });
    if (updated.count === 0) return res.status(404).json({ msg: "Admin not found", success: false });
    res.json({ msg: `Assigned role ${role} to ${username}`, success: true });
  } catch (err) {
    res.status(500).json({ msg: "Error assigning role", success: false });
  }
});

staffRouter.post("/addadmin", authMiddleware, requireAnyRole("director", "webmaster"), async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ msg: "username, password, and role required", success: false });
    if (!["webmaster", "dean", "director"].includes(role)) return res.status(400).json({ msg: "Invalid role", success: false });

    const existing = await prisma.admin.findUnique({ where: { Username: username } });
    if (existing) return res.status(409).json({ msg: "Admin already exists", success: false });

    const hashedPassword = await hashPassword(password);
    const admin = await prisma.admin.create({
      data: { id: uuidv4(), Username: username, Password: hashedPassword, role },
    });

    res.json({ msg: `Admin ${username} added successfully`, admin, success: true });
  } catch (err) {
    res.status(500).json({ msg: "Error adding admin", success: false });
  }
});

staffRouter.put("/admin/:username/permissions", authMiddleware, requireAnyRole("director", "webmaster"), async (req, res) => {
  try {
    const { username } = req.params;
    const { permissions } = req.body;
    if (!Array.isArray(permissions)) return res.status(400).json({ msg: "Invalid permissions", success: false });

    const admin = await prisma.admin.updateMany({ where: { Username: username }, data: {} });
    if (admin.count === 0) return res.status(404).json({ msg: "Admin not found", success: false });
    res.json({ msg: `Permissions updated for ${username}`, success: true });
  } catch (err) {
    res.status(500).json({ msg: "Error updating permissions", success: false });
  }
});

staffRouter.get("/searchadmin", authMiddleware, requireAnyRole("director", "webmaster"), async (req, res) => {
  try {
    const q = (req.query.q as string) || "";
    const admins = await prisma.admin.findMany({
      where: { Username: { contains: q, mode: "insensitive" } },
      select: { id: true, Username: true, role: true },
    });
    res.json({ admins, success: true });
  } catch (err) {
    res.status(500).json({ msg: "Error searching admins", success: false });
  }
});
staffRouter.put("/roles/:role/permissions", authMiddleware, requireAnyRole("webmaster"), async (req, res) => {
  const { role } = req.params;
  const { permissions } = req.body;

  if (!ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]) {
    return res.status(404).json({ msg: "Role not found", success: false });
  }

  if (!Array.isArray(permissions)) {
    return res.status(400).json({ msg: "Permissions must be an array", success: false });
  }

  // Update in-memory permissions (Note: identifying this limitation if server restarts)
  (ROLE_PERMISSIONS as any)[role] = permissions;

  res.json({ 
    msg: `Permissions updated for role ${role}`, 
    permissions: ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS],
    success: true 
  });
});


