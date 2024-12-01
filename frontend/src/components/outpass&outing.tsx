import { useRecoilValue } from "recoil";
import { student } from "../store";
import { Button } from "./button";
import { useNavigate } from "react-router";
import React from "react";
const RequestCard = React.lazy(()=>import('../components/requestCard'));
type requestProps = {
    request : "outing" | "outpass"
}
export default function Outpass_Outing({request}:requestProps){
    const Student = useRecoilValue(student);    const navigateTo = useNavigate();
    const pendingRequests = (list: any[]) => list.filter((request: any) => !request.is_approved && !request.is_rejected && !request.is_expired).length;
    return<>
        <div className="justify-center place-content-center w-full">
            <div className="flex justify-center items-center">
                {request == "outing" ? <>                <Button onclickFunction={() => navigateTo('/student/outing/requestouting')} value="Request Outing" loading={false} />&nbsp;
                </> : <>                <Button onclickFunction={() => navigateTo('/student/outpass/requestoutpass')} value="Request Outpass" loading={false} />&nbsp;
                </>}
            </div>
            <div className="m-5">
                <div className="flex justify-start">
                <h4 className="text-xl font-bold">Your have ({Student.outings_list.filter(outing => !outing.is_expired && !outing.is_approved && !outing.is_rejected).length + Student.outpasses_list.filter(outpass => !outpass.is_expired && !outpass.is_approved && !outpass.is_rejected).length}) requests pending</h4>
                </div>
                <p className="bg-gray-200 rounded-lg px-2 py-2 m-1 w-full text-gray-800 italic">**Note : Only <b className="italic">APPROVED REQUESTS</b> will be displayed here <br/>Expired requests by (date/time) and <b className="italic">INCLUDING REJECTED</b> requests won't appear here <br/> Updates about your requests will be sent to <b className="italic">{Student.email}</b></p>
                    {Student.outings_list.filter(outing => !outing.is_expired && !outing.is_rejected).length + Student.outpasses_list.filter(outpass => !outpass.is_expired && !outpass.is_rejected).length === 0 ? (
                    <p className="flex justify-center m-10 lg:m-20">You have no pending requests, you can request outing/outpass above</p>
                ) : (
                    <>
                        {!Student.is_in_campus ? (
                            <>
                                <h2 className="text-center text-black text-xl m-5 font-bold">You are considered to be Outside the Campus Since your request is approved (Consult your warden to update your presence)</h2>
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
                                {pendingRequests(Student.outings_list) == 0 && pendingRequests(Student.outpasses_list) == 0 ? <>
                                <p className="text-black text-lg m-5 italic">You don't have any pending requests</p>                                    </> : null}
                                {Student.outings_list.map(outing => !outing.is_expired && !outing.is_approved && !outing.is_rejected ? (
                                    <RequestCard request={outing} type="outing" key={outing._id} email={Student.email} />
                                ) : <>
                                </>)}
                                {Student.outpasses_list.map(outpass => !outpass.is_expired && !outpass.is_approved && !outpass.is_rejected ? (
                                    <RequestCard request={outpass} type="outpass" key={outpass._id} email={Student.email} />
                                ) : null)}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    </>
}