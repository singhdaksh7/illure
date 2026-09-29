import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { X, Plus, Trash2, Image, Check } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function AdminProductEditorModal({ product, onClose, onSaved }) {
  const { accessToken } = useAdminAuth();
  const isEditing = !!product;

  // Options
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    shortDescription: product?.shortDescription || '',
    description: product?.description || '',
    referenceBrandId: product?.referenceBrandId || '',
    inspiredByName: product?.inspiredByName || '',
    gender: product?.gender || 'UNISEX',
    fragranceFamily: product?.fragranceFamily || 'Woody & Smoky',
    topNotes: product?.topNotes ? product.topNotes.join(', ') : '',
    heartNotes: product?.heartNotes ? product.heartNotes.join(', ') : '',
    baseNotes: product?.baseNotes ? product.baseNotes.join(', ') : '',
    occasion: product?.occasion || '',
    season: product?.season || '',
    longevity: product?.longevity || '8-10 Hours',
    projection: product?.projection || 'Moderate to Strong',
    featured: product?.featured ?? false,
    bestseller: product?.bestseller ?? false,
    newArrival: product?.newArrival ?? false,
    status: product?.status || 'ACTIVE',
    seoTitle: product?.seoTitle || '',
    seoDescription: product?.seoDescription || '',
    categoryIds: product?.categoryIds || (product?.productCategories ? product.productCategories.map(pc => pc.categoryId) : []),
    variants: product?.variants
      ? product.variants.map((v) => ({
          id: v.id,
          sizeLabel: v.sizeLabel,
          sizeMl: v.sizeMl ? Number(v.sizeMl) : undefined,
          sku: v.sku,
          price: Number(v.price),
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
          costPrice: v.costPrice ? Number(v.costPrice) : null,
          stockQuantity: v.stockQuantity,
          lowStockThreshold: v.lowStockThreshold || 5,
          isActive: v.isActive,
          sortOrder: v.sortOrder || 0,
        }))
      : [
          { sizeLabel: '3 ML Sample', sizeMl: 3, sku: '', price: 299, stockQuantity: 50, lowStockThreshold: 5, isActive: true, sortOrder: 1 },
          { sizeLabel: '6 ML Attar', sizeMl: 6, sku: '', price: 549, stockQuantity: 30, lowStockThreshold: 5, isActive: true, sortOrder: 2 },
          { sizeLabel: '12 ML Pocket Luxury', sizeMl: 12, sku: '', price: 999, stockQuantity: 20, lowStockThreshold: 5, isActive: true, sortOrder: 3 },
        ],
    images: product?.images
      ? product.images.map((img) => ({
          id: img.id,
          url: img.url,
          altText: img.altText || '',
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder || 0,
        }))
      : [
          { url: '/images/oud_wood.jpg', altText: 'Primary Fragrance Image', isPrimary: true, sortOrder: 0 },
        ],
  });

  const [activeSection, setActiveSection] = useState('basic'); // 'basic' | 'inspiration' | 'fragrance' | 'variants' | 'images' | 'merchandising' | 'seo'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOptions() {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch(`${API_BASE}/admin/categories`, { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch(`${API_BASE}/admin/reference-brands`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        ]);

        const catData = await catRes.json();
        const brandData = await brandRes.json();

        if (catData.success) setCategories(catData.data.categories || []);
        if (brandData.success) setBrands(brandData.data.brands || []);
      } catch (err) {
        console.error('Load editor options error:', err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, [accessToken]);

  // Variant Helpers
  const handleAddVariant = () => {
    const nextIdx = formData.variants.length + 1;
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          sizeLabel: '100 ML Extrait',
          sizeMl: 100,
          sku: '',
          price: 2499,
          stockQuantity: 15,
          lowStockThreshold: 5,
          isActive: true,
          sortOrder: nextIdx,
        },
      ],
    }));
  };

  const handleUpdateVariant = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  const handleRemoveVariant = (index) => {
    if (formData.variants.length <= 1) {
      alert('Product must have at least one variant.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  // Image Helpers
  const handleAddImage = () => {
    setFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        { url: '', altText: '', isPrimary: false, sortOrder: prev.images.length },
      ],
    }));
  };

  const handleUpdateImage = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.images];
      if (field === 'isPrimary' && value === true) {
        // Reset other images primary flag
        updated.forEach((img, i) => {
          img.isPrimary = i === index;
        });
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return { ...prev, images: updated };
    });
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const parseNotes = (str) =>
        typeof str === 'string' ? str.split(',').map((s) => s.trim()).filter(Boolean) : [];

      const payload = {
        name: formData.name,
        slug: formData.slug || undefined,
        shortDescription: formData.shortDescription || undefined,
        description: formData.description,
        referenceBrandId: formData.referenceBrandId || undefined,
        inspiredByName: formData.inspiredByName || undefined,
        gender: formData.gender,
        fragranceFamily: formData.fragranceFamily || undefined,
        topNotes: parseNotes(formData.topNotes),
        heartNotes: parseNotes(formData.heartNotes),
        baseNotes: parseNotes(formData.baseNotes),
        occasion: formData.occasion || undefined,
        season: formData.season || undefined,
        longevity: formData.longevity || undefined,
        projection: formData.projection || undefined,
        featured: formData.featured,
        bestseller: formData.bestseller,
        newArrival: formData.newArrival,
        status: formData.status,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
        categoryIds: formData.categoryIds,
        variants: formData.variants.map((v) => ({
          id: v.id,
          sizeLabel: v.sizeLabel,
          sizeMl: v.sizeMl ? Number(v.sizeMl) : undefined,
          sku: v.sku.toUpperCase(),
          price: Number(v.price),
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
          costPrice: v.costPrice ? Number(v.costPrice) : null,
          stockQuantity: Number(v.stockQuantity) || 0,
          lowStockThreshold: Number(v.lowStockThreshold) || 5,
          isActive: v.isActive,
          sortOrder: Number(v.sortOrder) || 0,
        })),
        images: formData.images.filter((img) => img.url.trim() !== ''),
      };

      const url = isEditing
        ? `${API_BASE}/admin/products/${product.id}`
        : `${API_BASE}/admin/products`;
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to save product.');
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0D1112] text-[#F2EFE8] px-6 py-4 flex items-center justify-between border-b border-[#C6AE82]/20">
          <div>
            <h2 className="text-lg font-serif tracking-wide text-white">
              {isEditing ? `Edit Product: ${product.name}` : 'Create New İLLURÊ Fragrance'}
            </h2>
            <p className="text-[11px] text-[#C6AE82]">
              Haute Parfumerie Catalog Architecture Editor
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:text-[#C6AE82] transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-2 text-xs border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'basic', label: 'Basic Info' },
            { id: 'inspiration', label: 'Inspiration Metadata' },
            { id: 'fragrance', label: 'Fragrance Profile' },
            { id: 'variants', label: `Variants (${formData.variants.length})` },
            { id: 'images', label: `Images (${formData.images.length})` },
            { id: 'merchandising', label: 'Merchandising & Status' },
            { id: 'seo', label: 'SEO' },
          ].map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeSection === sec.id
                  ? 'bg-[#0D1112] text-[#C6AE82]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: BASIC INFO */}
          {activeSection === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    İLLURÊ Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aqua Edge"
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
                    placeholder="aqua-edge"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Fresh marine citrus with sun-bleached driftwood..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Story &amp; Description *
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="An invigorating oceanic masterpiece inspired by Mediterranean sea spray..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                />
              </div>
            </div>
          )}

          {/* SECTION 2: INSPIRATION METADATA */}
          {activeSection === 'inspiration' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                <strong>Brand Separation Rule:</strong> Keep İLLURÊ product name distinct from the reference house and inspired fragrance name.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Reference House / Brand
                  </label>
                  <select
                    value={formData.referenceBrandId}
                    onChange={(e) => setFormData({ ...formData, referenceBrandId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                  >
                    <option value="">-- Select Reference Brand --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Inspired-By Fragrance Name
                  </label>
                  <input
                    type="text"
                    value={formData.inspiredByName}
                    onChange={(e) => setFormData({ ...formData, inspiredByName: e.target.value })}
                    placeholder="e.g. Acqua di Giò"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Gender Target</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                  >
                    <option value="UNISEX">UNISEX</option>
                    <option value="MEN">MEN</option>
                    <option value="WOMEN">WOMEN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Fragrance Family</label>
                  <input
                    type="text"
                    value={formData.fragranceFamily}
                    onChange={(e) => setFormData({ ...formData, fragranceFamily: e.target.value })}
                    placeholder="e.g. Fresh &amp; Aquatic"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Categories</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => {
                    const isChecked = formData.categoryIds.includes(cat.id);
                    return (
                      <label
                        key={cat.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-[#C6AE82]/15 border-[#C6AE82] text-[#8C6D32] font-semibold'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, categoryIds: [...formData.categoryIds, cat.id] });
                            } else {
                              setFormData({
                                ...formData,
                                categoryIds: formData.categoryIds.filter((id) => id !== cat.id),
                              });
                            }
                          }}
                          className="rounded text-[#C6AE82] focus:ring-0"
                        />
                        <span>{cat.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: FRAGRANCE PROFILE */}
          {activeSection === 'fragrance' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Top Notes (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.topNotes}
                  onChange={(e) => setFormData({ ...formData, topNotes: e.target.value })}
                  placeholder="Bergamot, Calabrian Lemon, Neroli"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Heart Notes (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.heartNotes}
                  onChange={(e) => setFormData({ ...formData, heartNotes: e.target.value })}
                  placeholder="Marine Accord, Rosemary, Jasmine"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Base Notes (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.baseNotes}
                  onChange={(e) => setFormData({ ...formData, baseNotes: e.target.value })}
                  placeholder="White Musk, Cedarwood, Patchouli"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Occasion</label>
                  <input
                    type="text"
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    placeholder="Daily Luxury / Summer Evenings"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Season</label>
                  <input
                    type="text"
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    placeholder="Spring / Summer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Longevity</label>
                  <input
                    type="text"
                    value={formData.longevity}
                    onChange={(e) => setFormData({ ...formData, longevity: e.target.value })}
                    placeholder="8-10 Hours"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Projection</label>
                  <input
                    type="text"
                    value={formData.projection}
                    onChange={(e) => setFormData({ ...formData, projection: e.target.value })}
                    placeholder="Moderate to Strong"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: VARIANTS */}
          {activeSection === 'variants' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-700">
                  Dynamic Product Sizes &amp; Pricing (3 ML, 6 ML, 12 ML, etc.)
                </p>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C6AE82] hover:bg-[#B38E46] text-[#080C0D] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Variant Size
                </button>
              </div>

              <div className="space-y-3">
                {formData.variants.map((v, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">Variant #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="text-red-500 hover:text-red-700 text-xs p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                          Size Label *
                        </label>
                        <input
                          type="text"
                          required
                          value={v.sizeLabel}
                          onChange={(e) => handleUpdateVariant(idx, 'sizeLabel', e.target.value)}
                          placeholder="e.g. 3 ML Sample"
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-[#C6AE82]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                          Size (ML)
                        </label>
                        <input
                          type="number"
                          value={v.sizeMl || ''}
                          onChange={(e) => handleUpdateVariant(idx, 'sizeMl', Number(e.target.value))}
                          placeholder="3"
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs font-mono bg-white focus:outline-none focus:border-[#C6AE82]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                          SKU *
                        </label>
                        <input
                          type="text"
                          required
                          value={v.sku}
                          onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                          placeholder="IL-AQE-003"
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs font-mono font-bold bg-white focus:outline-none focus:border-[#C6AE82]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                          Selling Price (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={v.price}
                          onChange={(e) => handleUpdateVariant(idx, 'price', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs font-mono font-bold bg-white focus:outline-none focus:border-[#C6AE82]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                          Compare Price (₹)
                        </label>
                        <input
                          type="number"
                          value={v.compareAtPrice || ''}
                          onChange={(e) => handleUpdateVariant(idx, 'compareAtPrice', e.target.value ? Number(e.target.value) : null)}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs font-mono bg-white focus:outline-none focus:border-[#C6AE82]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                          Stock Qty *
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={v.stockQuantity}
                          onChange={(e) => handleUpdateVariant(idx, 'stockQuantity', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs font-mono bg-white focus:outline-none focus:border-[#C6AE82]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                          Low Stock Threshold
                        </label>
                        <input
                          type="number"
                          value={v.lowStockThreshold}
                          onChange={(e) => handleUpdateVariant(idx, 'lowStockThreshold', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs font-mono bg-white focus:outline-none focus:border-[#C6AE82]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: IMAGES */}
          {activeSection === 'images' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-700">Product Images</p>
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C6AE82] hover:bg-[#B38E46] text-[#080C0D] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Image URL
                </button>
              </div>

              <div className="space-y-3">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-16 h-16 rounded bg-gray-200 overflow-hidden shrink-0">
                      {img.url ? (
                        <img src={img.url} alt={img.altText || ''} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Image className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <input
                        type="url"
                        required
                        value={img.url}
                        onChange={(e) => handleUpdateImage(idx, 'url', e.target.value)}
                        placeholder="Image URL (e.g. /images/oud_wood.jpg or https://...)"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:border-[#C6AE82]"
                      />
                      <input
                        type="text"
                        value={img.altText}
                        onChange={(e) => handleUpdateImage(idx, 'altText', e.target.value)}
                        placeholder="Alt text description..."
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#C6AE82]"
                      />
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="primaryImage"
                          checked={img.isPrimary}
                          onChange={() => handleUpdateImage(idx, 'isPrimary', true)}
                          className="text-[#C6AE82] focus:ring-0"
                        />
                        <span>Primary</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: MERCHANDISING & STATUS */}
          {activeSection === 'merchandising' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Product Publication Status *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'ACTIVE', label: 'ACTIVE (Publicly Visible)' },
                    { id: 'DRAFT', label: 'DRAFT (Hidden Internal)' },
                    { id: 'ARCHIVED', label: 'ARCHIVED (Discontinued)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: s.id })}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer text-center ${
                        formData.status === s.id
                          ? 'bg-[#0D1112] text-[#C6AE82] border-[#C6AE82]'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Catalog Highlighting &amp; Badges
                </label>
                <div className="space-y-3">
                  {[
                    { id: 'featured', label: 'Featured Collection Highlight' },
                    { id: 'bestseller', label: 'Bestseller Tag' },
                    { id: 'newArrival', label: 'New Arrival Badge' },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData[item.id]}
                        onChange={(e) => setFormData({ ...formData, [item.id]: e.target.checked })}
                        className="rounded text-[#C6AE82] focus:ring-0"
                      />
                      <span className="text-xs font-semibold text-gray-800">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: SEO */}
          {activeSection === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">SEO Title</label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder="Aqua Edge — Inspired by Acqua di Giò | İLLURÊ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">SEO Description</label>
                <textarea
                  rows={4}
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  placeholder="Discover Aqua Edge by İLLURÊ. Fresh marine citrus Extrait de Parfum..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                />
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-[11px] text-gray-500">
            {isEditing ? 'Editing Product Record' : 'New Product Record'}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 bg-[#C6AE82] hover:bg-[#B38E46] text-[#080C0D] text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {submitting ? 'Saving...' : 'Save Product Record'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
