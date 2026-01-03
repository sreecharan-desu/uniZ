
import { memo } from 'react';
import { motion } from 'framer-motion';

export const InfoCard = memo(({ icon, label, name, value, editable, isEditing, isLoading, onValueChange, type = 'text', fullWidth }: any) => {
    const handleChange = (e: any) => onValueChange(name, e.target.value);
  
    return (
      <div 
        className={`bg-white p-5 rounded-2xl border border-neutral-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.02)] hover:border-neutral-200 transition-all ${fullWidth ? 'col-span-full' : ''}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="p-2 bg-neutral-50 rounded-lg text-neutral-500">{icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</span>
        </div>
        
        {isLoading ? (
          <div className="bg-neutral-50 rounded w-3/4 h-7 animate-pulse"></div>
        ) : isEditing && editable ? (
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            className="w-full bg-neutral-50 text-black text-base font-medium p-2 rounded-lg border border-neutral-100 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
            autoComplete="off"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        ) : (
          <p className="text-neutral-900 text-lg font-semibold truncate leading-tight tracking-tight">
            {value ? value : <span className="text-neutral-300 font-normal italic text-sm">Not Provided</span>}
          </p>
        )}
      </div>
    );
  });
