import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { outings } from "../store";
import { GET_OUTING_REQUESTS } from "../apis";

export function useGetOutings(){
    const setOutings = useSetRecoilState(outings);
    useEffect(()=>{
        const token = localStorage.getItem('admin_token');
        if( token){
            const getDetails = async()=>{
                const res = await fetch(GET_OUTING_REQUESTS,{
                    method : 'GET',
                    headers : {
                        'Content-Type' : 'application/json',
                        'Authorization' : `Bearer ${JSON.parse(token)}`
                    },
                });
                const data = await res.json();
                setOutings(data.outings);
            }
            getDetails();
            setInterval(()=>getDetails(),60*1000)  
    }},[])
}