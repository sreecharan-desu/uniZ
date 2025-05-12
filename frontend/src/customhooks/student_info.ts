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
    // Check if student data is already available in Recoil
    if (
      currentStudent?.name &&
      currentStudent?.email &&
      currentStudent?.username
    ) {
      console.log("Student data already available in Recoil, skipping API call.");
      return;
    }

    // Check if data is cached in sessionStorage
    const cachedData = sessionStorage.getItem("studentData");
    const hasFetched = sessionStorage.getItem("studentDataFetched");
    if (cachedData && hasFetched === "true") {
      try {
        const parsedData = JSON.parse(cachedData);
        if (
          parsedData.name &&
          parsedData.email &&
          parsedData.username
        ) {
          setStudent(parsedData);
          console.log("Loaded student data from sessionStorage.");
          return;
        }
      } catch (error) {
        console.error("Failed to parse cached student data:", error);
      }
    }

    // Proceed with API call if no valid data is available
    const localStorageUsername = localStorage.getItem("username");
    const token = localStorage.getItem("student_token");

    if (localStorageUsername && token) {
      const username = JSON.parse(localStorageUsername);
      const getDetails = async () => {
        try {
          const bodyData = JSON.stringify({ username });
          const res = await fetch(STUDENT_INFO, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${JSON.parse(token)}`,
            },
            body: bodyData,
          });

          const data: StudentInfoResponse = await res.json();

          if (res.ok && data.success && data.student) {
            //@ts-expect-error ---
            setStudent(data.student);
            // Cache data in sessionStorage
            sessionStorage.setItem("studentData", JSON.stringify(data.student));
            sessionStorage.setItem("studentDataFetched", "true");
            console.log("Fetched and cached student data.");
          } else {
            toast.error(data.msg || "Failed to fetch student data.");
          }
        } catch (error: any) {
          console.error("Error fetching student data:", error);
          toast.error(
            error.name === "TypeError"
              ? "Network error. Please check your connection."
              : "An error occurred while fetching student data."
          );
        }
      };

      getDetails();
    } else {
      console.log("Missing username or token, skipping API call.");
      // toast.warn("Please sign in to access student data.");
    }
  }, [setStudent, currentStudent]);
}