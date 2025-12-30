"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAnyRole = exports.requirePermission = void 0;
const roles_1 = require("../constants/roles");
const requirePermission = (permission) => {
    return (req, res, next) => {
        const admin = req.admin;
        if (!admin)
            return res.status(401).json({ msg: "Authentication required", success: false });
        const role = admin.role;
        const permissions = roles_1.ROLE_PERMISSIONS[role] || [];
        if (!permissions.includes(permission)) {
            return res.status(403).json({ msg: "Permission denied", success: false });
        }
        next();
    };
};
exports.requirePermission = requirePermission;
const requireAnyRole = (...roles) => {
    return (req, res, next) => {
        const admin = req.admin;
        if (!admin)
            return res.status(401).json({ msg: "Authentication required", success: false });
        if (!roles.includes(admin.role)) {
            return res.status(403).json({ msg: "Access denied", success: false });
        }
        next();
    };
};
exports.requireAnyRole = requireAnyRole;
