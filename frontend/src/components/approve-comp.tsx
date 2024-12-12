import { useRecoilValue } from "recoil";
import { useGetOutings } from "../customhooks/getoutings";
import { useGetOutpasses } from "../customhooks/getoutpassess";
import { outings, outpasses } from "../store";
import { APPROVE_OUTING, APPROVE_OUTPASS, REJECT_OUTING, REJECT_OUTPASS } from "../apis";
import { useState } from "react";
import { Button } from "./button";
import { useIsAuth } from "../customhooks/is_authenticated";
import { calculateDuration, formatDuration, formatRequestTime } from '../utils/timeUtils';
type ApproveProps = {
    type: "outing" | "outpass",
}

export function ApproveComp({ type }: ApproveProps) {
    useIsAuth();
    useGetOutings();
    useGetOutpasses();
    const [loading, setloading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const Outings = useRecoilValue(outings);
    const Outpasses = useRecoilValue(outpasses);

    // Filter function for search
    const filterRequests = (items: any[]) => {
        return items.filter(item => 
            !item.is_expired && 
            (item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
             item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
             item._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
             item.reason.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    };

    const approveouting = async (id: string) => {
        const token = localStorage.getItem('admin_token');
        const bodyData = JSON.stringify({ id });
        if (token) {
            setloading(true);
            const res = await fetch(APPROVE_OUTING, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(token)}`
                },
                body: bodyData
            });
            const data = await res.json();
            setloading(false);
            alert(data.msg);
            location.reload();
        }
    }

    const rejectouting = async (id: string) => {
        const token = localStorage.getItem('admin_token');
        const bodyData = JSON.stringify({ id });
        if (token) {
            setloading(true);
            const res = await fetch(REJECT_OUTING, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(token)}`
                },
                body: bodyData
            });
            const data = await res.json();
            setloading(false);
                alert(data.msg);
            location.reload();
        }
    }

    const approveoutpass = async (id: string) => {
        const token = localStorage.getItem('admin_token');
        const bodyData = JSON.stringify({ id });
        if (token) {
            setloading(true);
            const res = await fetch(APPROVE_OUTPASS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(token)}`
                },
                body: bodyData
            });
            const data = await res.json();
            setloading(false);
            alert(data.msg);
            location.reload();  
        }
    }

    const rejectoutpass = async (id: string) => {
        const token = localStorage.getItem('admin_token');
        const bodyData = JSON.stringify({ id });
        if (token) {
            setloading(true);
            const res = await fetch(REJECT_OUTPASS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(token)}`
                },
                body: bodyData
            });
            const data = await res.json();
            setloading(false);
            alert(data.msg);
            location.reload();
    }
    }

    const filteredRequests = filterRequests(type === "outing" ? Outings : Outpasses);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Search Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search by name, email, ID or reason..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-blue-50 rounded-lg">
                            <span className="text-blue-700 font-medium">Total Requests</span>
                            <span className="ml-2 text-blue-900 font-bold">
                                {type === "outing" ? Outings.length : Outpasses.length}
                            </span>
                        </div>
                        <div className="px-4 py-2 bg-green-50 rounded-lg">
                            <span className="text-green-700 font-medium">Active</span>
                            <span className="ml-2 text-green-900 font-bold">
                                {filteredRequests.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {type === "outing" ? "Outing" : "Outpass"} Requests
                    </h1>
                    <div className="text-sm text-gray-500">
                        Showing {filteredRequests.length} results
                    </div>
                </div>
            </div>

            {/* Request Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRequests.length === 0 ? (
                    <div className="col-span-2 bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                        <p className="text-gray-500">
                            {searchQuery 
                                ? "Try adjusting your search terms" 
                                : `No ${type} requests pending approval`}
                        </p>
                    </div>
                ) : (
                    filteredRequests.map((request) => (
                        <div key={request._id} 
                            className={`bg-white rounded-xl shadow-sm border-2 hover:shadow-md transition-all duration-200 ${
                                selectedRequest === request._id 
                                    ? 'border-blue-500 ring-2 ring-blue-200' 
                                    : 'border-gray-100 hover:border-gray-200'
                            }`}
                            onClick={() => setSelectedRequest(request._id)}
                        >
                            <div className="p-6">
                                {/* Request Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                                            {request.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{request.username}</p>
                                            <p className="text-sm text-gray-500">{request.email}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        request.is_approved ? 'bg-green-100 text-green-800' :
                                        request.is_rejected ? 'bg-red-100 text-red-800' :
                                        request.is_expired ? 'bg-gray-100 text-gray-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {request.is_approved ? "Approved" :
                                         request.is_rejected ? "Rejected" :
                                         request.is_expired ? "Expired" :
                                         "Pending"}
                                    </span>
                                </div>

                                {/* Request Details */}
                                <div className="space-y-4">
                                    {/* Reason Section */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Reason</h4>
                                        <p className="text-sm text-gray-600">{request.reason}</p>
                                    </div>

                                    {/* Time/Date Details */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-1">From</h4>
                                            <p className="text-sm text-gray-900">
                                                {type === "outing" ? request.from_time : request.from_day}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-1">To</h4>
                                            <p className="text-sm text-gray-900">
                                                {type === "outing" ? request.to_time : request.to_day}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Duration and Request Time */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-1">Duration</h4>
                                            <p className="text-sm text-blue-600">
                                                {type === "outing" 
                                                    ? formatDuration(calculateDuration(request.from_time, request.to_time))
                                                    : formatDuration(calculateDuration(request.from_day, request.to_day))
                                                }
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-1">Requested On</h4>
                                            <p className="text-sm text-gray-900">
                                                {formatRequestTime(request.requested_time)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {!request.is_approved && !request.is_rejected && !request.is_expired && (
                                        <div className="flex gap-3 mt-4">
                                            <Button
                                                onclickFunction={() => type === "outing" 
                                                    ? approveouting(request._id) 
                                                    : approveoutpass(request._id)
                                                }
                                                value="Approve"
                                                loading={loading}
                                            />
                                            <Button
                                                onclickFunction={() => type === "outing" 
                                                    ? rejectouting(request._id)
                                                    : rejectoutpass(request._id)
                                                }
                                                value="Reject"
                                                loading={loading}
                                            />
                                        </div>
                                    )}

                                    {/* Status Information */}
                                    {(request.is_approved || request.is_rejected) && (
                                        <div className="border-t pt-4 mt-4">
                                            <div className="flex items-center text-sm">
                                                {request.is_approved && (
                                                    <div className="text-green-600">
                                                        <svg className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Approved by {request.issued_by} at {request.issued_time}
                                                    </div>
                                                )}
                                                {request.is_rejected && (
                                                    <div className="text-red-600">
                                                        <svg className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Rejected by {request.rejected_by} at {request.rejected_time}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
