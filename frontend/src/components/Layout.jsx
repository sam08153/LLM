import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for Tailwind class merging
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Layout = ({ children, sidebar, transparencyPanel, showTransparency }) => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-72 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col shadow-sm z-20">
        {sidebar}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-white">
        <div className="flex-1 flex overflow-hidden">
          {/* Central Canvas */}
          <div className={cn(
            "flex-1 flex flex-col transition-all duration-500 ease-in-out",
            showTransparency ? "mr-96" : "mr-0"
          )}>
            {children}
          </div>

          {/* Transparency Mode Side Panel */}
          <aside className={cn(
            "fixed right-0 top-0 bottom-0 w-96 bg-slate-50 border-l border-slate-200 transition-transform duration-500 ease-in-out z-10",
            showTransparency ? "translate-x-0" : "translate-x-full"
          )}>
            {transparencyPanel}
          </aside>
        </div>

        {/* Floating Health Footer */}
        <footer className="h-10 border-t border-slate-100 bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> System: Operational</span>
            <span className="flex items-center gap-1.5">Model: <span className="text-slate-600">GPT-4o</span></span>
            <span className="flex items-center gap-1.5">DB: <span className="text-slate-600">PGVector</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span>Latency: <span className="text-slate-600">242ms</span></span>
            <span>Shopaluru v2.4.0</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
