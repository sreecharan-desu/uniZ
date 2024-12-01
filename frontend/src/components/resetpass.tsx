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
    const navigateTo = useNavigate();
    useStudentData();
    const Student = useRecoilValue(student);

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setter(event.target.value);
    };

    const sendDataToBackend = async () => {
        if (!oldPassword || !password || !repassword) {
            alert('Please enter all fields.');
            return;
        } else if (password !== repassword) {
            alert('Passwords do not match.');
            return;
        }

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
                alert(data.msg);
                if (data.success) {
                    localStorage.removeItem('student_token');
                    localStorage.removeItem('username');
                    navigateTo('/student/signin');
                    window.location.reload();
                }
            } catch (error) {
                console.error('Error resetting password:', error);
                alert('Error resetting your password, please try again!');
            }
        } else {
            alert('Missing auth_token. Authorization failed.');
        }
    };

    return (
        <div className="flex justify-center py-8 px-10">
            <div className="flex flex-col items-center w-full max-w-sm p-6 shadow-lg border border-gray-300 bg-white rounded-lg text-left">
                <label className="block text-gray-700 font-semibold mb-2 text-left ">Current Password</label>
                <Input 
                    type="password" 
                    onchangeFunction={handleInputChange(setOldPassword)} 
                    placeholder="Current Password" 
                />
                <label className="block text-gray-700 font-semibold mt-4 mb-2 text-left">New Password</label>
                <Input 
                    type="password" 
                    onchangeFunction={handleInputChange(setPassword)} 
                    placeholder="New Password" 
                />
                <label className="block text-gray-700 font-semibold mt-4 mb-2 text-left">Re-enter New Password</label>
                <Input 
                    type="password" 
                    onchangeFunction={handleInputChange(setRePassword)} 
                    placeholder="Re-enter New Password" 
                />
                <Button 
                    value="Reset My Password"
                    onclickFunction={sendDataToBackend} loading={false}                />
                <p className="text-center mt-4">
                    Click <a className="font-bold text-blue-600 underline cursor-pointer" onClick={() => navigateTo('/student')}>here</a> to go back to the dashboard!
                </p>
            </div>
        </div>
    );
}
