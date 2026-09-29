import { useState, useEffect } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { Award, Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, Info } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function AdminReferenceBrandsPage() {
  const { accessToken } = useAdminAuth();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/reference-brands`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBrands(data.data.brands || []);
      }
    } catch (err) {
      console.error('Fetch brands error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [accessToken]);

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setFormData({ name: '', slug: '', description: '', isActive: true });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || '',
      isActive: brand.isActive,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const url = editingBrand
        ? `${API_BASE}/admin/reference-brands/${editingBrand.id}`
        : `${API_BASE}/admin/reference-brands`;
      const method = editingBrand ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug || undefined,
          description: formData.description || undefined,
          isActive: formData.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to save reference brand.');
      }

      setShowModal(false);
      fetchBrands();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove or deactivate this reference brand?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/reference-brands/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        fetchBrands();
      }
    } catch (err) {
      console.error('Delete reference brand error:', err);
    }
  };

  const filtered = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="bg-[#0D1112] border border-[#C6AE82]/30 p-4 rounded-xl text-[#F2EFE8] flex items-start gap-3 text-xs shadow-md">
        <Info className="w-5 h-5 text-[#C6AE82] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-[#C6AE82] uppercase tracking-wider text-[11px]">
            Inspiration &amp; Reference Metadata Notice
          </p>
          <p className="text-gray-300">
            Reference Brands (e.g., Tom Ford, Giorgio Armani, Creed) are strictly used to describe fragrance profile inspiration. Reference Brands are <span className="text-[#C6AE82] font-semibold">NOT</span> the manufacturers or owners of İLLURÊ products.
          </p>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#0D1112]">Reference Brand Houses</h1>
          <p className="text-xs text-gray-500 mt-1">
            Designer &amp; niche luxury houses referenced for scent profile inspiration
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C6AE82] hover:bg-[#B38E46] text-[#080C0D] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Reference Brand
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Filter reference brands..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
        />
      </div>

      {/* Brands Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-[#0D1112] text-[#F2EFE8] uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Brand Name</th>
              <th className="px-6 py-3.5">Slug</th>
              <th className="px-6 py-3.5">Description</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-sans">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Loading reference brands...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  No reference brands found.
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#C6AE82]/15 flex items-center justify-center text-[#8C6D32]">
                      <Award className="w-4 h-4" />
                    </div>
                    <span>{b.name}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-500">{b.slug}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{b.description || '—'}</td>
                  <td className="px-6 py-4">
                    {b.isActive ? (
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
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 text-gray-600 hover:text-[#8C6D32] hover:bg-gray-100 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-200">
            <h2 className="text-lg font-serif text-[#0D1112]">
              {editingBrand ? 'Edit Reference Brand' : 'Create Reference Brand'}
            </h2>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Tom Ford"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Slug (Auto-generated if empty)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="tom-ford"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Designer luxury house notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div className="pt-2">
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
                  {submitting ? 'Saving...' : 'Save Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
