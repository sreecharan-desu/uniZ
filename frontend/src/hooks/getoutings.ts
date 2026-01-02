import { useEffect, useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { outings } from "../store";
import { GET_OUTING_REQUESTS } from "../api/endpoints";
import { useWebSocket } from "./useWebSocket";

export function useGetOutings(){
    const setOutings = useSetRecoilState(outings);

    const getDetails = useCallback(async () => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            try {
                const res = await fetch(GET_OUTING_REQUESTS, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${JSON.parse(token)}`
                    },
                });
                const data = await res.json();
                if (data.success) {
                    setOutings(data.outings);
                }
            } catch (err) {
                console.error("Failed to fetch outings", err);
            }
        }
    }, [setOutings]);

    useEffect(() => {
        getDetails();
        const interval = setInterval(() => getDetails(), 60000);
        return () => clearInterval(interval);
    }, [getDetails]);

    useWebSocket(undefined, (msg) => {
        if (msg.type === 'REFRESH_REQUESTS') {
            if (msg.payload?.type === 'outing' || !msg.payload?.type) {
                console.log("WebSocket signal received: Refreshing Outings...");
                getDetails();
            }
        }
    });
}