import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { Home } from './pages/home';
import { Signin } from './components/signin-component';
import { Admin } from './pages/admin';
import { ApproveComp } from './components/approve-comp';
import { UpdateStatus } from './components/updatestudentstatus';
import { SearchStudents } from './components/searchstudents';
// import { Analytics } from '@vercel/analytics/next';
import './index.css'
import Sidebar from './components/sideBar';
function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          {/* <Analytics/> */}
          <Route element={<div className='flex justify-center align-middle place-content-center'><Home /></div>} path='/' />
          <Route element={<Signin type='student' />} path='/student/signin' />
          <Route element={<Signin type='admin' />} path='/admin/signin' />
          <Route element={<Sidebar content='dashboard'/>} path='/student' />
          <Route element={<Suspense fallback={<div className="text-md text-black">Loading...</div>}><Sidebar content='outpass'/></Suspense>} path='/student/outpass' />
          <Route element={<Suspense fallback={<div className="text-md text-black">Loading...</div>}><Sidebar content='outing'/></Suspense>} path='/student/outing' />
          <Route element={<Sidebar content='requestOuting'></Sidebar>} path='/student/outing/requestouting' />
          <Route element={<Sidebar content='requestOutpass'></Sidebar>} path='/student/outpass/requestoutpass' />
          <Route element={<Sidebar content='resetpassword'/>} path='/student/resetpassword' />
          <Route element={<Sidebar content='gradehub'/>} path='/student/gradehub' />
          <Route element={<Admin />} path='/admin' />
          <Route element={<ApproveComp type='outing' />} path='/admin/approveouting' />
          <Route element={<ApproveComp type='outpass' />} path='/admin/approveoutpass' />
          <Route element={<UpdateStatus />} path='/admin/updatestudentstatus' />
          <Route element={<SearchStudents />} path='/admin/searchstudents' />
          <Route element={<Error/>} path='*'/>
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}

export function Error() {
  return (
    <div style={{ textAlign: 'center' }}>
      <h2>
        The page you are trying to search doesn't exist! or will be available soon . . . <br />
        Click <a href="/" style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>here</a> to go to HomePage
      </h2>
    </div>
  );
}

export default App;
