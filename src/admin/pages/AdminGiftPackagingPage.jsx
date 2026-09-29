import { useState, useEffect } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { Gift, Plus, Edit2, Trash2, CheckCircle2, XCircle, Info } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function AdminGiftPackagingPage() {
  const { accessToken } = useAdminAuth();
  const [giftPackaging, setGiftPackaging] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 499,
    imageUrl: '',
    isActive: true,
    sortOrder: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchGiftPackaging = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/gift-packaging`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGiftPackaging(data.data.giftPackaging || []);
      }
    } catch (err) {
      console.error('Fetch gift packaging error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiftPackaging();
  }, [accessToken]);

  const handleOpenCreate = () => {
    setEditingPkg(null);
    setFormData({
      name: '',
      description: '',
      price: 499,
      imageUrl: '',
      isActive: true,
      sortOrder: giftPackaging.length + 1,
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingPkg(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      price: Number(pkg.price),
      imageUrl: pkg.imageUrl || '',
      isActive: pkg.isActive,
      sortOrder: pkg.sortOrder,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const url = editingPkg
        ? `${API_BASE}/admin/gift-packaging/${editingPkg.id}`
        : `${API_BASE}/admin/gift-packaging`;
      const method = editingPkg ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          price: Number(formData.price),
          imageUrl: formData.imageUrl || undefined,
          isActive: formData.isActive,
          sortOrder: Number(formData.sortOrder) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to save gift packaging option.');
      }

      setShowModal(false);
      fetchGiftPackaging();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this gift packaging option?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/gift-packaging/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        fetchGiftPackaging();
      }
    } catch (err) {
      console.error('Delete gift packaging error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="bg-[#0D1112] border border-[#C6AE82]/30 p-4 rounded-xl text-[#F2EFE8] flex items-start gap-3 text-xs shadow-md">
        <Info className="w-5 h-5 text-[#C6AE82] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-[#C6AE82] uppercase tracking-wider text-[11px]">
            Standard Packaging Notice
          </p>
          <p className="text-gray-300">
            Standard İLLURÊ box is <span className="text-[#C6AE82] font-semibold">INCLUDED FREE</span> with every fragrance order. Do NOT add charges for standard packaging. The items listed below represent <span className="text-[#C6AE82] font-semibold">OPTIONAL PAID</span> upgrades (e.g. Royal Velvet Gift Box, Custom Stamped Velvet Case).
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#0D1112]">Optional Gift Packaging</h1>
          <p className="text-xs text-gray-500 mt-1">
            Premium paid gift wrapping, velvet cases, and custom presentation boxes
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C6AE82] hover:bg-[#B38E46] text-[#080C0D] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Paid Packaging Option
        </button>
      </div>

      {/* Packaging Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-[#0D1112] text-[#F2EFE8] uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Option Name</th>
              <th className="px-6 py-3.5">Price (₹)</th>
              <th className="px-6 py-3.5">Description</th>
              <th className="px-6 py-3.5">Sort Order</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-sans">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  Loading packaging options...
                </td>
              </tr>
            ) : giftPackaging.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No gift packaging options configured.
                </td>
              </tr>
            ) : (
              giftPackaging.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#C6AE82]/15 flex items-center justify-center text-[#8C6D32]">
                      <Gift className="w-4 h-4" />
                    </div>
                    <span>{pkg.name}</span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-[#8C6D32]">
                    ₹{Number(pkg.price).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{pkg.description || '—'}</td>
                  <td className="px-6 py-4 font-mono">{pkg.sortOrder}</td>
                  <td className="px-6 py-4">
                    {pkg.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-gray-400 font-medium">
                        <XCircle className="w-3.5 h-3.5" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(pkg)}
                      className="p-1.5 text-gray-600 hover:text-[#8C6D32] hover:bg-gray-100 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-200">
            <h2 className="text-lg font-serif text-[#0D1112]">
              {editingPkg ? 'Edit Gift Packaging' : 'Add Gift Packaging Upgrade'}
            </h2>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Option Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Velvet Gift Box"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Embossed black velvet luxury box with silk ribbon..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-[#C6AE82] focus:ring-0"
                    />
                    <span>Active Status</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#C6AE82] hover:bg-[#B38E46] text-[#080C0D] text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Option'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
