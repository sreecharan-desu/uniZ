import { useEffect, useState } from "react";

export function useDebounce(delimiter:string,delay:number){
    const [debounce,setDebounce] = useState('')
    useEffect(()=>{
        const timer = setTimeout(()=>{
            setDebounce(delimiter);
        },delay)
        return()=>{
            clearTimeout(timer);
        }
    },[delay, delimiter])
    return debounce;
}