
import { useNavigate } from "react-router";
import { useAdminname } from "../../hooks/adminname";
import { useIsAuth } from "../../hooks/is_authenticated";
import {
  Settings,
  UserPlus,
  ClipboardList,
  CalendarCheck,
  UserCog,
  Image as ImageIcon,
  Megaphone,
  CheckCircle2,
  BookOpen,
  LogOut,
  Zap,
  RefreshCcw,
  Search,
  ScanLine
} from "lucide-react";
import { clearSession } from "../../utils/security";

const QuickActionButton = ({
  onClick,
  title,
  subtitle,
  Icon,
  colorClass = "text-blue-600 bg-blue-50"
}: {
  onClick: () => void;
  title: string;
  subtitle: string;
  Icon: any;
  colorClass?: string;
}) => (
  <button
    onClick={onClick}
    className="group relative flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-md transition-all duration-200 text-left w-full"
  >
    <div className={`p-3 rounded-lg ${colorClass} shrink-0`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h3 className="font-semibold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
          {title}
      </h3>
      <p className="text-sm text-slate-500 mt-1 leading-snug">{subtitle}</p>
    </div>
  </button>
);

export default function Admin() {
  useIsAuth();
  useAdminname();
  const navigate = useNavigate();
  const username = JSON.parse(localStorage.getItem("username") || `"Admin"`);
  const role = localStorage.getItem("admin_role") || "admin";

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  const isDirector = role === 'director' || role === 'webmaster';
  const isDean = role === 'dean' || isDirector;
  const isDSW = role === 'dsw' || isDean;
  const isWarden = role === 'warden' || isDSW;
  const isCaretaker = role === 'caretaker' || isWarden;
  const isSecurity = role === 'security' || isDirector;

  // Define actions for each role
  const priorityActions = [];
  if (isCaretaker) {
      priorityActions.push({
          onClick: () => navigate("/admin/approveouting"),
          title: "Approve Outings",
          subtitle: "Process student outing requests",
          Icon: CheckCircle2,
          colorClass: "bg-emerald-50 text-emerald-600"
      });
      priorityActions.push({
          onClick: () => navigate("/admin/approveoutpass"),
          title: "Approve Outpasses",
          subtitle: "Process student outpass requests",
          Icon: CheckCircle2,
          colorClass: "bg-emerald-50 text-emerald-600"
      });
  }

  if (role === 'security') {
      priorityActions.push({
        onClick: () => navigate("/admin/security"),
        title: "Security Scanner",
        subtitle: "Check-in/out students via ID/QR",
        Icon: ScanLine,
        colorClass: "bg-amber-50 text-amber-600"
      });
  }

  const adminActions = [];
  if (isSecurity) {
      adminActions.push({
          onClick: () => navigate("/admin/searchstudents"),
          title: "Search Students",
          subtitle: "Find & Manage Students",
          Icon: Search,
          colorClass: "bg-blue-50 text-blue-600"
      });
  }

  if (isCaretaker) {
      adminActions.push({
          onClick: () => navigate("/admin/updatestudentstatus"),
          title: "Update Status",
          subtitle: "Mark In/Out of Campus",
          Icon: RefreshCcw,
          colorClass: "bg-indigo-50 text-indigo-600"
      });
  }

  if (isDean) {
      adminActions.push({
          onClick: () => navigate("/admin/addstudents"),
          title: "Import Students",
          subtitle: "Bulk add via CSV",
          Icon: UserPlus,
          colorClass: "bg-blue-50 text-blue-600"
      });
      adminActions.push({
          onClick: () => navigate("/admin/addgrades"),
          title: "Academic Records",
          subtitle: "Upload Grades",
          Icon: ClipboardList,
          colorClass: "bg-violet-50 text-violet-600"
      });
      adminActions.push({
          onClick: () => navigate("/admin/addattendance"),
          title: "Attendance",
          subtitle: "Update daily logs",
          Icon: CalendarCheck,
          colorClass: "bg-violet-50 text-violet-600"
      });
      adminActions.push({
        onClick: () => navigate("/admin/curriculum"),
        title: "Curriculum",
        subtitle: "Courses & Syllabus",
        Icon: BookOpen,
        colorClass: "bg-cyan-50 text-cyan-600"
      });
      adminActions.push({
        onClick: () => navigate("/admin/addfaculty"),
        title: "Faculty Management",
        subtitle: "Add/Manage Teachers",
        Icon: UserPlus,
        colorClass: "bg-teal-50 text-teal-600"
      });
  }

  if (isDSW) {
      adminActions.push({
          onClick: () => navigate("/admin/notifications"),
          title: "Notifications",
          subtitle: "Broadcast alerts",
          Icon: Megaphone,
          colorClass: "bg-pink-50 text-pink-600"
      });
  }

  if (isDean) {
      adminActions.push({
          onClick: () => navigate("/admin/banners"),
          title: "Banners",
          subtitle: "Manage site banners",
          Icon: ImageIcon,
          colorClass: "bg-rose-50 text-rose-600"
      });
  }

  if (isDirector) {
      adminActions.push({
          onClick: () => navigate("/admin/roles"),
          title: "Role Management",
          subtitle: "Admin permissions",
          Icon: UserCog,
          colorClass: "bg-orange-50 text-orange-600"
      });
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
             <h1 className="text-2xl font-bold text-slate-900">
                Welcome, {username}
             </h1>
             <p className="text-slate-500 mt-1">
                Admin Dashboard Overview
             </p>
          </div>
          <div className="flex gap-3">
             <button
                onClick={() => navigate("/admin/settings")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
             >
                <Settings className="w-4 h-4" /> Settings
             </button>
             <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-medium transition-colors"
             >
                <LogOut className="w-4 h-4" /> Logout
             </button>
          </div>
        </div>

        {/* Priority Actions */}
        {priorityActions.length > 0 && (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <Zap className="w-5 h-5 text-amber-500 fill-amber-500" /> 
                    Priority Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {priorityActions.map((action, idx) => (
                        <QuickActionButton key={idx} {...action} />
                    ))}
                </div>
            </div>
        )}

         {/* Administration Grid */}
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-lg font-bold text-slate-900">Administration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {adminActions.map((action, idx) => (
                    <QuickActionButton key={idx} {...action} />
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}
