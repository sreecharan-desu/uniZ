
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-center gap-2 mt-6", className)}>
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-slate-200 enabled:hover:bg-slate-50 disabled:opacity-50 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .map((p, i, arr) => (
            <div key={p} className="flex items-center">
              {i > 0 && arr[i-1] !== p - 1 && <span className="px-2 text-slate-400">...</span>}
              <button
                onClick={() => onPageChange(p)}
                className={cn(
                  "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                  currentPage === p
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 hover:bg-slate-50 text-slate-600"
                )}
              >
                {p}
              </button>
            </div>
          ))}
      </div>

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-slate-200 enabled:hover:bg-slate-50 disabled:opacity-50 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
