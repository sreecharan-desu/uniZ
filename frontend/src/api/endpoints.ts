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
export const SEARCH_STUDENTS = `${BASE_URL}/admin/searchstudent`; // Handled by legacy or students router
export const UPDATE_STUDENT_STATUS = `${BASE_URL}/admin/pass/updatestudentstatus`;


// Student endpoints
export const STUDENT_INFO = `${BASE_URL}/student/getdetails`;
export const REQUEST_OUTING = `${BASE_URL}/student/requestouting`;
export const REQUEST_OUTPASS = `${BASE_URL}/student/requestoutpass`;
export const RESET_PASS = `${BASE_URL}/student/resetpass`;

  // --------------------------
  //  Reset Password APIs (students)
  //  NOTE: Update endpoints below if your backend uses a different base path.
  // --------------------------
  export const FORGOT_PASS_ENDPOINT = `${BASE_URL}/student/forgotpass`; // POST { username }
  export const VERIFY_OTP_ENDPOINT = `${BASE_URL}/student/verifyotp`; // POST { username, otp }
  export const SET_NEW_PASS_ENDPOINT = `${BASE_URL}/student/setnewpass`; // PUT { username, otp, new_password }

// Common endpoints
export const SIGNIN = (type: "student" | "admin") => `${BASE_URL}/${type}/signin`;
export const SIGNUP = (type: "student" | "admin") => `${BASE_URL}/${type}/signup`;
