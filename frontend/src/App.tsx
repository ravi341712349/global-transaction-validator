import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ResultsView } from './components/ResultsView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { ToastContainer } from './components/Toast';
import type { HistoryItem, Settings, ValidationSummary, ToastMessage } from './types';
import { api } from './api';
import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [view, setView] = useState<string>('Landing');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activeSummary, setActiveSummary] = useState<ValidationSummary | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Notifications helper
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // API calls
  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      showToast("Could not load validation settings.", "error");
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await api.getHistory();
      setHistory(data);
    } catch (err) {
      showToast("Could not load processing history.", "error");
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchSettings(), fetchHistory()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleUploadSuccess = async (fileMetadata: HistoryItem) => {
    // Refresh history logs
    await fetchHistory();
    
    // Automatically trigger validation and redirect to results
    try {
      const summary = await api.validateFile(fileMetadata.file_id);
      setActiveSummary(summary);
      setView('Results');
      showToast("File uploaded and validated!", "success");
      // Refresh history again to get "Validated" status
      fetchHistory();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Validation check failed.", "error");
    }
  };

  const handleSelectFile = async (fileId: string) => {
    try {
      const summary = await api.validateFile(fileId);
      setActiveSummary(summary);
      setView('Results');
      fetchHistory(); // Sync history status
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Could not load validation summary.", "error");
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex flex-col items-center justify-center gap-4 select-none">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-sm font-semibold text-gray-400">Initializing validator console...</span>
      </div>
    );
  }

  // Render Landing Page if active view is Landing
  if (view === 'Landing') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LandingPage onStart={() => setView('Dashboard')} />
          <ToastContainer toasts={toasts} removeToast={removeToast} />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Otherwise, render core app dashboard layout
  return (
    <>
      <Layout 
        activeView={view} 
        setView={setView} 
        hasActiveResult={activeSummary !== null}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 15, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(5px)' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {view === 'Dashboard' && (
              <Dashboard
                onUploadSuccess={handleUploadSuccess}
                recentHistory={history}
                onSelectFile={handleSelectFile}
                showToast={showToast}
                setView={setView}
              />
            )}
            
            {view === 'Results' && activeSummary && (
              <ResultsView
                summary={activeSummary}
                showToast={showToast}
                onProcessedSuccess={fetchHistory}
              />
            )}

            {view === 'History' && (
              <HistoryView
                history={history}
                refreshHistory={fetchHistory}
                onSelectFile={handleSelectFile}
                showToast={showToast}
              />
            )}

            {view === 'Settings' && settings && (
              <SettingsView
                settings={settings}
                onSettingsUpdate={(newSettings) => setSettings(newSettings)}
                showToast={showToast}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </Layout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default App;
