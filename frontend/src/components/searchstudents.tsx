/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useDebounce } from "../customhooks/useDebounce";
import { SEARCH_STUDENTS } from "../apis";
import { useIsAuth } from "../customhooks/is_authenticated";
import { calculateDuration } from "../utils/timeUtils";

const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-sm mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-600', '-100')}`}>
                {icon}
            </div>
        </div>
    </div>
);

// Skeleton components
const StudentCardSkeleton = () => (
    <div className="animate-pulse m-5 p-5 bg-gray-100 shadow-lg rounded-lg">
        <div className="flex items-center space-x-4 mb-4">
            <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
        </div>
        <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-gray-300 rounded w-full"></div>
            ))}
        </div>
    </div>
);

const HistoryCardSkeleton = () => (
    <div className="animate-pulse mt-5 p-4 border border-gray-300 rounded-lg bg-white">
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-3"></div>
        <div className="space-y-2">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-3 bg-gray-300 rounded w-3/4"></div>
            ))}
        </div>
    </div>
);

// Add this new component for request timeline
const RequestTimeline = ({ request, type }: { request: any, type: 'outing' | 'outpass' }) => {
    // Convert requested_time to IST
    const getISTTime = (dateString: string) => {
        const [day, month, year] = dateString.split(',')[0].split('/');
        const time = dateString.split(',')[1];
        const date = new Date(`${month}/${day}/${year}${time}`);
        const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
        const istDate = new Date(date.getTime() + istOffset);
        return istDate.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };


    return (
        <div className="relative pl-8 pb-6 border-l-2 border-gray-200 last:pb-0">
            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-400"></div>
            <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${type === 'outing' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                        {type === 'outing' ? 'Outing' : 'Outpass'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${request.is_approved
                            ? 'bg-green-100 text-green-800'
                            : request.is_rejected
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {request.is_approved ? "Approved" : request.is_rejected ? "Rejected" : "Pending"}
                    </span>
                </div>
                <p className="text-sm font-medium text-gray-800 mb-2">{request.reason}</p>
                <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                            {type === 'outing'
                                ? `${request.from_time} - ${request.to_time}`
                                : `${request.from_day} - ${request.to_day}`
                            }
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Duration: {
                            type === 'outing'
                                ? `${calculateDuration(request.from_time, request.to_time).hours} hours`
                                : `${calculateDuration(request.from_day, request.to_day).days} days`
                        }</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Requested: {getISTTime(request.requested_time)}</span>
                    </div>
                    {request.message && (
                        <div className="flex items-center space-x-2 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <span>{request.message}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
const parseDate = (dateStr: string) => {
    const parts = dateStr.split(", ");
    if (parts.length !== 2) return new Date(NaN); // Invalid date

    const [datePart, timePart] = parts;
    return new Date(`${datePart} ${timePart}`);
};

const getWeeklyStats = (list: Array<{ requested_time: string; is_approved: boolean; is_rejected: boolean }>) => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(now.getDate() - now.getDay());

    return list.filter(item => {
        const itemDate = parseDate(item.requested_time);
        return !isNaN(itemDate.getTime()) && itemDate >= weekStart;
    });
};

const getMonthlyStats = (list: Array<{ requested_time: string; is_approved: boolean; is_rejected: boolean }>) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JS months are 0-based
    const currentYear = now.getFullYear();

    return list.filter(item => {
        const match = item.requested_time.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (!match) return false;

        const [, month, day, year] = match.map(Number);
        return year === currentYear && month === currentMonth;
    });
};


const getYearlyStats = (list: Array<{ requested_time: string; is_approved: boolean; is_rejected: boolean }>) => {
    const currentYear = new Date().getFullYear();
    return list.filter(item => {
        const itemDate = parseDate(item.requested_time);
        return !isNaN(itemDate.getTime()) && itemDate.getFullYear() === currentYear;
    });
};



// Update the DetailedStats component
const DetailedStats = ({ student }: { student: { outings_list: any[], outpasses_list: any[] } }) => {
    // Combine outings and outpasses
    const allRequests = [...student.outings_list, ...student.outpasses_list];

    console.log(allRequests);
    // Calculate statistics
    const weeklyStats = getWeeklyStats(allRequests);
    const yearlyStats = getYearlyStats(allRequests);
    const monthlyStats = getMonthlyStats(allRequests)
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Weekly Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">This Week</h4>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Requests</span>
                        <span className="font-medium">{weeklyStats.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Approved</span>
                        <span className="text-green-600 font-medium">
                            {weeklyStats.filter(r => r.is_approved).length}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Rejected</span>
                        <span className="text-red-600 font-medium">
                            {weeklyStats.filter(r => r.is_rejected).length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Monthly Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">This Month</h4>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Requests</span>
                        <span className="font-medium">{(weeklyStats.length != 0 && yearlyStats.length !=0) ? weeklyStats.length : 0}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Approved</span>
                        <span className="text-green-600 font-medium">
                            {((weeklyStats.length != 0 && yearlyStats.length !=0) ? weeklyStats : []).filter((r: { is_approved: boolean }) => r.is_approved).length}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Rejected</span>
                        <span className="text-red-600 font-medium">
                            {((weeklyStats.length != 0 && yearlyStats.length !=0) ? weeklyStats : []).filter((r: { is_rejected: boolean }) => r.is_rejected).length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Yearly Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">This Year</h4>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Requests</span>
                        <span className="font-medium">{yearlyStats.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Approved</span>
                        <span className="text-green-600 font-medium">
                            {yearlyStats.filter(r => r.is_approved).length}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Rejected</span>
                        <span className="text-red-600 font-medium">
                            {yearlyStats.filter(r => r.is_rejected).length}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export function SearchStudents() {
    useIsAuth();
    const [string, setString] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [error, setError] = useState("");

    interface StudentProps {
        _id: string;
        username: string;
        email: string;
        has_pending_requests: false;
        name: string;
        gender: string;
        is_in_campus: true;
        outings_list: Array<{
            from_time: string;
            in_time: string;
            is_approved: true;
            is_expired: true;
            is_rejected: false;
            issued_by: string;
            issued_time: string;
            message: string;
            no_of_days: number;
            reason: string;
            rejected_by: string;
            rejected_time: string;
            requested_time: string;
            student_id: string;
            to_time: string;
            _id: string;
        }>;
        outpasses_list: Array<{
            from_day: string;
            in_time: string;
            is_approved: true;
            is_expired: true;
            is_rejected: false;
            issued_by: string;
            issued_time: string;
            message: string;
            no_of_days: number;
            reason: string;
            rejected_by: string;
            rejected_time: string;
            requested_time: string;
            student_id: string;
            to_day: string;
            _id: string;
        }>;
    }

    const [student, setStudent] = useState<StudentProps | null>(null);
    const debouncedValue = useDebounce(string, 500);

    const getDetails = async () => {
        setIsLoading(true);
        setError("");
        const token = localStorage.getItem('admin_token');

        // Check if input is empty
        if (!debouncedValue) {
            setError("Please enter a student ID");
            setIsLoading(false);
            return;
        }

        // Check if input starts with 'o' (case insensitive)
        if (!debouncedValue.toLowerCase().match(/^o/)) {
            setError("Student ID must start with 'o'");
            setIsLoading(false);
            return;
        }

        // Check if token exists
        if (!token) {
            setError("Authentication token not found");
            setIsLoading(false);
            return;
        }

        try {
            // Remove any quotes from token if present
            const cleanToken = token.replace(/^["'](.+(?=["']$))["']$/, '$1');

            const bodyData = JSON.stringify({ username: debouncedValue.toLowerCase() });
            const res = await fetch(SEARCH_STUDENTS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cleanToken}`
                },
                body: bodyData
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();

            if (!data.success) {
                setError(data.message || "Failed to fetch student details");
                setStudent(null);
                return;
            }

            setStudent(data.student);
            setShowHistory(false);
        } catch (err) {
            console.error('Error fetching student details:', err);
            setError("Failed to fetch student details. Please try again.");
            setStudent(null);
        } finally {
            setIsLoading(false);
        }
    };
    // Add new statistics calculations
    const getMonthlyStats = (list: Array<{
        requested_time: string;
        is_approved: boolean;
        is_rejected: boolean;
    }>) => {
        const currentMonth = new Date().getMonth();
        return list.filter(item => new Date(item.requested_time).getMonth() === currentMonth);
    };

    const getStats = (student: StudentProps | null) => {
        if (!student) return null;

        const currentMonthOutings = getMonthlyStats(student.outings_list);
        const currentMonthOutpasses = getMonthlyStats(student.outpasses_list);

        return {
            totalRequests: student.outings_list.length + student.outpasses_list.length,
            pendingRequests: [...student.outings_list, ...student.outpasses_list]
                .filter(req => !req.is_approved && !req.is_rejected).length,
            approvedRequests: [...student.outings_list, ...student.outpasses_list]
                .filter(req => req.is_approved).length,
            rejectedRequests: [...student.outings_list, ...student.outpasses_list]
                .filter(req => req.is_rejected).length,
            monthlyRequests: currentMonthOutings.length + currentMonthOutpasses.length,
            monthlyApproved: [...currentMonthOutings, ...currentMonthOutpasses]
                .filter(req => req.is_approved && !req.is_rejected).length,
            monthlyRejected: [...currentMonthOutings, ...currentMonthOutpasses]
                .filter(req => !req.is_approved && req.is_rejected).length,
        };
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
            {/* Header Section */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Student Search Portal
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Search for detailed student information including attendance records and request history
                </p>
            </div>

            {/* Search Section */}
            <div className="mb-8">
                <div className="max-w-md mx-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Enter student ID (e.g., o160000)"
                            className="w-full h-12 pl-5 pr-12 text-lg border-2 border-gray-300 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all duration-300"
                            onChange={(e) => {
                                setString(e.target.value);
                                setError("");
                            }}
                        />
                        <button
                            onClick={getDetails}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600 transition-colors duration-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                    {error && (
                        <div className="mt-2 text-red-500 text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            {isLoading ? (
                <div>
                    <StudentCardSkeleton />
                    <HistoryCardSkeleton />
                    <HistoryCardSkeleton />
                </div>
            ) : student ? (
                <div className="space-y-8">
                    {/* Student Info Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
                            <div className="flex items-center space-x-4">
                                <div className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
                                    {student.name.charAt(0)}
                                </div>
                                <div className="text-white">
                                    <h2 className="text-xl font-bold">{student.name}</h2>
                                    <p className="text-gray-100">{student.username}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-500">Email</label>
                                        <p className="font-medium">{student.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Gender</label>
                                        <p className="font-medium capitalize">{student.gender}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-500">Campus Status</label>
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${student.is_in_campus
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {student.is_in_campus ? "In Campus" : "Out of Campus"}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Pending Requests</label>
                                        <p className="font-medium">
                                            {student.has_pending_requests ? "Yes" : "No"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Requests"
                            value={getStats(student)?.totalRequests || 0}
                            icon={
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            }
                            color="border-gray-600"
                        />
                        <StatCard
                            title="Pending Requests"
                            value={getStats(student)?.pendingRequests || 0}
                            icon={
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                            color="border-yellow-600"
                        />
                        <StatCard
                            title="Approved Requests"
                            value={getStats(student)?.approvedRequests || 0}
                            icon={
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                            color="border-green-600"
                        />
                        <StatCard
                            title="Rejected Requests"
                            value={getStats(student)?.rejectedRequests || 0}
                            icon={
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                            color="border-red-600"
                        />
                    </div>

                    {/* Monthly Statistics */}
                    {/* <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4">Monthly Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-500 text-sm">This Month's Requests</p>
                                <p className="text-2xl font-bold text-gray-800">{getStats(student)?.monthlyRequests || 0}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-500 text-sm">Monthly Approved</p>
                                <p className="text-2xl font-bold text-green-600">{getStats(student)?.monthlyApproved || 0 }</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-500 text-sm">Monthly Rejected</p>
                                    <p className="text-2xl font-bold text-red-600">{getStats(student)?.monthlyRejected || 0}</p>
                            </div>
                        </div>
                    </div> */}

                    {/* History Toggle */}
                    <div className="flex justify-center">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <span>{showHistory ? "Hide" : "Show"} Enitre Request History</span>
                            <svg
                                className={`w-5 h-5 transform transition-transform ${showHistory ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* History Section */}
                    {showHistory && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Outings History */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-xl font-semibold mb-6 flex items-center">
                                        <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Outing History
                                    </h3>
                                    <div className="space-y-4">
                                        {student.outings_list.map((outing) => (
                                            <RequestTimeline key={outing._id} request={outing} type="outing" />
                                        ))}
                                    </div>
                                </div>

                                {/* Outpasses History */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-xl font-semibold mb-6 flex items-center">
                                        <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                        </svg>
                                        Outpass History
                                    </h3>
                                    <div className="space-y-4">
                                        {student.outpasses_list.map((outpass) => (
                                            <RequestTimeline key={outpass._id} request={outpass} type="outpass" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add this component to your main render, after the existing stats grid */}
                    {student && (
                        <div className="mt-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Detailed Statistics</h3>
                            <DetailedStats student={student} />
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}
