/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { useNavigate } from "react-router";
import { useRecoilValue } from "recoil";
import { student } from "../store";
import { useStudentData } from "../customhooks/student_info";
import { REQUEST_OUTING, REQUEST_OUTPASS } from "../apis";

type RequestCompProps = {
    type: "outpass" | "outing";
};

export function RequestComp({ type }: RequestCompProps) {
    useStudentData();
    const [reason, setReason] = useState('');
    const [fromDate, setFromDate] = useState<string | null>(null);
    const [toDate, setToDate] = useState<string | null>(null);
    const [fromTime, setFromTime] = useState<string | null>(null);
    const [toTime, setToTime] = useState<string | null>(null);
    const Student = useRecoilValue(student);
    const navigateTo = useNavigate();

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setter(event.target.value);
    };

    const sendDataToBackend = async () => {
        const token = localStorage.getItem('student_token');
        if (!token) {
            alert('Missing auth_token. Authorization failed!');
            localStorage.removeItem('student_token');
            localStorage.removeItem('username');
            window.location.reload();
            return;
        }

        const userId = Student._id;
        const bodyData = JSON.stringify({
            reason,
            userId,
            ...(type === "outing" ? { fromTime, toTime } : { fromDate, toDate })
        });

        try {
            const endpoint = type === "outing"
                ? REQUEST_OUTING
                : REQUEST_OUTPASS;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(token)}`
                },
                body: bodyData
            });

            const data = await res.json();
            alert(data.msg);
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while sending the request.');
        }
    };

    return (
        <div className="flex justify-center py-8">
            <div className="flex flex-col items-center w-full max-w-md p-4 shadow-lg border border-gray-300 bg-white">
                <h2 className="text-2xl font-bold mb-4 underline">
                    Request {type}
                </h2>
                <textarea
                    onChange={handleInputChange(setReason)}
                    placeholder="Enter your reason here"
                    className="w-full mb-4 p-2 border border-gray-300 rounded"
                />
                {type === "outpass" ? (
                    <div className="flex justify-center space-x-4 mb-4">
                        <Input type="date" placeholder="" onchangeFunction={handleInputChange(setFromDate)} />
                        <Input type="date" placeholder="" onchangeFunction={handleInputChange(setToDate)} />
                    </div>
                ) : (
                    <div className="flex justify-center space-x-4 mb-4">
                        <Input type="time" placeholder="" onchangeFunction={handleInputChange(setFromTime)} />
                        <Input type="time" placeholder="" onchangeFunction={handleInputChange(setToTime)} />
                    </div>
                )}
                <Button value={`Request ${type}`} onclickFunction={sendDataToBackend} />
                <p className="text-center mt-4">
                    Request <a className="font-bold underline cursor-pointer" onClick={() => navigateTo(`/student/request${type === "outing" ? "outpass" : "outing"}`)}>{type === "outing" ? "outpass" : "outing"}</a>!
                </p>
                <p className="text-center mt-4">
                    Click <a className="font-bold underline cursor-pointer" onClick={() => navigateTo('/student')}>here</a> to go back to dashboard!
                </p>
            </div>
        </div>
    );
}
