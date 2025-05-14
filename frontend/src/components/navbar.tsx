import { useRecoilState, useRecoilValue } from "recoil";
import { is_authenticated, student } from "../store";
import { useEffect} from "react";
import { useStudentData } from "../customhooks/student_info";
import { Button } from "./button";
import { useState } from "react";
import { isMaintenance } from "../App";

// Add new Skeleton components
const UserSkeleton = () => (
    <div className="flex items-center space-x-2 animate-pulse">
        <div className="bg-gray-300 rounded-full p-2 px-4 h-10 w-10"></div>
        <div className="flex-col justify-center">
            <div className="bg-gray-300 h-4 w-32 rounded mb-2"></div>
            <div className="bg-gray-300 h-4 w-40 rounded"></div>
        </div>
    </div>
);

export default function Navbar() {
    const [isAuth, setAuth] = useRecoilState(is_authenticated);
    const username = useRecoilValue(student);
    const [isLoading, setIsLoading] = useState(true);
    const adminName = localStorage.getItem('username');

    useEffect(() => {
        if (username?.name || username?.email) {
            setIsLoading(false);
        }
    }, [username]);

    useStudentData();

    // Helper function to safely get initials
    const getInitials = (name: string | null | undefined) => {
        if (!name) return '';
        
        // Special handling for Warden1, Warden2 format
        if (name.startsWith('Warden')) {
            return 'W';
        }
        
        // Original logic for other names
        const nameParts = name.split(' ');
        if (nameParts.length >= 2) {
            return `${nameParts[0][0]}${nameParts[1][0]}`;
        }
        return name[0] || '';
    };

    const logout = () => {
        localStorage.removeItem('student_token');
        localStorage.removeItem('username');
        localStorage.removeItem('admin_token');
        setAuth({
            is_authnticated: false,
            type: ''
        });
        location.href = "/";
    };

    return (
        <div className="flex justify-between pl-5 pr-2 items-center p-1 bg-black border-gray-300 sticky top-0 z-50">
            <div className="flex">
                <img src="/vite.svg" width="36"/>
                <a href="/" className="m-3 mt-4">
                    <h1 className="font-bold text-xl lg:text-3xl text-white">
                        uniZ
                    </h1>
                </a>
            </div> 
            {isMaintenance ? <>
           
            </> : <>
            {!localStorage.getItem('student_token') && !localStorage.getItem('admin_token') ? (
                <a href="/student/signin">
                    <Button
                        onclickFunction={() => undefined}
                        value="Signin Now"
                        loading={false}
                    />
                </a>
            ) : null}
            </>}            


            {(isAuth.is_authnticated && isAuth.type === "student" && localStorage.getItem('student_token')) || 
             (localStorage.getItem('student_token') && username) ? (
                <div className="flex items-center space-x-3">
                    {isLoading ? (
                        <UserSkeleton />
                    ) : (
                        <div className="flex items-center space-x-2">
                            <div className={`${username?.name ? 'bg-white' : 'transparent'} text-black rounded-full p-2 px-4 font-bold`}>
                                {username?.name ? getInitials(username.name) : ''}
                            </div>
                            <div className="flex-col justify-center">
                                <p className="text-white text-left text-sm font-semibold">{username?.name}</p>
                                <p className="text-white text-left text-sm font-semibold">{username?.email}</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : null}

            {(isAuth.is_authnticated && isAuth.type === "admin" && localStorage.getItem('admin_token')) || 
             (localStorage.getItem('admin_token') && adminName) ? (
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <div className='bg-white text-black rounded-full p-2 px-4 text-xl font-bold'>
                                {/* @ts-ignore */}
                                {localStorage.getItem('admin_token') ? getInitials(JSON.parse(adminName)) : ''}
                            </div>
                            <div className="flex-col justify-center">
                                <p className="text-white text-left text-sm font-semibold">
                                    {adminName?.slice(1,adminName.length-1).toString()}
                                </p>
                                <p className="text-white text-left text-sm font-semibold">sreecharan309@gmail.com</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={logout} className="bg-white rounded-full px-4 py-2">
                        Logout
                    </button>
                </div>
            ) : null}
            
        </div>
    );
}
