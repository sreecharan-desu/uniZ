/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRecoilValue } from "recoil";
import { useIsAuth } from "../customhooks/is_authenticated";
import { useStudentData } from "../customhooks/student_info";
import { student } from "../store";
import RequestCard from "../components/requestCard";
export function Student() {
    useIsAuth();
    useStudentData();
    const username = useRecoilValue(student);
    return (
        <>
            {!username.is_in_campus || username.has_pending_requests ? <>
                {username.outings_list.map(outing => !outing.is_expired && !outing.is_approved && !outing.is_rejected? (
                    <>
                    <h2 className="text-left ml-5 text-xl font-bold">
                        *You have {username.outings_list.filter(outing=>(!outing.is_approved && !outing.is_expired && !outing.is_rejected)).length} Pending Outing request.
                    </h2>
                    <RequestCard request={outing} email = {username.email} type="outing" key={outing._id} />
                </>) : null)}
                {username.outpasses_list.map(outpass => !outpass.is_expired && !outpass.is_approved && !outpass.is_rejected? (
                    <RequestCard request={outpass} type="outpass" key={outpass._id} email={""} />
                ) : null)}


                {username.outings_list.map(outing => !outing.is_expired && outing.is_approved && !outing.is_rejected? (
                    <>
                    <h2 className="text-left ml-5 text-lg font-bold italic">
                        *You are outside campus according to your last request listed below.Consult your warden to update your prescence in the website.
                    </h2>
                    <RequestCard request={outing} email = {username.email} type="outing" key={outing._id} />
                </>) : null)}
                {username.outpasses_list.map(outpass => !outpass.is_expired && outpass.is_approved && !outpass.is_rejected? (
                    <RequestCard request={outpass} type="outpass" key={outpass._id} email={""} />
                ) : null)}
            
            </> : <>
            
            <p className="text-center font-bold first-letter:text-2xl">
            <p className="text-center font-bold first-letter:text-2xl text-xl">
                    Welcome back , {username.name.toString()} <br />
            </p>    Seems like you've got some work here! Let's make it done together.
</p>
            </>}
        
    </>)}
