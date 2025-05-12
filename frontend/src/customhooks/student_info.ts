import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { student } from "../store";
import { STUDENT_INFO } from "../apis";
import { toast } from "react-toastify";

interface StudentData {
  _id: string;
  name: string;
  email: string;
  username: string;
  gender: string;
  is_in_campus: boolean;
  has_pending_requests: boolean;
  outings_list: Array<{ _id: string; reason: string; requested_time: string }>;
  outpasses_list: Array<{ _id: string; reason: string; requested_time: string }>;
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

      // Clear sessionStorage if no credentials or different user
      const cachedUsername = sessionStorage.getItem("currentUsername");
      if (!localStorageUsername || !token || cachedUsername !== localStorageUsername) {
        sessionStorage.removeItem("studentData");
        sessionStorage.removeItem("studentDataFetched");
        sessionStorage.removeItem("currentUsername");
      }

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

      // Check sessionStorage cache
      const cachedData = sessionStorage.getItem("studentData");
      const hasFetched = sessionStorage.getItem("studentDataFetched");
      if (cachedData && hasFetched === "true" && cachedUsername === localStorageUsername) {
        try {
          const parsedData: StudentData = JSON.parse(cachedData);
          if (
            parsedData.name &&
            parsedData.email &&
            parsedData.username &&
            parsedData.username === JSON.parse(localStorageUsername || '""')
          ) {
            //@ts-ignore
            setStudent(parsedData);
            console.log("Loaded student data from sessionStorage.");
            return;
          }
        } catch (error) {
          console.error("Failed to parse cached student data:", error);
          sessionStorage.removeItem("studentData");
          sessionStorage.removeItem("studentDataFetched");
          sessionStorage.removeItem("currentUsername");
        }
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
          sessionStorage.setItem("studentData", JSON.stringify(data.student));
          sessionStorage.setItem("studentDataFetched", "true");
          sessionStorage.setItem("currentUsername", localStorageUsername);
          console.log("Fetched and cached student data.");
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