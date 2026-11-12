import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { Truck, Search, ExternalLink, Package, RefreshCw, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminShipmentsPage() {
  const { accessToken } = useAdminAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/shipping/shipments`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShipments(data.data.shipments || []);
      }
    } catch (err) {
      console.error('Fetch shipments error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [accessToken]);

  const filtered = shipments.filter((s) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      s.awb?.toLowerCase().includes(term) ||
      s.shipmentId?.toLowerCase().includes(term) ||
      s.order?.orderNumber?.toLowerCase().includes(term) ||
      s.order?.customerName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#0D1112]">Shipments & Carrier Fulfillment</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real courier bookings, live AWB tracking codes, delivery status, and carrier webhook logs
          </p>
        </div>

        <button
          onClick={fetchShipments}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Shipments
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by AWB, Order #, or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
          />
        </div>

        <span className="text-xs font-mono text-gray-500">
          Showing {filtered.length} shipment(s)
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-[#0D1112] text-[#F2EFE8] uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Order Number</th>
              <th className="px-6 py-3.5">Courier & AWB</th>
              <th className="px-6 py-3.5">Customer & City</th>
              <th className="px-6 py-3.5">Fulfillment Status</th>
              <th className="px-6 py-3.5">Date Created</th>
              <th className="px-6 py-3.5 text-right">Tracking</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-mono">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  Loading shipment records...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No shipments found. Bookings created through Shiprocket or manual dispatch will appear here.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-sans font-medium text-gray-900">
                    {s.order?.orderNumber || s.orderId.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-sans font-semibold text-gray-800">{s.courierName || s.provider}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{s.awb || 'Pending AWB'}</p>
                  </td>
                  <td className="px-6 py-4 font-sans">
                    <p className="font-medium text-gray-800">{s.order?.customerName || 'Customer'}</p>
                    <p className="text-[10px] text-gray-400">
                      {s.order?.shippingAddress?.city || 'City'}, {s.order?.shippingAddress?.state || 'State'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        s.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'IN_TRANSIT' || s.status === 'OUT_FOR_DELIVERY'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-[11px]">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {s.trackingUrl ? (
                      <a
                        href={s.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#8C6D32] hover:underline"
                      >
                        <span>Track</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
