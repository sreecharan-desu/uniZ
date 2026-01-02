
// Minimal utility for transitions that falls back to CSS logic mostly
// but keeps structure compatible if we ever want to re-add motion.
import { ReactNode } from 'react';

interface TransitionProps {
    children: ReactNode;
    type?: 'page' | 'component' | 'list' | 'modal';
    delay?: number;
    className?: string; // Add className prop
}

export const PageTransition = ({ children, className }: TransitionProps) => {
    // Just a div wrapper that can accept classes - removing framer motion logic
    // We rely on simple CSS animations or no animation for sharpness.
    return (
        <div className={`animate-in fade-in duration-300 slide-in-from-bottom-2 ${className || ''}`}>
            {children}
        </div>
    );
};

export const ListItemTransition = ({ children }: { children: ReactNode; index?: number }) => {
    return (
        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
            {children}
        </div>
    );
};