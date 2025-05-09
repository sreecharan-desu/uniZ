import { useState, useCallback, useEffect } from "react";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { student } from "../store";
import { useStudentData } from "../customhooks/student_info";
import { RESET_PASS } from "../apis";
import { toast } from "react-toastify";

interface ResetPasswordResponse {
  success: boolean;
  msg: string;
}

export default function Resetpassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRePassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigateTo = useNavigate();
  useStudentData();
  const Student = useRecoilValue(student);

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  });

  // Handle input change
  const handleInputChange = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setter(event.target.value);
      },
    []
  );

  // Validate password strength
  const validatePassword = useCallback((pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
      case 0:
      case 1:
        return { score, label: "Weak", color: "bg-red-500" };
      case 2:
        return { score, label: "Moderate", color: "bg-yellow-500" };
      case 3:
        return { score, label: "Strong", color: "bg-green-500" };
      default:
        return { score: 0, label: "", color: "" };
    }
  }, []);

  // Update password strength on new password change
  useEffect(() => {
    setPasswordStrength(validatePassword(password));
  }, [password, validatePassword]);

  // Handle form submission
  const sendDataToBackend = async () => {
    // Input validation
    if (!oldPassword || !password || !repassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password !== repassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (passwordStrength.score < 3) {
      toast.error(
        "Password must be at least 8 characters long, include a number, and a special character."
      );
      return;
    }
    if (!Student?.username) {
      toast.error("User data not available. Please try again.");
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("student_token");

    if (!token) {
      toast.error("Authentication token missing. Please sign in again.");
      setIsLoading(false);
      navigateTo("/student/signin");
      return;
    }

    const bodyData = JSON.stringify({
      username: Student.username,
      password: oldPassword,
      new_password: password,
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch(RESET_PASS, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
        body: bodyData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data: ResetPasswordResponse = await res.json();

      if (res.ok && data.success) {
        toast.success(data.msg || "Password reset successfully!");
        localStorage.removeItem("student_token");
        localStorage.removeItem("username");
        // navigateTo("/student/signin");

        setTimeout(() => {
            location.href = "/student/signin";
        }
        , 2000);
      } else {
        switch (res.status) {
          case 401:
            toast.error("Invalid current password or unauthorized access.");
            break;
          case 400:
            toast.error(data.msg || "Invalid request. Please check your input.");
            break;
          case 500:
            toast.error("Server error. Please try again later.");
            break;
          default:
            toast.error(data.msg || "Failed to reset password.");
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        toast.error("Request timed out. Please try again.");
      } else {
        console.error("Error resetting password:", error);
        toast.error("An error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (

<div className="min-h-screen bg-white px-4 py-6">
  <div className="max-w-md mx-auto">
    {/* Header Card */}
    <div className="bg-white rounded-md border border-gray-200 p-6">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-black rounded-md flex items-center justify-center">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 11c0-1.104-.896-2-2-2s-2 .896-2 2v2h4v-2zm2 0c0-2.209-1.791-4-4-4s-4 1.791-4 4v2H5v5h10v-5h-1v-2zm-5 8h2v2H9v-2z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-black">Reset Password</h2>
          <p className="text-sm text-gray-700">
            Change your account password securely
          </p>
        </div>
      </div>
    </div>

    {/* Form Card */}
    <div className="bg-white rounded-md border border-gray-200 border-t-0 p-6 space-y-6">
      {/* Current Password */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Current Password
        </label>
        <div className="relative">
          <Input
            type={showOldPassword ? "text" : "password"}
            onchangeFunction={handleInputChange(setOldPassword)}
            placeholder="Enter your current password"
            // className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
          />
          <button
            type="button"
            onClick={() => setShowOldPassword(!showOldPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showOldPassword ? "Hide password" : "Show password"}
          >
      
          </button>
        </div>
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <div className="relative">
          <Input
            type={showNewPassword ? "text" : "password"}
            onchangeFunction={handleInputChange(setPassword)}
            placeholder="Enter your new password"
            // className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showNewPassword ? "Hide password" : "Show password"}
          >
 
          </button>
        </div>
        {password && (
          <div className="flex items-center space-x-2">
            <div className="h-2 w-20 rounded bg-gray-700"></div>
            <span className="text-sm text-gray-700">
              {passwordStrength.label}
            </span>
          </div>
        )}
      </div>

      {/* Confirm New Password */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Confirm New Password
        </label>
        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            onchangeFunction={handleInputChange(setRePassword)}
            placeholder="Confirm your new password"
            // className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
     
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 pt-4">
        <Button
          value={isLoading ? "Resetting..." : "Reset Password"}
          loading={isLoading}
          onclickFunction={sendDataToBackend}
          // className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-500"
        />
        <button
          onClick={() => navigateTo("/student")}
          className="w-full text-gray-700 hover:text-black font-medium py-2 transition-colors duration-200 disabled:text-gray-400"
          disabled={isLoading}
        >
          Back to Dashboard
        </button>
      </div>
    </div>

    {/* Info Card */}
    <div className="mt-6 bg-white rounded-md p-4 border border-gray-200">
      <div className="flex items-start space-x-3">
        <svg
          className="h-6 w-6 text-gray-700 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="text-sm text-gray-700">
          <p className="font-medium mb-1">Password Requirements:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Must be at least 8 characters long</li>
            <li>Include at least one number</li>
            <li>Include at least one special character</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>

  );
}