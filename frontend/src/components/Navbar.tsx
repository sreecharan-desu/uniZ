
import { useRecoilState, useRecoilValue } from "recoil";
import { is_authenticated, student } from "../store";
import { useEffect, useState } from "react";
import { useStudentData } from "../hooks/student_info";
import { Button } from "./Button";
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { isMaintenance } from "../App";
import { useWebSocket } from "../hooks/useWebSocket";
import { cn } from "../utils/cn";

const UserSkeleton = () => (
    <div className="flex items-center space-x-3 animate-pulse">
        <div className="bg-slate-200 rounded-full h-9 w-9"></div>
        <div className="space-y-1">
            <div className="bg-slate-200 h-3 w-24 rounded"></div>
            <div className="bg-slate-200 h-2 w-32 rounded"></div>
        </div>
    </div>
);

export default function Navbar() {
    const [isAuth, setAuth] = useRecoilState(is_authenticated);
    const user = useRecoilValue(student);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { isConnected } = useWebSocket(undefined); // Connect to global WS

    // Safely parse admin name
    const rawAdminName = localStorage.getItem('username');
    const adminName = rawAdminName ? rawAdminName.replace(/^"|"$/g, '') : null;

    useEffect(() => {
        if (user?.name || user?.email) {
            setIsLoading(false);
        }
    }, [user]);

    useStudentData();

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        if (name.startsWith('Warden')) return 'W';
        const parts = name.split(' ');
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return name[0].toUpperCase();
    };

    const logout = () => {
        localStorage.removeItem('student_token');
        localStorage.removeItem('username');
        localStorage.removeItem('admin_token');
        setAuth({ is_authnticated: false, type: '' });
        navigate("/");
    };

    const isAuthenticated = (
        (isAuth.is_authnticated && isAuth.type === "student" && localStorage.getItem('student_token')) ||
        (localStorage.getItem('student_token') && user)
    );

    const isAdminAuthenticated = (
        (isAuth.is_authnticated && isAuth.type === "admin" && localStorage.getItem('admin_token')) ||
        (localStorage.getItem('admin_token') && adminName)
    );

    return (
        <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                     <Link to="/" className="font-extrabold text-2xl tracking-tighter text-slate-900 flex items-center gap-1 group">
                        <span className="bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-md group-hover:scale-105 transition-transform duration-200">Z</span>
                        <span className="group-hover:text-slate-700 transition-colors">uniZ</span>
                    </Link>
                    {/* WS Status Indicator (Subtle) */}
                    <div 
                        className={cn(
                            "w-2 h-2 rounded-full transition-colors duration-500",
                            isConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-amber-400 animate-pulse"
                        )} 
                        title={isConnected ? "Live Connected" : "Connecting..."}
                    />
                </div>

                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        isLoading ? <UserSkeleton /> : (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 pl-1 pr-1 py-1 rounded-full border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition-colors cursor-default">
                                    <div className="h-9 w-9 rounded-full bg-white text-slate-900 flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm overflow-hidden">
                                        {user?.profile_url ? (
                                            <img src={user.profile_url} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            getInitials(user?.name)
                                        )}
                                    </div>
                                    <div className="hidden sm:block pr-3">
                                        <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</p>
                                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{user?.year || 'Student'}</p>
                                    </div>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={logout}
                                    className="hidden sm:flex border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-red-600 transition-colors"
                                >
                                    Sign out
                                </Button>
                                 <button onClick={logout} className="sm:hidden p-2 text-slate-400 hover:text-red-500 transition-colors">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        )
                    ) : isAdminAuthenticated ? (
                         <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full border border-slate-100 bg-slate-50/50">
                                    <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm">
                                        {getInitials(adminName)}
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-xs font-bold text-slate-900 leading-tight capitalize">{adminName}</p>
                                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Administrator</p>
                                    </div>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={logout}
                                    className="border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                                >
                                    Sign out
                                </Button>
                            </div>
                    ) : ( !isMaintenance &&
                        <Link to="/student/signin">
                            <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200">Sign In</Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
