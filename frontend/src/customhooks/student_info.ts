import { useEffect } from "react";
import {useSetRecoilState } from "recoil";
import {student } from "../store";
import { STUDENT_INFO } from "../apis";

export function useStudentData(){
    const setstudent = useSetRecoilState(student);
    useEffect(()=>{
      const localstorage =localStorage.getItem('username');
      const token = localStorage.getItem('student_token');
      if(localstorage && token){
          const username = JSON.parse(localstorage)
          const getDetails = async()=>{
              const bodyData = JSON.stringify({username});
              const res = await fetch(STUDENT_INFO,{
                  method : 'POST',
                  headers : {
                      'Content-Type' : 'application/json',
                      'Authorization' : `Bearer ${JSON.parse(token)}`
                  },
                  body : bodyData
              });
              const data = await res.json();
              if(data.student){
                  setstudent(data.student)
              }else{
                  toast(data.msg)
              }
          }
          getDetails();  
      }
  },[])
}
