import { useState, useEffect } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { Boxes, AlertTriangle, History, ArrowUpRight, ArrowDownRight, Sliders } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function AdminInventoryPage() {
  const { accessToken } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'low-stock' | 'movements'

  // Data states
  const [products, setProducts] = useState([]);
  const [lowStockVariants, setLowStockVariants] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Adjustment Modal state
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantityDelta, setQuantityDelta] = useState(0);
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [movementType, setMovementType] = useState('ADJUSTMENT');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'all') {
        const res = await fetch(`${API_BASE}/admin/products?pageSize=100`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setProducts(data.data.items || []);
        }
      } else if (activeTab === 'low-stock') {
        const res = await fetch(`${API_BASE}/admin/inventory/low-stock`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setLowStockVariants(data.data.lowStockVariants || []);
        }
      } else if (activeTab === 'movements') {
        const res = await fetch(`${API_BASE}/admin/inventory/movements?pageSize=50`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setMovements(data.data.items || []);
        }
      }
    } catch (err) {
      console.error('Fetch inventory error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [activeTab, accessToken]);

  const handleOpenAdjust = (variant, productInfo) => {
    setSelectedVariant({ ...variant, productName: productInfo?.name || variant.product?.name });
    setQuantityDelta(0);
    setReason('');
    setReference('');
    setMovementType('ADJUSTMENT');
    setError('');
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!quantityDelta || quantityDelta === 0) {
      setError('Quantity delta cannot be 0.');
      return;
    }
    if (!reason.trim()) {
      setError('A reason for manual stock adjustment is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/admin/inventory/${selectedVariant.id}/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          quantityDelta: Number(quantityDelta),
          reason: reason.trim(),
          reference: reference.trim() || undefined,
          movementType,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Stock adjustment failed.');
      }

      setAdjustModalOpen(false);
      fetchInventoryData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#0D1112]">Inventory Control &amp; Movement Audit</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time stock quantities, low-stock threshold alerts, and transactional audit trails
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { id: 'all', label: 'All Product Variants', icon: Boxes },
          { id: 'low-stock', label: 'Low Stock Alerts', icon: AlertTriangle, badge: lowStockVariants.length },
          { id: 'movements', label: 'Movement Audit History', icon: History },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#C6AE82] text-[#8C6D32] bg-white rounded-t-lg'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              {t.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ALL VARIANTS */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-[#0D1112] text-[#F2EFE8] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Product Name</th>
                <th className="px-6 py-3.5">Size</th>
                <th className="px-6 py-3.5">SKU</th>
                <th className="px-6 py-3.5">Current Stock</th>
                <th className="px-6 py-3.5">Threshold</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    Loading inventory...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.flatMap((prod) =>
                  prod.variants.map((v) => {
                    const isLow = v.stockQuantity <= v.lowStockThreshold;
                    return (
                      <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{prod.name}</td>
                        <td className="px-6 py-4">{v.sizeLabel}</td>
                        <td className="px-6 py-4 font-mono text-gray-500">{v.sku}</td>
                        <td className="px-6 py-4 font-mono font-bold text-gray-900">
                          {v.stockQuantity}
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-400">{v.lowStockThreshold}</td>
                        <td className="px-6 py-4">
                          {v.stockQuantity === 0 ? (
                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-semibold">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                              Healthy
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenAdjust(v, prod)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-[#C6AE82] hover:text-[#080C0D] text-gray-700 text-xs font-medium rounded transition-colors cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" /> Adjust
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: LOW STOCK ALERTS */}
      {activeTab === 'low-stock' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-[#0D1112] text-[#F2EFE8] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5">Size</th>
                <th className="px-6 py-3.5">SKU</th>
                <th className="px-6 py-3.5">Current Stock</th>
                <th className="px-6 py-3.5">Threshold</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Checking low stock alerts...
                  </td>
                </tr>
              ) : lowStockVariants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-emerald-600 font-medium">
                    All variants maintain healthy inventory levels! No low stock alerts.
                  </td>
                </tr>
              ) : (
                lowStockVariants.map((v) => (
                  <tr key={v.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{v.product?.name}</td>
                    <td className="px-6 py-4">{v.sizeLabel}</td>
                    <td className="px-6 py-4 font-mono text-gray-500">{v.sku}</td>
                    <td className="px-6 py-4 font-mono font-bold text-red-600">{v.stockQuantity}</td>
                    <td className="px-6 py-4 font-mono text-gray-400">{v.lowStockThreshold}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenAdjust(v, v.product)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#C6AE82] hover:bg-[#B38E46] text-[#080C0D] text-xs font-semibold rounded transition-colors cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5" /> Replenish
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: MOVEMENT AUDIT HISTORY */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-[#0D1112] text-[#F2EFE8] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Product &amp; SKU</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Quantity Delta</th>
                <th className="px-6 py-3.5">Reason</th>
                <th className="px-6 py-3.5">Admin Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No movement records recorded.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono text-[11px]">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{m.variant?.product?.name}</p>
                      <p className="text-[10px] font-mono text-gray-400">
                        {m.variant?.sizeLabel} • SKU: {m.variant?.sku}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-xs">
                      <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
                        {m.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-sm">
                      {m.quantity > 0 ? (
                        <span className="text-emerald-600 flex items-center gap-0.5">
                          <ArrowUpRight className="w-4 h-4" />+{m.quantity}
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-0.5">
                          <ArrowDownRight className="w-4 h-4" />{m.quantity}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs">{m.reason || '—'}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {m.createdByAdmin?.name || 'System Auto'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ADJUSTMENT MODAL */}
      {adjustModalOpen && selectedVariant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-200">
            <div>
              <h2 className="text-lg font-serif text-[#0D1112]">Stock Adjustment</h2>
              <p className="text-xs text-gray-500 mt-1">
                {selectedVariant.productName} ({selectedVariant.sizeLabel} • SKU: {selectedVariant.sku})
              </p>
              <p className="text-xs font-mono mt-1 text-[#8C6D32] font-semibold">
                Current Stock: {selectedVariant.stockQuantity}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Movement Type
                </label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                >
                  <option value="ADJUSTMENT">ADJUSTMENT (Manual Audit Correction)</option>
                  <option value="PURCHASE">PURCHASE (New Stock Received)</option>
                  <option value="RETURN">RETURN (Customer Return Stock Restoration)</option>
                  <option value="SALE">SALE (Manual Order Deduction)</option>
                  <option value="CANCELLATION">CANCELLATION (Order Cancellation Restoration)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quantity Delta * (+ to add, - to reduce)
                </label>
                <input
                  type="number"
                  required
                  value={quantityDelta}
                  onChange={(e) => setQuantityDelta(Number(e.target.value))}
                  placeholder="e.g. +10 or -5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-[#C6AE82]"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Resulting Stock Will Be:{' '}
                  <span className="font-bold text-gray-800">
                    {selectedVariant.stockQuantity + Number(quantityDelta)}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Adjustment *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Received new shipment batch #402..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reference Document (Optional)
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. PO-2026-881"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-[#C6AE82]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#C6AE82] hover:bg-[#B38E46] text-[#080C0D] text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
