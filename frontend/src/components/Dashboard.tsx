import React from 'react';
import { UploadZone } from './UploadZone';
import type { HistoryItem } from '../types';
import { 
  Download, FileSpreadsheet, CheckCircle2, RefreshCw, AlertTriangle, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { api } from '../api';

interface DashboardProps {
  onUploadSuccess: (item: HistoryItem) => void;
  recentHistory: HistoryItem[];
  onSelectFile: (fileId: string) => Promise<void>;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  setView: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onUploadSuccess,
  recentHistory,
  onSelectFile,
  showToast,
  setView,
}) => {
  const handleInspect = async (fileId: string) => {
    try {
      await onSelectFile(fileId);
      showToast("Loaded file validation metrics.", "success");
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to load validation metrics.", "error");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Processed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'Validated':
        return <ShieldCheck className="w-4 h-4 text-indigo-400" />;
      case 'Failed':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default:
        return <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative glass-panel rounded-3xl p-8 overflow-hidden border-white/5 bg-gradient-to-r from-indigo-500/10 to-violet-500/5">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            Ready for Production
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-4">
            Global Transaction Validator
          </h1>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            High-performance transaction audit system. Instantly validate phone digit constraints, order patterns, and sum mismatches; clean invalid CSV records; split heavy spreadsheets; and download packaged outputs.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <a
              href={api.getSampleCsvUrl()}
              className="flex items-center gap-2 px-5 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-glow transition duration-150"
            >
              <Download className="w-4 h-4" />
              Download Sample CSV
            </a>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none pulse-glow-bg" />
      </div>

      {/* Main Upload Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Upload Container */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-3xl">
            <h2 className="text-lg font-bold text-gray-200 mb-6">Validate CSV Records</h2>
            <UploadZone onUploadSuccess={onUploadSuccess} showToast={showToast} />
          </div>
        </div>

        {/* Sidebar Info cards */}
        <div className="space-y-6">
          {/* Schema Requirements */}
          <div className="glass-panel glass-panel-hover p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
              CSV Schema Requirements
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your uploaded CSV file must contain the following header column schema exactly:
            </p>
            <div className="max-h-36 overflow-y-auto border border-white/5 rounded-xl p-3 bg-black/20 font-mono text-[10px] text-indigo-300/80 leading-relaxed">
              order_id, order_date, order_time, customer_name, country_code, phone_number, product_id, product_name, quantity, unit_price, payment_mode, total_amount
            </div>
            <div className="space-y-2 text-[11px] text-gray-400">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                <span>Order ID format must match `^ORD\d+$` and must be unique.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                <span>Telephone lengths configured dynamically in settings.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                <span>Sum verification: `Quantity × Price = Total`.</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-200">Recent Activity</h3>
              <button 
                onClick={() => setView('History')} 
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                All history <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-2.5">
              {recentHistory.length > 0 ? (
                recentHistory.slice(0, 3).map((item) => (
                  <div 
                    key={item.file_id}
                    onClick={() => handleInspect(item.file_id)}
                    className="glass-panel glass-panel-hover flex items-center justify-between p-3.5 rounded-2xl cursor-pointer"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-xs font-semibold text-gray-200 truncate">{item.filename}</p>
                      <span className="text-[10px] text-gray-500 font-medium">{item.upload_time}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {getStatusIcon(item.status)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 py-2 text-center">No recent uploads</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
