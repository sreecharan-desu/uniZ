export type Role = "webmaster" | "dean" | "director" | "caretaker" | "warden" | "dsw" | "security";
export type Permission = 
  | "manage_admins" 
  | "assign_roles" 
  | "manage_banners" 
  | "send_notifications" 
  | "manage_students" 
  | "manage_curriculum" 
  | "manage_grades" 
  | "manage_attendance"
  | "manage_outpass"
  | "manage_outing";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  director: [
    "manage_admins", "assign_roles", "manage_banners", "send_notifications",
    "manage_students", "manage_curriculum", "manage_grades", "manage_attendance",
    "manage_outpass", "manage_outing"
  ],
  dean: [
    "manage_banners", "send_notifications", "manage_students", 
    "manage_grades", "manage_attendance", "manage_outpass", "manage_outing"
  ],
  dsw: ["send_notifications", "manage_students", "manage_outpass", "manage_outing"],
  warden: ["manage_outpass", "manage_outing"],
  caretaker: ["manage_outpass", "manage_outing"],
  security: ["manage_students"],
  webmaster: [
    "manage_admins", "assign_roles", "manage_banners", "manage_curriculum",
    "manage_outpass", "manage_outing"
  ],
};
