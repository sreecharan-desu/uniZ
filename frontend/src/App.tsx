import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { Home } from './pages/home';
import { Signin } from './components/signin-component';
import { Admin } from './pages/admin';
import { Student } from './pages/student';
import { RequestComp } from './components/request-component';
import { ApproveComp } from './components/approve-comp';
import { UpdateStatus } from './components/updatestudentstatus';
import { Resetpassword } from './components/resetpass';
import { SearchStudents } from './components/searchstudents';
import { Analytics } from '@vercel/analytics/next';

function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Analytics/>
          <Route element={<Home />} path='/' />
          <Route element={<Signin type='student' />} path='/student/signin' />
          <Route element={<Signin type='admin' />} path='/admin/signin' />
          <Route element={<Student />} path='/student' />
          <Route element={<RequestComp type='outing' />} path='/student/requestouting' />
          <Route element={<RequestComp type='outpass' />} path='/student/requestoutpass' />
          <Route element={<Resetpassword />} path='/student/resetpassword' />
          <Route element={<Admin />} path='/admin' />
          <Route element={<ApproveComp type='outing' />} path='/admin/approveouting' />
          <Route element={<ApproveComp type='outpass' />} path='/admin/approveoutpass' />
          <Route element={<UpdateStatus />} path='/admin/updatestudentstatus' />
          <Route element={<SearchStudents />} path='/admin/searchstudents' />
          <Route element={<Error />} path='*' />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}

function Error() {
  return (
    <div style={{ textAlign: 'center' }}>
      <h2>
        The page you are trying to search doesn't exist!
        Click <a href="/" style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>here</a> to go to HomePage
      </h2>
    </div>
  );
}

export default App;
