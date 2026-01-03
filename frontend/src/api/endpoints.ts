export const BASE_URL = import.meta.env.VITE_API_URL || (
  process.env.NODE_ENV === "production"
    ? "https://uni-z-api.vercel.app/api/v1"
    : "http://localhost:3000/api/v1"
);

// Admin endpoints
export const GET_OUTING_REQUESTS = `${BASE_URL}/admin/pass/getrequests?type=outing`;
export const GET_OUTPASS_REQUESTS = `${BASE_URL}/admin/pass/getrequests?type=outpass`;
export const STUDENT_OUTSIDE_CAMPUS = `${BASE_URL}/admin/pass/getstudentsoutsidecampus`;
export const APPROVE_OUTING = `${BASE_URL}/admin/pass/approveouting`;
export const REJECT_OUTING = `${BASE_URL}/admin/pass/rejectouting`;
export const APPROVE_OUTPASS = `${BASE_URL}/admin/pass/approveoutpass`;
export const REJECT_OUTPASS = `${BASE_URL}/admin/pass/rejectoutpass`;
export const FORWARD_OUTING = `${BASE_URL}/admin/pass/forwardouting`;
export const FORWARD_OUTPASS = `${BASE_URL}/admin/pass/forwardoutpass`;
export const SEARCH_STUDENTS = `${BASE_URL}/admin/searchstudent`; 
export const SEARCH_STUDENTS_LIST = `${BASE_URL}/admin/getstudents`;
export const ADMIN_STUDENT_HISTORY = (id: string) => `${BASE_URL}/admin/student/${id}/history`;
export const UPDATE_STUDENT_STATUS = `${BASE_URL}/admin/pass/updatestudentstatus`;
export const ADMIN_RESET_PASS = `${BASE_URL}/admin/resetpass`;
export const GET_ATTENDANCE = `${BASE_URL}/student/getattendance`;
export const GET_GRADES = `${BASE_URL}/student/getgrades`;
export const UPDATE_DETAILS = `${BASE_URL}/student/updatedetails`;
export const GET_SEMESTERS = `${BASE_URL}/student/getsemesters`;


// Student endpoints
export const STUDENT_INFO = `${BASE_URL}/student/getdetails`;
export const REQUEST_OUTING = `${BASE_URL}/student/requestouting`;
export const REQUEST_OUTPASS = `${BASE_URL}/student/requestoutpass`;
export const STUDENT_HISTORY = `${BASE_URL}/student/history`;
export const RESET_PASS = `${BASE_URL}/student/resetpass`;

  // --------------------------
  //  Reset Password APIs (students)
  //  NOTE: Update endpoints below if your backend uses a different base path.
  // --------------------------
  export const FORGOT_PASS_ENDPOINT = `${BASE_URL}/student/forgotpass`; // POST { username }
  export const VERIFY_OTP_ENDPOINT = `${BASE_URL}/student/verifyotp`; // POST { username, otp }
  export const SET_NEW_PASS_ENDPOINT = `${BASE_URL}/student/setnewpass`; // PUT { username, otp, new_password }

// Common endpoints
export const SIGNIN = (type: "student" | "admin" | "faculty") => `${BASE_URL}/${type}/signin`;
export const SIGNUP = (type: "student" | "admin" | "faculty") => `${BASE_URL}/${type}/signup`;
export const CREATE_FACULTY = `${BASE_URL}/admin/faculty/create`;
