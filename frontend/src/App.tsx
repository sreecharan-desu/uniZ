import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import "./index.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PageTransition } from "./components/Transition";
import { useIsAuth } from "./hooks/is_authenticated";
import AddStudents from "./pages/admin/AddStudents";
import AddGrades from "./pages/admin/AddGrades";
import AddAttendance from "./pages/attendance/AddAttendance";
import Settings from "./pages/admin/Settings";
import RoleManagement from "./pages/admin/RoleManagement";
import BannerManager from "./pages/admin/BannerManager";
import EmailNotification from "./pages/admin/EmailNotification";
import CurriculumManager from "./pages/admin/Curriculum";


// Lazy load components
const Home = lazy(() => import("./pages/home"));
const Signin = lazy(() => import("./pages/auth/CommonSignin"));
const Admin = lazy(() => import("./pages/admin/index"));
const Sidebar = lazy(()=> import("./components/Sidebar")) 

const SearchStudents = lazy(() => import("./pages/admin/searchstudents"));
const UpdateStatus = lazy(() => import("./components/UpdateStudentStatus"));
const ApproveComp = lazy(() => import("./pages/admin/approve-comp"));

// Fallback UI
const LoadingFallback = () => (
  <div
    className="min-h-screen bg-gray-50 flex items-center justify-center"
    role="alert"
    aria-live="polite"
  >
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-black"></div>
      <p className="text-md text-black">Loading...</p>
    </div>
  </div>
);
// ... imports ...

export const isMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

const MaintenanceGuard = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('admin_token');
  if (isMaintenance && !token) {
    return (
      <PageTransition>
        <Maintenance />
      </PageTransition>
    );
  }
  return children;
};

function App() {
  useEffect(() => {
    // ... items ...
  });

  return (
    <BrowserRouter>
      {/* ToastContainer */}
      <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            {/* Public Routes */}
            <Route path="/" element={<MaintenanceGuard><PageTransition><div className="flex justify-center align-middle place-content-center"><Home /></div></PageTransition></MaintenanceGuard>} />
            <Route path="/student/signin" element={<MaintenanceGuard><PageTransition><Signin type="student" /></PageTransition></MaintenanceGuard>} />
            <Route path="/admin/signin" element={<PageTransition><Signin type="admin" /></PageTransition>} />

            {/* Student Routes - Protected by MaintenanceGuard */}
            <Route path="/student" element={<MaintenanceGuard><PageTransition><Sidebar content="dashboard" /></PageTransition></MaintenanceGuard>} />
            <Route path="/student/outpass" element={<MaintenanceGuard><PageTransition><Sidebar content="outpass" /></PageTransition></MaintenanceGuard>} />
            <Route path="/student/outing" element={<MaintenanceGuard><PageTransition><Sidebar content="outing" /></PageTransition></MaintenanceGuard>} />
            <Route path="/student/outing/requestouting" element={<MaintenanceGuard><PageTransition><Sidebar content="requestOuting" /></PageTransition></MaintenanceGuard>} />
            <Route path="/student/outpass/requestoutpass" element={<MaintenanceGuard><PageTransition><Sidebar content="requestOutpass" /></PageTransition></MaintenanceGuard>} />
            <Route path="/student/resetpassword" element={<MaintenanceGuard><PageTransition><Sidebar content="resetpassword" /></PageTransition></MaintenanceGuard>} />
            <Route path="/studyspace" element={<MaintenanceGuard><PageTransition><Sidebar content="studyspace" /></PageTransition></MaintenanceGuard>} />
            <Route path="/campushub" element={<MaintenanceGuard><PageTransition><Sidebar content="campushub" /></PageTransition></MaintenanceGuard>} />
            <Route path="/student/attendance" element={<MaintenanceGuard><PageTransition><Sidebar content="attendance" /></PageTransition></MaintenanceGuard>} />
            <Route path="/student/gradehub" element={<MaintenanceGuard><PageTransition><Sidebar content="gradehub" /></PageTransition></MaintenanceGuard>} />

            {/* Admin Routes - Always Accessible (Auth checks are inside pages) */}
            <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
            <Route path="/admin/addstudents" element={<PageTransition><AddStudents /></PageTransition>} />
            <Route path="/admin/addgrades" element={<PageTransition><AddGrades /></PageTransition>} />
            <Route path="/admin/addattendance" element={<PageTransition><AddAttendance /></PageTransition>} />
            <Route path="/admin/settings" element={<PageTransition><Settings /></PageTransition>} />
            <Route path="/admin/curriculum" element={<PageTransition><CurriculumManager /></PageTransition>} />
            <Route path="/admin/roles" element={<PageTransition><RoleManagement /></PageTransition>} />
            <Route path="/admin/banners" element={<PageTransition><BannerManager /></PageTransition>} />
            <Route path="/admin/notifications" element={<PageTransition><EmailNotification /></PageTransition>} />
            <Route path="/admin/approveouting" element={<PageTransition><ApproveComp type="outing" /></PageTransition>} />
            <Route path="/admin/approveoutpass" element={<PageTransition><ApproveComp type="outpass" /></PageTransition>} />
            <Route path="/admin/updatestudentstatus" element={<PageTransition><UpdateStatus /></PageTransition>} />
            <Route path="/admin/searchstudents" element={<PageTransition><SearchStudents /></PageTransition>} />

            {/* Catch All */}
            <Route path="*" element={<PageTransition><Error /></PageTransition>} />
          </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
// ... components ...

// Moved to ./pages/Error.tsx
export function Error() {
  useIsAuth();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600 mt-2">
          The page you are trying to search doesn't exist! or will be available
          soon . . . <br />
          I'm currently working on some improvements along with Pikachu. Check
          back soon! -{" "}
          <a
            href="https://sr3x0r.vercel.app"
            className="text-blue-400 hover:underline"
          >
            Sr3X0r
          </a>
        </p>
      </div>
    </div>
  );
}

// Moved to ./pages/Maintenance.tsx
export function Maintenance() {
  return (
    <div className="flex w-full h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <img
        src="/pikachu.png"
        alt="Pikachu fixing things"
        width={200}
        height={200}
        className="mb-4"
      />
      <h1 className="text-4xl font-bold text-gray-800 animate-bounce">
        🚧 Under Maintenance 🚧
      </h1>
      <p className="text-lg text-gray-600 mt-2 text-center">
        I'm currently working on some improvements along with <b>Pikachu.</b>{" "}
        Check back soon! -{" "}
        <a
          href="https://sr3x0r.vercel.app"
          className="text-blue-500 hover:underline"
        >
          Sr3X0r
        </a>
      </p>
    </div>
  );
}

export default App;