import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { outpasses } from "../store";
import { GET_OUTPASS_REQUESTS } from "../api/endpoints";

export function useGetOutpasses(){
    const setOutpasses = useSetRecoilState(outpasses);
    useEffect(()=>{
        const token = localStorage.getItem('admin_token');
        if(token){
            const getDetails = async()=>{
                const res = await fetch(GET_OUTPASS_REQUESTS,{
                    method : 'GET',
                    headers : {
                        'Content-Type' : 'application/json',
                        'Authorization' : `Bearer ${JSON.parse(token)}`
                    },
                });
                const data = await res.json();
                setOutpasses(data.outpasses)
            }
            getDetails();
            setInterval(()=>getDetails(),60*1000)  
        }
    },[])
}