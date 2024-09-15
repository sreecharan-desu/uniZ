/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router";
import { Button } from "../components/button";
import { useIsAuth } from "../customhooks/is_authenticated";
import { useStudentData } from "../customhooks/student_info";
import { useRecoilValue } from "recoil";
import { student } from "../store";

function RequestCard({ request, type }: { request: any; type: 'outing' | 'outpass'; }) {
    return (
        <div className="shadow-lg p-4 border border-gray-200 rounded-lg bg-white">
            <p className="font-semibold text-lg text-gray-800">{request._id}</p>
            <p className="my-2">
                <span className="font-semibold">Reason:</span> {request.reason}
            </p>
            <p className="my-2">
                <span className="font-semibold">Requested time:</span> {request.requested_time}
            </p>
            {type === 'outing' ? (
                <>
                    <p className="my-2">
                        <span className="font-semibold">No_of_days:</span> {request.no_of_days}
                    </p>
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
                <span className="font-semibold">Status:</span> {request.is_approved ? "Approved" : request.is_rejected ? "Rejected" : "Pending"}
            </p>
            {request.is_approved ? (
                <>
                    <p className="my-2">
                        <span className="font-semibold">Approved by:</span> {request.issued_by} at {request.issued_time}
                    </p>
                    <p className="my-2">
                        <span className="font-semibold">Message:</span> You should return by {request.to_time}
                    </p>
                </>
            ) : request.is_rejected ? (
                <>
                    <p className="my-2">
                        <span className="font-semibold">Rejected by:</span> {request.rejected_by} at {request.rejected_time}
                    </p>
                    <p className="my-2">
                        <span className="font-semibold">Message:</span> {request.message}
                    </p>
                </>
            ) : null}
            <p className="mt-4 text-sm text-gray-600">
                *We have sent you a mail to email-id <b>{request.email}</b> regarding your {type} confirmation!
            </p>
        </div>
    );
}

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
                <Button onclickFunction={() => navigateTo('/student/requestouting')} value="Request Outing" />&nbsp;
                <Button onclickFunction={() => navigateTo('/student/requestoutpass')} value="Request Outpass" />&nbsp;
                <Button onclickFunction={() => navigateTo('/student/resetpassword')} value="Reset Password" />&nbsp;
            </div>
            <div className="m-5">
                <h4>Your requests ({Student.outings_list.filter(outing => !outing.is_expired).length + Student.outpasses_list.filter(outpass => !outpass.is_expired).length})</h4>
                *Note expired requests by (date/time) won't appear here
                {Student.outings_list.filter(outing => !outing.is_expired).length + Student.outpasses_list.filter(outpass => !outpass.is_expired).length === 0 ? (
                    <p>You have no pending requests, you can request outing/outpass above</p>
                ) : (
                    <>
                        {!Student.is_in_campus ? (
                            <>
                                <h2>You are currently Outside the Campus (Consult your warden to update your presence)</h2>
                                {Student.outings_list.map(outing => !outing.is_expired && outing.is_approved ? (
                                    <RequestCard request={outing} type="outing" key={outing._id} />
                                ) : null)}
                                {Student.outpasses_list.map(outpass => !outpass.is_expired && outpass.is_approved ? (
                                    <RequestCard request={outpass} type="outpass" key={outpass._id} />
                                ) : null)}
                            </>
                        ) : (
                            <>
                                <h2>Pending requests ({pendingRequests(Student.outings_list) + pendingRequests(Student.outpasses_list)})</h2>
                                {Student.outings_list.map(outing => !outing.is_expired && !outing.is_approved && !outing.is_rejected ? (
                                    <RequestCard request={outing} type="outing" key={outing._id} />
                                ) : null)}
                                {Student.outpasses_list.map(outpass => !outpass.is_expired && !outpass.is_approved && !outpass.is_rejected ? (
                                    <RequestCard request={outpass} type="outpass" key={outpass._id} />
                                ) : null)}

                                {completedRequests(Student.outings_list) + completedRequests(Student.outpasses_list) > 0 && (
                                    <>
                                        <h2>Completed requests ({completedRequests(Student.outings_list) + completedRequests(Student.outpasses_list)})</h2>
                                        {Student.outings_list.map(outing => !outing.is_expired && (outing.is_approved || outing.is_rejected) ? (
                                            <RequestCard request={outing} type="outing" key={outing._id} />
                                        ) : null)}
                                        {Student.outpasses_list.map(outpass => !outpass.is_expired && (outpass.is_approved || outpass.is_rejected) ? (
                                            <RequestCard request={outpass} type="outpass" key={outpass._id} />
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
