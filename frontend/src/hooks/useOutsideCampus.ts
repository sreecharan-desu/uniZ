import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { offCampus } from "../store";
import { STUDENT_OUTSIDE_CAMPUS } from "../api/endpoints";

export function useOutsideCampus() {
    const setOffCampus = useSetRecoilState(offCampus);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            const getDetails = async () => {
                try {
                    const res = await fetch(STUDENT_OUTSIDE_CAMPUS, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${JSON.parse(token)}`
                        },
                    });
                    const data = await res.json();
                    if (data.success) {
                        setOffCampus(data.students);
                    }
                } catch (e) {
                    console.error("Failed to fetch outside campus students", e);
                }
            }
            getDetails();
            const interval = setInterval(() => getDetails(), 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [setOffCampus]);
}
