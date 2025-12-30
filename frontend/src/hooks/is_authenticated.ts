import { useEffect } from "react";
import { is_authenticated } from "../store";
import { useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";

export function useIsAuth() {
  const [isAuth, setAuth] = useRecoilState(is_authenticated);
  const navigateTo = useNavigate();
  useEffect(() => {
    const studentToken = localStorage.getItem("student_token");
    const adminToken = localStorage.getItem("admin_token");
    if (!isAuth.is_authnticated) {
      if (studentToken && !adminToken) {
        navigateTo("/student");
        setAuth({
          is_authnticated: true,
          type: "student",
        });
      } else if (!studentToken && adminToken) {
        navigateTo("/admin/");
        setAuth({
          is_authnticated: true,
          type: "admin",
        });
      }else if(!studentToken && !adminToken){
        navigateTo('/');
      }
    }
  }, [isAuth, navigateTo, setAuth]);

  return isAuth;
}
