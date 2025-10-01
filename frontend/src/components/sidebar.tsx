import { useRecoilState, useRecoilValue } from "recoil";
import { is_authenticated, student } from "../store";
import { useNavigate } from "react-router-dom"; // Fixed import
import { useIsAuth } from "../customhooks/is_authenticated";
import { useState, useEffect, lazy, Suspense, useRef } from "react";
import { motion } from "framer-motion";
import { enableOutingsAndOutpasses } from "../pages/student/student"; // Fixed import path
const CampusHub = lazy(() => import("../pages/promotions/CampusHub"));
const Attendance = lazy(() => import("../pages/attendance/Attendance")); // Fixed typo
const StudySpace = lazy(() => import("../pages/promotions/StudySpace")); // Fixed typo and case
const OutpassOuting = lazy(() => import("../pages/student/outpass&outing")); // Fixed path and name
const ResetPassword = lazy(() => import("../pages/student/resetpass")); // Fixed path and name
const RequestComp = lazy(() => import("../pages/student/request-component")); // Fixed path and name
const Student = lazy(() => import("../pages/student/student")); // Fixed path and name
const GradeHub = lazy(() => import("../pages/promotions/GradeHub"));
import { FaCalendarCheck, FaLaptopCode } from "react-icons/fa";
import { FaHouseLock } from "react-icons/fa6";
import { Error } from "../App";
import { ConfirmModal } from "./ConfirmPopup";

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

// Skeleton components
const UserProfileSkeleton = () => (
  <div className="flex items-center gap-2 animate-pulse">
    <div className="bg-gray-700 rounded-full p-2 px-3 h-8 w-8" />
    <div className="bg-gray-700 h-4 w-24 rounded" />
  </div>
);

const ContentSkeleton = () => (
  <div className="animate-pulse space-y-4 p-4">
    <div className="h-8 bg-gray-200 rounded-md w-3/4" />
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-4/6" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <div className="h-32 bg-gray-200 rounded-lg" />
      <div className="h-32 bg-gray-200 rounded-lg" />
    </div>
  </div>
);

export default function Sidebar({ content }: MainContent) {
  useIsAuth();
  const username = useRecoilValue(student);
  const navigate = useNavigate();
  const [_isAuth, setAuth] = useRecoilState(is_authenticated);
  const [isLoading, setIsLoading] = useState(true);
  const [_isChanging, setIsChanging] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  // Handle username loading
  useEffect(() => {
    if (username?.name || username?.username) {
      setIsLoading(false);
    }
  }, [username]);

  // Handle sidebar collapse based on breakpoint
  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth <= 886);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle content transition
  useEffect(() => {
    setIsChanging(true);
    setDirection(Math.random() > 0.5 ? "left" : "right");
    const timer = setTimeout(() => setIsChanging(false), 300);
    return () => clearTimeout(timer);
  }, [content]);

  // Handle content loading
  useEffect(() => {
    setContentLoading(true);
    const timer = setTimeout(() => setContentLoading(false), 500);
    return () => clearTimeout(timer);
  }, [content]);

  // Handle scrolling behavior
  useEffect(() => {
    const mainContent = mainContentRef.current;
    const sidebar = sidebarRef.current;

    if (!mainContent || !sidebar) return;

    const handleScroll = () => {
      const isAtBottom =
        Math.abs(mainContent.scrollHeight - mainContent.scrollTop - mainContent.clientHeight) <= 1;

      sidebar.style.position = isAtBottom ? "relative" : "fixed";
      sidebar.style.top = "0";
    };

    mainContent.addEventListener("scroll", handleScroll);
    return () => mainContent.removeEventListener("scroll", handleScroll);
  }, []);

