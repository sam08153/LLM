import React from 'react';
import { Send, User, Bot, RefreshCw, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import CitationCard from './CitationCard';
import { motion, AnimatePresence } from 'framer-motion';

const ChatContainer = ({ messages, input, setInput, sendMessage, loading }) => {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-8 py-10 space-y-10 scrollbar-thin scrollbar-thumb-slate-200">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mt-24 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto text-white shadow-xl shadow-blue-200 rotate-3 hover:rotate-0 transition-transform duration-500">
                <Bot size={40} />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">Merchant <span className="text-blue-600">Intelligence</span></h2>
                <p className="text-slate-500 mt-3 font-medium text-lg leading-relaxed">
                  Analyze reviews, market reports, and tickets.<br />Extract high-impact strategic insights.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 pt-6">
                {["Summarize customer complaints", "Bangalore delivery trends", "Review wrap supplier"].map((hint, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(hint)}
                    className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-6 max-w-4xl mx-auto ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-100 ring-4 ring-blue-50">
                    <Bot size={20} />
                  </div>
                )}
                
                <div className={`flex flex-col gap-4 max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                  <div className={`rounded-2xl px-6 py-4 shadow-sm border ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-blue-100' 
                      : 'bg-white text-slate-800 border-slate-200'
                  }`}>
                    <div className="prose prose-sm max-w-none prose-slate prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-600 prose-p:leading-relaxed prose-li:leading-relaxed">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>

                  {msg.role === 'assistant' && msg.sources && (
                    <div className="space-y-3 w-full animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center gap-2 px-1">
                        <Zap size={12} className="text-blue-600 fill-blue-600" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grounding Citations</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {msg.sources.map((source, sIdx) => (
                          <CitationCard key={sIdx} source={source} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-lg shadow-slate-200 ring-4 ring-slate-50">
                    <User size={20} />
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-8 bg-white border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-4 relative">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query the Merchant Intelligence Engine..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 focus:bg-white outline-none transition-all pr-16 text-sm font-semibold text-slate-900"
              disabled={loading}
            />
            <div className="absolute right-2 top-2 bottom-2">
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-full px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:grayscale disabled:scale-100 shadow-lg shadow-blue-100"
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </div>
          </div>
        </form>
        <div className="max-w-4xl mx-auto mt-4 flex justify-center gap-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <span className="flex items-center gap-1.5"><Zap size={10} className="text-blue-600" /> Grounded Analysis</span>
          <span className="flex items-center gap-1.5"><Zap size={10} className="text-blue-600" /> Vector Index Active</span>
          <span className="flex items-center gap-1.5"><Zap size={10} className="text-blue-600" /> Sovereign Context</span>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
