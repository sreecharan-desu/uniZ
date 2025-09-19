/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Input } from "../../components/input";
import { Button } from "../../components/button";
import { useRecoilState, useSetRecoilState } from "recoil";
import { adminUsername, is_authenticated } from "../../store";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { SIGNIN } from "../../apis";

type SigninProps = {
  type: "student" | "admin";
};

interface SigninResponse {
  msg?: string;
  student_token?: string;
  admin_token?: string;
}

export default function Signin({ type }: SigninProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authState] = useRecoilState(is_authenticated); // Check auth status
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

  const usernameHandler = (event: any) => {
    setUsername(event.target.value.toLowerCase());
  };
  const passwordHandler = (event: any) => {
    setPassword(event.target.value);
  };

  // Validate and send data to backend
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
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data: SigninResponse = await response.json();

      if (data.msg) {
        toast.error(data.msg);
        return;
      }

      // Handle successful signin
      if (data.student_token) {
        localStorage.setItem("student_token", JSON.stringify(data.student_token));
        localStorage.setItem("username", JSON.stringify(username.trim()));
        setAuth({ is_authnticated: true, type: "student" });
        toast.success(`Successfully signed in as ${username.trim()}!`);
        navigate("/student", { replace: true });
      } else if (data.admin_token) {
        localStorage.setItem("admin_token", JSON.stringify(data.admin_token));
        localStorage.setItem("username", JSON.stringify(username.trim()));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // prevent page reload
    sendDataToBackend();
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-br from-white to-gray-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full text-center space-y-8"
      >
        <h1 className="text-3xl font-extrabold text-black">
          {type === "student" ? "Student Sign In" : "Admin Sign In"}
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center w-full p-8 bg-white shadow-lg rounded-2xl border border-gray-200 space-y-4"
        >
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
          <Button value="Sign In" onclickFunction={sendDataToBackend} loading={isLoading} />
          <p className="mt-4 text-gray-600 text-sm">
            Back to{" "}
            <a
              className="font-semibold text-black hover:underline cursor-pointer"
              onClick={() => navigate(`/${type}`)}
            >
              dashboard
            </a>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
