import React, { useEffect } from 'react';
import type { ToastMessage } from '../types';
import { X, CheckCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; removeToast: (id: string) => void }> = ({
  toast,
  removeToast,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <X className="w-5 h-5 text-rose-400 shrink-0 bg-rose-950/40 rounded-full p-0.5" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-500/20 bg-emerald-950/30',
    error: 'border-rose-500/20 bg-rose-950/30',
    info: 'border-indigo-500/20 bg-indigo-950/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border glass-panel shadow-2xl ${borderColors[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 text-sm font-medium text-gray-200">
        {toast.message}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-gray-400 hover:text-gray-200 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
