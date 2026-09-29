import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import AdminProductEditorModal from './AdminProductEditorModal';
import { Package, Plus, Search, Edit2, Archive, Star, Flame, Sparkles, Filter } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function AdminProductsPage() {
  const { accessToken } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  // Modal State
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Options
  const [brands, setBrands] = useState([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/admin/products?page=${pagination.page}&pageSize=${pagination.pageSize}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (brandFilter) url += `&referenceBrandId=${brandFilter}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts(data.data.items || []);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, statusFilter, brandFilter, accessToken]);

  useEffect(() => {
    async function loadBrands() {
      try {
        const res = await fetch(`${API_BASE}/admin/reference-brands`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (data.success) setBrands(data.data.brands || []);
      } catch (err) {
        console.error('Load brands error:', err);
      }
    }
    loadBrands();
  }, [accessToken]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchProducts();
  };

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setEditorModalOpen(true);
  };

  const handleOpenEdit = async (prod) => {
    try {
      const res = await fetch(`${API_BASE}/admin/products/${prod.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedProduct(data.data.product);
        setEditorModalOpen(true);
      }
    } catch (err) {
      console.error('Fetch product detail error:', err);
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm('Are you sure you want to archive this product?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Archive product error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#0D1112]">Fragrance Product Catalog</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage İLLURÊ fragrance catalog, dynamic 3/6/12 ML variants, pricing, and inspired-by profiles
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C6AE82] hover:bg-[#B38E46] text-[#080C0D] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create New Fragrance
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name, inspired-by scent, SKU, or family..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82] bg-white"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>

          <select
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82] bg-white"
          >
            <option value="">All Reference Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-[#0D1112] text-[#F2EFE8] uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Fragrance Product</th>
              <th className="px-6 py-3.5">Inspiration Metadata</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Variants &amp; Price Range</th>
              <th className="px-6 py-3.5">Stock</th>
              <th className="px-6 py-3.5">Merchandising</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-sans">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                      {prod.primaryImage ? (
                        <img
                          src={prod.primaryImage.url}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{prod.name}</p>
                      <p className="text-[10px] font-mono text-gray-400">{prod.slug}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {prod.inspiredByName ? (
                      <div>
                        <p className="font-medium text-gray-800">Inspired by {prod.inspiredByName}</p>
                        <p className="text-[10px] text-[#8C6D32] font-semibold">
                          {prod.referenceBrand?.name || 'Independent Profile'}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        prod.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : prod.status === 'DRAFT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {prod.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-mono font-bold text-gray-900">
                      ₹{prod.minPrice?.toLocaleString('en-IN')}
                      {prod.maxPrice && prod.maxPrice !== prod.minPrice
                        ? ` - ₹${prod.maxPrice.toLocaleString('en-IN')}`
                        : ''}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono">
                      {prod.variantsCount} Size Variant(s)
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`font-mono font-bold ${
                        prod.totalStock === 0
                          ? 'text-red-600'
                          : prod.totalStock < 10
                          ? 'text-amber-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {prod.totalStock} Units
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      {prod.featured && (
                        <span title="Featured" className="p-1 rounded bg-amber-50 text-amber-600 border border-amber-200">
                          <Star className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {prod.bestseller && (
                        <span title="Bestseller" className="p-1 rounded bg-red-50 text-red-600 border border-red-200">
                          <Flame className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {prod.newArrival && (
                        <span title="New Arrival" className="p-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <Sparkles className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="p-1.5 text-gray-600 hover:text-[#8C6D32] hover:bg-gray-100 rounded transition-colors"
                      title="Edit Product Record"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleArchive(prod.id)}
                      className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Archive Product"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Product Editor Modal */}
      {editorModalOpen && (
        <AdminProductEditorModal
          product={selectedProduct}
          onClose={() => setEditorModalOpen(false)}
          onSaved={() => fetchProducts()}
        />
      )}
    </div>
  );
}
