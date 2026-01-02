
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '../utils/cn';

interface ModalProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    className?: string; // Content wrapper class
}

export function Modal({ children, isOpen, onClose, title, description, className }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden'; // Prevent scroll
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
                aria-hidden="true"
            />
            
            {/* Content */}
            <div 
                className={cn(
                    "relative w-full max-w-lg bg-white rounded-xl shadow-2xl ring-1 ring-slate-900/5 transition-all transform scale-100 opacity-100",
                    className
                )}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-start justify-between p-6 border-b border-slate-100">
                     <div>
                        {title && <h3 className="text-lg font-semibold text-slate-900 leading-none">{title}</h3>}
                        {description && <p className="text-sm text-slate-500 mt-1.5">{description}</p>}
                     </div>
                     <button 
                        onClick={onClose}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                     >
                         <X className="w-5 h-5" />
                     </button>
                </div>
                
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}