import React, { Suspense } from "react";
import { Footer } from "./components/footer";

const Navbar = React.lazy(() => import('./components/navbar'));

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="text-center py-4">Loading Navbar...</div>}>
        <Navbar />
      </Suspense>
      <main className="flex-grow  m-10">{children}</main>
      <Footer/>
    </div>
  );
}
