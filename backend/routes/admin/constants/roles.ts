export type Role = "webmaster" | "dean" | "director";
export type Permission = 
  | "manage_admins" 
  | "assign_roles" 
  | "manage_banners" 
  | "send_notifications" 
  | "manage_students" 
  | "manage_curriculum" 
  | "manage_grades" 
  | "manage_attendance";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  director: [
    "manage_admins", "assign_roles", "manage_banners", "send_notifications",
    "manage_students", "manage_curriculum", "manage_grades", "manage_attendance"
  ],
  dean: ["manage_banners", "send_notifications", "manage_students", "manage_grades", "manage_attendance"],
  webmaster: ["manage_admins", "assign_roles", "manage_banners", "manage_curriculum"],
};
