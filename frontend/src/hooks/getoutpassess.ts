import { useEffect, useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { outpasses } from "../store";
import { GET_OUTPASS_REQUESTS } from "../api/endpoints";
import { useWebSocket } from "./useWebSocket";

export function useGetOutpasses(){
    const setOutpasses = useSetRecoilState(outpasses);

    const getDetails = useCallback(async () => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            try {
                const res = await fetch(GET_OUTPASS_REQUESTS, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${JSON.parse(token)}`
                    },
                });
                const data = await res.json();
                if (data.success) {
                    setOutpasses(data.outpasses);
                }
            } catch (err) {
                console.error("Failed to fetch outpasses", err);
            }
        }
    }, [setOutpasses]);

    useEffect(() => {
        getDetails();
        const interval = setInterval(() => getDetails(), 60000);
        return () => clearInterval(interval);
    }, [getDetails]);

    useWebSocket(undefined, (msg) => {
        if (msg.type === 'REFRESH_REQUESTS') {
            if (msg.payload?.type === 'outpass' || !msg.payload?.type) {
                console.log("WebSocket signal received: Refreshing Outpasses...");
                getDetails();
            }
        }
    });
}