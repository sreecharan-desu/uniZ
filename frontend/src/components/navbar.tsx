import { useRecoilState, useRecoilValue } from "recoil";
import { is_authenticated, student } from "../store";
import { useEffect, useState } from "react";

export default function Navbar() {
    const [isAuth, setAuth] = useRecoilState(is_authenticated);
    const [studentUsername, setUsername] = useState('');
    const username = useRecoilValue(student);

    const logout = () => {
        localStorage.removeItem('student_token');
        localStorage.removeItem('username');
        localStorage.removeItem('admin_token');
        setAuth({
            is_authnticated: false,
            type: ''
        });
        window.location.reload(); // Reload to reflect logout changes
    };

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(JSON.parse(storedUsername));
        }
    }, []);

    return (
        <div className="flex justify-between items-center p-4 bg-white border-b border-gray-300">
            <div>
                <a href="/">
                    <h1 className="font-bold text-xl text-black">
                        uniZ
                    </h1>
                </a>
            </div>
            {(isAuth.is_authnticated && isAuth.type === "student" && localStorage.getItem('student_token')) || (localStorage.getItem('student_token') && username) ? (
                <div className="flex items-center space-x-4">
                    <p className="text-black">Hello, {studentUsername}</p>
                    <button
                        onClick={logout}
                        className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition duration-300"
                    >
                        Logout
                    </button>
                </div>
            ) : (isAuth.is_authnticated && isAuth.type === "admin" && localStorage.getItem('admin_token')) || (localStorage.getItem('admin_token') && username) ? (
                <div className="flex items-center space-x-4">
                    <p className="text-black">Hello Admin</p>
                    <button
                        onClick={logout}
                        className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition duration-300"
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <></>
            )}
        </div>
    );
}
