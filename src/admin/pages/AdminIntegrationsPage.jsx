import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { Shield, Key, CheckCircle, AlertTriangle, RefreshCw, Eye, EyeOff, Save } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminIntegrationsPage() {
  const { accessToken } = useAdminAuth();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('R2');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active Provider Form state
  const [credentials, setCredentials] = useState({});
  const [settings, setSettings] = useState({});
  const [isEnabled, setIsEnabled] = useState(false);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/integrations`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIntegrations(data.data.integrations || []);
        loadProviderData(activeTab, data.data.integrations || []);
      }
    } catch (err) {
      console.error('Fetch integrations error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProviderData = (prov, list) => {
    const found = list.find((i) => i.provider === prov);
    if (found) {
      setIsEnabled(found.isEnabled);
      setSettings(found.settings || {});
      setCredentials(found.maskedCredentials || {});
    } else {
      setIsEnabled(false);
      setSettings({});
      setCredentials({});
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [accessToken]);

  const handleTabChange = (prov) => {
    setActiveTab(prov);
    setTestResult(null);
    setSaveSuccess(false);
    loadProviderData(prov, integrations);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/admin/integrations/${activeTab}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          isEnabled,
          credentials,
          settings,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        fetchIntegrations();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save integration error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API_BASE}/admin/integrations/${activeTab}/test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setTestResult(data.data || { success: false, message: 'Test failed.' });
      fetchIntegrations();
    } catch (err) {
      setTestResult({ success: false, message: 'Could not execute test request.' });
    } finally {
      setTesting(false);
    }
  };

  const currentIntegration = integrations.find((i) => i.provider === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif text-[#0D1112]">Third-Party Integrations Vault</h1>
        <p className="text-xs text-gray-500 mt-1">
          Encrypted secrets vault (AES-256-GCM). API keys and credentials are never transmitted to clients in plain text.
        </p>
      </div>

      {/* Provider Selector Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'R2', label: 'Cloudflare R2 Storage', desc: 'Asset Buckets & Direct Uploads' },
          { id: 'SHIPROCKET', label: 'Shiprocket Shipping', desc: 'AWB, Tracking & Webhooks' },
          { id: 'RAZORPAY', label: 'Razorpay Payments', desc: 'PG, Webhook & Reconciliation' },
          { id: 'SMTP', label: 'Transactional SMTP', desc: 'Order & Security Emails' },
        ].map((tab) => {
          const config = integrations.find((i) => i.provider === tab.id);
          const isConfigured = config && config.hasCredentials;
          const isTabActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-6 py-4 text-left border-b-2 font-medium text-xs transition-colors cursor-pointer flex flex-col gap-1 ${
                isTabActive
                  ? 'border-[#C6AE82] text-[#0D1112] bg-[#C6AE82]/5'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{tab.label}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConfigured && config.isEnabled ? 'bg-emerald-500' : 'bg-amber-400'
                  }`}
                />
              </div>
              <span className="text-[10px] text-gray-400">{tab.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Integration Configuration Body */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#0D1112] text-[#C6AE82]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">{activeTab} Gateway Status</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                    currentIntegration?.testStatus === 'CONNECTED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentIntegration?.testStatus === 'CONFIGURATION_REQUIRED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {currentIntegration?.testStatus || 'CONFIGURATION_REQUIRED'}
                </span>
                {currentIntegration?.lastTestedAt && (
                  <span className="text-[10px] text-gray-400 font-mono">
                    Last tested: {new Date(currentIntegration.lastTestedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center justify-between ${
              testResult.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            <span>{testResult.message}</span>
            <button onClick={() => setTestResult(null)} className="text-gray-400 hover:text-gray-600 font-bold">×</button>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Integration secrets securely encrypted and updated.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5 text-xs max-w-2xl">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <input
              type="checkbox"
              id="isEnabledCheck"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="rounded text-[#C6AE82] focus:ring-[#C6AE82]"
            />
            <label htmlFor="isEnabledCheck" className="font-semibold text-gray-800 cursor-pointer">
              Enable {activeTab} in production workflows
            </label>
          </div>

          {/* R2 Fields */}
          {activeTab === 'R2' && (
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Cloudflare Account ID</label>
                <input
                  type="text"
                  placeholder="e.g. 7f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c"
                  value={credentials.accountId || ''}
                  onChange={(e) => setCredentials({ ...credentials, accountId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">R2 Bucket Name</label>
                <input
                  type="text"
                  placeholder="illure-media-production"
                  value={settings.bucketName || ''}
                  onChange={(e) => setSettings({ ...settings, bucketName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">R2 Access Key ID</label>
                <input
                  type="text"
                  placeholder={credentials.accessKeyId || 'Enter Access Key ID'}
                  onChange={(e) => setCredentials({ ...credentials, accessKeyId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">R2 Secret Access Key</label>
                <input
                  type="password"
                  placeholder={credentials.secretAccessKey || '••••••••••••••••'}
                  onChange={(e) => setCredentials({ ...credentials, secretAccessKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Public Base Domain / CDN (Optional)</label>
                <input
                  type="url"
                  placeholder="https://assets.illurefragrance.com"
                  value={settings.publicBaseUrl || ''}
                  onChange={(e) => setSettings({ ...settings, publicBaseUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono focus:outline-none focus:border-[#C6AE82]"
                />
              </div>
            </div>
          )}

          {/* SHIPROCKET Fields */}
          {activeTab === 'SHIPROCKET' && (
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Shiprocket Registered Email</label>
                <input
                  type="email"
                  placeholder="shipping@illurefragrance.com"
                  value={credentials.email || ''}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Shiprocket Account Password</label>
                <input
                  type="password"
                  placeholder={credentials.password || '••••••••••••••••'}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Pickup Location Name</label>
                <input
                  type="text"
                  placeholder="Primary Warehouse"
                  value={settings.pickupLocationName || ''}
                  onChange={(e) => setSettings({ ...settings, pickupLocationName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Webhook Security Key (x-api-key)</label>
                <input
                  type="password"
                  placeholder={credentials.webhookSecret || '••••••••••••••••'}
                  onChange={(e) => setCredentials({ ...credentials, webhookSecret: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono focus:outline-none focus:border-[#C6AE82]"
                />
              </div>
            </div>
          )}

          {/* RAZORPAY Fields */}
          {activeTab === 'RAZORPAY' && (
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Razorpay Key ID</label>
                <input
                  type="text"
                  placeholder="rzp_live_..."
                  value={credentials.keyId || ''}
                  onChange={(e) => setCredentials({ ...credentials, keyId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Razorpay Key Secret</label>
                <input
                  type="password"
                  placeholder={credentials.keySecret || '••••••••••••••••'}
                  onChange={(e) => setCredentials({ ...credentials, keySecret: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Webhook Secret</label>
                <input
                  type="password"
                  placeholder={credentials.webhookSecret || '••••••••••••••••'}
                  onChange={(e) => setCredentials({ ...credentials, webhookSecret: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono focus:outline-none focus:border-[#C6AE82]"
                />
              </div>
            </div>
          )}

          {/* SMTP Fields */}
          {activeTab === 'SMTP' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">SMTP Host</label>
                  <input
                    type="text"
                    placeholder="smtp.sendgrid.net"
                    value={settings.host || ''}
                    onChange={(e) => setSettings({ ...settings, host: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">SMTP Port</label>
                  <input
                    type="number"
                    placeholder="587"
                    value={settings.port || 587}
                    onChange={(e) => setSettings({ ...settings, port: parseInt(e.target.value, 10) || 587 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">SMTP Username / User</label>
                <input
                  type="text"
                  placeholder="apikey or user@domain.com"
                  value={credentials.user || ''}
                  onChange={(e) => setCredentials({ ...credentials, user: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">SMTP Password / API Key</label>
                <input
                  type="password"
                  placeholder={credentials.pass || '••••••••••••••••'}
                  onChange={(e) => setCredentials({ ...credentials, pass: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono focus:outline-none focus:border-[#C6AE82]"
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C6AE82] hover:bg-[#B38E46] text-[#080C0D] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Encrypting & Saving...' : 'Save Credentials'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
