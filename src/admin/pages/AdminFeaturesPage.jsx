import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import {
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ShoppingBag,
  Gift,
  Heart,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Settings2,
  AlertCircle,
  Truck,
  RotateCcw,
  BarChart3,
  Users2,
  Calendar,
  Lock,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const FEATURE_GROUPS = [
  { id: 'ALL', label: 'All Features' },
  { id: 'DISCOVERY', label: 'Discovery' },
  { id: 'CONVERSION', label: 'Conversion' },
  { id: 'GIFTING', label: 'Gifting' },
  { id: 'RETENTION', label: 'Retention' },
  { id: 'LOYALTY', label: 'Loyalty' },
  { id: 'ORDERS', label: 'Orders' },
  { id: 'DELIVERY', label: 'Delivery' },
  { id: 'MARKETING', label: 'Marketing' },
  { id: 'CUSTOMER_EXPERIENCE', label: 'Customer Exp' },
];

export default function AdminFeaturesPage() {
  const { accessToken, admin } = useAdminAuth();
  const [features, setFeatures] = useState([]);
  const [summary, setSummary] = useState({ total: 0, activeCount: 0, disabledCount: 0 });
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [editConfig, setEditConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const url = selectedGroup === 'ALL'
        ? `${API_BASE}/admin/features`
        : `${API_BASE}/admin/features?group=${selectedGroup}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeatures(data.data.features || []);
        if (data.data.summary) {
          setSummary(data.data.summary);
        }
      }
    } catch (err) {
      console.error('Failed to load features:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [selectedGroup, accessToken]);

  const handleToggle = async (feat, e) => {
    e.stopPropagation();
    try {
      const nextEnabled = !feat.isEnabled;
      const res = await fetch(`${API_BASE}/admin/features/${feat.key}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isEnabled: nextEnabled }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeatures((prev) =>
          prev.map((f) => (f.key === feat.key ? data.data.feature : f))
        );
        setActionMessage(`Feature "${feat.name}" turned ${nextEnabled ? 'ON' : 'OFF'}.`);
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to toggle feature:', err);
    }
  };

  const handleOpenConfig = (feat) => {
    setSelectedFeature(feat);
    setEditConfig({
      isEnabled: feat.isEnabled,
      status: feat.status,
      showInNavigation: feat.showInNavigation,
      navigationLabel: feat.navigationLabel || '',
      showOnHomepage: feat.showOnHomepage,
      homepageSortOrder: feat.homepageSortOrder || 0,
      configJson: JSON.stringify(feat.config || {}, null, 2),
    });
  };

  const handleSaveConfig = async () => {
    if (!selectedFeature || !editConfig) return;
    setSaving(true);
    try {
      let parsedConfig = {};
      try {
        parsedConfig = JSON.parse(editConfig.configJson);
      } catch (err) {
        alert('Invalid JSON in Configuration field.');
        setSaving(false);
        return;
      }

      const res = await fetch(`${API_BASE}/admin/features/${selectedFeature.key}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isEnabled: editConfig.isEnabled,
          status: editConfig.status,
          showInNavigation: editConfig.showInNavigation,
          navigationLabel: editConfig.navigationLabel,
          showOnHomepage: editConfig.showOnHomepage,
          homepageSortOrder: Number(editConfig.homepageSortOrder) || 0,
          config: parsedConfig,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeatures((prev) =>
          prev.map((f) => (f.key === selectedFeature.key ? data.data.feature : f))
        );
        setSelectedFeature(null);
        setEditConfig(null);
        setActionMessage(`Feature "${selectedFeature.name}" saved successfully.`);
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        alert(data.message || 'Error saving feature.');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Error updating feature configuration.');
    } finally {
      setSaving(false);
    }
  };

  const filteredFeatures = features.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.key.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Banner & Summary */}
      <div className="bg-[#0D1112] text-[#F2EFE8] p-8 rounded-2xl border border-[#C6AE82]/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C6AE82]/15 text-[#C6AE82] text-xs rounded-full border border-[#C6AE82]/30 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Commerce Operating System</span>
          </div>
          <h1 className="text-3xl font-serif tracking-tight text-[#F2EFE8]">
            Commerce Feature Control Center
          </h1>
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            Configure discovery wizards, gifting, loyalty, orders, delivery, and checkout controls.
            Every feature can be toggled independently without code changes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-[#141A1C] border border-white/10 px-4 py-3 rounded-xl text-center min-w-[90px]">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 block font-sans">
              TOTAL
            </span>
            <span className="text-xl font-serif text-[#F2EFE8] font-bold">
              {summary.total}
            </span>
          </div>
          <div className="bg-emerald-950/40 border border-emerald-500/20 px-4 py-3 rounded-xl text-center min-w-[90px]">
            <span className="text-[10px] uppercase tracking-widest text-emerald-400 block font-sans">
              ACTIVE
            </span>
            <span className="text-xl font-serif text-emerald-300 font-bold">
              {summary.activeCount}
            </span>
          </div>
          <div className="bg-zinc-900 border border-white/10 px-4 py-3 rounded-xl text-center min-w-[90px]">
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 block font-sans">
              OFF
            </span>
            <span className="text-xl font-serif text-zinc-400 font-bold">
              {summary.disabledCount}
            </span>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
        </div>
      )}

      {/* Group Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {FEATURE_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGroup(g.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedGroup === g.id
                  ? 'bg-[#0D1112] text-[#F2EFE8] shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-xs text-gray-900 focus:outline-none focus:border-[#C6AE82]"
          />
        </div>
      </div>

      {/* Features Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400 font-mono">
          Loading commerce features...
        </div>
      ) : filteredFeatures.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-500 bg-white rounded-xl border border-gray-200">
          No commerce features matched the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feat) => {
            const isLive = feat.isEnabled && feat.status === 'ACTIVE';

            return (
              <div
                key={feat.key}
                onClick={() => handleOpenConfig(feat)}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group hover:border-[#C6AE82]/50 relative"
              >
                <div>
                  {/* Top Row: Group Badge + Toggle Switch */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                      {feat.group}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleToggle(feat, e)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        feat.isEnabled ? 'bg-emerald-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          feat.isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Feature Title */}
                  <h3 className="font-serif text-base text-gray-900 group-hover:text-[#8C6D32] transition-colors leading-snug">
                    {feat.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                {/* Bottom Meta & Quick Actions */}
                <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isLive ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                      {feat.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#8C6D32] group-hover:translate-x-0.5 transition-transform">
                    <span>Configure</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Configuration Drawer / Modal */}
      {selectedFeature && editConfig && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#8C6D32] uppercase">
                  {selectedFeature.group} · {selectedFeature.key}
                </span>
                <h2 className="text-xl font-serif text-gray-900 mt-0.5">
                  {selectedFeature.name}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedFeature(null);
                  setEditConfig(null);
                }}
                className="text-gray-400 hover:text-gray-700 p-1 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Form Controls */}
            <div className="space-y-4 text-xs">
              {/* Activation Switch */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <span className="font-semibold text-gray-900 block">Feature Master Switch</span>
                  <span className="text-gray-500 text-[11px]">
                    When OFF, all customer components and related public endpoints safely deactivate.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditConfig({ ...editConfig, isEnabled: !editConfig.isEnabled })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    editConfig.isEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      editConfig.isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Status Selector */}
              <div className="space-y-1">
                <label className="font-medium text-gray-700 block">Lifecycle Status</label>
                <select
                  value={editConfig.status}
                  onChange={(e) => setEditConfig({ ...editConfig, status: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#C6AE82]"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="CONFIGURATION_REQUIRED">CONFIGURATION REQUIRED</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
              </div>

              {/* Navigation Exposure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-700 font-medium">Show in Navigation</span>
                  <input
                    type="checkbox"
                    checked={editConfig.showInNavigation}
                    onChange={(e) =>
                      setEditConfig({ ...editConfig, showInNavigation: e.target.checked })
                    }
                    className="rounded text-[#C6AE82] focus:ring-[#C6AE82]"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-700 font-medium">Show on Homepage</span>
                  <input
                    type="checkbox"
                    checked={editConfig.showOnHomepage}
                    onChange={(e) =>
                      setEditConfig({ ...editConfig, showOnHomepage: e.target.checked })
                    }
                    className="rounded text-[#C6AE82] focus:ring-[#C6AE82]"
                  />
                </div>
              </div>

              {/* Navigation Label */}
              {editConfig.showInNavigation && (
                <div className="space-y-1">
                  <label className="font-medium text-gray-700 block">Header Navigation Label</label>
                  <input
                    type="text"
                    value={editConfig.navigationLabel}
                    onChange={(e) =>
                      setEditConfig({ ...editConfig, navigationLabel: e.target.value })
                    }
                    placeholder="e.g. Scent Finder"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>
              )}

              {/* JSON Configuration Payload */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-gray-700 block">
                    Structured Feature Settings (JSON)
                  </label>
                  <span className="text-[10px] font-mono text-gray-400">Strict JSON validation</span>
                </div>
                <textarea
                  rows={6}
                  value={editConfig.configJson}
                  onChange={(e) => setEditConfig({ ...editConfig, configJson: e.target.value })}
                  className="w-full bg-[#0D1112] text-emerald-400 font-mono text-[11px] p-3 rounded-lg border border-gray-300 focus:outline-none"
                />
              </div>

              {/* Audit Trail Note */}
              <div className="text-[10px] text-gray-400 italic pt-1">
                Modifications are immutably logged with actor ID: {admin?.id} ({admin?.name}).
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedFeature(null);
                  setEditConfig(null);
                }}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={saving}
                className="px-5 py-2 bg-[#0D1112] hover:bg-[#1E2527] text-[#C6AE82] font-semibold text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {saving ? 'Saving Changes...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
