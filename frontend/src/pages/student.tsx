/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRecoilValue } from "recoil";
import { useIsAuth } from "../customhooks/is_authenticated";
import { useStudentData } from "../customhooks/student_info";
import { student } from "../store";
import RequestCard from "../components/requestCard";
import { useState, useEffect } from "react";
import { calculateDuration } from '../utils/timeUtils';

// Helper function to convert to IST
const convertToIST = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    // Add 5 hours and 30 minutes for IST
    date.setHours(date.getHours() + 5);
    date.setMinutes(date.getMinutes() + 30);
    return date.toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

export function Student() {
    useIsAuth();
    useStudentData();
    const username = useRecoilValue(student);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (username?.name || username?.outings_list || username?.outpasses_list) {
            setIsLoading(false);
        }
    }, [username]);

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
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-gray-600 to-black-600 rounded-xl p-8 text-white shadow-xl">
                <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/50">
                        <span className="text-3xl font-bold">{username.name?.[0]}</span>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">{username.name}</h1>
                        <p className="text-gray-100">{username.email}</p>
                    </div>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">Student ID</p>
                            <p className="text-xl font-semibold">{username.username}</p>
                        </div>
                        <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">Campus Status</p>
                            <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${username.is_in_campus ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <p className="text-xl font-semibold">{username.is_in_campus ? 'In Campus' : 'Out of Campus'}</p>
                            </div>
                        </div>
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${username.is_in_campus ? 'bg-green-100' : 'bg-red-100'}`}>
                            <svg className={`w-6 h-6 ${username.is_in_campus ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">Request Status</p>
                            <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${username.has_pending_requests ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                <p className="text-xl font-semibold">{username.has_pending_requests ? 'Pending' : 'No Requests'}</p>
                            </div>
                        </div>
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${username.has_pending_requests ? 'bg-yellow-100' : 'bg-green-100'}`}>
                            <svg className={`w-6 h-6 ${username.has_pending_requests ? 'text-yellow-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Requests Section */}
            {username.has_pending_requests && (
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
                    <div className="space-y-4">
                        {username.outings_list.map(outing => (
                            !outing.is_expired && !outing.is_approved && !outing.is_rejected && (
                                <RequestCard 
                                    key={outing._id} 
                                    request={outing} 
                                    email={username.email} 
                                    type="outing" 
                                />
                            )
                        ))}
                        {username.outpasses_list.map(outpass => (
                            !outpass.is_expired && !outpass.is_approved && !outpass.is_rejected && (
                                <RequestCard 
                                    key={outpass._id} 
                                    request={outpass} 
                                    type="outpass" 
                                    email={""} 
                                />
                            )
                        ))}
                    </div>
                </div>
            )}

{username.outings_list.map(outing => (
    !outing.is_expired && outing.is_approved && !outing.is_rejected && (
        <>
            <p className="text-gray-600 italic mb-2">
                *You are outside campus according to your last request listed below.
                <br />
                <span className="font-medium">Time:</span> {outing.from_time} - {outing.to_time}
                <span className="ml-2 text-blue-600">
                    Duration: {calculateDuration(outing.from_time, outing.to_time).hours} hours
                </span>
            </p>
            <RequestCard 
                key={outing._id} 
                request={outing} 
                email={username.email} 
                type="outing" 
            />
        </>
    )
))}

{username.outpasses_list.map(outpass => (
    !outpass.is_expired && outpass.is_approved && !outpass.is_rejected && (
        <>
            <p className="text-gray-600 italic mb-2">
                *You are outside campus according to your last request listed below.
                <br />
                <span className="font-medium">Date:</span> {outpass.from_day} - {outpass.to_day}
                <span className="ml-2 text-blue-600">
                    Duration: {calculateDuration(outpass.from_day, outpass.to_day).days} days
                </span>
            </p>
            <RequestCard 
                key={outpass._id} 
                request={outpass} 
                type="outpass" 
                email={""} 
            />
        </>
    )
))}
            {/* Welcome Message for In-Campus Students */}
            {username.is_in_campus && !username.has_pending_requests && (
                <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Welcome back, {username.name}!
                    </h2>
                    <p className="text-gray-600">
                        You're currently in campus with no pending requests.
                    </p>
                </div>
            )}

            {/* Request History and Stats Section */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-semibold mb-6">Request History & Statistics</h2>
                
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Outings</p>
                        <p className="text-2xl font-bold">{username.outings_list.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600">Total Outpasses</p>
                        <p className="text-2xl font-bold">{username.outpasses_list.length}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-yellow-600">Approved Requests</p>
                        <p className="text-2xl font-bold">
                            {username.outings_list.filter(o => o.is_approved).length + 
                             username.outpasses_list.filter(o => o.is_approved).length}
                        </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-red-600">Rejected Requests</p>
                        <p className="text-2xl font-bold">
                            {username.outings_list.filter(o => o.is_rejected).length + 
                             username.outpasses_list.filter(o => o.is_rejected).length}
                        </p>
                    </div>
                </div>

                {/* Detailed History */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Outings History */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Outings History
                        </h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {username.outings_list.length === 0 ? (
                                <p className="text-gray-500 italic">No outing requests found</p>
                            ) : (
                                username.outings_list.map((outing) => (
                                    <div key={outing._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-medium">{outing.reason}</p>
                                                <div className="space-y-1">
                                                    <p className="text-sm text-gray-500">
                                                        <span className="font-medium">Time:</span> {outing.from_time} - {outing.to_time}
                                                    </p>
                                                    <p className="text-sm text-blue-600">
                                                        Duration: {calculateDuration(outing.from_time, outing.to_time).hours} hours
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        <span className="font-medium">Requested:</span> {convertToIST(outing.requested_time)}
                                                    </p>
                                                    {outing.is_approved && (
                                                        <p className="text-sm text-green-600">
                                                            <span className="font-medium">Issued by:</span> {outing.issued_by} at {convertToIST(outing.issued_time)}
                                                        </p>
                                                    )}
                                                    {outing.is_rejected && (
                                                        <p className="text-sm text-red-600">
                                                            <span className="font-medium">Rejected by:</span> {outing.rejected_by} at {convertToIST(outing.rejected_time)}
                                                        </p>
                                                    )}
                                                    {outing.message && (
                                                        <p className="text-sm text-gray-600">
                                                            <span className="font-medium">Message:</span> {outing.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                outing.is_approved ? 'bg-green-100 text-green-800' :
                                                outing.is_rejected ? 'bg-red-100 text-red-800' :
                                                outing.is_expired ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {outing.is_approved ? 'Approved' :
                                                 outing.is_rejected ? 'Rejected' :
                                                 outing.is_expired ? 'Expired' :
                                                 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Outpasses History */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-black-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            Outpasses History
                        </h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {username.outpasses_list.length === 0 ? (
                                <p className="text-gray-500 italic">No outpass requests found</p>
                            ) : (
                                username.outpasses_list.map((outpass) => (
                                    <div key={outpass._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-medium">{outpass.reason}</p>
                                                <div className="space-y-1">
                                                    <p className="text-sm text-gray-500">
                                                        <span className="font-medium">Date:</span> {outpass.from_day} - {outpass.to_day}
                                                    </p>
                                                    <p className="text-sm text-blue-600">
                                                        Duration: {calculateDuration(outpass.from_day, outpass.to_day).days} days
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        <span className="font-medium">Requested:</span> {convertToIST(outpass.requested_time)}
                                                    </p>
                                                    {outpass.is_approved && (
                                                        <p className="text-sm text-green-600">
                                                            <span className="font-medium">Issued by:</span> {outpass.issued_by} at {convertToIST(outpass.issued_time)}
                                                        </p>
                                                    )}
                                                    {outpass.is_rejected && (
                                                        <p className="text-sm text-red-600">
                                                            <span className="font-medium">Rejected by:</span> {outpass.rejected_by} at {convertToIST(outpass.rejected_time)}
                                                        </p>
                                                    )}
                                                    {outpass.message && (
                                                        <p className="text-sm text-gray-600">
                                                            <span className="font-medium">Message:</span> {outpass.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                outpass.is_approved ? 'bg-green-100 text-green-800' :
                                                outpass.is_rejected ? 'bg-red-100 text-red-800' :
                                                outpass.is_expired ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {outpass.is_approved ? 'Approved' :
                                                 outpass.is_rejected ? 'Rejected' :
                                                 outpass.is_expired ? 'Expired' :
                                                 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
