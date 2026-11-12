import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { Bell, Plus, Trash2, Edit2, Link as LinkIcon, Check, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminTickerPage() {
  const { accessToken } = useAdminAuth();
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTicker, setEditingTicker] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    message: '',
    linkLabel: '',
    linkUrl: '',
    priority: 0,
    isEnabled: true,
  });

  const fetchTickers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/content/tickers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTickers(data.data.tickers || []);
      }
    } catch (err) {
      console.error('Fetch tickers error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickers();
  }, [accessToken]);

  const handleOpenCreate = () => {
    setEditingTicker(null);
    setFormData({
      message: '',
      linkLabel: '',
      linkUrl: '',
      priority: tickers.length,
      isEnabled: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (ticker) => {
    setEditingTicker(ticker);
    setFormData({
      message: ticker.message,
      linkLabel: ticker.linkLabel || '',
      linkUrl: ticker.linkUrl || '',
      priority: ticker.priority || 0,
      isEnabled: ticker.isEnabled,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingTicker
        ? `${API_BASE}/admin/content/tickers/${editingTicker.id}`
        : `${API_BASE}/admin/content/tickers`;
      const method = editingTicker ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchTickers();
      }
    } catch (err) {
      console.error('Save ticker error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement ticker?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/content/tickers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        fetchTickers();
      }
    } catch (err) {
      console.error('Delete ticker error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#0D1112]">Announcement Ticker</h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure header marquee announcements, shipping offers, and seasonal notifications
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C6AE82] hover:bg-[#B38E46] text-[#080C0D] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Announcement
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-[#0D1112] text-[#F2EFE8] uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Message</th>
              <th className="px-6 py-3.5">Action Link</th>
              <th className="px-6 py-3.5">Priority</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Loading announcements...
                </td>
              </tr>
            ) : tickers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  No announcements active. Add an announcement strip to display at the top of the store.
                </td>
              </tr>
            ) : (
              tickers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{t.message}</td>
                  <td className="px-6 py-4">
                    {t.linkUrl ? (
                      <span className="font-mono text-gray-500">
                        {t.linkLabel || 'Link'} → {t.linkUrl}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono">{t.priority}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        t.isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {t.isEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-1.5 text-gray-600 hover:text-[#8C6D32] hover:bg-gray-100 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-serif text-lg text-gray-900">
                {editingTicker ? 'Edit Announcement' : 'New Announcement'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Announcement Text</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Complimentary Luxury Packaging on all prepaid orders."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Action Label</label>
                  <input
                    type="text"
                    placeholder="e.g. SHOP NOW"
                    value={formData.linkLabel}
                    onChange={(e) => setFormData({ ...formData, linkLabel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Action URL</label>
                  <input
                    type="text"
                    placeholder="/catalog"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Priority Order</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isTickerEnabled"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  className="rounded text-[#C6AE82] focus:ring-[#C6AE82]"
                />
                <label htmlFor="isTickerEnabled" className="font-medium text-gray-700 cursor-pointer">
                  Show ticker on storefront header
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C6AE82] hover:bg-[#B38E46] text-[#080C0D] font-semibold uppercase tracking-wider rounded-lg"
                >
                  Save Ticker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
