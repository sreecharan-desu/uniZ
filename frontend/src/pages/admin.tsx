import { useNavigate } from "react-router";
import { Button } from "../components/button";
import { useAdminname } from "../customhooks/adminname";
import { useIsAuth } from "../customhooks/is_authenticated";
import { useRecoilValue } from "recoil";
import { offCampus, outings, outpasses } from "../store";
import { useGetOutpasses } from "../customhooks/getoutpassess";
import { useGetOutings } from "../customhooks/getoutings";
import { useOutsideCampus } from "../customhooks/outsidecampus";

export function Admin() {
    useIsAuth();
    useAdminname();
    const navigateTo = useNavigate();
    useGetOutpasses();
    useGetOutings();
    useOutsideCampus();
    const Outpasses = useRecoilValue(outpasses);
    const Outings = useRecoilValue(outings);
    const students = useRecoilValue(offCampus);

    return (
        <div className="grid grid-cols-1 lg:grid lg:grid-cols-4 justify-center place-content-center text-center items-center space-x-4 m-4">
            <div className="m-1 ml-4 lg:ml-0">
            <Button
                onclickFunction={() => navigateTo('/admin/approveouting')}
                value={`OutingRequests (${Outings.length})`} loading={false}            />
            </div>
            <div className="m-1">
            <Button
                onclickFunction={() => navigateTo('/admin/approveoutpass')}
                value={`OutpassRequests (${Outpasses.length})`} loading={false}            />
            </div>
                <div className="m-1">
                <Button
                onclickFunction={() => navigateTo('/admin/updatestudentstatus')}
                value={`Students outside campus (${students.length})`} loading={false}            />
                </div>
                <div className="m-1">
                <Button
                onclickFunction={() => navigateTo('/admin/searchstudents')}
                value={`Search students`} loading={false}            />
                </div>
        </div>
    );
}
