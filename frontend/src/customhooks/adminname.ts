import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { Admin } from "../store";

export function useAdminname(){
    const setadminname = useSetRecoilState(Admin);
    useEffect(()=>{
        setadminname({
            Username : 'admin'
        })
    },[])
}