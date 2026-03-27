import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const TransparencyToggle = ({ active, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        active 
          ? 'bg-founder-gold text-founder-blue shadow-inner' 
          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
      }`}
    >
      {active ? <Eye size={16} /> : <EyeOff size={16} />}
      <span>{active ? 'Transparency Mode ON' : 'Transparency Mode OFF'}</span>
    </button>
  );
};

export default TransparencyToggle;
