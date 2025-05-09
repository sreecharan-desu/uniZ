import { useNavigate } from "react-router";
import { useAdminname } from "../customhooks/adminname";
import { useIsAuth } from "../customhooks/is_authenticated";
import { useRecoilValue } from "recoil";
import { offCampus, outings, outpasses } from "../store";
import { useGetOutpasses } from "../customhooks/getoutpassess";
import { useGetOutings } from "../customhooks/getoutings";
import { useOutsideCampus } from "../customhooks/outsidecampus";
import { useState, useEffect } from "react";
import { calculateDuration } from '../utils/timeUtils';

// Enhanced loading skeletons
const StatCardSkeleton = () => (
    <div className="animate-pulse bg-white p-6 rounded-lg shadow-md">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
    </div>
);

const ActivityCardSkeleton = () => (
    <div className="animate-pulse bg-white p-4 rounded-lg">
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
    useGetOutpasses();
    useGetOutings();
    useOutsideCampus();
    const Outpasses = useRecoilValue(outpasses);
    const Outings = useRecoilValue(outings);
    const students = useRecoilValue(offCampus);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading state
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const getTotalRequests = () => Outpasses.length + Outings.length;
    const getUrgentRequests = () => {
        const now = new Date();
        return Outings.filter(outing => {
            const requestDate = new Date(outing.requested_time);
            return now.getTime() - requestDate.getTime() > 24 * 60 * 60 * 1000;
        }).length;
    };

    const convertToIST = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        // Add 5 hours and 30 minutes for IST
        date.setHours(date.getHours() + 5);
        date.setMinutes(date.getMinutes() + 30);
        return {
            date: date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }),
            time: date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
        };
    };

    if (isLoading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen mt-16">
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
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen mt-16 relative">
            {/* Welcome Section */}
            <div className="mb-8 relative z-0">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome, Admin</h1>
                <p className="text-gray-600">
                    You have {getTotalRequests()} pending requests and {getUrgentRequests()} urgent matters to attend to.
                </p>
            </div>

            {/* Stats Overview with Hover Effects and Animations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-0">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            Live Updates
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-semibold mb-2">Pending Outing Requests</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-3xl font-bold text-gray-800">{Outings.length}</span>
                            <span className="text-gray-500 text-sm ml-2">requests</span>
                        </div>
                        <button 
                            onClick={() => navigateTo('/admin/approveouting')}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-full hover:bg-blue-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-100 p-3 rounded-full">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            Live Updates
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-semibold mb-2">Pending Outpass Requests</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-3xl font-bold text-gray-800">{Outpasses.length}</span>
                            <span className="text-gray-500 text-sm ml-2">requests</span>
                        </div>
                        <button 
                            onClick={() => navigateTo('/admin/approveoutpass')}
                            className="text-green-600 hover:text-green-800 transition-colors p-2 rounded-full hover:bg-green-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-100 p-3 rounded-full">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                            Live Updates
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-semibold mb-2">Students Outside Campus</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-3xl font-bold text-gray-800">{students.length}</span>
                            <span className="text-gray-500 text-sm ml-2">students</span>
                        </div>
                        <button 
                            onClick={() => navigateTo('/admin/updatestudentstatus')}
                            className="text-purple-600 hover:text-purple-800 transition-colors p-2 rounded-full hover:bg-purple-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Actions with Interactive Cards */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 relative z-0">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                        onClick={() => navigateTo('/admin/searchstudents')}
                        className="group flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300"
                    >
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <span className="font-semibold block">Search Students</span>
                                <span className="text-sm text-gray-500">Quick access to student records</span>
                            </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    
                    <button 
                        onClick={() => navigateTo('/admin/updatestudentstatus')}
                        className="group flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300"
                    >
                        <div className="flex items-center">
                            <div className="bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <span className="font-semibold block">Update Student Status</span>
                                <span className="text-sm text-gray-500">Quickly update student status</span>
                            </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

<div className="space-y-4">
    <div className="flex items-center space-x-2 mb-4">
        <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
        <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
    </div>
    {Outings.slice(0, 3).map(outing => {
        const istTime = convertToIST(outing.requested_time);
        const duration = calculateDuration(outing.from_time, outing.to_time);
        
        return (
            <div key={outing._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                    <div className="bg-gray-200 rounded-full p-3">
                        {outing.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">{outing.username}</p>
                        <p className="text-sm text-gray-600">
                            Requested: {outing.reason.substring(0, 30)}...
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-sm text-gray-500">{istTime.date}</span>
                    <span className="block text-xs text-gray-400">{istTime.time}</span>
                    <span className="block text-xs text-blue-600">
                        Duration: {duration.hours} hours
                    </span>
                </div>
            </div>
        );
    })}
</div>
        </div>
    );
}
