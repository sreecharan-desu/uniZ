
import { Suspense, lazy } from "react";
import { Route, Routes, Link, useNavigate } from "react-router-dom";
import "./App.css";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PageTransition } from "./components/Transition";
import { useIsAuth } from "./hooks/is_authenticated";
import { Construction, FileQuestion, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "./components/Button";

// Lazy imports
const Home = lazy(() => import("./pages/home"));
const Signin = lazy(() => import("./pages/auth/CommonSignin"));
const Admin = lazy(() => import("./pages/admin/index"));
const Sidebar = lazy(() => import("./components/Sidebar"));

// Admin Components
const AddStudents = lazy(() => import("./pages/admin/AddStudents"));
const AddGrades = lazy(() => import("./pages/admin/AddGrades"));
const AddAttendance = lazy(() => import("./pages/attendance/AddAttendance"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const RoleManagement = lazy(() => import("./pages/admin/RoleManagement"));
const BannerManager = lazy(() => import("./pages/admin/BannerManager"));
const EmailNotification = lazy(() => import("./pages/admin/EmailNotification"));
const CurriculumManager = lazy(() => import("./pages/admin/Curriculum"));
const SearchStudents = lazy(() => import("./pages/admin/searchstudents"));
const UpdateStatus = lazy(() => import("./components/UpdateStudentStatus"));
const ApproveComp = lazy(() => import("./pages/admin/approve-comp"));


export const isMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

const LoadingFallback = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <Loader2 className="w-10 h-10 text-black animate-spin" />
        <p className="text-black font-black uppercase tracking-widest animate-pulse">Loading uniZ...</p>
    </div>
);

export function Error() {
  useIsAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-4">
       <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6 text-white">
           <FileQuestion size={32} />
       </div>
       <h1 className="text-4xl font-black text-black mb-2 uppercase tracking-tighter">Page Not Found</h1>
       <p className="text-slate-500 max-w-md mb-8 font-medium italic">
          The requested resource is unavailable or has been relocated.
       </p>
       <div className="flex gap-4">
           <Button variant="outline" onclickFunction={() => navigate(-1)} className="rounded-none border-2 border-black font-bold uppercase">
               <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
           </Button>
           <Link to="/">
                <Button className="rounded-none bg-black text-white px-8 font-bold uppercase">Return to Home</Button>
           </Link>
       </div>
    </div>
  );
}

export function Maintenance() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
       <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mb-6 text-white animate-pulse">
           <Construction size={40} />
       </div>
       <h1 className="text-3xl font-bold text-slate-900 mb-2">Under Maintenance</h1>
       <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
          We are currently updating the system to serve you better. 
          Please check back later or contact administration if this persists.
       </p>
       <div className="flex gap-4">
           <Button variant="outline" onclickFunction={() => navigate(-1)}>
               <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
           </Button>
       </div>
    </div>
  );
}

const MaintenanceGuard = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('admin_token');
  if (isMaintenance && !token) {
    return <PageTransition><Maintenance /></PageTransition>;
  }
  return children;
};

export default function App() {
  return (
    <>
      <ToastContainer 
        position="top-center" 
        autoClose={3000} 
        hideProgressBar 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss={false} 
        draggable={false} 
        pauseOnHover 
        theme="light"
        toastClassName="shadow-lg rounded-lg font-medium text-sm"
      />
      
      <Suspense fallback={<LoadingFallback />}>
          <Routes>
             {/* Public & Auth */}
            <Route path="/" element={<MaintenanceGuard><PageTransition><div className="flex justify-center"><Home /></div></PageTransition></MaintenanceGuard>} />
            <Route path="/student/signin" element={<MaintenanceGuard><PageTransition><Signin type="student" /></PageTransition></MaintenanceGuard>} />
            <Route path="/admin/signin" element={<PageTransition><Signin type="admin" /></PageTransition>} />

            {/* Student Protected Routes */}
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

             {/* Admin Protected Routes */}
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
    </>
  );
}