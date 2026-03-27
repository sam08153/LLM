import React from 'react';
import { LayoutDashboard, Database, TrendingUp, History, Shield, Zap, Settings, HelpCircle, ChevronRight, Activity } from 'lucide-react';
import FileUpload from './FileUpload';

const Sidebar = ({ insights, onUploadSuccess }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-50 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100 ring-4 ring-blue-50">
          <Shield size={20} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none uppercase">Shopaluru</h1>
          <p className="text-[10px] font-black text-blue-600 mt-1 uppercase tracking-widest leading-none">Strategic AI</p>
        </div>
      </div>

      {/* Navigation Area */}
      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-100">
        {/* Core Sections */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 mb-4 flex items-center gap-2">
            <LayoutDashboard size={10} /> Dashboard
          </h3>
          <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs transition-all border border-blue-100 shadow-sm">
            <span className="flex items-center gap-3"><Zap size={14} fill="currentColor" /> Strategic Intelligence</span>
            <ChevronRight size={14} />
          </button>
          <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-50 transition-all border border-transparent">
            <span className="flex items-center gap-3"><TrendingUp size={14} /> Market Analysis</span>
          </button>
        </div>

        {/* Data Ingestion Hub */}
        <FileUpload onUploadSuccess={onUploadSuccess} />

        {/* Insight History */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 flex items-center gap-2">
            <History size={10} /> Insight History
          </h3>
          <div className="space-y-3">
            {insights.length > 0 ? (
              insights.map((trend, idx) => (
                <div key={idx} className="group relative pl-3 pr-2 py-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 cursor-default">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-blue-600/20 group-hover:bg-blue-600 rounded-full transition-all" />
                  <p className="text-[11px] font-bold text-slate-600 leading-relaxed group-hover:text-slate-900 line-clamp-2">
                    {trend}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-3 py-6 text-center border-2 border-dashed border-slate-100 rounded-xl">
                <Database size={20} className="mx-auto text-slate-200 mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Context</p>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-50 space-y-4">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Health</span>
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
              <Activity size={10} /> Active
            </span>
          </div>
          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
            <div className="w-3/4 h-full bg-blue-600 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="flex items-center justify-around text-slate-400">
          <button className="hover:text-blue-600 transition-colors"><Settings size={18} /></button>
          <button className="hover:text-blue-600 transition-colors"><HelpCircle size={18} /></button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
