import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { adminUsername } from "../store";

export function useAdminname() {
    const setadminname = useSetRecoilState(adminUsername);

    useEffect(() => {
        const stored = localStorage.getItem('username');
        if (stored) {
            try {
                setadminname(JSON.parse(stored)); // handles "\"SreeCharan\"" properly
            } catch {
                setadminname(stored); // fallback if not JSON
            }
        }
    }, []);
}
