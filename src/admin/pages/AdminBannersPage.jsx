import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { Image, Plus, Trash2, Edit2, Calendar, Link as LinkIcon, Check, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminBannersPage() {
  const { accessToken } = useAdminAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    position: 'HOMEPAGE',
    desktopImageUrl: '',
    mobileImageUrl: '',
    headline: '',
    subheadline: '',
    ctaLabel: '',
    ctaUrl: '',
    sortOrder: 0,
    isEnabled: true,
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/content/banners`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBanners(data.data.banners || []);
      }
    } catch (err) {
      console.error('Fetch banners error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [accessToken]);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setFormData({
      name: '',
      position: 'HOMEPAGE',
      desktopImageUrl: '',
      mobileImageUrl: '',
      headline: '',
      subheadline: '',
      ctaLabel: '',
      ctaUrl: '',
      sortOrder: banners.length,
      isEnabled: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      name: banner.name,
      position: banner.position,
      desktopImageUrl: banner.desktopImageUrl || '',
      mobileImageUrl: banner.mobileImageUrl || '',
      headline: banner.headline || '',
      subheadline: banner.subheadline || '',
      ctaLabel: banner.ctaLabel || '',
      ctaUrl: banner.ctaUrl || '',
      sortOrder: banner.sortOrder || 0,
      isEnabled: banner.isEnabled,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingBanner
        ? `${API_BASE}/admin/content/banners/${editingBanner.id}`
        : `${API_BASE}/admin/content/banners`;
      const method = editingBanner ? 'PATCH' : 'POST';

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
        fetchBanners();
      }
    } catch (err) {
      console.error('Save banner error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner permanently?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/content/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        fetchBanners();
      }
    } catch (err) {
      console.error('Delete banner error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#0D1112]">Storefront Banners</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage hero visual slides, promotional announcement strips, and collection banners
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C6AE82] hover:bg-[#B38E46] text-[#080C0D] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Banner
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400 bg-white rounded-xl border border-gray-200">
          Loading banners...
        </div>
      ) : banners.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200 space-y-2">
          <Image className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-sm font-medium text-gray-700">No active banners</p>
          <p className="text-xs text-gray-400">Add homepage or category banners to showcase signature launches.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                <img
                  src={b.desktopImageUrl}
                  alt={b.name}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800';
                  }}
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-white">
                  {b.position}
                </span>
                <span
                  className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold ${
                    b.isEnabled ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                  }`}
                >
                  {b.isEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="p-4 space-y-2 flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{b.name}</h3>
                {b.headline && <p className="text-xs font-serif text-[#8C6D32]">{b.headline}</p>}
                {b.subheadline && <p className="text-xs text-gray-500 line-clamp-2">{b.subheadline}</p>}
                {b.ctaUrl && (
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                    <LinkIcon className="w-3 h-3" /> {b.ctaLabel || 'Shop'} → {b.ctaUrl}
                  </p>
                )}
              </div>

              <div className="p-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <span className="text-[10px] font-mono text-gray-400">Order: {b.sortOrder}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 text-gray-600 hover:text-[#8C6D32] hover:bg-white rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-white rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-serif text-lg text-gray-900">
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Banner Internal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amber Oud Holiday Hero"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C6AE82]"
                  >
                    <option value="HOMEPAGE">Homepage</option>
                    <option value="COLLECTION">Collection</option>
                    <option value="PRODUCT_PAGE">Product Page</option>
                    <option value="CHECKOUT">Checkout</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Desktop Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formData.desktopImageUrl}
                  onChange={(e) => setFormData({ ...formData, desktopImageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Mobile Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.mobileImageUrl}
                  onChange={(e) => setFormData({ ...formData, mobileImageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Headline</label>
                <input
                  type="text"
                  placeholder="e.g. THE NOIR COLLECTION"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Subheadline</label>
                <input
                  type="text"
                  placeholder="e.g. Artisanal extrait formulations engineered for high longevity."
                  value={formData.subheadline}
                  onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">CTA Button Label</label>
                  <input
                    type="text"
                    placeholder="e.g. EXPLORE SCENTS"
                    value={formData.ctaLabel}
                    onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">CTA Target URL</label>
                  <input
                    type="text"
                    placeholder="/catalog or /product/noir"
                    value={formData.ctaUrl}
                    onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  className="rounded text-[#C6AE82] focus:ring-[#C6AE82]"
                />
                <label htmlFor="isEnabled" className="font-medium text-gray-700 cursor-pointer">
                  Enable and show this banner on storefront
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
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
