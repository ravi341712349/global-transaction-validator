import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';
import type { HistoryItem } from '../types';

interface UploadZoneProps {
  onUploadSuccess: (item: HistoryItem) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUploadSuccess, showToast }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<HistoryItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // File validation
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMsg("Please upload a CSV file only.");
      showToast("Only CSV files are supported.", "error");
      return;
    }
    
    const MAX_SIZE = 500 * 1024 * 1024; // 500MB
    if (file.size > MAX_SIZE) {
      setErrorMsg("File size exceeds 500MB limit.");
      showToast("File size too large (max 500MB).", "error");
      return;
    }
    
    setUploading(true);
    setProgress(0);
    setErrorMsg(null);
    setUploadedFile(null);
    
    try {
      const response = await api.uploadFile(file, (percent) => {
        setProgress(percent);
      });
      setUploadedFile(response);
      showToast("File uploaded successfully!", "success");
      onUploadSuccess(response);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Upload failed. Please try again.";
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess, showToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'text/csv': ['.csv'],
    }
  });

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-500/5 shadow-glow scale-[1.01]'
            : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
        }`}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center text-center w-full"
            >
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-indigo-950/50 mb-6">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Uploading Transaction File...</h3>
              <p className="text-sm text-gray-400 mb-6">Processing raw records into memory</p>
              
              {/* Progress bar */}
              <div className="w-full max-w-md bg-white/5 h-2 rounded-full overflow-hidden mb-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-indigo-400">{progress}%</span>
            </motion.div>
          ) : uploadedFile ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-950/50 mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Upload Complete!</h3>
              <p className="text-sm text-gray-400 mb-6">File stored and ready for validation</p>
              
              <div className="glass-panel p-4 rounded-xl flex items-center gap-4 text-left border-emerald-500/20 max-w-md w-full">
                <FileText className="w-8 h-8 text-indigo-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-200 truncate">{uploadedFile.filename}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>{formatSize(uploadedFile.size_bytes)}</span>
                    <span>•</span>
                    <span>{uploadedFile.total_rows.toLocaleString()} rows</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadedFile(null);
                }} 
                className="mt-6 px-4 py-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/5 transition"
              >
                Upload another file
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.04] mb-6 border border-white/5 hover:border-indigo-500/20 transition-all duration-300">
                <Upload className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">
                {isDragActive ? 'Drop your CSV file here' : 'Drag & drop your CSV file'}
              </h3>
              <p className="text-sm text-gray-400 mb-2">or click to browse your local storage</p>
              <p className="text-xs text-gray-500">Supports transaction CSV datasets up to 500MB</p>
              
              {errorMsg && (
                <div className="mt-4 flex items-center gap-2 text-rose-400 text-xs border border-rose-500/20 bg-rose-950/20 px-3 py-1.5 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errorMsg}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
