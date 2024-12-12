import React, { Suspense} from 'react';
import { BrowserRouter, Route, Routes} from 'react-router-dom';
import './App.css';
import { Home } from './pages/home';
import { Signin } from './components/signin-component';
import { Admin } from './pages/admin';
import { ApproveComp } from './components/approve-comp';
import { UpdateStatus } from './components/updatestudentstatus';
import { SearchStudents } from './components/searchstudents';
import './index.css'
import Sidebar from './components/sidebar';
import { useIsAuth } from './customhooks/is_authenticated';
import { PageTransition } from './components/Transition';

function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          {/* <Analytics/> */}
          <Route element={<PageTransition><div className='flex justify-center align-middle place-content-center'><Home /></div></PageTransition>} path='/' />
          <Route element={<PageTransition><Signin type='student' /></PageTransition>} path='/student/signin' />
          <Route element={<PageTransition><Signin type='admin' /></PageTransition>} path='/admin/signin' />
          <Route element={<PageTransition><Sidebar content='dashboard'/></PageTransition>} path='/student' />
          <Route element={<PageTransition><Suspense fallback={<div className="text-md text-black">Loading...</div>}><Sidebar content='outpass'/></Suspense></PageTransition>} path='/student/outpass' />
          <Route element={<PageTransition><Suspense fallback={<div className="text-md text-black">Loading...</div>}><Sidebar content='outing'/></Suspense></PageTransition>} path='/student/outing' />
          <Route element={<PageTransition><Sidebar content='requestOuting'></Sidebar></PageTransition>} path='/student/outing/requestouting' />
          <Route element={<PageTransition><Sidebar content='requestOutpass'></Sidebar></PageTransition>} path='/student/outpass/requestoutpass' />
          <Route element={<PageTransition><Sidebar content='resetpassword'/></PageTransition>} path='/student/resetpassword' />
          <Route element={<PageTransition><Sidebar content='gradehub'/></PageTransition>} path='/student/gradehub' />
          <Route element={<PageTransition><Admin /></PageTransition>} path='/admin' />
          <Route element={<PageTransition><ApproveComp type='outing' /></PageTransition>} path='/admin/approveouting' />
          <Route element={<PageTransition><ApproveComp type='outpass' /></PageTransition>} path='/admin/approveoutpass' />
          <Route element={<PageTransition><UpdateStatus /></PageTransition>} path='/admin/updatestudentstatus' />
          <Route element={<PageTransition><SearchStudents /></PageTransition>} path='/admin/searchstudents' />
          <Route element={<PageTransition><Error/></PageTransition>} path='*'/>
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}

export function Error() {
    useIsAuth();
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
