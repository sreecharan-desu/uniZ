import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { offCampus } from "../store";
import { STUDENT_OUTSIDE_CAMPUS } from "../apis";

export function useOutsideCampus(){
    const setOffCampus = useSetRecoilState(offCampus);
    useEffect(()=>{
        const token = localStorage.getItem('admin_token');
        if( token){
            const getDetails = async()=>{
                const res = await fetch(STUDENT_OUTSIDE_CAMPUS,{
                    method : 'GET',
                    headers : {
                        'Content-Type' : 'application/json',
                        'Authorization' : `Bearer ${JSON.parse(token)}`
                    },
                });
                const data = await res.json();
                setOffCampus(data.studens);
            }
            getDetails();
            setInterval(()=>getDetails(),60*1000)  
    }},[])
}