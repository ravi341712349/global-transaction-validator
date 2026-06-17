import React, { useState } from 'react';
import type { ValidationSummary } from '../types';
import { ErrorTable } from './ErrorTable';
import { 
  BarChart, Bar, Cell, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  ShieldCheck, ShieldAlert, Sparkles, Scissors, FileDown, CheckCircle
} from 'lucide-react';
import { api } from '../api';

interface ResultsViewProps {
  summary: ValidationSummary;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onProcessedSuccess: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ summary, showToast, onProcessedSuccess }) => {
  const [cleaning, setCleaning] = useState(false);
  const [splitting, setSplitting] = useState(false);
  const [chunkSize, setChunkSize] = useState(10000);
  const [cleanLinks, setCleanLinks] = useState<{
    cleaned: string;
    invalid: string;
    zip: string;
  } | null>(null);
  const [splitLinks, setSplitLinks] = useState<string[] | null>(null);

  // 1. Data formatting for Pie Chart (Valid vs Invalid)
  const validationData = [
    { name: 'Valid Records', value: summary.valid_records, color: '#10B981' },
    { name: 'Invalid Records', value: summary.invalid_records, color: '#EF4444' }
  ].filter(d => d.value > 0);

  // 2. Data formatting for Error Categories
  const errorCategoriesData = Object.entries(summary.errors_by_type).map(([key, val]) => ({
    name: key,
    errors: val
  })).slice(0, 6);

  // 3. Data formatting for Country distribution
  const countryDistributionData = Object.entries(summary.country_stats).map(([key, val]) => ({
    country: key,
    transactions: val
  })).sort((a, b) => b.transactions - a.transactions).slice(0, 8);

  const handleClean = async () => {
    setCleaning(true);
    try {
      const res = await api.cleanFile(summary.file_id);
      setCleanLinks({
        cleaned: res.cleaned_file_link,
        invalid: res.invalid_file_link,
        zip: res.zip_file_link
      });
      showToast("CSV dataset cleaned and standardized!", "success");
      onProcessedSuccess();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Cleaning failed.", "error");
    } finally {
      setCleaning(false);
    }
  };

  const handleSplit = async () => {
    setSplitting(true);
    try {
      const res = await api.splitFile(summary.file_id, chunkSize);
      setSplitLinks(res.split_files_links);
      if (res.zip_file_link && cleanLinks) {
        setCleanLinks({ ...cleanLinks, zip: res.zip_file_link });
      }
      showToast(`CSV split into ${res.split_files_links.length} chunks!`, "success");
      onProcessedSuccess();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Splitting failed.", "error");
    } finally {
      setSplitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Records */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Records</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold tracking-tight text-white">{summary.total_records.toLocaleString()}</span>
          </div>
        </div>

        {/* Valid Records */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Valid Records
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold tracking-tight text-emerald-400">{summary.valid_records.toLocaleString()}</span>
            <span className="text-xs text-gray-500">{(summary.total_records > 0 ? (summary.valid_records/summary.total_records * 100).toFixed(1) : 0)}%</span>
          </div>
        </div>

        {/* Invalid Records */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-xs text-rose-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            Invalid Records
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold tracking-tight text-rose-400">{summary.invalid_records.toLocaleString()}</span>
            <span className="text-xs text-gray-500">{(summary.total_records > 0 ? (summary.invalid_records/summary.total_records * 100).toFixed(1) : 0)}%</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Success Rate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              {summary.success_rate}%
            </span>
          </div>
        </div>

        {/* Total Errors */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Errors</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold tracking-tight text-white">{summary.total_errors.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Charts Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Top Row: Pie and Error categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Valid vs Invalid Pie */}
            <div className="glass-panel p-6 rounded-2xl border-white/5">
              <h3 className="text-sm font-semibold text-gray-300 mb-6">Validation Integrity</h3>
              <div className="h-64 flex items-center justify-center">
                {validationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={validationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {validationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: '#121824', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} 
                        itemStyle={{ color: '#E5E7EB' }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-sm text-gray-500">No data available</span>
                )}
              </div>
            </div>

            {/* Error Categories Bar */}
            <div className="glass-panel p-6 rounded-2xl border-white/5">
              <h3 className="text-sm font-semibold text-gray-300 mb-6">Errors by Category</h3>
              <div className="h-64">
                {errorCategoriesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={errorCategoriesData} layout="vertical" margin={{ left: -10, right: 10 }}>
                      <XAxis type="number" stroke="#4B5563" fontSize={10} />
                      <YAxis dataKey="name" type="category" stroke="#4B5563" fontSize={10} width={100} />
                      <Tooltip 
                        contentStyle={{ background: '#121824', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} 
                        itemStyle={{ color: '#E5E7EB' }}
                      />
                      <Bar dataKey="errors" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-emerald-400 font-semibold gap-2">
                    <CheckCircle className="w-5 h-5" /> All checks passed! No errors.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Countrywise transactions */}
          <div className="glass-panel p-6 rounded-2xl border-white/5">
            <h3 className="text-sm font-semibold text-gray-300 mb-6">Transactions by Country</h3>
            <div className="h-64">
              {countryDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryDistributionData} margin={{ bottom: 10 }}>
                    <XAxis dataKey="country" stroke="#4B5563" fontSize={10} />
                    <YAxis stroke="#4B5563" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ background: '#121824', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} 
                      itemStyle={{ color: '#E5E7EB' }}
                    />
                    <Bar dataKey="transactions" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-sm text-gray-500">No country data available</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions Column (Clean & Split) */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col justify-between h-full min-h-[500px]">
            <div>
              <h3 className="text-base font-bold text-gray-200 mb-2">CSV Pipeline Tools</h3>
              <p className="text-xs text-gray-400 mb-6">Clean invalid records, format columns, and split large outputs.</p>

              {/* Cleaning Widget */}
              <div className="mb-6 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-200">Data Cleaning Module</h4>
                    <p className="text-xs text-gray-400 mt-1">Normalizes whitespace, fixes payment formats, and resolves date/time issues.</p>
                  </div>
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                
                {cleanLinks ? (
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 mb-1">
                      <CheckCircle className="w-4 h-4" /> Cleaning processing complete
                    </div>
                    <a
                      href={api.getDownloadUrl(cleanLinks.cleaned)}
                      className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold text-gray-200 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition duration-150"
                    >
                      <span className="flex items-center gap-2">
                        <FileDown className="w-4 h-4 text-emerald-400" /> Download Cleaned CSV
                      </span>
                    </a>
                    <a
                      href={api.getDownloadUrl(cleanLinks.invalid)}
                      className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold text-gray-200 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition duration-150"
                    >
                      <span className="flex items-center gap-2">
                        <FileDown className="w-4 h-4 text-rose-400" /> Download Invalid CSV
                      </span>
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={handleClean}
                    disabled={cleaning || splitting}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition duration-200 shadow-glow"
                  >
                    {cleaning ? 'Cleaning Records...' : 'Execute Cleaner'}
                  </button>
                )}
              </div>

              {/* Splitting Widget */}
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-200">CSV Chunk Splitter</h4>
                    <p className="text-xs text-gray-400 mt-1">Splits large dataset into clean chunk files based on row threshold.</p>
                  </div>
                  <Scissors className="w-5 h-5 text-indigo-400" />
                </div>
                
                <div className="mt-3 flex items-center gap-3">
                  <label className="text-xs text-gray-400 shrink-0">Chunk size:</label>
                  <input
                    type="number"
                    value={chunkSize}
                    onChange={(e) => setChunkSize(Math.max(1, parseInt(e.target.value) || 0))}
                    disabled={splitting}
                    className="w-24 px-2 py-1.5 text-xs text-gray-200 glass-input rounded-lg text-center"
                  />
                  <span className="text-xs text-gray-500">rows</span>
                </div>

                {splitLinks ? (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 mb-1">
                      <CheckCircle className="w-4 h-4" /> Splitting processing complete
                    </div>
                    <div className="max-h-36 overflow-y-auto border border-white/5 rounded-lg p-2 bg-black/20 space-y-1">
                      {splitLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={api.getDownloadUrl(link)}
                          className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold text-gray-300 hover:text-white bg-white/5 rounded-md hover:bg-white/10 transition"
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <FileDown className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            Part {idx + 1} ({chunkSize.toLocaleString()} rows)
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleSplit}
                    disabled={splitting || cleaning}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition duration-200 shadow-glow"
                  >
                    {splitting ? 'Splitting Dataset...' : 'Split Dataset'}
                  </button>
                )}
              </div>
            </div>

            {/* ZIP download at bottom */}
            {(cleanLinks || splitLinks) && (
              <div className="mt-6 pt-4 border-t border-white/5">
                <a
                  href={api.getDownloadUrl(cleanLinks?.zip || '')}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 rounded-xl shadow-glow transition duration-200"
                >
                  <FileDown className="w-4.5 h-4.5" />
                  Download Complete ZIP Package
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Error Reports Section */}
      <div className="glass-panel p-6 rounded-2xl border-white/5">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-200">Validation Error Details</h3>
          <p className="text-xs text-gray-400 mt-1">
            Search, filter, and inspect specific data violations. Total of {summary.total_errors.toLocaleString()} anomalies detected.
          </p>
        </div>
        <ErrorTable errors={summary.errors} />
      </div>
    </div>
  );
};
