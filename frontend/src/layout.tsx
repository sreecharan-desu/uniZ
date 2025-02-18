import React, { Suspense } from "react";
import { Footer } from "./components/footer";

const Navbar = React.lazy(() => import('./components/navbar'));

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
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