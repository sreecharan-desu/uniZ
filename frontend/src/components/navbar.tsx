import { useRecoilState, useRecoilValue } from "recoil";
import { is_authenticated, student } from "../store";
// import { useEffect} from "react";
import { useStudentData } from "../customhooks/student_info";
import { Button } from "./button";
import { useState, useEffect } from "react";

// Add new Skeleton components
const UserSkeleton = () => (
    <div className="flex items-center space-x-2 animate-pulse">
        <div className="bg-gray-300 rounded-full p-2 px-3 h-10 w-10"></div>
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
    
    useEffect(() => {
        // Set loading false when username data is available
        if (username?.name || username?.email) {
            setIsLoading(false);
        }
    }, [username]);

    useStudentData();
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
        <div className="flex justify-between items-center p-1 bg-black border-gray-300">
            <div className="flex">
                <img src="/vite.svg" width="40"/>
                <a href="/" className="m-3 mt-4">
                    <h1 className="font-bold text-xl lg:text-3xl  text-white">
                        uniZ
                    </h1>
                </a>
            </div>
                {!localStorage.getItem('student_token') && !localStorage.getItem('admin_token') ? <>
                    <a href="/student/signin">
                        <Button
                            onclickFunction={() =>undefined}
                            value="Signin Now"
                            loading= {false}
                        />
                    </a>
                </> : <>
                     </>
            }
            {(isAuth.is_authnticated && isAuth.type === "student" && localStorage.getItem('student_token')) || (localStorage.getItem('student_token') && username) ? (
                <div className="flex items-center space-x-3">
                    {isLoading ? (
                        <UserSkeleton />
                    ) : (
                        <div className="flex items-center space-x-2">
                            <div className={`${username.name ? 'bg-white' : 'transparent'} text-black rounded-full p-2 px-3 font-bold`}>
                                {username.name ? (username.name[0] + username.name.split(' ')[1][0]) : <></>}
                            </div>
                            <div className="flex-col justify-center">
                                <p className="text-white text-left text-sm font-semibold">{username.name}</p>
                                <p className="text-white text-left text-sm font-semibold">{username.email}</p>
                            </div>
                        </div>
                    )}
                </div>
            ): (isAuth.is_authnticated && isAuth.type === "admin" && localStorage.getItem('admin_token')) || (localStorage.getItem('admin_token') && username) ? (
                <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <div className='bg-white text-black rounded-full p-2 px-3 text-xl font-bold'>
                                    W
                                </div>
                                <div className="flex-col justify-center">
                                    <p className="text-white text-left text-sm font-semibold">Warden</p>
                                    <p className="text-white text-left text-sm font-semibold">sreecharan309@gmail.com</p>
                                </div>
                            </div>
                        </div>
                    <button onClick={logout} className="bg-white rounded-full px-4 py-2">
                        Logout
                    </button>
                </div>
            ) : (
                <></>
            )}
        </div>
    );
}
