/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useDebounce } from "../customhooks/useDebounce";
import { SEARCH_STUDENTS } from "../apis";
import { useIsAuth } from "../customhooks/is_authenticated";

export function SearchStudents() {
    useIsAuth();
    const [string, setString] = useState("");
    const onchangeHandler = (event: any) => {
        setString(event.target.value);
    };

    interface StudentProps {
        _id: string;
        username: string;
        email: string;
        has_pending_requests: false;
        name: string;
        gender: string;
        is_in_campus: true;
        outings_list: Array<{
            from_time: string;
            in_time: string;
            is_approved: true;
            is_expired: true;
            is_rejected: false;
            issued_by: string;
            issued_time: string;
            message: string;
            no_of_days: number;
            reason: string;
            rejected_by: string;
            rejected_time: string;
            requested_time: string;
            student_id: string;
            to_time: string;
            _id: string;
        }>;
        outpasses_list: Array<{
            from_day: string;
            in_time: string;
            is_approved: true;
            is_expired: true;
            is_rejected: false;
            issued_by: string;
            issued_time: string;
            message: string;
            no_of_days: number;
            reason: string;
            rejected_by: string;
            rejected_time: string;
            requested_time: string;
            student_id: string;
            to_day: string;
            _id: string;
        }>;
    }

    const [student, setStudent] = useState<StudentProps | null>(null);
    const debouncedValue = useDebounce(string, 500);

    const getDetails = async () => {
        const token = localStorage.getItem('admin_token');
        if (!debouncedValue.startsWith('o') || !token) {
            alert("Students id starts with 'o'");
            return;
        }
        const bodyData = JSON.stringify({ username: debouncedValue });
        const res = await fetch(SEARCH_STUDENTS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${JSON.parse(token)}`
            },
            body: bodyData
        });
        const data = await res.json();
        setStudent(data.student);
    };

    return (
        <>
            <h1 className="text-xl font-bold mb-4">
                Search students by Id number
            </h1>
            <div className="flex justify-center items-center">
                <div className="relative inline-block">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-72 h-10 pl-4 pr-10 border-2 border-gray-300 rounded-full text-lg transition-colors duration-300 ease-in-out"
                        onChange={onchangeHandler}
                    />
                    <button
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 border-none bg-transparent cursor-pointer"
                        onClick={getDetails}
                    >
                        🔍
                    </button>
                </div>
            </div>

            {debouncedValue.includes('o') && debouncedValue.length === 7 && student == null ? null : (
                <>
                    {student ? (
                        <>
                            <div
                                key={student.username}
                                className="m-5 p-5 bg-gray-100 shadow-lg rounded-lg max-w-full font-sans"
                            >
                                <div className="flex flex-col text-left">
                                    <div className="m-2">
                                        <b className="text-gray-800">Name: </b> {student.name}
                                    </div>
                                    <div className="m-2">
                                        <b className="text-gray-800">Email:</b> {student.email}
                                    </div>
                                    <div className="m-2">
                                        <b className="text-gray-800">Id Number:</b> {student.username}
                                    </div>
                                    <div className="m-2">
                                        <b className="text-gray-800">Gender: </b> {student.gender}
                                    </div>
                                    <div className="m-2">
                                        <b className="text-gray-800">Present in Campus:</b> {student.is_in_campus ? "Yes" : "No"}
                                    </div>
                                </div>
                            </div>

                            {/* {student.outings_list.map((outing) => (
                                <div
                                    key={outing._id}
                                    className="mt-5 p-4 border border-gray-300 rounded-lg bg-white"
                                >
                                    <div>
                                        <b>Went on:</b> {outing.from_time}
                                    </div>
                                    <div>
                                        <b>Requested timings:</b> {outing.from_time} to {outing.to_time}
                                    </div>
                                    <div>
                                        <b>Reason:</b> {outing.reason}
                                    </div>
                                    {outing.is_approved ? <>
                                        <div>
                                        <b>Approved by:</b> {outing.issued_by}
                                    </div>
                                    <div>
                                        <b>Approved at:</b> {outing.issued_time}
                                    </div>
                                    </> : <>
                                    <div>
                                        <b>Rejected by:</b> {outing.rejected_by}
                                    </div>
                                    <div>
                                        <b>Rejected at:</b> {outing.rejected_time}
                                    </div>
                                    </>}
                                </div>
                            ))}

                            {student.outpasses_list.map((outpass) => (
                                <div
                                    key={outpass._id}
                                    className="mt-5 p-4 border border-gray-300 rounded-lg bg-white"
                                >
                                    <div className="grid grid-cols-3 gap-2 items-center text-left">
                                        <b className="underline col-span-3 text-gray-800">
                                            Request Type: Outpass
                                        </b>

                                        <div>
                                            <b>Went on:</b> {outpass.from_day}
                                        </div>
                                        <div>
                                            <b>Requested timings:</b> {outpass.from_day} to {outpass.to_day}
                                        </div>
                                        <div>
                                            <b>Reason:</b> {outpass.reason}
                                        </div>

                                        <div>
                                            <b>Approved by:</b> {outpass.issued_by}
                                        </div>
                                        <div>
                                            <b>Approved at:</b> {outpass.issued_time}
                                        </div>
                                    </div>
                                </div>
                            ))} */}
                        </>
                    ) : <></>}
                </>
            )}
        </>
    );
}
