/* eslint-disable @typescript-eslint/no-explicit-any */
import { useIsAuth } from "../customhooks/is_authenticated";
import { useStudentData } from "../customhooks/student_info";
export function Student() {
    useIsAuth();
    useStudentData();
    return (
        <>
        <p className="text-center font-bold">

            Hi there

        </p>
            {/* <Sidebar content="dashboard"/> */}
        </>
    );
}
