import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { student } from "../store";
import { STUDENT_INFO } from "../api/endpoints";

interface StudentData {
  _id: string;
  name: string;
  email: string;
  username: string;
  gender: string;
  is_in_campus: boolean;
  has_pending_requests: boolean;
}

interface StudentInfoResponse {
  success: boolean;
  student?: StudentData;
  msg?: string;
}

export function useStudentData() {
  const setStudent = useSetRecoilState(student);
  const currentStudent = useRecoilValue(student);

  useEffect(() => {
    const fetchStudentData = async () => {
      const tokenStr = localStorage.getItem("student_token");
      
      // If no token or if we already have student data, skip
      if (!tokenStr || (currentStudent?.username && currentStudent?.email)) {
        return;
      }

      const token = tokenStr.replace(/^"|"$/g, '');

      try {
        const res = await fetch(STUDENT_INFO, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}), // Rely on token for username
        });

        const data: StudentInfoResponse = await res.json();

        if (res.ok && data.success && data.student) {
          //@ts-ignore
          setStudent(data.student);
        } else {
             // If token is invalid or expired, maybe clear it?
             if (res.status === 401 || res.status === 403) {
                 console.warn("Invalid token during fetch");
             }
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();
  }, [setStudent, currentStudent]);
}