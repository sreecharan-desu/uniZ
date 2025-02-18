import {  useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import './index.css';
// import { Home } from './pages/home';
// import { Signin } from './components/signin-component';
// import { Admin } from './pages/admin';
// import { ApproveComp } from './components/approve-comp';
// import { UpdateStatus } from './components/updatestudentstatus';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { SearchStudents } from './components/searchstudents';
// import Sidebar from './components/sidebar';
import { useIsAuth } from './customhooks/is_authenticated';
import { PageTransition } from './components/Transition';

function App() {
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      console.log(`Detected change in localStorage: ${event.key}`);
      toast("unauthorized change detected in localStorage please signin again!");
      setTimeout(() => {
        location.href = ""
      }, 1000)
      localStorage.clear();
      console.log("localStorage cleared due to modification.");
    };

    // Listen for localStorage changes
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route element={<PageTransition><div className='flex justify-center align-middle place-content-center'><Maintenance /></div></PageTransition>} path='/' />
        {/* <Route element={<PageTransition><Signin type='student' /></PageTransition>} path='/student/signin' />
        <Route element={<PageTransition><Signin type='admin' /></PageTransition>} path='/admin/signin' />
        <Route element={<PageTransition><Sidebar content='dashboard' /></PageTransition>} path='/student' />
        <Route element={<PageTransition><Suspense fallback={<div className="text-md text-black">Loading...</div>}><Sidebar content='outpass' /></Suspense></PageTransition>} path='/student/outpass' />
        <Route element={<PageTransition><Suspense fallback={<div className="text-md text-black">Loading...</div>}><Sidebar content='outing' /></Suspense></PageTransition>} path='/student/outing' />
        <Route element={<PageTransition><Sidebar content='requestOuting' /></PageTransition>} path='/student/outing/requestouting' />
        <Route element={<PageTransition><Sidebar content='requestOutpass' /></PageTransition>} path='/student/outpass/requestoutpass' />
        <Route element={<PageTransition><Sidebar content='resetpassword' /></PageTransition>} path='/student/resetpassword' />
        <Route element={<PageTransition><Sidebar content='gradehub' /></PageTransition>} path='/student/gradehub' />
        <Route element={<PageTransition><Admin /></PageTransition>} path='/admin' />
        <Route element={<PageTransition><ApproveComp type='outing' /></PageTransition>} path='/admin/approveouting' />
        <Route element={<PageTransition><ApproveComp type='outpass' /></PageTransition>} path='/admin/approveoutpass' />
        <Route element={<PageTransition><UpdateStatus /></PageTransition>} path='/admin/updatestudentstatus' />
        <Route element={<PageTransition><SearchStudents /></PageTransition>} path='/admin/searchstudents' /> */}
        <Route element={<PageTransition><Error /></PageTransition>} path='*' />
      </Routes>
    </BrowserRouter>
  );
}

export function Error() {
  useIsAuth();
  return (
    <div style={{ textAlign: 'center' }}>
      <h2>
        The page you are trying to search doesn't exist! or will be available soon . . . <br />
        <p className="text-lg text-gray-600 mt-2">
          I'm currently working on some improvements. Check back soon! - <a href='https://sr3x0r.vercel.app' className='text-decoration-none text-blue-400' >Sr3X0r</a>
        </p>      
      </h2>
    </div>
  );
}


function Maintenance() {
  return (
    <div className="flex w-full rounded-md flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">🚧 Under Maintenance 🚧</h1>
      <p className="text-lg text-gray-600 mt-2">
        SreeCharan is currently working on some improvements. Check back soon! - <a href='https://sr3x0r.vercel.app' className='text-decoration-none text-blue-400' >Sr3X0r</a>
      </p>
    </div>
  );
}

export default App;
