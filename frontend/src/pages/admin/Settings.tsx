import { useState, useCallback, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { adminUsername } from '../../store';
import { useIsAuth } from '../../hooks/is_authenticated';
import { toast } from 'react-toastify';

interface ResetPasswordResponse {
  success: boolean;
  msg: string;
}

export default function Settings() {
  useIsAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRePassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, _setShowOldPassword] = useState(false);
  const [showNewPassword, _setShowNewPassword] = useState(false);
  const [showConfirmPassword, _setShowConfirmPassword] = useState(false);
  const navigateTo = useNavigate();
  const username = useRecoilValue(adminUsername);

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: '',
  });

  // Handle input change
  const handleInputChange = useCallback(
    (setter:any) => (event:any) => {
      setter(event.target.value);
    },
    []
  );

  // Validate password strength
  const validatePassword = useCallback((pwd:any) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
      case 0:
      case 1:
        return { score, label: 'Weak', color: 'bg-gray-300' };
      case 2:
        return { score, label: 'Moderate', color: 'bg-gray-600' };
      case 3:
        return { score, label: 'Strong', color: 'bg-black' };
      default:
        return { score: 0, label: '', color: '' };
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
      toast.error('Please fill in all fields.');
      return;
    }
    if (password !== repassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwordStrength.score < 3) {
      toast.error(
        'Password must be at least 8 characters long, include a number, and a special character.'
      );
      return;
    }
    if (!username) {
      toast.error('User data not available. Please try again.');
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem('admin_token');

    if (!token) {
      toast.error('Authentication token missing. Please sign in again.');
      setIsLoading(false);
      navigateTo('/admin/signin');
      return;
    }

    const bodyData = JSON.stringify({
      username,
      password: oldPassword,
      new_password: password,
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch('https://uni-z-api.vercel.app/api/v1/admin/resetpass', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
        body: bodyData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data: ResetPasswordResponse = await res.json();

      if (res.ok && data.success) {
        toast.success(data.msg || 'Password reset successfully!');
        localStorage.removeItem('admin_token');
        setTimeout(() => {
          location.href = '/admin/signin';
        }, 2000);
      } else {
        switch (res.status) {
          case 401:
            toast.error('Invalid current password or unauthorized access.');
            break;
          case 400:
            toast.error(data.msg || 'Invalid request. Please check your input.');
            break;
          case 500:
            toast.error('Server error. Please try again later.');
            break;
          default:
            toast.error(data.msg || 'Failed to reset password.');
        }
      }
    } catch (error:any) {
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please try again.');
      } else {
        console.error('Error resetting password:', error);
        toast.error('An error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-black rounded-full flex items-center justify-center mb-4 shadow-lg">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Secure your account with a strong new password
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="md:flex">
            {/* Form Section */}
            <div className="md:w-2/3 p-8">
              <div className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative group">
                    <Input
                      type={showOldPassword ? 'text' : 'password'}
                      onchangeFunction={handleInputChange(setOldPassword)}
                      placeholder="Enter your current password"
                    />
             
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative group">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      onchangeFunction={handleInputChange(setPassword)}
                      placeholder="Enter your new password"
                    />
                   
                  </div>
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                          ></div>
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            passwordStrength.score === 3
                              ? 'text-black'
                              : passwordStrength.score === 2
                              ? 'text-gray-700'
                              : 'text-gray-500'
                          }`}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      onchangeFunction={handleInputChange(setRePassword)}
                      placeholder="Confirm your new password"
                    />
                    
                  </div>
                  {password && repassword && (
                    <div className="mt-1">
                      {password === repassword ? (
                        <p className="text-xs text-black flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Passwords match
                        </p>
                      ) : (
                        <p className="text-xs text-gray-700 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Passwords do not match
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-6 space-y-4">
                  <Button
                    value={isLoading ? 'Processing...' : 'Reset Password'}
                    loading={isLoading}
                    onclickFunction={sendDataToBackend}
                  />
                  <button
                    onClick={() => navigateTo('/admin')}
                    className="w-full text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium py-3 rounded-lg transition-colors duration-300 disabled:text-gray-400 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="md:w-1/3 bg-gray-50 p-8 border-l border-gray-200">
              <div className="h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="h-5 w-5 mr-2 text-black"
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
                  Password Requirements
                </h3>

                <div className="space-y-4 flex-grow">
                  <div className={`flex items-start ${password.length >= 8 ? 'text-black' : 'text-gray-500'}`}>
                    <svg
                      className={`h-5 w-5 mr-3 ${password.length >= 8 ? 'text-black' : 'text-gray-300'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={password.length >= 8 ? 'M5 13l4 4L19 7' : 'M20 12H4'}
                      />
                    </svg>
                    <p>At least 8 characters long</p>
                  </div>

                  <div
                    className={`flex items-start ${/[0-9]/.test(password) ? 'text-black' : 'text-gray-500'}`}
                  >
                    <svg
                      className={`h-5 w-5 mr-3 ${/[0-9]/.test(password) ? 'text-black' : 'text-gray-300'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={/[0-9]/.test(password) ? 'M5 13l4 4L19 7' : 'M20 12H4'}
                      />
                    </svg>
                    <p>Include at least one number</p>
                  </div>

                  <div
                    className={`flex items-start ${/[^A-Za-z0-9]/.test(password) ? 'text-black' : 'text-gray-500'}`}
                  >
                    <svg
                      className={`h-5 w-5 mr-3 ${/[^A-Za-z0-9]/.test(password) ? 'text-black' : 'text-gray-300'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={/[^A-Za-z0-9]/.test(password) ? 'M5 13l4 4L19 7' : 'M20 12H4'}
                      />
                    </svg>
                    <p>Include at least one special character</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 mt-auto">
                  <div className="flex items-start text-sm text-gray-600">
                    <svg
                      className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <p>For security reasons, you'll be logged out after changing your password.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}