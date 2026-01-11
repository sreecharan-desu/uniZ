import { useState, useCallback, useEffect } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { student } from "../../store";
import { useStudentData } from "../../hooks/student_info";
import { RESET_PASS } from "../../api/endpoints";
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
        return { score, label: "Weak", color: "bg-slate-200" };
      case 2:
        return { score, label: "Moderate", color: "bg-slate-400" };
      case 3:
        return { score, label: "Strong", color: "bg-black" };
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

        setTimeout(() => {
          navigateTo("/student/signin");
        }, 2000);
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
    <div className="min-h-screen bg-white font-sans text-neutral-900 pb-20">
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-6">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-black mb-4">Security</h1>
          <p className="text-neutral-500 font-medium text-lg">Manage your account security and password preferences.</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-[2.5rem] overflow-hidden border border-neutral-200 shadow-sm">
          <div className="md:flex">
            {/* Form Section */}
            <div className="md:w-2/3 p-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-black text-white rounded-xl">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-black tracking-tight">Change Password</h3>
                  <p className="text-sm font-medium text-neutral-500">Enter your details to update your password</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Current Password */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 block ml-1">Current Password</label>
                  <div className="relative group">
                    <Input
                      type="password"
                      onchangeFunction={handleInputChange(setOldPassword)}
                      placeholder="Enter current password"
                    //   className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 font-bold text-lg focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 block ml-1">New Password</label>
                  <div className="relative group">
                    <Input
                      type="password"
                      onchangeFunction={handleInputChange(setPassword)}
                      placeholder="Enter new password"
                    />
                  </div>
                  {password && (
                    <div className="mt-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider w-20 text-right ${passwordStrength.score === 3 ? 'text-black' :
                          passwordStrength.score === 2 ? 'text-neutral-600' : 'text-neutral-400'
                          }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2 block ml-1">Confirm Password</label>
                  <div className="relative group">
                    <Input
                      type="password"
                      onchangeFunction={handleInputChange(setRePassword)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  {password && repassword && (
                    <div className="mt-2 ml-1">
                      {password === repassword ? (
                        <p className="text-xs font-bold text-black flex items-center gap-1.5 uppercase tracking-wide">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                          Passwords match
                        </p>
                      ) : (
                        <p className="text-xs font-bold text-neutral-400 flex items-center gap-1.5 uppercase tracking-wide">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Passwords do not match
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-8 space-y-4">
                  <Button
                    value={isLoading ? "Processing..." : "Reset Password"}
                    loading={isLoading}
                    onclickFunction={sendDataToBackend}
                  // className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                  />
                  <button
                    onClick={() => navigateTo("/student")}
                    className="w-full text-neutral-500 hover:text-black font-bold py-4 rounded-xl transition-colors duration-300 flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="md:w-1/3 bg-neutral-50 p-12 border-l border-neutral-100 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  Password Strength
                </h3>

                <div className="space-y-6">
                  <div className={`flex items-center gap-3 transition-colors duration-300 ${password.length >= 8 ? 'text-black' : 'text-neutral-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${password.length >= 8 ? 'border-black bg-black text-white' : 'border-neutral-200'}`}>
                      {password.length >= 8 && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <p className="font-medium text-sm">8+ Characters</p>
                  </div>

                  <div className={`flex items-center gap-3 transition-colors duration-300 ${/[0-9]/.test(password) ? 'text-black' : 'text-neutral-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${/[0-9]/.test(password) ? 'border-black bg-black text-white' : 'border-neutral-200'}`}>
                      {/[0-9]/.test(password) && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <p className="font-medium text-sm">One Number</p>
                  </div>

                  <div className={`flex items-center gap-3 transition-colors duration-300 ${/[^A-Za-z0-9]/.test(password) ? 'text-black' : 'text-neutral-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${/[^A-Za-z0-9]/.test(password) ? 'border-black bg-black text-white' : 'border-neutral-200'}`}>
                      {/[^A-Za-z0-9]/.test(password) && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <p className="font-medium text-sm">Special Character</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-neutral-900 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-xs font-medium text-neutral-600 leading-relaxed">
                    For your security, you will be automatically logged out from all devices after successfully changing your password.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}