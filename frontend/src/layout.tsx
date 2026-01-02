import React, { Suspense } from "react";
import { Footer } from "./components/Footer";
import { useWebSocket } from "./hooks/useWebSocket";
import { useLocation } from "react-router-dom";

const Navbar = React.lazy(() => import('./components/Navbar'));

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  // Initialize WebSocket connection for real-time updates
  useWebSocket(undefined, (msg) => {
      console.log("Real-time update signal:", msg);
      // Future: Trigger SWR revalidation or global state updates here
  });

  const isStudentDashboard = 
    (location.pathname.startsWith('/student') && location.pathname !== '/student/signin') ||
    ['/studyspace', '/campushub'].includes(location.pathname);

  if (isStudentDashboard) {
      return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<LoadingAnim/>}>
        <Navbar />
      </Suspense>
      <main className="flex-grow m-10">{children}</main>
      <Footer/>
    </div>
  );
}

const LoadingAnim = () => {
  return <div className="flex items-center justify-center h-screen">
    <div className="w-10 h-10 border-4 border-gray-800 border-t-white rounded-full animate-spin"></div>
  </div>
}