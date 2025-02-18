import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { useNavigate } from "react-router";
import { useRecoilValue } from "recoil";
import { student } from "../store";
import { useStudentData } from "../customhooks/student_info";
import { RESET_PASS } from "../apis";

export function Resetpassword() {
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [repassword, setRePassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigateTo = useNavigate();
    useStudentData();
    const Student = useRecoilValue(student);
    // const [showOldPassword, setShowOldPassword] = useState(false);
    // const [showNewPassword, setShowNewPassword] = useState(false);
    // const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setter(event.target.value);
    };

    const sendDataToBackend = async () => {
        if (!oldPassword || !password || !repassword) {
            toast('Please enter all fields.');
            return;
        } else if (password !== repassword) {
            toast('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        const token = localStorage.getItem('student_token');
        const bodyData = JSON.stringify({
            username: Student.username,
            password: oldPassword,
            new_password: password
        });

        if (token) {
            try {
                const res = await fetch(RESET_PASS, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${JSON.parse(token)}`
                    },
                    body: bodyData
                });
                const data = await res.json();
                toast(data.msg);
                if (data.success) {
                    localStorage.removeItem('student_token');
                    localStorage.removeItem('username');
                    navigateTo('/student/signin');
                    window.location.reload();
                }
            } catch (error) {
                console.error('Error resetting password:', error);
                toast('Error resetting your password, please try again!');
            } finally {
                setIsLoading(false);
            }
        } else {
            toast('Missing auth_token. Authorization failed.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-t-2xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                            <p className="text-sm text-gray-500">Change your account password securely</p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-gray-200 border-t-0 space-y-6">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Current Password
                        </label>
                        <Input 
                            type="password"
                            onchangeFunction={handleInputChange(setOldPassword)} 
                            placeholder="Enter your current password"
                            // className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                        />
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            New Password
                        </label>
                        <Input 
                            type="password"
                            onchangeFunction={handleInputChange(setPassword)} 
                            placeholder="Enter your new password"
                            // className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                        />
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Confirm New Password
                        </label>
                        <Input 
                            type="password"
                            onchangeFunction={handleInputChange(setRePassword)} 
                            placeholder="Confirm your new password"
                            // className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4 pt-4">
                        <Button 
                            value="Reset Password"
                            loading={isLoading}
                            onclickFunction={sendDataToBackend}
                        />
                        
                        <button
                            onClick={() => navigateTo('/student')}
                            className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors duration-200"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Info Card */}
                <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-start space-x-3">
                        <svg className="h-6 w-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Password Requirements:</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                <li>Must be at least 8 characters long</li>
                                <li>Include at least one number</li>
                                <li>Include at least one special character</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
