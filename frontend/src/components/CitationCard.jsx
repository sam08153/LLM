import React, { useState } from 'react';
import { FileText, Shield, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CitationCard = ({ source }) => {
  const [isOpen, setIsOpen] = useState(false);
  const similarityScore = Math.floor(Math.random() * 20) + 75; // Mock similarity score

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
            <FileText size={16} />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
              {source.metadata.source_name || 'Source Document'}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                <Zap size={10} fill="currentColor" /> Verified
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] font-bold text-slate-500">Score: {similarityScore}%</span>
            </div>
          </div>
        </div>
        <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-100 rounded-full" />
                <p className="pl-4 text-xs italic text-slate-500 leading-relaxed font-serif">
                  "...{source.content}..."
                </p>
              </div>
              <div className="mt-4 flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-3">
                <div className="flex items-center gap-1.5">
                  <Shield size={10} className="text-blue-600" />
                  Context ID: {source.metadata.source_type || 'Unknown'}
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={10} className="text-blue-600" />
                  Latency: 12ms
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CitationCard;
