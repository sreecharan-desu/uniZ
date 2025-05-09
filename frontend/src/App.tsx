import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import "./index.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PageTransition } from "./components/Transition";
import { useIsAuth } from "./customhooks/is_authenticated";

// Lazy load components
const Home = lazy(() => import("./pages/home"));
const Signin = lazy(() => import("./pages/StudentSignin"));
const Admin = lazy(() => import("./pages/admin"));
const ApproveComp = lazy(() => import("./components/approve-comp"));
const UpdateStatus = lazy(() => import("./components/updatestudentstatus"));
const SearchStudents = lazy(() => import("./components/searchstudents"));
const Sidebar = lazy(() => import("./components/sidebar"));

// Fallback UI
const LoadingFallback = () => (
  <div
    className="min-h-screen bg-gray-50 flex items-center justify-center"
    role="alert"
    aria-live="polite"
  >
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-black"></div>
      <p className="text-md text-black">Loading...</p>
    </div>
  </div>
);
export const isMaintenance = false; // Set to true for maintenance mode

function App() {

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      console.log(`Detected change in localStorage: ${event.key}`);
      toast.error(
        "Unauthorized change detected in localStorage. Please sign in again!"
      );
      localStorage.clear();
      console.log("localStorage cleared due to modification.");
      setTimeout(() => {
        window.location.href = "/student/signin";
      }, 1000);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Suspense fallback={<LoadingFallback />}>
        {isMaintenance ? (
          <Routes>
            {/* Allow sign-in routes during maintenance */}
            <Route
              path="/student/signin"
              element={
                <PageTransition>
                  <Signin type="student" />
                </PageTransition>
              }
            />
            <Route
              path="/admin/signin"
              element={
                <PageTransition>
                  <Signin type="admin" />
                </PageTransition>
              }
            />
            {/* All other routes show Maintenance */}
            <Route
              path="*"
              element={
                <PageTransition>
                  <Maintenance />
                </PageTransition>
              }
            />
          </Routes>
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <PageTransition>
                  <div className="flex justify-center align-middle place-content-center">
                    <Home />
                  </div>
                </PageTransition>
              }
            />
            <Route
              path="/student/signin"
              element={
                <PageTransition>
                  <Signin type="student" />
                </PageTransition>
              }
            />
            <Route
              path="/admin/signin"
              element={
                <PageTransition>
                  <Signin type="admin" />
                </PageTransition>
              }
            />
            <Route
              path="/student"
              element={
                <PageTransition>
                  <Sidebar content="dashboard" />
                </PageTransition>
              }
            />
            <Route
              path="/student/outpass"
              element={
                <PageTransition>
                  <Sidebar content="outpass" />
                </PageTransition>
              }
            />
            <Route
              path="/student/outing"
              element={
                <PageTransition>
                  <Sidebar content="outing" />
                </PageTransition>
              }
            />
            <Route
              path="/student/outing/requestouting"
              element={
                <PageTransition>
                  <Sidebar content="requestOuting" />
                </PageTransition>
              }
            />
            <Route
              path="/student/outpass/requestoutpass"
              element={
                <PageTransition>
                  <Sidebar content="requestOutpass" />
                </PageTransition>
              }
            />
            <Route
              path="/student/resetpassword"
              element={
                <PageTransition>
                  <Sidebar content="resetpassword" />
                </PageTransition>
              }
            />
            <Route
              path="/student/gradehub"
              element={
                <PageTransition>
                  <Sidebar content="gradehub" />
                </PageTransition>
              }
            />
            <Route
              path="/admin"
              element={
                <PageTransition>
                  <Admin />
                </PageTransition>
              }
            />
            <Route
              path="/admin/approveouting"
              element={
                <PageTransition>
                  <ApproveComp type="outing" />
                </PageTransition>
              }
            />
            <Route
              path="/admin/approveoutpass"
              element={
                <PageTransition>
                  <Maintenance />
                </PageTransition>
              }
            />
            <Route
              path="/admin/updatestudentstatus"
              element={
                <PageTransition>
                  <UpdateStatus />
                </PageTransition>
              }
            />
            <Route
              path="/admin/searchstudents"
              element={
                <PageTransition>
                  <SearchStudents />
                </PageTransition>
              }
            />
            <Route
              path="*"
              element={
                <PageTransition>
                  <Error />
                </PageTransition>
              }
            />
          </Routes>
        )}
      </Suspense>
    </BrowserRouter>
  );
}

// Moved to ./pages/Error.tsx
export function Error() {
  useIsAuth();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600 mt-2">
          The page you are trying to search doesn't exist! or will be available
          soon . . . <br />
          I'm currently working on some improvements along with Pikachu. Check
          back soon! -{" "}
          <a
            href="https://sr3x0r.vercel.app"
            className="text-blue-400 hover:underline"
          >
            Sr3X0r
          </a>
        </p>
      </div>
    </div>
  );
}

// Moved to ./pages/Maintenance.tsx
export function Maintenance() {
  return (
    <div className="flex w-full h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <img
        src="/pikachu.png"
        alt="Pikachu fixing things"
        width={200}
        height={200}
        className="mb-4"
      />
      <h1 className="text-4xl font-bold text-gray-800 animate-bounce">
        🚧 Under Maintenance 🚧
      </h1>
      <p className="text-lg text-gray-600 mt-2 text-center">
        I'm currently working on some improvements along with <b>Pikachu.</b>{" "}
        Check back soon! -{" "}
        <a
          href="https://sr3x0r.vercel.app"
          className="text-blue-500 hover:underline"
        >
          Sr3X0r
        </a>
      </p>
    </div>
  );
}

export default App;