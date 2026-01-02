
import { useState, useCallback, useEffect } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { adminUsername } from "../../store";
import { useIsAuth } from "../../hooks/is_authenticated";
import { toast } from "react-toastify";
import { ADMIN_RESET_PASS } from "../../api/endpoints";
import { ArrowLeft, CheckCircle, XCircle, ShieldCheck, Lock, AlertTriangle } from "lucide-react";
import { cn } from "../../utils/cn";

interface ResetPasswordResponse {
  success: boolean;
  msg: string;
}

export default function Settings() {
  useIsAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRePassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigateTo = useNavigate();
  const username = useRecoilValue(adminUsername);

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  });

  // Handle input change
  const handleInputChange = useCallback(
    (setter: any) => (event: any) => {
      setter(event.target.value);
    },
    []
  );

  // Validate password strength
  const validatePassword = useCallback((pwd: any) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
      case 0:
      case 1:
        return { score, label: "Weak", color: "bg-red-500" };
      case 2:
        return { score, label: "Moderate", color: "bg-amber-500" };
      case 3:
        return { score, label: "Strong", color: "bg-emerald-500" };
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
    if (!username) {
      toast.error("User data not available. Please try again.");
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("admin_token");

    if (!token) {
      toast.error("Authentication token missing. Please sign in again.");
      setIsLoading(false);
      navigateTo("/admin/signin");
      return;
    }

    const bodyData = JSON.stringify({
      username,
      password: oldPassword,
      new_password: password,
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); 

      const res = await fetch(ADMIN_RESET_PASS, {
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
        localStorage.removeItem("admin_token");
        setTimeout(() => {
          navigateTo("/admin/signin");
        }, 2000);
      } else {
         toast.error(data.msg || "Failed to reset password.");
      }
    } catch (error: any) {
        toast.error("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
         <button
            onClick={() => navigateTo("/admin")}
            className="mb-8 inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
            {/* Form Section */}
            <div className="md:w-3/5 p-8 lg:p-12">
               <div className="mb-8">
                  <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-900">
                      <Lock className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
                  <p className="text-slate-500 mt-1">Enhance your account security with a strong password.</p>
               </div>
               
               <div className="space-y-6">
                    <div>
                        <Input
                            label="Current Password"
                            type="password"
                            onchangeFunction={handleInputChange(setOldPassword)}
                            placeholder="Enter current password"
                        />
                    </div>

                    <div>
                        <Input
                            label="New Password"
                            type="password"
                            onchangeFunction={handleInputChange(setPassword)}
                            placeholder="Enter new password"
                        />
                         {password && (
                            <div className="mt-2.5">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-slate-500 font-medium">Strength</span>
                                    <span className={cn("font-bold capitalize", 
                                        passwordStrength.score === 3 ? "text-emerald-600" :
                                        passwordStrength.score === 2 ? "text-amber-600" : "text-red-500"
                                    )}>
                                        {passwordStrength.label}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className={cn("h-full transition-all duration-300", passwordStrength.color)} 
                                        style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <Input
                            label="Confirm New Password"
                            type="password"
                            onchangeFunction={handleInputChange(setRePassword)}
                            placeholder="Re-enter new password"
                        />
                          {password && repassword && (
                            <div className="mt-2 flex items-center text-xs font-medium">
                                {password === repassword ? (
                                    <span className="text-emerald-600 flex items-center gap-1.5">
                                        <CheckCircle className="w-3.5 h-3.5" /> Passwords match
                                    </span>
                                ) : (
                                    <span className="text-red-500 flex items-center gap-1.5">
                                        <XCircle className="w-3.5 h-3.5" /> Passwords do not match
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <Button 
                            value="Reset Password"
                            loading={isLoading}
                            onclickFunction={sendDataToBackend}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        />
                    </div>
               </div>
            </div>

             {/* Sidebar Info */}
             <div className="md:w-2/5 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-8 lg:p-12 flex flex-col justify-between">
                 <div>
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-6">
                        <ShieldCheck className="w-5 h-5 text-blue-600" /> Security Requirements
                    </h3>
                    
                    <ul className="space-y-4">
                        <RequirementItem 
                            met={password.length >= 8} 
                            text="At least 8 characters long" 
                        />
                        <RequirementItem 
                            met={/[0-9]/.test(password)} 
                            text="Include at least one number" 
                        />
                        <RequirementItem 
                            met={/[^A-Za-z0-9]/.test(password)} 
                            text="Include one special character" 
                        />
                    </ul>
                 </div>

                 <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mt-8">
                     <div className="flex gap-3">
                         <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                         <p className="text-sm text-blue-800 leading-relaxed">
                             For security reasons, you will be automatically logged out after successfully changing your password.
                         </p>
                     </div>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
    return (
        <li className="flex items-start gap-3">
            <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                met ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-400"
            )}>
                {met ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-slate-400" />}
            </div>
            <span className={cn("text-sm font-medium transition-colors", met ? "text-slate-900" : "text-slate-500")}>
                {text}
            </span>
        </li>
    );
}