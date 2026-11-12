import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { FileText, Plus, Trash2, Edit2, ExternalLink, Check, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminPagesPage() {
  const { accessToken } = useAdminAuth();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
    status: 'PUBLISHED',
  });

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/content/pages`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPages(data.data.pages || []);
      }
    } catch (err) {
      console.error('Fetch pages error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [accessToken]);

  const handleOpenCreate = () => {
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      seoTitle: '',
      seoDescription: '',
      status: 'PUBLISHED',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      seoTitle: page.seoTitle || '',
      seoDescription: page.seoDescription || '',
      status: page.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingPage
        ? `${API_BASE}/admin/content/pages/${editingPage.id}`
        : `${API_BASE}/admin/content/pages`;
      const method = editingPage ? 'PATCH' : 'POST';

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
        fetchPages();
      }
    } catch (err) {
      console.error('Save page error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this static page?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/content/pages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        fetchPages();
      }
    } catch (err) {
      console.error('Delete page error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#0D1112]">Static Pages & Policies</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage legal documents, Brand Story, FAQ, Shipping & Return policies, and Terms
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C6AE82] hover:bg-[#B38E46] text-[#080C0D] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Page
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-[#0D1112] text-[#F2EFE8] uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Page Title</th>
              <th className="px-6 py-3.5">Slug</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Last Updated</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Loading static pages...
                </td>
              </tr>
            ) : pages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  No static pages found. Create About Us, Shipping Policy, or Terms.
                </td>
              </tr>
            ) : (
              pages.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.title}</td>
                  <td className="px-6 py-4 font-mono text-gray-500">/page/{p.slug}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        p.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-gray-600 hover:text-[#8C6D32] hover:bg-gray-100 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
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
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-serif text-lg text-gray-900">
                {editingPage ? 'Edit Page' : 'Create Static Page'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Page Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shipping & Delivery Policy"
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                      setFormData({
                        ...formData,
                        title,
                        slug: editingPage ? formData.slug : slug,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    placeholder="shipping-policy"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Content (Markdown or HTML)</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Enter policy details or brand story..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">SEO Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="Meta Title"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C6AE82]"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">SEO Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Meta description for search engines..."
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C6AE82]"
                />
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
                  Save Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
