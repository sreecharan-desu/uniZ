
import { useRecoilState, useRecoilValue } from "recoil";
import { is_authenticated, student } from "../store";
import { useNavigate } from "react-router-dom";
import { useIsAuth } from "../hooks/is_authenticated";
import { useState, useEffect, lazy, Suspense } from "react";
import { enableOutingsAndOutpasses } from "../pages/student/student";
import { LayoutDashboard, Clock, CalendarDays, GraduationCap, CalendarCheck, Home, Laptop, KeyRound, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Error } from "../App";
import { ConfirmModal } from "./ConfirmPopup";
import { cn } from "../utils/cn";

const CampusHub = lazy(() => import("../pages/promotions/CampusHub"));
const Attendance = lazy(() => import("../pages/attendance/Attendance"));
const StudySpace = lazy(() => import("../pages/promotions/StudySpace"));
const OutpassOuting = lazy(() => import("../pages/student/outpass&outing"));
const ResetPassword = lazy(() => import("../pages/student/resetpass"));
const RequestComp = lazy(() => import("../pages/student/request-component"));
const Student = lazy(() => import("../pages/student/student"));
const GradeHub = lazy(() => import("../pages/promotions/GradeHub"));

// Re-export enableOutingsAndOutpasses
export { enableOutingsAndOutpasses } from "../pages/student/student";

interface MainContent {
  content:
    | "outpass"
    | "outing"
    | "gradehub"
    | "resetpassword"
    | "dashboard"
    | "requestOuting"
    | "requestOutpass"
    | "campushub"
    | "studyspace"
    | "attendance"
    | "error";
}

const ContentSkeleton = () => (
  <div className="space-y-6 animate-pulse p-2">
    <div className="h-40 bg-slate-100 rounded-xl" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       <div className="h-32 bg-slate-100 rounded-xl" />
       <div className="h-32 bg-slate-100 rounded-xl" />
       <div className="h-32 bg-slate-100 rounded-xl" />
    </div>
  </div>
);

export default function Sidebar({ content }: MainContent) {
  useIsAuth();
  const userData = useRecoilValue(student);
  const navigate = useNavigate();
  const [_isAuth, setAuth] = useRecoilState(is_authenticated);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Handle sidebar collapse based on breakpoint
  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth <= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("student_token");
    localStorage.removeItem("username");
    localStorage.removeItem("admin_token");
    setAuth({
      is_authnticated: false,
      type: "",
    });
    navigate("/");
  };

  const navItems = [
      { name: "Dashboard", path: "/student", content: "dashboard", icon: <LayoutDashboard size={20} /> },
      ...(enableOutingsAndOutpasses ? [
          { name: "Outing", path: "/student/outing", content: "outing", icon: <Clock size={20} /> },
          { name: "Outpass", path: "/student/outpass", content: "outpass", icon: <CalendarDays size={20} /> },
      ] : []),
      { name: "GradeHub", path: "/student/gradehub", content: "gradehub", icon: <GraduationCap size={20} /> },
      { name: "Attendance", path: "/student/attendance", content: "attendance", icon: <CalendarCheck size={20} /> },
      { name: "Campus Hub", path: "/campushub", content: "campushub", icon: <Home size={20} /> },
      { name: "Study Space", path: "/studyspace", content: "studyspace", icon: <Laptop size={20} /> },
      { name: "Reset Password", path: "/student/resetpassword", content: "resetpassword", icon: <KeyRound size={20} /> },
  ];

  const contentMap: Record<MainContent["content"], JSX.Element> = {
    outing: <OutpassOuting request="outing" />,
    outpass: <OutpassOuting request="outpass" />,
    resetpassword: <ResetPassword />,
    requestOuting: <RequestComp type="outing" />,
    requestOutpass: <RequestComp type="outpass" />,
    dashboard: <Student />,
    gradehub: <GradeHub />,
    campushub: <CampusHub />,
    studyspace: <StudySpace />,
    attendance: <Attendance />,
    error: <Error />,
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Sidebar */}
      <aside 
        className={cn(
            "fixed inset-y-0 left-0 bg-slate-900 text-slate-300 z-40 transition-all duration-300 ease-in-out border-r border-slate-800 flex flex-col",
            isCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Toggle Button */}
        <button 
           onClick={() => setIsCollapsed(!isCollapsed)}
           className="hidden md:flex absolute -right-3 top-6 w-6 h-6 bg-slate-900 border border-slate-700 text-slate-400 rounded-full items-center justify-center hover:text-white transition-colors"
        >
            {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>

        {/* User Profile Summary */}
        <div className={cn("p-4 border-b border-slate-800 flex items-center gap-3 transition-all", isCollapsed ? "justify-center" : "")}>
           <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-semibold shadow-sm ring-1 ring-slate-700 overflow-hidden">
             {userData?.profile_url ? (
               <img src={userData.profile_url} alt={userData.name} className="w-full h-full object-cover" />
             ) : (
               userData?.name?.[0] || 'U'
             )}
           </div>
           {!isCollapsed && (
             <div className="min-w-0 flex-1">
               <p className="font-medium text-white truncate text-sm">{userData?.name || 'Student'}</p>
               <p className="text-xs text-slate-500 truncate">{userData?.username}</p>
             </div>
           )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
            {navItems.map((item) => {
                const isActive = content === item.content;
                return (
                    <div
                        key={item.name}
                        onClick={() => navigate(item.path)}
                        className={cn(
                            "group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 select-none",
                            isActive 
                                ? "bg-slate-800 text-white shadow-sm" 
                                : "hover:bg-slate-800/50 hover:text-slate-200 text-slate-400",
                             isCollapsed ? "justify-center" : ""
                        )}
                        title={isCollapsed ? item.name : undefined}
                    >
                        <span className={cn("transition-colors", isActive ? "text-white" : "group-hover:text-white text-slate-500")}>
                            {item.icon}
                        </span>
                        {!isCollapsed && (
                            <span className="text-sm font-medium">{item.name}</span>
                        )}
                    </div>
                );
            })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800">
             <button
                onClick={() => setShowConfirm(true)}
                className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors text-slate-400 hover:bg-white hover:text-black",
                    isCollapsed ? "justify-center" : ""
                )}
                title={isCollapsed ? "Logout" : undefined}
             >
                <LogOut size={20} />
                {!isCollapsed && <span className="text-sm font-medium">Log Out</span>}
             </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 min-h-screen transition-all duration-300 ease-in-out px-4 py-8 md:px-8",
        isCollapsed ? "ml-[72px]" : "ml-0 md:ml-64"
      )}>
         <Suspense fallback={<ContentSkeleton />}>
            {contentMap[content] || <Error />}
         </Suspense>
      </main>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleLogout}
        message="Are you sure you want to end your session?"
      />
    </div>
  );
}