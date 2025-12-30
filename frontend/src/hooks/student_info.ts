import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { student } from "../store";
import { STUDENT_INFO } from "../api/endpoints";
import { toast } from "react-toastify";

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
      const localStorageUsername = localStorage.getItem("username");
      const token = localStorage.getItem("student_token");

      // Check Recoil state first
      if (
        currentStudent?.name &&
        currentStudent?.email &&
        currentStudent?.username &&
        currentStudent.username === JSON.parse(localStorageUsername || '""')
      ) {
        console.log("Student data already available in Recoil, skipping API call.");
        return;
      }

      // Fetch from API if no valid data
      if (!localStorageUsername || !token) {
        console.log("Missing username or token, skipping API call.");
        // toast.warn("Please sign in to access student data.");
        return;
      }

      try {
        const username = JSON.parse(localStorageUsername);
        const bodyData = JSON.stringify({ username });
        const res = await fetch(STUDENT_INFO, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JSON.parse(token)}`,
          },
          body: bodyData,
        });

        const data: StudentInfoResponse = await res.json();

        if (res.ok && data.success && data.student) {
          //@ts-ignore
          setStudent(data.student);
          console.log("Fetched student data.");
        } else {
          throw new Error(data.msg || "Failed to fetch student data.");
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
        toast.error(
          error instanceof TypeError
            ? "Network error. Please check your connection."
            : error instanceof Error
            ? error.message
            : "An error occurred while fetching student data."
        );
      }
    };

    fetchStudentData();
  }, [setStudent, currentStudent]);
}