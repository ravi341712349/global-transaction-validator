import React from 'react';
import { 
  FileCheck, Shield, Sparkles, Split, ArrowRight, Download, Lock
} from 'lucide-react';
import { api } from '../api';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring" as const, stiffness: 80, damping: 15 }
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-gray-200">
      {/* Header / Nav */}
      <nav className="border-b border-white/5 py-5 px-6 md:px-12 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 shadow-glow">
            <FileCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold tracking-tight text-white text-lg">
            Global Validator
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={api.getSampleCsvUrl()}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition"
          >
            <Download className="w-3.5 h-3.5" /> Sample CSV
          </a>
          <button
            onClick={onStart}
            className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-glow transition duration-150"
          >
            Launch Console
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-28 md:pt-32 md:pb-40 text-center max-w-5xl mx-auto overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none pulse-glow-bg" />
        
        <motion.div 
          className="relative z-10 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span 
            variants={itemVariants}
            className="px-3.5 py-1 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full inline-block"
          >
            Enterprise CSV Compliance Engine
          </motion.span>
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto"
          >
            Audit, Clean, and Validate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">
              Transaction Data in Real Time
            </span>
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            A secure, localized SaaS audit terminal built for modern finance teams. Standardize country configurations, parse phone patterns, compute matching margins, and partition huge datasets without database overhead.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
          >
            <button
              onClick={onStart}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 rounded-xl shadow-glow transition duration-200"
            >
              Upload Transaction CSV
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={api.getSampleCsvUrl()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition duration-150"
            >
              <Download className="w-4 h-4" />
              Download Sample Dataset
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="border-t border-white/5 py-24 px-6 md:px-12 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Built for Enterprise Compliance</h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">Highly optimized Pandas/NumPy backend designed for massive throughput and memory conservation.</p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {/* Feature 1 */}
            <motion.div variants={cardVariants} className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-200 mb-2">Configurable Validation</h3>
                <p className="text-xs text-gray-400 leading-relaxed">Modify date formats, allowed payment gateways, and custom country phone codes without backend redeployments.</p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={cardVariants} className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 mb-6">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-200 mb-2">Automated Data Cleaning</h3>
                <p className="text-xs text-gray-400 leading-relaxed">Auto-standardizes transaction payment tags, trims whitespace corruption, and formats datetime columns instantly.</p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={cardVariants} className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 mb-6">
                  <Split className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-200 mb-2">High-Volume Splitting</h3>
                <p className="text-xs text-gray-400 leading-relaxed">Automatically slice heavy spreadsheets larger than 10,000 rows into micro-files for downstream parsing.</p>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={cardVariants} className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-200 mb-2">Secure Local Execution</h3>
                <p className="text-xs text-gray-400 leading-relaxed">No tracking, database persistence or internet leak risk. Secure local operations keep customer information fully isolated.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/5 py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">How It Works</h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">Standardize transaction compliance audits in three easy steps.</p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {/* Step 1 */}
            <motion.div variants={cardVariants} className="relative p-6 rounded-2xl border border-white/5 bg-white/[0.005] glass-panel-hover">
              <span className="absolute -top-4 left-6 text-3xl font-extrabold text-indigo-500/25">01</span>
              <h3 className="text-sm font-bold text-gray-200 mt-2 mb-2">1. Upload Datasets</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Drag-and-drop file inputs up to 500MB. File content is processed instantly and parsed locally.</p>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={cardVariants} className="relative p-6 rounded-2xl border border-white/5 bg-white/[0.005] glass-panel-hover">
              <span className="absolute -top-4 left-6 text-3xl font-extrabold text-indigo-500/25">02</span>
              <h3 className="text-sm font-bold text-gray-200 mt-2 mb-2">2. Inspect Diagnostics</h3>
              <p className="text-xs text-gray-400 leading-relaxed">View donut validation charts, check error counts by code column, and drill into specific error details.</p>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={cardVariants} className="relative p-6 rounded-2xl border border-white/5 bg-white/[0.005] glass-panel-hover">
              <span className="absolute -top-4 left-6 text-3xl font-extrabold text-indigo-500/25">03</span>
              <h3 className="text-sm font-bold text-gray-200 mt-2 mb-2">3. Package Outputs</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Run the cleaner, split heavy datasets by row limit, and download structured outputs or unified ZIP packages.</p>
            </motion.div>
          </motion.div>

          <div className="text-center pt-8">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-glow transition duration-150"
            >
              Start Uploading
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500 text-white">
              <FileCheck className="w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight text-white text-sm">
              Global Transaction Validator
            </span>
          </div>
          <span className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Global Transaction Validator. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
};
