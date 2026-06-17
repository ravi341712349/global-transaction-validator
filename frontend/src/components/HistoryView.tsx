import React, { useState } from 'react';
import type { HistoryItem } from '../types';
import { api } from '../api';
import { 
  FileText, Calendar, FileDown, Eye, RefreshCw
} from 'lucide-react';

interface HistoryViewProps {
  history: HistoryItem[];
  refreshHistory: () => Promise<void>;
  onSelectFile: (fileId: string) => Promise<void>;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  refreshHistory,
  onSelectFile,
  showToast,
}) => {
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleInspect = async (fileId: string) => {
    setLoadingFileId(fileId);
    try {
      await onSelectFile(fileId);
      showToast("Loaded file validation metrics.", "success");
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to load validation metrics.", "error");
    } finally {
      setLoadingFileId(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshHistory();
      showToast("Processing history refreshed.", "success");
    } catch (err) {
      showToast("Failed to refresh history.", "error");
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Validated':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Failed':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-200">Processing History</h2>
          <p className="text-xs text-gray-400 mt-1">Audit log of all uploaded datasets, validation audits, and outputs.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-gray-300 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh History
        </button>
      </div>

      {/* History List */}
      <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="custom-table">
            <thead>
              <tr>
                <th>File Details</th>
                <th>Upload Time</th>
                <th>Status</th>
                <th>Validation Summary</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((item) => (
                  <tr key={item.file_id} className="transition duration-150">
                    {/* File info */}
                    <td>
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-indigo-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-200 truncate max-w-xs md:max-w-md">{item.filename}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            <span>{formatSize(item.size_bytes)}</span>
                            <span>•</span>
                            <span>{item.total_rows.toLocaleString()} rows</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Upload date */}
                    <td className="text-xs text-gray-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        {item.upload_time}
                      </div>
                    </td>

                    {/* Status badges */}
                    <td>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Validation rates */}
                    <td>
                      {item.success_rate !== undefined ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-200">{item.success_rate}% Success</span>
                          <span className="text-xs text-rose-400">{item.total_errors?.toLocaleString()} errors found</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>

                    {/* Actions / Downloads */}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Load to Dashboard */}
                        <button
                          onClick={() => handleInspect(item.file_id)}
                          disabled={loadingFileId !== null}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow transition"
                        >
                          {loadingFileId === item.file_id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                          Audit Results
                        </button>

                        {/* Download zip if processed */}
                        {item.zip_file_link && (
                          <a
                            href={api.getDownloadUrl(item.zip_file_link)}
                            title="Download ZIP Archive"
                            className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition"
                          >
                            <FileDown className="w-4 h-4 text-emerald-400" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm text-gray-500">
                    No processing history available. Upload a CSV file to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
