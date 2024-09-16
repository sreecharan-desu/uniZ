/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router";
import { Button } from "../components/button";
import { useIsAuth } from "../customhooks/is_authenticated";
import { useStudentData } from "../customhooks/student_info";
import { useRecoilValue } from "recoil";
import { student } from "../store";

export function Student() {
    useIsAuth();
    useStudentData();
    const navigateTo = useNavigate();
    const Student = useRecoilValue(student);
    const pendingRequests = (list: any[]) => list.filter((request: any) => !request.is_approved && !request.is_rejected && !request.is_expired).length;
    const completedRequests = (list: any[]) => list.filter((request: any) => (request.is_approved || request.is_rejected) && !request.is_expired).length;

    return (
        <div>
            <div className="flex justify-center items-center">
                <Button onclickFunction={() => navigateTo('/student/requestouting')} value="Request Outing" loading={false} />&nbsp;
                <Button onclickFunction={() => navigateTo('/student/requestoutpass')} value="Request Outpass" loading={false} />&nbsp;
                <Button onclickFunction={() => navigateTo('/student/resetpassword')} value="Reset Password" loading={false} />&nbsp;
            </div>
            <div className="m-5">
                <div className="flex justify-start">
                <h4 className="text-xl font-bold">Your have ({Student.outings_list.filter(outing => !outing.is_expired && outing.is_approved && !outing.is_rejected).length + Student.outpasses_list.filter(outpass => !outpass.is_expired && outpass.is_approved && !outpass.is_rejected).length}) requests pending</h4>
                <p className="bg-gray-200 rounded-lg px-2 m-1 text-gray-800 italic">*Note expired requests by (date/time) won't appear here</p>
                </div>
                    {Student.outings_list.filter(outing => !outing.is_expired).length + Student.outpasses_list.filter(outpass => !outpass.is_expired).length === 0 ? (
                    <p>You have no pending requests, you can request outing/outpass above</p>
                ) : (
                    <>
                        {!Student.is_in_campus ? (
                            <>
                                <h2 className="text-center text-black text-xl m-5 font-bold">You are currently Outside the Campus (Consult your warden to update your presence)</h2>
                                {Student.outings_list.map(outing => !outing.is_expired && outing.is_approved ? (
                                    <RequestCard request={outing} email = {Student.email} type="outing" key={outing._id} />
                                ) : null)}
                                {Student.outpasses_list.map(outpass => !outpass.is_expired && outpass.is_approved ? (
                                    <RequestCard request={outpass} type="outpass" key={outpass._id} email={""} />
                                ) : null)}
                            </>
                        ) : (
                            <>
                                <h2 className="underline text-xl m-3">*Pending requests ({pendingRequests(Student.outings_list) + pendingRequests(Student.outpasses_list)})</h2>
                                {pendingRequests(Student.outings_list) == 0 || pendingRequests(Student.outpasses_list) == 0 ? <>
                                <p className="text-black text-lg m-5 italic">You don't have any pending requests</p>                                    </> : null}
                                {Student.outings_list.map(outing => !outing.is_expired && !outing.is_approved && !outing.is_rejected ? (
                                    <RequestCard request={outing} type="outing" key={outing._id} email={Student.email} />
                                ) : <>
                                </>)}
                                {Student.outpasses_list.map(outpass => !outpass.is_expired && !outpass.is_approved && !outpass.is_rejected ? (
                                    <RequestCard request={outpass} type="outpass" key={outpass._id} email={Student.email} />
                                ) : null)}

                                {completedRequests(Student.outings_list) + completedRequests(Student.outpasses_list) > 0 && (
                                    <>
                                        <h2 className="underline text-xl m-3">*Completed requests ({completedRequests(Student.outings_list) + completedRequests(Student.outpasses_list)})</h2>
                                        {Student.outings_list.map(outing => !outing.is_expired && (outing.is_approved || outing.is_rejected) ? (
                                            <RequestCard request={outing} type="outing" key={outing._id} email={Student.email} />
                                        ) : null)}
                                        {Student.outpasses_list.map(outpass => !outpass.is_expired && (outpass.is_approved || outpass.is_rejected) ? (
                                            <RequestCard request={outpass} type="outpass" key={outpass._id} email={Student.email} />
                                        ) : null)}
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}


function RequestCard({ request, type,email }: { request: any; type: 'outing' | 'outpass';email : string}) {
    return (
        <div className="shadow-lg p-4 border border-gray-600 rounded-lg bg-white m-5">
            <p className="font-semibold text-lg text-gray-800">{request._id}</p>
            <p className="my-2">
                <span className="font-semibold">Reason:</span> {request.reason}
            </p>
            <p className="my-2">
                <span className="font-semibold">Requested on :</span> {request.requested_time.split(",")[0]}
            </p>
            {type === 'outing' ? (
                <>
                    <p className="my-2">
                        <span className="font-semibold">Duration:</span> {request.from_time} to {request.to_time}
                    </p>
                </>
            ) : (
                <>
                    <p className="my-2">
                        <span className="font-semibold">No_of_days:</span> {request.no_of_days}
                    </p>
                    <p className="my-2">
                        <span className="font-semibold">Duration:</span> {request.from_day} to {request.to_day}
                    </p>
                </>
            )}
            <p className="my-2">
                <span className="font-semibold">Status:</span> {request.is_approved ? "Approved ✅" : request.is_rejected ? "Rejected ❌" : "Pending ⏳"}
            </p>
            {request.is_approved ? (
                <>
                    <p className="my-2">
                        <span className="font-semibold">Approved by:</span> {request.issued_by} at {request.issued_time.split(",")[0]}
                    </p>
                    <p className="my-2">
                        <span className="font-semibold">Message:</span> You should return by {request.to_time}
                    </p>
                </>
            ) : request.is_rejected ? (
                <>
                    <p className="my-2">
                        <span className="font-semibold">Rejected by:</span> {request.rejected_by} on {request.rejected_time.split(",")[0]}
                    </p>
                    <p className="my-2">
                        <span className="font-semibold">Message:</span> {request.message}
                    </p>
                </>
            ) : null}
            <p className="mt-4 text-sm text-gray-600">
                *We have sent you a mail to email-id <b className="font-bold text-black">{email}</b> regarding your {type} confirmation!
            </p>
        </div>
    );
}