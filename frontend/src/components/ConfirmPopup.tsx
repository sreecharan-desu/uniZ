
import { Button } from "./Button";
import { AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

export function ConfirmModal({ open, onClose, onConfirm, message }: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
           <div className="flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-slate-100 rounded-full text-slate-900">
                  <AlertCircle size={24} />
              </div>
              <div>
                  <h3 className="text-lg font-semibold text-slate-900">Confirm Action</h3>
                  <p className="text-sm text-slate-500 mt-1">{message}</p>
              </div>
           </div>

           <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1"
              >
                Confirm
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
