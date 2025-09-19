
import { useNavigate } from "react-router";
import { useAdminname } from "../../customhooks/adminname";
import { useIsAuth } from "../../customhooks/is_authenticated";
import { useState, useEffect } from "react";

// Loading Skeletons
const StatCardSkeleton = ()=>{
  return <div className="animate-pulse bg-white p-6 rounded-xl shadow-md">
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
    <div className="h-8 bg-gray-200 rounded w-24"></div>
  </div>
};

const ActivityCardSkeleton = () => (
  <div className="animate-pulse bg-white p-4 rounded-xl">
    <div className="flex items-center space-x-4">
      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

export default function Admin() {
  useIsAuth();
  useAdminname();
  const navigateTo = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[1, 2].map((i) => (
              <ActivityCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-white shadow-2xl rounded-2xl p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                {/* @ts-ignore */}
                Welcome, {JSON.parse(localStorage.getItem("username"))}
              </h1>
            </div>
            <button
              onClick={() => navigateTo("/admin/settings")}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Settings"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow-2xl rounded-2xl p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => navigateTo("/admin/searchstudents")}
              className="flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              <div className="flex items-center">
                <div className="bg-black p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <span className="font-semibold block text-gray-900">
                    Search Students
                  </span>
                  <span className="text-sm text-gray-600">
                    Access student records
                  </span>
                </div>
              </div>
            </button>
            <button
              onClick={() => navigateTo("/admin/addstudents")}
              className="flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              <div className="flex items-center">
                <div className="bg-black p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <span className="font-semibold block text-gray-900">
                    Add Students
                  </span>
                  <span className="text-sm text-gray-600">
                    Add by uploading a csv
                  </span>
                </div>
              </div>
            </button>
            <button
              onClick={() => navigateTo("/admin/addgrades")}
              className="flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              <div className="flex items-center">
                <div className="bg-black p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <span className="font-semibold block text-gray-900">
                    Add Grades
                  </span>
                  <span className="text-sm text-gray-600">Upload via CSV</span>
                </div>
              </div>
            </button>
            <button
              onClick={() => navigateTo("/admin/addattendance")}
              className="flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 
              transition-all"
            >
              <div className="flex items-center">
                <div className="bg-black p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <span className="font-semibold block text-gray-900">
                    Add Attendance
                  </span>
                  <span className="text-sm text-gray-600">Upload via CSV</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Error Toast */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-md">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-white font-bold"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
