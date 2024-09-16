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
        <div className="flex-col lg:flex justify-center place-content-center text-center items-center space-x-4 m-4">
            <Button
                onclickFunction={() => navigateTo('/admin/approveouting')}
                value={`OutingRequests (${Outings.length})`} loading={false}            />
            <Button
                onclickFunction={() => navigateTo('/admin/approveoutpass')}
                value={`OutpassRequests (${Outpasses.length})`} loading={false}            />
            <Button
                onclickFunction={() => navigateTo('/admin/updatestudentstatus')}
                value={`Students outside campus (${students.length})`} loading={false}            />
            <Button
                onclickFunction={() => navigateTo('/admin/searchstudents')}
                value={`Search students`} loading={false}            />
        </div>
    );
}
