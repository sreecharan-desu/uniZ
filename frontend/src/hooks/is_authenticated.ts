import { useEffect } from "react";
import { is_authenticated } from "../store";
import { useRecoilState } from "recoil";
import { useNavigate, useLocation } from "react-router-dom";
import { isTokenValid, parseJwt, clearSession } from "../utils/security";
import { toast } from "react-toastify";

export function useIsAuth() {
  const [isAuth, setAuth] = useRecoilState(is_authenticated);
  const navigateTo = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getSafeToken = (key: string) => {
        const stored = localStorage.getItem(key);
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch (e) {
            return "MALFORMED";
        }
    }

    const studentToken = getSafeToken("student_token");
    const adminToken = getSafeToken("admin_token");
    const storedUsername = getSafeToken("username");
    const publicPaths = ['/', '/student/signin', '/admin/signin', '/admin/signin/', '/admin/signin#'];

    const logoutAndRedirect = (reason: string) => {
        const wasAuth = isAuth.is_authnticated;
        clearSession();
        setAuth({ is_authnticated: false, type: "" });
        if (wasAuth || !publicPaths.includes(location.pathname)) {
            toast.error(`Security Alert: ${reason}`);
            navigateTo("/");
        }
    };

    if (adminToken === "MALFORMED" || studentToken === "MALFORMED" || storedUsername === "MALFORMED") {
        return logoutAndRedirect("Storage tampering detected");
    }

    if (adminToken) {
        if (!isTokenValid(adminToken)) {
            return logoutAndRedirect("Session expired or invalid");
        }
        const decoded = parseJwt(adminToken);
        const validAdminRoles = ["admin", "webmaster", "dean", "director", "caretaker", "warden", "dsw", "hod", "faculty"];
        if (!decoded || !validAdminRoles.includes(decoded.role || "")) {
             return logoutAndRedirect("Access violation: Invalid Role");
        }
        
        // Valid Admin
        if (!isAuth.is_authnticated) {
             setAuth({ is_authnticated: true, type: "admin" });
        }
        
        if (publicPaths.includes(location.pathname)) {
            navigateTo("/admin");
        }

    } else if (studentToken) {
        if (!isTokenValid(studentToken)) {
             return logoutAndRedirect("Session expired or invalid");
        }
        const decoded = parseJwt(studentToken);
        // Check if role exists and implies student
        if (decoded?.role && decoded.role !== 'student') {
             return logoutAndRedirect("Access violation");
        }
        
        if (decoded?.username && storedUsername && decoded.username !== storedUsername) {
             return logoutAndRedirect("Identity mismatch");
        }

        // Valid Student
        if (!isAuth.is_authnticated) {
             setAuth({ is_authnticated: true, type: "student" });
        }

        if (publicPaths.includes(location.pathname)) {
            navigateTo("/student");
        }
        
    } else {
        // No tokens
         if (!publicPaths.includes(location.pathname)) {
             // Only redirect if we are not already on a public page
             // And assuming protected routes need auth
             navigateTo("/");
         }
    }

  }, [isAuth, navigateTo, setAuth, location.pathname]);

  return isAuth;
}
