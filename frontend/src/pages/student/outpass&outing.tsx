import { useRecoilValue } from "recoil";
import { student } from "../../store";
import { Button } from "../../components/Button";
import { useNavigate } from "react-router";
import React from "react";
import { calculateDuration, formatDuration } from '../../utils/timeUtils';
const RequestCard = React.lazy(() => import('../../components/RequestCard'));

type requestProps = {
    request: "outing" | "outpass"
}

export function OutButton({ request }: requestProps) {
    const navigateTo = useNavigate();
    return (
        <div className="flex justify-center items-center">
            <Button
                onclickFunction={() => navigateTo(`/student/${request}/request${request}`)}
                value={`Request ${request.charAt(0).toUpperCase() + request.slice(1)}`}
                loading={false}
                // className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            />
        </div>
    );
}

export default function Outpass_Outing({ request }: requestProps) {
    const Student = useRecoilValue(student);
    const outings = Student?.outings_list || [];
    const outpasses = Student?.outpasses_list || [];

    const pendingOutings = outings.filter(outing => !outing.is_expired && !outing.is_approved && !outing.is_rejected);
    const pendingOutpasses = outpasses.filter(outpass => !outpass.is_expired && !outpass.is_approved && !outpass.is_rejected);
    const totalPending = pendingOutings.length + pendingOutpasses.length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="mb-8">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-2xl font-bold text-gray-800">
                            Pending Requests ({totalPending})
                        </h4>
                        {!Student?.has_pending_requests && <OutButton request={request} />}
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Important Notes:</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-700">
                                    <li>Only approved requests will be displayed here</li>
                                    <li>Expired and rejected requests won't appear</li>
                                    <li>Updates will be sent to <span className="font-semibold">{Student?.email}</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
                {outings.filter(outing => !outing.is_expired && !outing.is_rejected).length + outpasses.filter(outpass => !outpass.is_expired && !outpass.is_rejected).length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                            <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No Pending Requests</h3>
                        <p className="text-gray-500">You can create a new request using the button above</p>
                    </div>
                ) : (
                    <>
                        {!Student?.is_in_campus && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            You are currently marked as outside campus. Please consult your warden to update your presence.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Active Requests */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Outings */}
                            {outings.map(outing => !outing.is_expired && (outing.is_approved || (!outing.is_approved && !outing.is_rejected)) ? (
                                <div key={outing._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="font-medium text-gray-900">Outing Request</span>
                                            </div>
                                            <span className="text-sm text-gray-500">{outing.from_time} - {outing.to_time}</span>
                                        </div>
                                        <div className="mt-2 text-sm text-blue-600">
                                            Duration: {formatDuration(calculateDuration(outing.from_time, outing.to_time))}
                                        </div>
                                    </div>
                                    <RequestCard request={outing} type="outing" key={outing._id} />
                                </div>
                            ) : null)}

                            {/* Outpasses */}
                            {outpasses.map(outpass => !outpass.is_expired && (outpass.is_approved || (!outpass.is_approved && !outpass.is_rejected)) ? (
                                <div key={outpass._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                                </svg>
                                                <span className="font-medium text-gray-900">Outpass Request</span>
                                            </div>
                                            <span className="text-sm text-gray-500">{outpass.from_day} - {outpass.to_day}</span>
                                        </div>
                                        <div className="mt-2 text-sm text-purple-600">
                                            Duration: {formatDuration(calculateDuration(outpass.from_day, outpass.to_day))}
                                        </div>
                                    </div>
                                    <RequestCard request={outpass} type="outpass" key={outpass._id} />
                                </div>
                            ) : null)}
                        </div>
                    </>
                )}
            </div>

            {/* Warning Message for Pending Requests */}
            {Student?.has_pending_requests && (
                <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                You have pending requests. New requests cannot be created until existing ones are processed.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}