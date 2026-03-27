import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Activity, 
  Search, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  History,
  TrendingDown,
  ChevronRight,
  Loader2,
  Database,
  Bot,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SentinelDashboard = () => {
  const [sku, setSku] = useState('RICE-SM-5KG');
  const [strategy, setStrategy] = useState('match_lowest');
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [agentState, setAgentState] = useState(null);
  const [showApproval, setShowApproval] = useState(false);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [success, setSuccess] = useState(false);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [executionLogs]);

  const runAgentTask = async () => {
    setLoading(true);
    setSuccess(false);
    setExecutionLogs([{ type: 'system', text: `Initiating ${strategy} strategy for ${sku}...` }]);
    
    try {
      const response = await axios.post('http://localhost:8000/api/run-strategy', {
        sku,
        strategy
      });
      
      setThreadId(response.data.thread_id);
      setAgentState(response.data.state);
      setExecutionLogs(prev => [
        ...prev, 
        ...response.data.state.logs.map(log => ({ 
          type: log.includes('Scout') ? 'scout' : log.includes('Analyst') ? 'analyst' : 'system', 
          text: log 
        }))
      ]);
      
      if (response.data.status === 'paused') {
        setShowApproval(true);
      }
    } catch (err) {
      console.error('Error running agent task:', err);
      setExecutionLogs(prev => [...prev, { type: 'error', text: 'Failed to start agent task.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (approve) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/approve-action', {
        thread_id: threadId,
        approve
      });
      
      setAgentState(response.data.state);
      setExecutionLogs(prev => [
        ...prev, 
        ...response.data.state.logs.slice(-1).map(log => ({ 
          type: log.includes('Executive') ? 'executive' : 'system', 
          text: log 
        }))
      ]);
      
      if (approve && response.data.status === 'completed') {
        setSuccess(true);
      }
      setShowApproval(false);
    } catch (err) {
      console.error('Error approving action:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-8 overflow-hidden">
        
        {/* Left Column: Strategy Input */}
        <div className="space-y-6 flex flex-col h-full">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-8 flex flex-col">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                <Activity size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Strategy Control</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Autonomous Pricing Engine</p>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select SKU</label>
                <select 
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="RICE-SM-5KG">RICE-SM-5KG (Sona Masoori Rice)</option>
                  <option value="OIL-SF-1L">OIL-SF-1L (Sunflower Oil)</option>
                  <option value="WHEAT-ATTA-10KG">WHEAT-ATTA-10KG (Whole Wheat Atta)</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing Strategy</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'match_lowest', label: 'Match Lowest Competitor', desc: 'Sets price to ₹0.01 below lowest found.' },
                    { id: '5_percent_under', label: 'Aggressive (5% Under)', desc: 'Undercut market leader by 5%.' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStrategy(s.id)}
                      className={`text-left p-5 rounded-2xl border transition-all ${strategy === s.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-black ${strategy === s.id ? 'text-blue-700' : 'text-slate-700'}`}>{s.label}</span>
                        {strategy === s.id && <CheckCircle2 size={16} className="text-blue-600" />}
                      </div>
                      <p className="text-[10px] font-medium text-slate-500">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={runAgentTask}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
              Run Agent Task
            </button>
          </div>
        </div>

        {/* Right Column: Thought Trace */}
        <div className="bg-slate-900 rounded-3xl flex flex-col h-full shadow-2xl overflow-hidden border border-slate-800">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Bot size={18} className="text-blue-400" />
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Agent Thought Trace</h3>
            </div>
            {loading && <div className="flex gap-1"><div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" /><div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" /><div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" /></div>}
          </div>
          
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-6 font-mono scroll-smooth"
          >
            {executionLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-50">
                <History size={40} />
                <p className="text-[10px] font-black uppercase tracking-widest">Waiting for task initialization...</p>
              </div>
            ) : (
              executionLogs.map((log, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${log.type === 'error' ? 'text-red-400' : 'text-slate-300'}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {log.type === 'scout' && <Search size={14} className="text-amber-400" />}
                    {log.type === 'analyst' && <BarChart3 size={14} className="text-blue-400" />}
                    {log.type === 'executive' && <Zap size={14} className="text-emerald-400" />}
                    {log.type === 'system' && <ChevronRight size={14} className="text-slate-500" />}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] leading-relaxed break-words">{log.text}</span>
                  </div>
                </motion.div>
              ))
            )}
            
            <AnimatePresence>
              {success && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 mt-4"
                >
                  <div className="bg-emerald-500 text-white p-1 rounded-full">
                    <CheckCircle2 size={12} />
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Database Updated Successfully</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      <AnimatePresence>
        {showApproval && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
            >
              <div className="p-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Approval Required</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">The Sentinel is paused for review</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-6">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <TrendingDown size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Proposed Action</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                    "{agentState?.last_action_summary}"
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/50">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">SKU</p>
                      <p className="text-xs font-black text-slate-900">{sku}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Price</p>
                      <p className="text-xs font-black text-blue-600">₹{agentState?.recommended_price}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => handleApproval(false)}
                    className="flex-1 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleApproval(true)}
                    className="flex-1 px-8 py-5 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={14} /> Approve & Execute
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SentinelDashboard;
