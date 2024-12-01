/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRecoilValue } from "recoil";
import { useIsAuth } from "../customhooks/is_authenticated";
import { useStudentData } from "../customhooks/student_info";
import { student } from "../store";
export function Student() {
    useIsAuth();
    useStudentData();
    const username = useRecoilValue(student);
    return (
        <>
        <p className="text-center font-bold first-letter:text-2xl">
            Welcome back , {username.name.toString()} <br />
            Seems like you've got some work here! Let's make it done together.
        </p>
        </>
    );
}
