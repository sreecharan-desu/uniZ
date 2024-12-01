import { useRecoilState, useRecoilValue } from "recoil";
import { is_authenticated, student } from "../store";
// import { useEffect} from "react";
import { useStudentData } from "../customhooks/student_info";
import { Button } from "./button";

export default function Navbar() {
    const [isAuth, setAuth] = useRecoilState(is_authenticated);
    // const [studentUsername, setUsername] = useState('');
    const username = useRecoilValue(student);
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

    // useEffect(() => {
    //     const storedUsername = localStorage.getItem('username');
    //     if (storedUsername) {
    //         setUsername(JSON.parse(storedUsername));
    //     }
    // }, []);

    return (
        <div className="flex justify-between items-center p-4 bg-white border-b border-gray-300">
            <div>
                <a href="/">
                    <h1 className="font-bold text-xl lg:text-3xl  text-black">
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
                <div className="flex items-center space-x-4">
                    <div className="flex-col justify-center">
                    <p className="text-gray-700 text-left text-sm">{username.name}</p>
                    <p className="text-gray-700 text-left text-sm">{username.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="bg-black text-white py-2 px-4 rounded-full hover:bg-gray-800 transition duration-300"
                    >
                        Logout
                    </button>
                </div>
            ) : (isAuth.is_authnticated && isAuth.type === "admin" && localStorage.getItem('admin_token')) || (localStorage.getItem('admin_token') && username) ? (
                <div className="flex items-center space-x-4">
                    <p className="text-black">Hello Warden</p>
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
