import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Zap, Eye, EyeOff, LayoutDashboard, Database, Activity, Bot, User, Send, RefreshCw } from 'lucide-react';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import ChatContainer from './components/ChatContainer';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [transparencyMode, setTransparencyMode] = useState(false);
  const [insights, setInsights] = useState([]);

  const fetchInsights = async () => {
    try {
      const response = await axios.get('http://localhost:8000/insights');
      setInsights(response.data.trends);
    } catch (err) {
      console.error('Error fetching insights:', err);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chatHistory = messages.map(m => [m.role === 'user' ? 'human' : 'assistant', m.content]);
      const response = await axios.post('http://localhost:8000/chat', {
        message: input,
        chat_history: chatHistory
      });

      const assistantMsg = { 
        role: 'assistant', 
        content: response.data.answer,
        sources: response.data.sources 
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error communicating with the Strategic Assistant.' }]);
    } finally {
      setLoading(false);
    }
  };

  const currentAssistantMsg = messages.filter(m => m.role === 'assistant').slice(-1)[0];

  return (
    <Layout 
      showTransparency={transparencyMode}
      sidebar={
        <Sidebar insights={insights} onUploadSuccess={fetchInsights} />
      }
      transparencyPanel={
        <div className="h-full flex flex-col p-8 space-y-8 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
              <Eye size={14} className="text-blue-600" /> Context Grounding
            </h3>
            <button onClick={() => setTransparencyMode(false)} className="text-slate-400 hover:text-slate-600">
              <EyeOff size={16} />
            </button>
          </div>
          
          <div className="space-y-6">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              Displaying the raw retrieval chunks utilized by the model for the most recent query.
            </p>
            
            <AnimatePresence mode="wait">
              {currentAssistantMsg?.sources ? (
                <div className="space-y-6">
                  {currentAssistantMsg.sources.map((source, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4"
                    >
                      <div className="flex items-center gap-2">
                        <Database size={12} className="text-blue-600" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
                          Chunk: {source.metadata.source_name}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium leading-relaxed text-slate-600 font-mono bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {source.full_content}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30 grayscale">
                  <Database size={40} className="text-slate-300" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Active Grounding Context</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      }
    >
      {/* Header with Dashboard Controls */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Context: Global</span>
            <span className="text-slate-200 text-xs font-black">/</span>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Merchant Intelligence</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center bg-slate-100 p-1 rounded-full shadow-inner border border-slate-200">
            <button 
              onClick={() => setTransparencyMode(false)}
              className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${!transparencyMode ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Standard
            </button>
            <button 
              onClick={() => setTransparencyMode(true)}
              className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${transparencyMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Eye size={12} /> Transparency
            </button>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Shield size={14} fill="currentColor" />
            <span className="text-[10px] font-black uppercase tracking-widest">Grounding Shield Enabled</span>
          </div>
        </div>
      </header>

      {/* Main Chat Canvas */}
      <ChatContainer 
        messages={messages}
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        loading={loading}
      />
    </Layout>
  );
};

export default App;
