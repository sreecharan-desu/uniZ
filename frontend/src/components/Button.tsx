import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    // Legacy support to be removed
    value?: string;
    onclickFunction?: () => void;
    loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, loading, children, value, disabled, onclickFunction, onClick, ...props }, ref) => {
        const variants = {
            primary: "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-700 shadow-sm",
            secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-sm",
            outline: "border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700",
            danger: "bg-black text-white hover:bg-slate-800 shadow-sm",
            ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 py-2 text-sm",
            lg: "h-12 px-6 text-base",
        };

        const finalIsLoading = isLoading || loading;
        const finalOnClick = onClick || onclickFunction;

        return (
            <button
                ref={ref}
                onClick={finalOnClick}
                disabled={disabled || finalIsLoading}
                className={cn(
                    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {finalIsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {/* Legacy 'value' prop or children */}
                {!finalIsLoading && (children || value)}
                {finalIsLoading && value && !children ? "Loading..." : null}
                {finalIsLoading && children}
            </button>
        );
    }
);

Button.displayName = "Button";
