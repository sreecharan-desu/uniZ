
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
  ScanLine,
  LayoutGrid
} from "lucide-react";
import { clearSession } from "../../utils/security";
import { motion } from "framer-motion";

const QuickActionButton = ({
  onClick,
  title,
  subtitle,
  Icon,
}: {
  onClick: () => void;
  title: string;
  subtitle: string;
  Icon: any;
}) => (
  <button
    onClick={onClick}
    className="group relative flex flex-col items-start p-6 bg-white border border-neutral-100 rounded-2xl hover:border-black/10 hover:shadow-lg transition-all duration-300 text-left w-full overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
        <Icon className="w-24 h-24" />
    </div>
    <div className="p-3 rounded-xl bg-neutral-50 text-neutral-900 mb-4 group-hover:bg-black group-hover:text-white transition-colors duration-300">
      <Icon className="w-6 h-6" />
    </div>
    <div className="relative z-10">
      <h3 className="font-bold text-neutral-900 text-lg leading-tight mb-1 group-hover:translate-x-1 transition-transform">
          {title}
      </h3>
      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide group-hover:text-neutral-400 transition-colors">{subtitle}</p>
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

  // Define actions using a cleaner data structure
  const priorityActions = [];
  if (isCaretaker) {
      priorityActions.push({ onClick: () => navigate("/admin/approveouting"), title: "Approve Outings", subtitle: "Process Requests", Icon: CheckCircle2 });
      priorityActions.push({ onClick: () => navigate("/admin/approveoutpass"), title: "Approve Outpasses", subtitle: "Process Requests", Icon: CheckCircle2 });
  }

  if (role === 'security') {
      priorityActions.push({ onClick: () => navigate("/admin/security"), title: "Security Scanner", subtitle: "Gate Keeping", Icon: ScanLine });
  }

  const sections = [
      {
          title: "Academic Management",
          show: isDean,
          items: [
              { onClick: () => navigate("/admin/addgrades"), title: "Academic Records", subtitle: "Upload Grades", Icon: ClipboardList },
              { onClick: () => navigate("/admin/addattendance"), title: "Attendance", subtitle: "Daily Logs", Icon: CalendarCheck },
              { onClick: () => navigate("/admin/curriculum"), title: "Curriculum", subtitle: "Courses & Syllabus", Icon: BookOpen },
          ]
      },
      {
          title: "People & Roles",
          show: true,
          items: [
              ...(isDean ? [
                  { onClick: () => navigate("/admin/addfaculty"), title: "Faculty", subtitle: "Manage Staff", Icon: UserPlus },
                  { onClick: () => navigate("/admin/addstudents"), title: "Students", subtitle: "Import CSV", Icon: UserPlus }
              ] : []),
              ...(isDirector ? [
                  { onClick: () => navigate("/admin/roles"), title: "Roles", subtitle: "Permissions", Icon: UserCog }
              ] : []),
              ...(isSecurity ? [
                  { onClick: () => navigate("/admin/searchstudents"), title: "Search", subtitle: "Find Students", Icon: Search }
               ] : [])
          ]
      },
      {
          title: "Communication & Site",
          show: isDSW,
          items: [
              { onClick: () => navigate("/admin/notifications"), title: "Notifications", subtitle: "Broadcasts", Icon: Megaphone },
              ...(isDean ? [{ onClick: () => navigate("/admin/banners"), title: "Banners", subtitle: "Site Visuals", Icon: ImageIcon }] : [])
          ]
      },
      {
           title: "Operations",
           show: isCaretaker,
           items: [
               { onClick: () => navigate("/admin/updatestudentstatus"), title: "Status Update", subtitle: "Force Check-in/out", Icon: RefreshCcw }
           ]
      }
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                      {username[0].toUpperCase()}
                  </div>
                  <div>
                      <h1 className="text-xl font-bold leading-none">{username}</h1>
                      <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{role.replace('_', ' ')} Dashboard</p>
                      </div>
                  </div>
              </div>
              
              <div className="flex items-center gap-3">
                  <button onClick={() => navigate("/admin/settings")} className="p-2.5 rounded-xl hover:bg-neutral-50 text-neutral-400 hover:text-black transition-colors">
                      <Settings className="w-5 h-5"/>
                  </button>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-600 font-bold text-xs uppercase tracking-wider transition-all">
                      <LogOut className="w-4 h-4" /> Logout
                  </button>
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        
        {/* Priority Section */}
        {priorityActions.length > 0 && (
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}}>
                 <div className="flex items-center gap-2 mb-6 ml-1">
                    <Zap className="w-5 h-5 text-black fill-black" />
                    <h2 className="text-lg font-black tracking-tight uppercase">Priority Actions</h2>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {priorityActions.map((action, idx) => <QuickActionButton key={idx} {...action} />)}
                 </div>
            </motion.div>
        )}

        {/* Dynamic Sections */}
        {sections.map((section, idx) => (
            section.show && section.items.length > 0 && (
                <motion.div key={section.title} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.1 * (idx + 2)}}>
                    <div className="flex items-center gap-2 mb-6 ml-1 border-b border-neutral-100 pb-2">
                        <LayoutGrid className="w-4 h-4 text-neutral-400" />
                        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">{section.title}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {section.items.map((item, i) => <QuickActionButton key={i} {...item} />)}
                    </div>
                </motion.div>
            )
        ))}
      </div>
    </div>
  );
}
