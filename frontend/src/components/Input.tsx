import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    // Legacy support
    onchangeFunction?: React.ChangeEventHandler<HTMLInputElement>;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, icon, onchangeFunction, onChange, placeholder, ...props }, ref) => {
        const [isPasswordVisible, setIsPasswordVisible] = useState(false);
        const isPassword = type === 'password';
        const finalType = isPassword ? (isPasswordVisible ? 'text' : 'password') : type;

        const finalOnChange = onChange || onchangeFunction;

        return (
            <div className="w-full space-y-1">
                {label && (
                    <label className="text-sm font-medium text-slate-700 block mb-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={finalType}
                        className={cn(
                            "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
                            icon ? "pl-10" : "",
                            isPassword ? "pr-10" : "",
                            error ? "border-red-500 focus:ring-red-500" : "",
                            className
                        )}
                        placeholder={placeholder}
                        onChange={finalOnChange}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                            {isPasswordVisible ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    )}
                </div>
                {error && (
                    <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
