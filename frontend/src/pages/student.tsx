import { useRecoilValue } from "recoil";
import { useIsAuth } from "../customhooks/is_authenticated";
import { useStudentData } from "../customhooks/student_info";
import { student } from "../store";
import { useState, useEffect, lazy } from "react";
import { motion } from "framer-motion";

// Lazy-loaded components
const RequestCard = lazy(() => import("../components/requestCard"));
const PageTransition = lazy(() => import("../components/Transition").then(mod => ({ default: mod.PageTransition })));
const ListItemTransition = lazy(() => import("../components/Transition").then(mod => ({ default: mod.ListItemTransition })));

export const enableOutingsAndOutpasses = false; // Set to false to disable features

export default function Student() {
  useIsAuth();
  useStudentData();
  const username = useRecoilValue(student);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"outings" | "outpasses">("outings");
  const [visibleItems, _setVisibleItems] = useState(10);
  const [_itemsIncrement, _setItemsIncrement] = useState(10);
  const [filterReason, setFilterReason] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [_showHistory, _setShowHistory] = useState(false);
  const [filterTime, setFilterTime] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'approved', 'rejected', 'pending', 'expired'


  useEffect(() => {
    if (username?.name || username?.outings_list || username?.outpasses_list) {
      setIsLoading(false);
    }
  }, [username]);

  const filterRequests = (requests: any[]) => {
    return requests.filter((request) => {
      const matchesReason = request.reason
        .toLowerCase()
        .includes(filterReason.toLowerCase());

      let matchesDate = true;
      if (filterDateFrom || filterDateTo) {
        const requestDate = new Date(request.requested_time);
        const requestDateStr = requestDate.toISOString().split("T")[0];

        if (filterDateFrom) {
          matchesDate = matchesDate && requestDateStr >= filterDateFrom;
        }
        if (filterDateTo) {
          matchesDate = matchesDate && requestDateStr <= filterDateTo;
        }
      }

      let matchesTime = true;
      if (activeTab === "outings" && filterTime) {
        const requestTime = request.from_time; // or could check to_time
        matchesTime = requestTime.includes(filterTime);
      }

      let matchesStatus = true;
      if (filterStatus !== "all") {
        switch (filterStatus) {
          case "approved":
            matchesStatus = request.is_approved;
            break;
          case "rejected":
            matchesStatus = request.is_rejected;
            break;
          case "expired":
            matchesStatus = request.is_expired;
            break;
          case "pending":
            matchesStatus =
              !request.is_approved && !request.is_rejected && !request.is_expired;
            break;
        }
      }

      return matchesReason && matchesDate && matchesTime && matchesStatus;
    });
  };

  const getFilteredRequests = () => {
    // Get the appropriate list based on active tab
    const requests =
      activeTab === "outings" ? username?.outings_list : username?.outpasses_list;

    // If no requests or data is undefined, return empty array
    if (!requests) return [];

    // Apply filters to the requests
    return filterRequests(requests).sort((a, b) => {
      // Sort by requested_time in descending order (newest first)
      return (
        new Date(b.requested_time).getTime() -
        new Date(a.requested_time).getTime()
      );
    });
  };

  const handleTabChange = (tab: "outings" | "outpasses") => {
    setIsLoading(true);
    setActiveTab(tab);
    setTimeout(() => setIsLoading(false), 300);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-w-full">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-700 to-black rounded-xl p-8 text-white shadow-xl border border-white/10">
      <div className="flex items-center gap-6">
        <div className="h-20 w-20 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center border-2 border-white/30 shadow-inner">
          <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">{username.name?.[0]}</span>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            {username.name}
          </h1>
          {/* <p className="text-gray-200">{username.email.split("@")[0]}</p> */}
          <p className="text-gray-300 flex items-center gap-2">
            {username.email}
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
          </p>        </div>
      </div>
    </div>


        {
            enableOutingsAndOutpasses ? 
            <>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Student ID</p>
                <p className="text-xl font-semibold">{username.username}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Campus Status</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      username.is_in_campus ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  <p className="text-xl font-semibold">
                    {username.is_in_campus ? "In Campus" : "Out of Campus"}
                  </p>
                </div>
              </div>
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  username.is_in_campus ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    username.is_in_campus ? "text-green-600" : "text-red-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Request Status</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      username.has_pending_requests
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  ></span>
                  <p className="text-xl font-semibold">
                    {username.has_pending_requests ? "Pending" : "No Requests"}
                  </p>
                </div>
              </div>
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  username.has_pending_requests
                    ? "bg-yellow-100"
                    : "bg-green-100"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    username.has_pending_requests
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>
  
        
        {/* Welcome Message for In-Campus Students */}
        {username.is_in_campus && !username.has_pending_requests && (
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome back, {username.name}!
            </h2>
            <p className="text-gray-600">
              You're currently in campus with no pending requests.
            </p>
          </div>
        )}


        </div>

            </> : <></>
        }



        {/* Request History and Stats Section */}
        {enableOutingsAndOutpasses ? (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-6">
              Request History & Statistics
            </h2>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Outings</p>
                <p className="text-2xl font-bold">
                  {username?.outings_list?.length || 0}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Outpasses</p>
                <p className="text-2xl font-bold">
                  {username?.outpasses_list?.length || 0}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Approved Requests</p>
                <p className="text-2xl font-bold">
                  {(username?.outings_list?.filter((o) => o.is_approved)
                    ?.length || 0) +
                    (username?.outpasses_list?.filter((o) => o.is_approved)
                      ?.length || 0)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Rejected Requests</p>
                <p className="text-2xl font-bold">
                  {(username?.outings_list?.filter((o) => o.is_rejected)
                    ?.length || 0) +
                    (username?.outpasses_list?.filter((o) => o.is_rejected)
                      ?.length || 0)}
                </p>
              </div>
            </div>

            {/* History Filters and Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => handleTabChange("outings")}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeTab === "outings"
                      ? "bg-black text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Outings
                </button>
                <button
                  onClick={() => handleTabChange("outpasses")}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeTab === "outpasses"
                      ? "bg-black text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Outpasses
                </button>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                {/* Basic Search */}
                <input
                  type="text"
                  value={filterReason}
                  onChange={(e) => setFilterReason(e.target.value)}
                  placeholder="Search by reason..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg min-w-[200px]"
                />

                {/* Date Range Filters */}
                <div className="flex flex-col w-32">
                  <label className="text-sm text-gray-600 mb-1">
                    Requested From
                  </label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg"
                    title="Filter requests from this date"
                  />
                </div>
                <div className="flex flex-col w-32">
                  <label className="text-sm text-gray-600 mb-1">
                    Requested To
                  </label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg"
                    title="Filter requests until this date"
                  />
                </div>

                {/* Time Filter (Only for Outings) */}
                {activeTab === "outings" && (
                  <div className="flex flex-col w-32">
                    <label className="text-sm text-gray-600 mb-1">
                      Time Filter
                    </label>
                    <input
                      type="time"
                      value={filterTime}
                      onChange={(e) => setFilterTime(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg"
                      title="Filter outings by time"
                    />
                  </div>
                )}

                {/* Status Filter */}
                <div className="flex flex-col w-40">
                  <label className="text-sm text-gray-600 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                {/* Clear Filters Button */}
                {(filterReason ||
                  filterDateFrom ||
                  filterDateTo ||
                  filterTime ||
                  filterStatus !== "all") && (
                  <button
                    onClick={() => {
                      setFilterReason("");
                      setFilterDateFrom("");
                      setFilterDateTo("");
                      setFilterTime("");
                      setFilterStatus("all");
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-100"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Request Cards List */}
            <PageTransition type="page">
              <div className="space-y-4">
                {getFilteredRequests().slice(0, visibleItems).map((request, index) => (
                  <ListItemTransition key={request._id} index={index}>
                    <RequestCard
                      request={request}
                      type={activeTab === "outings" ? "outing" : "outpass"}
                      email={username.email}
                    />
                  </ListItemTransition>
                ))}

                {getFilteredRequests().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {username ? "No requests found" : "Loading requests..."}
                  </div>
                )}
              </div>
            </PageTransition>
          </div>
        ) : (
<></>
        )}
      </div>
    </PageTransition>
  );
}