/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useRecoilState, useSetRecoilState } from "recoil";
import { adminUsername, is_authenticated } from "../../store";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FORGOT_PASS_ENDPOINT, SET_NEW_PASS_ENDPOINT, SIGNIN } from "../../api/endpoints";

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

  const usernameHandler = (event: any) => setUsername(event.target.value.toLowerCase());
  const passwordHandler = (event: any) => setPassword(event.target.value);

  // --------------------------
  //  Sign In API
  // --------------------------
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
        toast.success(`Successfully signed in as ${username.trim()}!`);
        navigate("/student", { replace: true });
      } else if (data.admin_token) {
        localStorage.setItem("admin_token", JSON.stringify(data.admin_token));
        localStorage.setItem("username", JSON.stringify(username.trim()));
        localStorage.setItem("admin_role", (data as any).role || "admin");
        setAuth({ is_authnticated: true, type: "admin" });
        setAdmin(username.trim());
        toast.success("Successfully signed in as admin!");
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
      toast.error("Please enter your email");
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
        toast.error(data?.msg || `Failed to request OTP: ${response.status}`);
        return;
      }

      if (data.success) {
        toast.success(data.msg || "OTP sent to your registered email");
        setStep("verifyOtp");
      } else {
        toast.error(data.msg || "Failed to send OTP");
      }
    } catch (error: any) {
      toast.error(`Error requesting OTP: ${error.message || "Network error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // We call the setnewpass endpoint which also validates the OTP on the server side.
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
        toast.error(data?.msg || `Failed to reset password: ${response.status}`);
        return;
      }

      if (data.success) {
        toast.success(data.msg || "Password has been reset successfully. Please sign in.");
        // Clear sensitive fields
        setOtp("");
        setNewPassword("");
        setStep("signin");
      } else {
        toast.error(data.msg || "Failed to reset password");
      }
    } catch (error: any) {
      toast.error(`Error resetting password: ${error.message || "Network error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: if you want to provide a separate "Verify OTP" step before accepting a new password
  // you can implement a function that calls VERIFY_OTP_ENDPOINT and then shows a dedicated form.

  // --------------------------
  //  Submit Handler
  // --------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "signin") sendDataToBackend();
    if (step === "forgot") requestOtp();
    if (step === "verifyOtp") resetPassword();
  };

 return (
  <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-br from-white to-gray-100">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-md w-full text-center space-y-8"
    >
      <div>
        <h1 className="text-3xl font-extrabold text-black tracking-tight">
          {step === "signin"
            ? type === "student"
              ? "Student Sign In"
              : "Admin Sign In"
            : step === "forgot"
            ? "Forgot Password"
            : "Reset Password"}
        </h1>
        <p className="mt-2 text-gray-500 text-sm">
          {step === "signin"
            ? "Welcome back! Please enter your details."
            : step === "forgot"
            ? "Enter your email to receive an OTP."
            : "Set your new password to continue."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center w-full p-8 bg-white shadow-xl rounded-2xl border border-gray-200 space-y-5"
      >
        {/* Signin Form */}
        {step === "signin" && (
          <>
            <Input
              type="text"
              onchangeFunction={usernameHandler}
              placeholder="Username"
            />
            <Input
              type="password"
              onchangeFunction={passwordHandler}
              placeholder="Password"
            />
            <Button
              value="Sign In"
              onclickFunction={sendDataToBackend}
              loading={isLoading}
            />

            {type === "student" && (
              <p
                className="mt-2 text-sm text-blue-600 cursor-pointer hover:underline transition"
                onClick={() => setStep("forgot")}
              >
                Forgot password?
              </p>
            )}
          </>
        )}

        {/* Forgot Password (students only) */}
        {type === "student" && step === "forgot" && (
          <>
            <Input
              type="text"
              onchangeFunction={usernameHandler}
              placeholder="Enter your email"
            />
            <Button
              value="Send OTP"
              onclickFunction={requestOtp}
              loading={isLoading}
            />
            <p
              className="mt-2 text-sm text-gray-500 cursor-pointer hover:underline transition"
              onClick={() => setStep("signin")}
            >
              Back to Sign In
            </p>
          </>
        )}

        {/* Reset Password (students only) */}
        {type === "student" && step === "verifyOtp" && (
          <>
            <Input
              type="text"
              onchangeFunction={(e: any) => setOtp(e.target.value)}
              placeholder="Enter OTP"
            />
            <Input
              type="password"
              onchangeFunction={(e: any) => setNewPassword(e.target.value)}
              placeholder="Enter New Password"
            />
            <Button
              value="Reset Password"
              onclickFunction={resetPassword}
              loading={isLoading}
            />
          </>
        )}
      </form>
    </motion.div>
  </div>
);

}
