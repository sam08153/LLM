import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FileUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    const endpoint = file.name.endsWith('.csv') ? '/ingest/csv' : '/ingest/pdf';

    try {
      // Mocking high-end processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await axios.post(`http://localhost:8000${endpoint}`, formData);
      
      if (response.data.status === 'success') {
        setStatus('success');
        onUploadSuccess?.();
      }
    } catch (err) {
      console.error('Upload error:', err);
      setStatus('error');
    } finally {
      setUploading(false);
      // Reset status after a few seconds
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Data Hub</h3>
      
      <div className="relative group cursor-pointer">
        <input
          type="file"
          accept=".csv,.pdf"
          onChange={handleFileUpload}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className={`
          border-2 border-dashed rounded-xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-3
          ${uploading ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-slate-50 group-hover:border-blue-400 group-hover:bg-white'}
          ${status === 'success' ? 'border-green-500 bg-green-50' : ''}
          ${status === 'error' ? 'border-red-500 bg-red-50' : ''}
        `}>
          <AnimatePresence mode="wait">
            {uploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Upload size={14} className="text-blue-600" />
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600 animate-pulse">Processing...</span>
              </motion.div>
            ) : status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <CheckCircle2 size={32} className="text-green-500" />
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Ingested</span>
              </motion.div>
            ) : status === 'error' ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <AlertCircle size={32} className="text-red-500" />
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Failed</span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                  <Upload size={20} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-600 group-hover:text-blue-600 transition-colors uppercase tracking-wider">Drop CSV or PDF</p>
                  <p className="text-[10px] text-slate-400 mt-1">Merchant data repository</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
