import { useEffect } from "react";
import { is_authenticated } from "../store";
import { useRecoilState } from "recoil";
import { useNavigate } from "react-router";

export function useIsAuth(){
    const [isAuth,setAuth] = useRecoilState(is_authenticated);
    const naviagteTo = useNavigate();
    useEffect(()=>{
      const localstorage_student = localStorage.getItem('student_token');
      const localstorage_admin = localStorage.getItem('admin_token');
        if(isAuth.is_authnticated == false || localstorage_student || localstorage_admin){
            if(localstorage_student!=null && localstorage_student != ''){
              naviagteTo('/student');
              setAuth({
                is_authnticated : true,
                type : 'student'
              });
            }else if(localstorage_admin != null && localstorage_admin != ''){
              naviagteTo('/admin')
              setAuth({
                is_authnticated : true,
                type : 'admin'
              });
            }else{
              setAuth({
                is_authnticated :false,
                type : 'none'
              });
              naviagteTo('/');
            }
        }else{
            if(isAuth.is_authnticated){
                if(isAuth.type == 'admin'){
                    naviagteTo('/admin');
                }else if(isAuth.type == 'student'){
                    naviagteTo('/student');
                }
            }else{
                naviagteTo('/');
            }
        }
    },[])

    return isAuth;
}