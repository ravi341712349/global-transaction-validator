import React, { useState } from 'react';
import { 
  LayoutDashboard, Upload, ShieldCheck, History, Settings, Menu, X, FileCheck 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setView: (view: string) => void;
  hasActiveResult: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeView, 
  setView,
  hasActiveResult
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, view: 'Dashboard' },
    { name: 'Upload File', icon: <Upload className="w-4 h-4" />, view: 'Upload' },
    { 
      name: 'Validation Results', 
      icon: <ShieldCheck className="w-4 h-4" />, 
      view: 'Results',
      disabled: !hasActiveResult 
    },
    { name: 'Processed Files', icon: <History className="w-4 h-4" />, view: 'History' },
    { name: 'Settings', icon: <Settings className="w-4 h-4" />, view: 'Settings' },
  ];

  const handleNav = (view: string) => {
    // If selecting 'Upload', navigate to Dashboard (where Upload is located)
    if (view === 'Upload') {
      setView('Dashboard');
    } else {
      setView(view);
    }
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-darkBg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-black/20 shrink-0 select-none">
        {/* Brand header */}
        <div className="flex items-center gap-2 px-6 py-6 border-b border-white/5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 shadow-glow">
            <FileCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold tracking-tight text-white text-base">
            Global Validator
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = activeView === item.view || (item.view === 'Upload' && activeView === 'Dashboard');
            return (
              <button
                key={item.name}
                onClick={() => handleNav(item.view)}
                disabled={item.disabled}
                className={`flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold rounded-xl transition duration-150 ${
                  item.disabled
                    ? 'opacity-30 cursor-not-allowed text-gray-600'
                    : isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-glow'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.02] border border-transparent'
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-200 truncate">Administrator</p>
            <p className="text-[10px] text-gray-500 truncate">admin@validator.corp</p>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-darkBg border-r border-white/5 z-50 transform transition-transform duration-300 lg:hidden flex flex-col justify-between ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          <div className="flex justify-between items-center px-6 py-5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-6.5 h-6.5 rounded-md bg-indigo-500 flex items-center justify-center text-white">
                <FileCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-sm">Global Validator</span>
            </div>
            <button 
              onClick={() => setMobileOpen(false)} 
              className="text-gray-400 hover:text-gray-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="px-4 py-6 space-y-1.5">
            {menuItems.map((item) => {
              const isActive = activeView === item.view || (item.view === 'Upload' && activeView === 'Dashboard');
              return (
                <button
                  key={item.name}
                  onClick={() => handleNav(item.view)}
                  disabled={item.disabled}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold rounded-xl transition ${
                    item.disabled
                      ? 'opacity-30 cursor-not-allowed text-gray-600'
                      : isActive
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-200 truncate">Administrator</p>
            <p className="text-[10px] text-gray-500 truncate">admin@validator.corp</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar for mobile header */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 z-30 select-none">
          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 rounded-md bg-indigo-500 flex items-center justify-center text-white">
              <FileCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">Global Validator</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="text-gray-400 hover:text-gray-200 p-1.5 border border-white/10 rounded-lg hover:bg-white/5 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Inner Content */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-12 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
