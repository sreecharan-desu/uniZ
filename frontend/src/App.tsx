import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy Loading for Better Performance
const Home = lazy(() => import('./pages/home'));
const Signin = lazy(() => import('./components/signin-component'));
const Admin = lazy(() => import('./pages/admin'));
const ApproveComp = lazy(() => import('./components/approve-comp'));
const UpdateStatus = lazy(() => import('./components/updatestudentstatus'));
const SearchStudents = lazy(() => import('./components/searchstudents'));
const Sidebar = lazy(() => import('./components/sidebar'));
const PageTransition = lazy(() => import('./components/Transition'));

// Authentication Hook
import { useIsAuth } from './customhooks/is_authenticated';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route 
          path="/" 
          element={<Suspense fallback={<Loading />}><PageTransition><Home /></PageTransition></Suspense>} 
        />
        <Route 
          path="/student/signin" 
          element={<Suspense fallback={<Loading />}><PageTransition><Signin type="student" /></PageTransition></Suspense>} 
        />
        <Route 
          path="/admin/signin" 
          element={<Suspense fallback={<Loading />}><PageTransition><Signin type="admin" /></PageTransition></Suspense>} 
        />
        <Route 
          path="/student" 
          element={<Suspense fallback={<Loading />}><PageTransition><Sidebar content="dashboard" /></PageTransition></Suspense>} 
        />
        <Route 
          path="/student/outpass" 
          element={<Suspense fallback={<Loading />}><PageTransition><Sidebar content="outpass" /></PageTransition></Suspense>} 
        />
        <Route 
          path="/student/outing" 
          element={<Suspense fallback={<Loading />}><PageTransition><Sidebar content="outing" /></PageTransition></Suspense>} 
        />
        <Route 
          path="/student/outing/requestouting" 
          element={<Suspense fallback={<Loading />}><PageTransition><Sidebar content="requestOuting" /></PageTransition></Suspense>} 
        />
        <Route 
          path="/student/outpass/requestoutpass" 
          element={<Suspense fallback={<Loading />}><PageTransition><Sidebar content="requestOutpass" /></PageTransition></Suspense>} 
        />
        <Route 
          path="/student/resetpassword" 
          element={<Suspense fallback={<Loading />}><PageTransition><Sidebar content="resetpassword" /></PageTransition></Suspense>} 
        />
        <Route 
          path="/admin" 
          element={<Suspense fallback={<Loading />}><PageTransition><Admin /></PageTransition></Suspense>} 
        />
        <Route 
          path="/admin/approveouting" 
          element={<Suspense fallback={<Loading />}><PageTransition><ApproveComp type="outing" /></PageTransition></Suspense>} 
        />
        <Route 
          path="/admin/approveoutpass" 
          element={<Suspense fallback={<Loading />}><PageTransition><ApproveComp type="outpass" /></PageTransition></Suspense>} 
        />
        <Route 
          path="/admin/updatestudentstatus" 
          element={<Suspense fallback={<Loading />}><PageTransition><UpdateStatus /></PageTransition></Suspense>} 
        />
        <Route 
          path="/admin/searchstudents" 
          element={<Suspense fallback={<Loading />}><PageTransition><SearchStudents /></PageTransition></Suspense>} 
        />
        <Route 
          path="*" 
          element={<Suspense fallback={<Loading />}><PageTransition><Error /></PageTransition></Suspense>} 
        />
      </Routes>
    </BrowserRouter>
  );
}

// 🔴 Error Page Handling (Prevents Infinite Loops)
export function Error() {
  useEffect(() => {
    useIsAuth(); // Ensures authentication logic runs only once
  }, []);

  return (
    <div className="text-center">
      <h2>
        The page you are trying to search doesn't exist! Or will be available soon... <br />
        Click <a href="/" className="text-blue-500 underline cursor-pointer">here</a> to go to HomePage.
      </h2>
    </div>
  );
}

// 🔵 Loading Fallback Component
function Loading() {
  return <div className="text-md text-black">Loading...</div>;
}

export default App;
