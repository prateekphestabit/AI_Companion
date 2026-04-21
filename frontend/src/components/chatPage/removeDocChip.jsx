import React from 'react';
import { FileText, X } from 'lucide-react';

const RemoveDocChip = ({ file, setFile }) => {
  const fileSize = (file.size / 1024).toFixed(1);

  return (
    <div className="flex items-center gap-3 bg-[#1a1a2e]/80 border border-white/10 rounded-xl px-3 py-2 mb-3 w-fit backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
        <FileText size={16} className="text-indigo-400" />
      </div>
      
      <div className="flex flex-col">
        <span className="text-xs font-medium text-slate-200 max-w-[150px] truncate">
          {file.name}
        </span>
        <span className="text-[10px] text-slate-500 font-medium">
          {fileSize} KB
        </span>
      </div>

      <button 
        onClick={() => setFile(null)}
        className="ml-2 p-1.5 hover:bg-white/10 rounded-full transition-all duration-200 group active:scale-90"
        title="Remove document"
      >
        <X size={14} className="text-slate-500 group-hover:text-rose-400" />
      </button>
    </div>
  );
};

export default RemoveDocChip;
