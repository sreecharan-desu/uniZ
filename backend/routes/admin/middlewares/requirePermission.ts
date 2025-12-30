import { Request, Response, NextFunction } from "express";
import { Permission, ROLE_PERMISSIONS, Role } from "../constants/roles";

export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const admin = (req as any).admin;
    if (!admin) return res.status(401).json({ msg: "Authentication required", success: false });

    const role = admin.role as Role;
    const permissions = ROLE_PERMISSIONS[role] || [];

    if (!permissions.includes(permission)) {
      return res.status(403).json({ msg: "Permission denied", success: false });
    }
    next();
  };
};

export const requireAnyRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const admin = (req as any).admin;
    if (!admin) return res.status(401).json({ msg: "Authentication required", success: false });

    if (!roles.includes(admin.role)) {
      return res.status(403).json({ msg: "Access denied", success: false });
    }
    next();
  };
};
