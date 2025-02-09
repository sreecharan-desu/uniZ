/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { useSetRecoilState } from "recoil";
import { Admin, is_authenticated } from "../store";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

type SigninProps = {
    type: "student" | "admin",
}

export default function Signin({ type }: SigninProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const setAdmin = useSetRecoilState(Admin);
    const navigateTo = useNavigate();
    const setAuth = useSetRecoilState(is_authenticated);
    const [isloading, setLoading] = useState(false)

    const usernameHandler = (event: any) => {
        setUsername(event.target.value);
    }
    const passwordHandler = (event: any) => {
        setPassword(event.target.value);
    }
    const sendDataToBackend = async () => {
        if (type === "student" && !username.includes("o")) {
            toast('Your username is your college ID');
            return;
        } else if (username === '' || password === '') {
            toast('Please enter the data to proceed');
            return;
        }
        setLoading(true);
        const bodyData = JSON.stringify({ username: username.trim(), password: password.trim() });
        const res = await fetch(`https://uni-z-api.vercel.app/api/v1/${type}/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: bodyData
        });
        const data = await res.json();
        setLoading(false);
        if (data.msg) {
            toast(data.msg)
        } else {
            if (data.student_token) {
                localStorage.setItem('student_token', JSON.stringify(data.student_token));
                localStorage.setItem('username', JSON.stringify(username));
                setAuth({
                    is_authnticated: true,
                    type: 'student'
                });
                navigateTo('/student');
            } else if (data.admin_token) {
                localStorage.setItem('admin_token', JSON.stringify(data.admin_token));
                localStorage.setItem('username', JSON.stringify(username));
                setAuth({
                    is_authnticated: true,
                    type: 'admin'
                });
                setAdmin({
                    Username: username
                });
                navigateTo('/admin');
            }
        }
    }
    return (
        <>
            <h1 className="text-2xl font-bold mb-4">
                {type === "student" ? "/ Student - Signin" : "/ Admin - Signin"}
            </h1>
            <div className="flex justify-center items-center">
                <div className="flex flex-col justify-center w-full max-w-sm p-6 bg-white shadow-md rounded-lg border border-gray-200">
                    <Input
                        type="text"
                        onchangeFunction={usernameHandler}
                        placeholder="Username"
                    />
                    <Input
                        type="password"
                        onchangeFunction={passwordHandler}
                        placeholder="Password"
                    />
                    <Button
                        value="Sign In"
                        onclickFunction={sendDataToBackend}
                        loading={isloading}
                    />
                    <p className="text-center">
                        Click <a
                            className="font-semibold text-blue-500 hover:underline cursor-pointer"
                            onClick={() => navigateTo('/student')}
                        >
                            here
                        </a> to go back to dashboard!
                    </p>
                </div>
            </div>
        </>
    );
}
