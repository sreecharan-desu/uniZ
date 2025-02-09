/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { useNavigate } from "react-router";
import { useRecoilValue } from "recoil";
import { student } from "../store";
import { useStudentData } from "../customhooks/student_info";
import { REQUEST_OUTING, REQUEST_OUTPASS } from "../apis";
import { useIsAuth } from "../customhooks/is_authenticated";

type RequestCompProps = {
    type: "outpass" | "outing";
};

export function RequestComp({ type }: RequestCompProps) {
    useIsAuth();
    useStudentData();
    const [reason, setReason] = useState(null);
    const [from_date, setFromDate] = useState<string | null>(null);
    const [to_date, setToDate] = useState<string | null>(null);
    const [from_time, setFromTime] = useState<string | null>(null);
    const [to_time, setToTime] = useState<string | null>(null);
    const Student = useRecoilValue(student);
    const [isLoading, setLoading] = useState(false);
    const navigateTo = useNavigate();

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setter(event.target.value);
    };

    const sendDataToBackend = async () => {
        const token = localStorage.getItem('student_token');
        if (!token) {
            alert('Missing auth_token. Authorization failed!');
            localStorage.removeItem('student_token');
            localStorage.removeItem('username');
            location.href = "";
            return;
        } else if ((type == "outpass" && (from_date == null || to_date == null || reason == null)) || (type == "outing" && (from_time == null || to_time == null || reason == null))) {
            alert("Please fill all the details!");
            return;
        }

        const userId = Student._id;
        const bodyData = JSON.stringify({
            reason,
            userId,
            ...(type === "outing" ? { from_time, to_time } : { from_date, to_date })
        });

        try {
            const endpoint = type === "outing"
                ? REQUEST_OUTING
                : REQUEST_OUTPASS;
            setLoading(true);
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(token)}`
                },
                body: bodyData
            });

            const data = await res.json();
            setLoading(false);
            alert(data.msg);
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while sending the request.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-t-2xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {type === "outpass" ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Request {type.charAt(0).toUpperCase() + type.slice(1)}
                            </h2>
                            <p className="text-sm text-gray-500">
                                Fill in the details below to submit your request
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-gray-200 border-t-0 space-y-6">
                    {/* Reason Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for {type}
                        </label>
                        <textarea
                            onChange={handleInputChange(setReason)}
                            placeholder="Please provide a detailed reason..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[100px] resize-none"
                        />
                    </div>

                    {/* Date/Time Inputs */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {type === "outpass" ? "Duration (Days)" : "Duration (Time)"}
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {type === "outpass" ? (
                                <>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">From Date</label>
                                        <Input
                                            type="date"
                                            placeholder=""
                                            onchangeFunction={handleInputChange(setFromDate)}
                                        // className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">To Date</label>
                                        <Input
                                            type="date"
                                            placeholder=""
                                            onchangeFunction={handleInputChange(setToDate)}
                                        // className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">From Time</label>
                                        <Input
                                            type="time"
                                            placeholder=""
                                            onchangeFunction={handleInputChange(setFromTime)}
                                        // className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">To Time</label>
                                        <Input
                                            type="time"
                                            placeholder=""
                                            onchangeFunction={handleInputChange(setToTime)}
                                        // className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <Button
                            value={`Submit ${type} Request`}
                            loading={isLoading}
                            onclickFunction={sendDataToBackend}
                        />

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <button
                                onClick={() => navigateTo(`/student/${type === "outing" ? "outpass" : "outing"}/request${type === "outing" ? "outpass" : "outing"}`)}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Switch to {type === "outing" ? "Outpass" : "Outing"} Request
                            </button>
                            <button
                                onClick={() => navigateTo('/student')}
                                className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-start space-x-3">
                        <svg className="h-6 w-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Please Note:</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                <li>All fields are required</li>
                                <li>You will receive updates at {Student.email}</li>
                                <li>Processing may take up to 24 hours</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
