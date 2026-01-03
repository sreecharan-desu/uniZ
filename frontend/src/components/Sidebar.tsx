
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
  <div className="flex h-screen items-center justify-center text-neutral-400 font-bold uppercase tracking-widest text-sm animate-pulse">
      Loading...
  </div>
);

export default function Sidebar({ content }: MainContent) {
  useIsAuth();
  const userData = useRecoilValue<any>(student);
  const navigate = useNavigate();
  const [_isAuth, setAuth] = useRecoilState(is_authenticated);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
      { name: "My Profile", path: "/student", content: "dashboard", icon: <LayoutDashboard size={20} /> },
      ...(enableOutingsAndOutpasses ? [
          { name: "Outing Requests", path: "/student/outing", content: "outing", icon: <Clock size={20} /> },
          { name: "Outpass Requests", path: "/student/outpass", content: "outpass", icon: <CalendarDays size={20} /> },
      ] : []),
      { name: "Grade Hub", path: "/student/gradehub", content: "gradehub", icon: <GraduationCap size={20} /> },
      { name: "Attendance", path: "/student/attendance", content: "attendance", icon: <CalendarCheck size={20} /> },
      { name: "Campus Hub", path: "/campushub", content: "campushub", icon: <Home size={20} /> },
      { name: "Study Space", path: "/studyspace", content: "studyspace", icon: <Laptop size={20} /> },
      { name: "Settings", path: "/student/resetpassword", content: "resetpassword", icon: <KeyRound size={20} /> },
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
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside 
        className={cn(
            "fixed inset-y-0 left-0 bg-white border-r border-neutral-100 z-50 transition-all duration-300 ease-in-out flex flex-col",
            isCollapsed ? "w-[80px]" : "w-72"
        )}
      >
        <div className="h-20 flex items-center justify-center border-b border-neutral-100">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-xl">Z</div>
                 {!isCollapsed && <span className="font-extrabold text-xl tracking-tighter">uniZ</span>}
             </div>
        </div>

        {/* Toggle Button */}
        <button 
           onClick={() => setIsCollapsed(!isCollapsed)}
           className="hidden md:flex absolute -right-3 top-24 w-6 h-6 bg-white border border-neutral-200 text-neutral-400 rounded-full items-center justify-center hover:text-black hover:border-black transition-colors z-50 shadow-sm"
        >
            {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2 scrollbar-hide">
            {navItems.map((item) => {
                const isActive = content === item.content;
                return (
                    <div
                        key={item.name}
                        onClick={() => navigate(item.path)}
                        className={cn(
                            "group flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-300 select-none",
                            isActive 
                                ? "bg-black text-white shadow-lg shadow-black/20" 
                                : "hover:bg-neutral-50 text-neutral-500 hover:text-black",
                             isCollapsed ? "justify-center px-2" : ""
                        )}
                        title={isCollapsed ? item.name : undefined}
                    >
                        <span className={cn("transition-colors", isActive ? "text-white" : "group-hover:text-black")}>
                            {item.icon}
                        </span>
                        {!isCollapsed && (
                            <span className="text-sm font-bold tracking-wide">{item.name}</span>
                        )}
                    </div>
                );
            })}
        </nav>

        {/* User Profile Summary */}
        <div className="p-4 border-t border-neutral-100">
             <div className={cn("flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-neutral-100 transition-all", isCollapsed ? "justify-center" : "")}>
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold overflow-hidden border border-neutral-200">
                  {userData?.profile_url ? (
                    <img src={userData.profile_url} alt={userData.name} className="w-full h-full object-cover" />
                  ) : (
                    userData?.name?.[0] || 'S'
                  )}
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-neutral-900 truncate text-sm">{userData?.name || 'Student'}</p>
                    <button onClick={() => setShowConfirm(true)} className="text-[10px] font-bold text-neutral-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                        <LogOut size={10} /> Sign Out
                    </button>
                  </div>
                )}
             </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 min-h-screen transition-all duration-300 ease-in-out px-4 py-8 md:px-8 bg-white",
        isCollapsed ? "ml-[80px]" : "ml-0 md:ml-72"
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