const [showConfirm, setShowConfirm] = useState(false);

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

  // Content map for lazy-loaded components
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

  // Animation variants
  const variants = {
    enter: (direction: string) => ({
      x: direction === "right" ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: string) => ({
      x: direction === "right" ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div className="flex min-h-screen w-full -ml-10">
      <aside
        ref={sidebarRef}
        className={`${
          isCollapsed ? "w-16" : "w-56"
        } bg-black text-white transition-all duration-300 ease-in-out fixed top-0 h-screen z-10`}
      >
        <div className="p-4 text-center font-bold text-lg border-b border-gray-700">
          {isLoading ? (
            <UserProfileSkeleton />
          ) : (
            <div className="text-white text-left flex items-center gap-3 mt-20">
              <div
              className={`flex items-center justify-center font-bold rounded-full h-10 w-10 py-1 px-2 text-lg shadow ${
                username.name ? "bg-white text-black" : "bg-gray-700 text-white"
              }`}
              title={username.name.split(" ")[1] || username.username.split(" ")[1] || "User"}
              >
              {username.name
                ? username.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                : username.username?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex flex-col">
              <span
                className={`transition-opacity duration-300 font-semibold ${
                isCollapsed ? "opacity-0 w-0" : "opacity-100"
                }`}
              >
                {!isCollapsed && username.name.split(" ")[1] || username.username.split(" ")[1] || "User"}
              </span>
              <span
                className={`transition-opacity duration-300 text-xs text-gray-400 ${
                isCollapsed ? "opacity-0 w-0" : "opacity-100"
                }`}
              >
                {!isCollapsed && username.username}
              </span>
              </div>
            </div>
          )}
        </div>
        <nav className="mt-4 space-y-2">
          {[
            {
              name: "Dashboard",
              path: "/student",
              content: "dashboard",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2 4.25A2.25 2.25 0 0 1 4.25 2h7.5A2.25 2.25 0 0 1 14 4.25v5.5A2.25 2.25 0 0 1 11.75 12h-1.312c.1.128.21.248.328.36a.75.75 0 0 1 .234.545v.345a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-.345a.75.75 0 0 1 .234-.545c.118-.111.228-.232.328-.36H4.25A2.25 2.25 0 0 1 2 9.75v-5.5Zm2.25-.75a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-.75-.75h-7.5Z"
                  />
                </svg>
              ),
            },
            ...(enableOutingsAndOutpasses
              ? [
                  {
                    name: "Outing",
                    path: "/student/outing",
                    content: "outing",
                    icon: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                        />
                      </svg>
                    ),
                  },
                  {
                    name: "Outpass",
                    path: "/student/outpass",
                    content: "outpass",
                    icon: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="w-6 h-6"
                      >
                        <path d="M4.75 2A2.75 2.75 0 0 0 2 4.75v6.5A2.75 2.75 0 0 0 4.75 14h3a2.75 2.75 0 0 0 2.75-2.75v-.5a.75.75 0 0 0-1.5 0v.5c0 .69-.56 1.25-1.25 1.25h-3c-.69 0-1.25-.56-1.25-1.25v-6.5c0-.69.56-1.25 1.25-1.25h3C8.44 3.5 9 4.06 9 4.75v.5a.75.75 0 0 0 1.5 0v-.5A2.75 2.75 0 0 0 7.75 2h-3Z" />
                        <path d="M8.03 6.28a.75.75 0 0 0-1.06-1.06L4.72 7.47a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 1 0 1.06-1.06l-.97-.97h7.19a.75.75 0 0 0 0-1.5H7.06l.97-.97Z" />
                      </svg>
                    ),
                  },
                ]
              : []),
            {
              name: "GradeHub",
              path: "/student/gradehub",
              content: "gradehub",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path d="M7.702 1.368a.75.75 0 0 1 .597 0c2.098.91 4.105 1.99 6.004 3.223a.75.75 0 0 1-.194 1.348A34.27 34.27 0 0 0 8.341 8.25a.75.75 0 0 1-.682 0c-.625-.32-1.262-.62-1.909-.901v-.542a36.878 36.878 0 0 1 2.568-1.33.75.75 0 0 0-.636-1.357 38.39 38.39 0 0 0-3.06 1.605.75.75 0 0 0-.372.648v.365c-.773-.294-1.56-.56-2.359-.8a.75.75 0 0 1-.194-1.347 40.901 40.901 0 0 1 6.005-3.223ZM4.25 8.348c-.53-.212-1.067-.411-1.611-.596a40.973 40.973 0 0 0-.418 2.97.75.75 0 0 0 .474.776c.175.068.35.138.524.21a5.544 5.544 0 0 1-.58.681.75.75 0 1 0 1.06 1.06c.35-.349.655-.726.915-1.124a29.282 29.282 0 0 0-1.395-.617A5.483 5.483 0 0 0 4.25 8.5v-.152Z" />
                </svg>
              ),
            },
                        {
              name: "Attendance",
              path: "/student/attendance",
              content: "attendance",
              icon: <FaCalendarCheck size={20} />, // Increased size to 20px
            },
            {
              name: "CampusHub",
              path: "/campushub",
              content: "campushub",
              icon: <FaHouseLock size={20} />, // Increased size to 20px
            },
            {
              name: "StudySpace",
              path: "/studyspace",
              content: "studyspace",
              icon: <FaLaptopCode size={20} />, // Increased size to 20px
            },

            {
              name: "Reset Password",
              path: "/student/resetpassword",
              icon: (
                <svg className="w-6 h-6 -ml-1" fill="currentColor" viewBox="0 0 16 16">
                  <path
                    fillRule="evenodd"
                    d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z"
                    clipRule="evenodd"
                  />
                </svg>
              ),
            },
          ].map((item) => (
            <motion.div
              key={item.name}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 hover:bg-gray-700 ${
                content === item.content ? "bg-gray-700" : ""
              } p-2 rounded-md cursor-pointer mx-2`}
              onClick={() => navigate(item.path)}
              title={isCollapsed ? item.name : ""}
            >
              {item.icon}
              <span
                className={`text-white transition-opacity duration-300 ${
                  isCollapsed ? "opacity-0 w-0" : "opacity-100"
                }`}
              >
                {!isCollapsed && item.name}
              </span>
            </motion.div>
          ))}

          <motion.div
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer mx-2"
  onClick={() => setShowConfirm(true)} // 👈 open modal
            title={isCollapsed ? "Logout" : ""}
          >
            <svg
              fill="#ff0000"
              height="20px"
              width="20px"
              viewBox="0 0 330 330"
              className="w-6 h-6"
            >
              <path
                d="M51.213,180h173.785c8.284,0,15-6.716,15-15s-6.716-15-15-15H51.213l19.394-19.393 c5.858-5.857,5.858-15.355,0-21.213c-5.856-5.858-15.354-5.858-21.213,0L4.397,154.391c-0.348,0.347-0.676,0.71-0.988,1.09 c-0.076,0.093-0.141,0.193-0.215,0.288c-0.229,0.291-0.454,0.583-0.66,0.891c-0.06,0.09-0.109,0.185-0.168,0.276 c-0.206,0.322-0.408,0.647-0.59,0.986c-0.035,0.067-0.064,0.138-0.099,0.205c-0.189,0.367-0.371,0.739-0.53,1.123 c-0.02,0.047-0.034,0.097-0.053,0.145c-0.163,0.404-0.314,0.813-0.442,1.234c-0.017,0.053-0.026,0.108-0.041,0.162 c-0.121,0.413-0.232,0.83-0.317,1.257c-0.025,0.127-0.036,0.258-0.059,0.386c-0.062,0.354-0.124,0.708-0.159,1.069 C0.025,163.998,0,164.498,0,165s0.025,1.002,0.076,1.498c0.035,0.366,0.099,0.723,0.16,1.08c0.022,0.124,0.033,0.251,0.058,0.374 c0.086,0.431,0.196,0.852,0.318,1.269c0.015,0.049,0.024,0.101,0.039,0.15c0.129,0.423,0.28,0.836,0.445,1.244 c0.018,0.044,0.031,0.091,0.050,0.135c0.16,0.387,0.343,0.761,0.534,1.13c0.033,0.065,0.061,0.133,0.095,0.198 c0.184,0.341,0.387,0.669,0.596,0.994c0.056,0.088,0.104,0.181,0.162,0.267c0.207,0.309,0.434,0.603,0.662,0.895 c0.073,0.094,0.138,0.193,0.213,0.285c0.313,0.379,0.641,0.743,0.988,1.09l44.997,44.997C52.322,223.536,56.161,225,60,225 s7.678-1.464,10.606-4.394c5.858-5.858,5.858-15.355,0-21.213L51.213,180z"
              />
              <path
                d="M207.299,42.299c-40.944,0-79.038,20.312-101.903,54.333c-4.62,6.875-2.792,16.195,4.083,20.816 c6.876,4.62,16.195,2.794,20.817-4.083c17.281-25.715,46.067-41.067,77.003-41.067C258.414,72.299,300,113.884,300,165 s-41.586,92.701-92.701,92.701c-30.845,0-59.584-15.283-76.878-40.881c-4.639-6.865-13.961-8.669-20.827-4.032 c-6.864,4.638-8.67,13.962-4.032,20.826c22.881,33.868,60.913,54.087,101.737,54.087C274.956,287.701,330,232.658,330,165 S274.956,42.299,207.299,42.299z"
              />
            </svg>
            <span
              className={`text-red-500 transition-opacity duration-300 ${
                isCollapsed ? "opacity-0 w-0" : "opacity-100"
              }`}
            >
              {!isCollapsed && "Logout"}
            </span>
          </motion.div>

          <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-end">
  <button
    onClick={() => setIsCollapsed(!isCollapsed)}
    className="mr-[-12px] w-6 h-6 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
    aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-4 w-4 transition-transform duration-300 ${
        isCollapsed ? "rotate-0" : "rotate-180"
      }`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  </button>
</div>

        </nav>
      </aside>

      <main
        className={`${
          isCollapsed ? "ml-16" : "ml-56"
        } flex-1 overflow-y-auto min-h-screen transition-all duration-300 ease-in-out`}
        ref={mainContentRef}
      >
        <motion.div
          className="p-4"
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {contentLoading ? (
            <ContentSkeleton />
          ) : (
            <Suspense fallback={<ContentSkeleton />}>
              {contentMap[content] || <Error />}
            </Suspense>
          )}
        </motion.div>
      </main>
      <ConfirmModal
  open={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleLogout}
  message="Are you sure you want to logout?"
/>

    </div>
  );
}