"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = void 0;
exports.ROLE_PERMISSIONS = {
    director: [
        "manage_admins", "assign_roles", "manage_banners", "send_notifications",
        "manage_students", "manage_curriculum", "manage_grades", "manage_attendance"
    ],
    dean: ["manage_banners", "send_notifications", "manage_students", "manage_grades", "manage_attendance"],
    webmaster: ["manage_admins", "assign_roles", "manage_banners", "manage_curriculum"],
};
