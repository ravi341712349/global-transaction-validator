import React, { useState, useEffect } from 'react';
import type { Settings } from '../types';
import { api } from '../api';
import { Save, Plus, Trash2 } from 'lucide-react';

interface SettingsViewProps {
  settings: Settings;
  onSettingsUpdate: (newSettings: Settings) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSettingsUpdate,
  showToast,
}) => {
  const [localSettings, setLocalSettings] = useState<Settings>({ ...settings });
  const [saving, setSaving] = useState(false);
  const [newCountry, setNewCountry] = useState('');
  const [newCountryLen, setNewCountryLen] = useState(10);
  const [newPaymentMode, setNewPaymentMode] = useState('');

  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateSettings(localSettings);
      onSettingsUpdate(localSettings);
      showToast("Configuration saved successfully!", "success");
    } catch (err) {
      showToast("Failed to save configuration.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePhoneLenChange = (country: string, len: number) => {
    setLocalSettings({
      ...localSettings,
      phone_rules: {
        ...localSettings.phone_rules,
        [country]: len,
      },
    });
  };

  const handleDeletePhoneRule = (country: string) => {
    const rules = { ...localSettings.phone_rules };
    delete rules[country];
    setLocalSettings({
      ...localSettings,
      phone_rules: rules,
    });
  };

  const handleAddPhoneRule = () => {
    if (!newCountry.trim()) {
      showToast("Country code cannot be empty.", "error");
      return;
    }
    const code = newCountry.trim().toUpperCase();
    if (localSettings.phone_rules[code]) {
      showToast("Country code already configured.", "error");
      return;
    }
    setLocalSettings({
      ...localSettings,
      phone_rules: {
        ...localSettings.phone_rules,
        [code]: newCountryLen,
      },
    });
    setNewCountry('');
    setNewCountryLen(10);
    showToast(`Added phone length rule for ${code}.`, "success");
  };

  const handleAddPaymentMode = () => {
    if (!newPaymentMode.trim()) return;
    const mode = newPaymentMode.trim();
    if (localSettings.allowed_payment_modes.includes(mode)) {
      showToast("Payment method already exists.", "error");
      return;
    }
    setLocalSettings({
      ...localSettings,
      allowed_payment_modes: [...localSettings.allowed_payment_modes, mode],
    });
    setNewPaymentMode('');
  };

  const handleDeletePaymentMode = (mode: string) => {
    setLocalSettings({
      ...localSettings,
      allowed_payment_modes: localSettings.allowed_payment_modes.filter((m) => m !== mode),
    });
  };

  const toggleDateFormat = (format: string) => {
    const active = localSettings.date_formats;
    const updated = active.includes(format)
      ? active.filter((f) => f !== format)
      : [...active, format];
      
    if (updated.length === 0) {
      showToast("At least one date format must be configured.", "error");
      return;
    }
    setLocalSettings({ ...localSettings, date_formats: updated });
  };

  const toggleTimeFormat = (format: string) => {
    const active = localSettings.time_formats;
    const updated = active.includes(format)
      ? active.filter((f) => f !== format)
      : [...active, format];
      
    if (updated.length === 0) {
      showToast("At least one time format must be configured.", "error");
      return;
    }
    setLocalSettings({ ...localSettings, time_formats: updated });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-200">System Configuration</h2>
          <p className="text-xs text-gray-400 mt-1">Configure live validation boundaries, thresholds, and patterns.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 rounded-xl shadow-glow transition duration-150"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phone rules */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-300">Phone Digit Lengths</h3>
          <p className="text-xs text-gray-400">Specify expected digit lengths for country codes to validate telephone inputs.</p>
          
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 border border-white/5 rounded-xl p-3 bg-black/20">
            {Object.entries(localSettings.phone_rules).map(([country, len]) => (
              <div key={country} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-xs font-bold text-indigo-400 px-2.5 py-1 bg-indigo-500/10 rounded-md border border-indigo-500/10">{country}</span>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={len}
                    onChange={(e) => handlePhoneLenChange(country, Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-16 px-2 py-1 text-xs text-gray-300 glass-input rounded text-center bg-darkBg"
                  />
                  <span className="text-xs text-gray-500">digits</span>
                  <button
                    onClick={() => handleDeletePhoneRule(country)}
                    className="text-gray-500 hover:text-rose-400 p-1 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add phone rule form */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="IN"
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value.toUpperCase())}
              maxLength={3}
              className="w-16 px-2.5 py-1.5 text-xs text-gray-200 glass-input rounded-xl text-center"
            />
            <input
              type="number"
              value={newCountryLen}
              onChange={(e) => setNewCountryLen(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-16 px-2.5 py-1.5 text-xs text-gray-200 glass-input rounded-xl text-center"
            />
            <button
              onClick={handleAddPhoneRule}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Rule
            </button>
          </div>
        </div>

        {/* Date and Time Formats */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
          {/* Date formats */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Supported Date Formats</h3>
            <p className="text-xs text-gray-400">Select which formats the validator should accept. Unchecked formats will be flagged.</p>
            <div className="flex flex-wrap gap-2.5">
              {['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'].map((format) => {
                const active = localSettings.date_formats.includes(format);
                return (
                  <button
                    key={format}
                    onClick={() => toggleDateFormat(format)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                      active
                        ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400'
                        : 'border-white/5 bg-white/[0.02] text-gray-500 hover:border-white/10'
                    }`}
                  >
                    {format}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time formats */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Supported Time Formats</h3>
            <p className="text-xs text-gray-400">Select which formats the validator should accept. Unchecked formats will be flagged.</p>
            <div className="flex flex-wrap gap-2.5">
              {['HH:MM', 'HH:MM:SS'].map((format) => {
                const active = localSettings.time_formats.includes(format);
                return (
                  <button
                    key={format}
                    onClick={() => toggleTimeFormat(format)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                      active
                        ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400'
                        : 'border-white/5 bg-white/[0.02] text-gray-500 hover:border-white/10'
                    }`}
                  >
                    {format}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Mappings */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-300">Allowed Payment Methods</h3>
          <p className="text-xs text-gray-400">Standardized payment methods mapped by validation audits.</p>
          
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
            {localSettings.allowed_payment_modes.map((mode) => (
              <span 
                key={mode} 
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-indigo-400"
              >
                {mode}
                <button
                  onClick={() => handleDeletePaymentMode(mode)}
                  className="text-indigo-400 hover:text-rose-400 transition"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="e.g. Apple Pay"
              value={newPaymentMode}
              onChange={(e) => setNewPaymentMode(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs text-gray-200 glass-input rounded-xl"
            />
            <button
              onClick={handleAddPaymentMode}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-gray-200 transition"
            >
              Add Mode
            </button>
          </div>
        </div>

        {/* System parameters */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-300">System Thresholds</h3>
          <p className="text-xs text-gray-400">Configure parameters for large-file performance and optimization.</p>
          
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-200">Default Split Chunk Size</label>
                <p className="text-[11px] text-gray-500 mt-0.5">Maximum number of records per split CSV file.</p>
              </div>
              <input
                type="number"
                value={localSettings.chunk_size}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  chunk_size: Math.max(1, parseInt(e.target.value) || 0)
                })}
                className="w-24 px-2.5 py-1.5 text-xs text-gray-200 glass-input rounded-xl text-center"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
