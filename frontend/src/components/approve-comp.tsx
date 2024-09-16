import { useRecoilValue } from "recoil";
import { useGetOutings } from "../customhooks/getoutings";
import { useGetOutpasses } from "../customhooks/getoutpassess";
import { outings, outpasses } from "../store";
import { APPROVE_OUTING, APPROVE_OUTPASS, REJECT_OUTING, REJECT_OUTPASS } from "../apis";
import { useState } from "react";
import { Button } from "./button";

type ApproveProps = {
    type: "outing" | "outpass",
}

export function ApproveComp({ type }: ApproveProps) {
    useGetOutings();
    useGetOutpasses();
    const [loading,setloading] = useState(false);
    const Outings = useRecoilValue(outings);
    const Outpasses = useRecoilValue(outpasses);

    const approveouting = async (id: string) => {
        const token = localStorage.getItem('admin_token');
        const bodyData = JSON.stringify({ id });
        if (token) {
            setloading(true);
            const res = await fetch(APPROVE_OUTING, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(token)}`
                },
                body: bodyData
            });
            const data = await res.json();
            setloading(false);
            alert(data.msg);
        }
    }

    const rejectouting = async (id: string) => {
        const token = localStorage.getItem('admin_token');
        const bodyData = JSON.stringify({ id });
        if (token) {
            setloading(true);
            const res = await fetch(REJECT_OUTING, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(token)}`
                },
                body: bodyData
            });
            const data = await res.json();
            setloading(false);
            alert(data.msg);
        }
    }

    const approveoutpass = async (id: string) => {
        const token = localStorage.getItem('admin_token');
        const bodyData = JSON.stringify({ id });
        if (token) {
            setloading(true);
            const res = await fetch(APPROVE_OUTPASS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(token)}`
                },
                body: bodyData
            });
            const data = await res.json();
            setloading(false);
            alert(data.msg);
        }
    }

    const rejectoutpass = async (id: string) => {
        const token = localStorage.getItem('admin_token');
        const bodyData = JSON.stringify({ id });
        if (token) {
            setloading(true);
            const res = await fetch(REJECT_OUTPASS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(token)}`
                },
                body: bodyData
            });
            const data = await res.json();
            setloading(false);
            alert(data.msg);
        }
    }

    return (
        <>
            {
                type === "outing" ? (
                    <>
                        <h1 className="text-2xl font-semibold text-black mb-6">
                            Outing Requests ({Outings.length})
                        </h1>
                        {Outings.length === 0 ? (
                            <p className="text-gray-600">No new outing requests!</p>
                        ) : (
                            Outings.map((outing) => {
                                if (!outing.is_expired) return (
                                    <div className="bg-white shadow-md p-6 mb-6 rounded-lg border border-gray-300">
                                        <p className="text-black">{outing._id}</p>
                                        <p className="mt-2"><span className="font-semibold">IdNumber:</span> {outing.username}</p>
                                        <p><span className="font-semibold">Email:</span> {outing.email}</p>
                                        <p><span className="font-semibold">Reason:</span> {outing.reason}</p>
                                        <p><span className="font-semibold">Requested time:</span> {outing.requested_time.split(",")[1]}</p>
                                        <p><span className="font-semibold">No_of_days:</span> {outing.no_of_days}</p>
                                        <p><span className="font-semibold">Duration:</span> {outing.from_time} to {outing.to_time}</p>
                                        <p><span className="font-semibold">Status:</span> {outing.is_approved ? "Approved" : "Pending"}</p>
                                        {outing.is_approved ? (
                                            <>
                                                <p><span className="font-semibold">Approved by:</span> {outing.issued_by} at {outing.issued_time}</p>
                                                <p><span className="font-semibold">Message:</span> You should return by {outing.to_time}</p>
                                            </>
                                        ) : null}
                                        <div className="flex gap-4 mt-4">
                                            <Button
                                                onclickFunction={() => approveouting(outing._id)}
                                                value="Approve"
                                                loading ={loading}
                                            />
                                            <Button
                                                onclickFunction={() => rejectouting(outing._id)} value={"Reject"} loading={loading}                                                
                                            />
                                        </div>
                                    </div>
                                );
                                return null;
                            })
                        )}
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-semibold text-black mb-6">Outpass Requests</h1>
                        {Outpasses.length === 0 ? (
                            <p className="text-gray-600">No New Outpass Requests!</p>
                        ) : (
                            Outpasses.map((outpass) => {
                                if (!outpass.is_expired) return (
                                    <div className="bg-white shadow-md p-6 mb-6 rounded-lg border border-gray-300">
                                        <p className="text-black">{outpass._id}</p>
                                        <p className="mt-2"><span className="font-semibold">IdNumber:</span> {outpass.username}</p>
                                        <p><span className="font-semibold">Email:</span> {outpass.email}</p>
                                        <p><span className="font-semibold">Reason:</span> {outpass.reason}</p>
                                        <p><span className="font-semibold">Requested time:</span> {outpass.requested_time}</p>
                                        <p><span className="font-semibold">No_of_days:</span> {outpass.no_of_days}</p>
                                        <p><span className="font-semibold">Duration:</span> {outpass.from_day} to {outpass.to_day}</p>
                                        <p><span className="font-semibold">Status:</span> {outpass.is_approved ? "Approved" : "Pending"}</p>
                                        {outpass.is_approved ? (
                                            <>
                                                <p><span className="font-semibold">Approved by:</span> {outpass.issued_by} at {outpass.issued_time}</p>
                                                <p><span className="font-semibold">Message:</span> You should return by {outpass.to_day}</p>
                                            </>
                                        ) : null}
                                        <div className="flex gap-4 mt-4">
                                            <button
                                                className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
                                                onClick={() => approveoutpass(outpass._id)}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600"
                                                onClick={() => rejectoutpass(outpass._id)}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                );
                                return null;
                            })
                        )}
                    </>
                )
            }
        </>
    );
}
