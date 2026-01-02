
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useRecoilState, useSetRecoilState } from "recoil";
import { adminUsername, is_authenticated } from "../../store";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FORGOT_PASS_ENDPOINT, SET_NEW_PASS_ENDPOINT, SIGNIN } from "../../api/endpoints";
import { User, Lock, Mail, KeyRound, ArrowLeft } from "lucide-react";

type SigninProps = {
  type: "student" | "admin";
};

interface SigninResponse {
  msg?: string;
  student_token?: string;
  admin_token?: string;
  success?: boolean;
}

export default function Signin({ type }: SigninProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"signin" | "forgot" | "verifyOtp">("signin");

  const [isLoading, setIsLoading] = useState(false);
  const [authState] = useRecoilState(is_authenticated);
  const setAdmin = useSetRecoilState<any>(adminUsername);
  const setAuth = useSetRecoilState(is_authenticated);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (authState.is_authnticated) {
      const redirectPath = authState.type === "student" ? "/student" : "/admin";
      navigate(redirectPath, { replace: true });
    }
  }, [authState, navigate]);

  const sendDataToBackend = async () => {
    if (username.trim() === "" || password.trim() === "") {
      toast.error("Username and password are required");
      return;
    }

    if (type === "student" && !username.toLowerCase().includes("o")) {
      toast.error("Student username must be your college ID (e.g., containing 'o')");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(SIGNIN(type), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data: SigninResponse = await response.json();

      if (data.msg && !data.student_token && !data.admin_token) {
        toast.error(data.msg);
        return;
      }

      if (data.student_token) {
        localStorage.setItem("student_token", JSON.stringify(data.student_token));
        localStorage.setItem("username", JSON.stringify(username.trim()));
        setAuth({ is_authnticated: true, type: "student" });
        toast.success(`Welcome back, ${username.trim()}!`);
        navigate("/student", { replace: true });
      } else if (data.admin_token) {
        localStorage.setItem("admin_token", JSON.stringify(data.admin_token));
        localStorage.setItem("username", JSON.stringify(username.trim()));
        localStorage.setItem("admin_role", (data as any).role || "admin");
        setAuth({ is_authnticated: true, type: "admin" });
        setAdmin(username.trim());
        toast.success("Welcome back, Admin!");
        navigate("/admin", { replace: true });
      }
    } catch (error: any) {
      toast.error(`Failed to sign in: ${error.message || "Network error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const requestOtp = async () => {
    if (username.trim() === "") {
      toast.error("Please enter your email/ID");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(FORGOT_PASS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data?.msg || `Failed to request OTP`);
        return;
      }

      if (data.success) {
        toast.success(data.msg || "OTP sent successfully");
        setStep("verifyOtp");
      } else {
        toast.error(data.msg || "Failed to send OTP");
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async () => {
    if (otp.trim() === "" || newPassword.trim() === "") {
      toast.error("OTP and new password are required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(SET_NEW_PASS_ENDPOINT, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), otp: otp.trim(), new_password: newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data?.msg || `Failed to reset password`);
        return;
      }

      if (data.success) {
        toast.success(data.msg || "Password reset successfully");
        setOtp("");
        setNewPassword("");
        setStep("signin");
      } else {
        toast.error(data.msg || "Failed to reset password");
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "signin") sendDataToBackend();
    if (step === "forgot") requestOtp();
    if (step === "verifyOtp") resetPassword();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-slate-900 p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 mb-4 ring-4 ring-slate-800/50">
                    {step === "signin" ? (
                        <User className="w-6 h-6 text-white" />
                    ) : step === "forgot" ? (
                        <Mail className="w-6 h-6 text-white" />
                    ) : (
                        <KeyRound className="w-6 h-6 text-white" />
                    )}
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                    {step === "signin"
                        ? type === "student" ? "Student Login" : "Administrator"
                        : step === "forgot" ? "Reset Password" : "New Credentials"
                    }
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                     {step === "signin"
                        ? "Enter your credentials to access the portal"
                        : step === "forgot"
                        ? "We'll send an OTP to your registered email"
                        : "Secure your account with a strong password"
                    }
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {step === "signin" && (
                    <div className="space-y-4">
                        <Input
                            label="Username"
                            icon={<User className="w-4 h-4" />}
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase())}
                            placeholder={type === 'student' ? 'University ID' : 'Admin ID'}
                        />
                        <Input
                            label="Password"
                            type="password"
                            icon={<Lock className="w-4 h-4" />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                        <div className="pt-2">
                             <Button 
                                className="w-full" 
                                size="lg"
                                isLoading={isLoading}
                                onClick={sendDataToBackend}
                            >
                                Sign In
                            </Button>
                        </div>
                        
                        {type === "student" && (
                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all"
                                    onClick={() => setStep("forgot")}
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {step === "forgot" && (
                     <div className="space-y-4">
                        <Input
                            label="University ID"
                            icon={<User className="w-4 h-4" />}
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase())}
                            placeholder="Enter your ID"
                        />
                         <div className="pt-2">
                             <Button 
                                className="w-full" 
                                size="lg"
                                isLoading={isLoading}
                                onClick={requestOtp}
                            >
                                Send OTP
                            </Button>
                        </div>
                        <div className="text-center pt-2">
                            <button
                                type="button"
                                className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 font-medium transition-all group"
                                onClick={() => setStep("signin")}
                            >
                                <ArrowLeft className="w-3 h-3 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Login
                            </button>
                        </div>
                     </div>
                )}

                {step === "verifyOtp" && (
                    <div className="space-y-4">
                        <Input
                            label="One-Time Password"
                            icon={<KeyRound className="w-4 h-4" />}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                        />
                        <Input
                            label="New Password"
                            type="password"
                            icon={<Lock className="w-4 h-4" />}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New strong password"
                        />
                        <div className="pt-2">
                             <Button 
                                className="w-full" 
                                size="lg"
                                isLoading={isLoading}
                                onClick={resetPassword}
                            >
                                Update Password
                            </Button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    </div>
  );
}
