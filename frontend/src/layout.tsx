import React, { Suspense } from "react";
import { Footer } from "./components/footer";

const Navbar = React.lazy(() => import('./components/navbar'));

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar />
      </Suspense>
      <main className="flex-grow m-10">{children}
      </main>
      <Footer />
    </div>
  );
}


function NavbarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="w-40 h-6 bg-gray-300 rounded-lg animate-pulse"></div> {/* Simulating Navbar title */}
      <div className="w-32 h-4 bg-gray-300 rounded-lg animate-pulse"></div> {/* Simulating a smaller Navbar item */}
      <div className="w-24 h-4 bg-gray-300 rounded-lg animate-pulse"></div> {/* Another item */}
    </div>
  );
}
