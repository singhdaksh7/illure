import React, { useState, useEffect } from 'react';
import { ordersApi } from '../../api/orders';
import { Search, Filter, RefreshCw, Eye, Clock, CheckCircle2, AlertTriangle, Truck, X, Loader2 } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 15, totalPages: 1, total: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  // Selected Order for Detail Drawer
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const fetchOrders = async (page = pagination.page) => {
    setLoading(true);
    try {
      const params = { page, pageSize: pagination.pageSize };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter;

      const res = await ordersApi.getAdminOrders(params);
      if (res?.data) {
        setOrders(res.data.items);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [statusFilter, paymentStatusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders(1);
  };

  const handleOpenDetail = async (id) => {
    setSelectedOrderId(id);
    setLoadingDetail(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const res = await ordersApi.getAdminOrderDetails(id);
      if (res?.data) {
        setOrderDetails(res.data);
        setNewStatus(res.data.status);
        setStatusNote('');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrderId || !newStatus) return;
    setUpdatingStatus(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await ordersApi.updateOrderStatus(selectedOrderId, newStatus, statusNote);
      if (res?.data) {
        setOrderDetails(res.data);
        setStatusMsg({ type: 'success', text: `Status updated to ${newStatus} successfully.` });
        fetchOrders(pagination.page);
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to update order status.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getValidTransitions = (currentStatus) => {
    const transitions = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['PACKED', 'CANCELLED'],
      PACKED: ['SHIPPED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: ['RETURN_REQUESTED'],
      CANCELLED: [],
      RETURN_REQUESTED: ['RETURNED', 'DELIVERED'],
      RETURNED: [],
    };
    return transitions[currentStatus] || [];
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial-serif text-3xl text-[#F2EFE8]">Order Management</h2>
          <p className="font-interface-sans text-xs text-[#8F9897]">Track, confirm, pack, ship, and update order statuses.</p>
        </div>
        <button
          onClick={() => fetchOrders(pagination.page)}
          className="px-4 py-2 bg-[#172022] border border-white/10 text-xs font-interface-sans text-[#F2EFE8] hover:border-[#B89A62] transition-colors rounded-xs flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>REFRESH</span>
        </button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-[#101617] border border-white/10 p-4 rounded-xs flex flex-col md:flex-row items-center justify-between gap-4 font-interface-sans text-xs">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full md:w-auto flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer name, phone, email..."
            className="w-full bg-[#080C0D] border border-white/10 px-3 py-2 text-[#F2EFE8] outline-none focus:border-[#B89A62]"
          />
          <button type="submit" className="px-4 py-2 bg-[#B89A62] text-[#080C0D] font-bold uppercase cursor-pointer">
            <Search className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#080C0D] border border-white/10 px-3 py-2 text-[#F2EFE8] outline-none focus:border-[#B89A62]"
          >
            <option value="">ALL STATUSES</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="PACKED">PACKED</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="bg-[#080C0D] border border-white/10 px-3 py-2 text-[#F2EFE8] outline-none focus:border-[#B89A62]"
          >
            <option value="">ALL PAYMENTS</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="COD_PENDING">COD PENDING</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-[#101617] border border-white/10 rounded-xs overflow-x-auto">
        <table className="w-full text-left font-interface-sans text-xs">
          <thead className="bg-[#080C0D] text-[#8F9897] uppercase tracking-wider border-b border-white/10">
            <tr>
              <th className="p-4">Order Number</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[#F2EFE8]">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-[#8F9897]">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#B89A62]" />
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-[#8F9897]">
                  No orders found matching the filter criteria.
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#161C1D]">
                  <td className="p-4 font-bold text-[#B89A62]">#{ord.orderNumber}</td>
                  <td className="p-4">
                    <div className="font-medium text-[#F2EFE8]">{ord.customerName}</div>
                    <div className="text-[10px] text-[#8F9897]">{ord.customerPhone}</div>
                  </td>
                  <td className="p-4">{ord.itemCount} items</td>
                  <td className="p-4 font-bold">₹{ord.totalAmount}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-xs ${
                      ord.status === 'DELIVERED' ? 'bg-green-950/60 text-green-400 border border-green-800/40' :
                      ord.status === 'CANCELLED' ? 'bg-red-950/60 text-red-400 border border-red-800/40' :
                      'bg-[#172022] text-[#B89A62] border border-[#B89A62]/30'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-xs ${
                      ord.paymentStatus === 'PAID' ? 'bg-green-950/60 text-green-400 border border-green-800/40' :
                      ord.paymentStatus === 'FAILED' ? 'bg-red-950/60 text-red-400 border border-red-800/40' :
                      'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                    }`}>
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-[#8F9897]">{new Date(ord.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleOpenDetail(ord.id)}
                      className="px-3 py-1.5 bg-[#172022] border border-white/10 hover:border-[#B89A62] text-[#F2EFE8] rounded-xs text-[11px] font-bold uppercase transition-colors cursor-pointer inline-flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>MANAGE</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ORDER DETAIL DRAWER / MODAL */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-end select-none">
          <div className="fixed inset-0 bg-[#080C0D]/80 backdrop-blur-md" onClick={() => setSelectedOrderId(null)} />

          <div className="relative z-10 w-full max-w-2xl h-full bg-[#101617] border-l border-white/10 p-6 md:p-8 space-y-6 text-[#F2EFE8] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-interface-sans text-[#B89A62] tracking-widest uppercase">ADMIN ORDER SNAPSHOT</span>
                <h3 className="font-editorial-serif text-2xl text-[#F2EFE8]">#{orderDetails?.orderNumber || '...'}</h3>
              </div>
              <button onClick={() => setSelectedOrderId(null)} className="p-2 text-[#8F9897] hover:text-[#F2EFE8] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-16 text-center text-[#B89A62]">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : orderDetails ? (
              <div className="space-y-6 text-xs font-interface-sans">
                
                {/* UPDATE STATUS CONTROL */}
                <div className="bg-[#172022] border border-[#B89A62]/40 p-4 rounded-xs space-y-3">
                  <span className="font-bold text-[#B89A62] uppercase tracking-wider block">UPDATE ORDER STATUS</span>
                  
                  {statusMsg.text && (
                    <div className={`p-2.5 rounded-xs text-xs font-medium ${
                      statusMsg.type === 'success' ? 'bg-green-950/60 text-green-300 border border-green-800' : 'bg-red-950/60 text-red-300 border border-red-800'
                    }`}>
                      {statusMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleUpdateStatus} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-[#8F9897] uppercase mb-1">Current Status</label>
                        <div className="font-bold text-[#F2EFE8] p-2.5 bg-[#080C0D] border border-white/10">{orderDetails.status}</div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#8F9897] uppercase mb-1">Transition To</label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full bg-[#080C0D] border border-white/10 p-2.5 text-[#F2EFE8] outline-none focus:border-[#B89A62]"
                        >
                          <option value={orderDetails.status}>{orderDetails.status} (No change)</option>
                          {getValidTransitions(orderDetails.status).map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#8F9897] uppercase mb-1">Status Note / Reason</label>
                      <input
                        type="text"
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="e.g. Packed with luxury box #4"
                        className="w-full bg-[#080C0D] border border-white/10 p-2.5 text-[#F2EFE8] outline-none focus:border-[#B89A62]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updatingStatus || newStatus === orderDetails.status}
                      className="px-5 py-2.5 bg-[#B89A62] text-[#080C0D] font-bold uppercase tracking-wider cursor-pointer hover:bg-[#d4b478] disabled:opacity-50"
                    >
                      {updatingStatus ? 'UPDATING...' : 'APPLY STATUS CHANGE'}
                    </button>
                  </form>
                </div>

                {/* CUSTOMER & SHIPPING INFO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#080C0D] p-4 border border-white/5 space-y-1">
                    <span className="text-[10px] text-[#B89A62] uppercase tracking-wider font-bold">CUSTOMER DETAILS</span>
                    <div className="font-bold text-[#F2EFE8]">{orderDetails.customerName}</div>
                    <div className="text-[#8F9897]">Phone: {orderDetails.customerPhone}</div>
                    <div className="text-[#8F9897]">Email: {orderDetails.customerEmail || 'N/A'}</div>
                  </div>

                  <div className="bg-[#080C0D] p-4 border border-white/5 space-y-1">
                    <span className="text-[10px] text-[#B89A62] uppercase tracking-wider font-bold">SHIPPING ADDRESS</span>
                    {orderDetails.shippingAddress ? (
                      <div className="text-[#8F9897]">
                        <div className="text-[#F2EFE8] font-bold">{orderDetails.shippingAddress.fullName}</div>
                        <div>{orderDetails.shippingAddress.addressLine1}</div>
                        <div>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} - {orderDetails.shippingAddress.postalCode}</div>
                      </div>
                    ) : (
                      <div className="text-[#8F9897]">No address snapshot available</div>
                    )}
                  </div>
                </div>

                {/* ORDER ITEMS SNAPSHOT */}
                <div className="space-y-2">
                  <span className="text-[10px] text-[#8F9897] uppercase tracking-wider font-bold">ORDER ITEMS SNAPSHOT</span>
                  <div className="bg-[#080C0D] border border-white/5 divide-y divide-white/5">
                    {orderDetails.items?.map((item) => (
                      <div key={item.id} className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#F2EFE8]">{item.productName}</div>
                          {item.inspiredByName && <div className="text-[10px] text-[#B89A62] italic">Inspired by {item.inspiredByName}</div>}
                          <div className="text-[#8F9897]">SKU: {item.sku} | Size: {item.sizeLabel} | Qty: {item.quantity}</div>
                          {item.giftPackagingName && <div className="text-[10px] text-[#B89A62]">🎁 {item.giftPackagingName}</div>}
                        </div>
                        <div className="font-bold text-[#F2EFE8]">₹{item.lineTotal}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STATUS HISTORY TIMELINE */}
                <div className="space-y-2">
                  <span className="text-[10px] text-[#8F9897] uppercase tracking-wider font-bold">STATUS AUDIT TIMELINE</span>
                  <div className="bg-[#080C0D] p-4 border border-white/5 space-y-2">
                    {orderDetails.statusHistory?.map((hist, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] border-b border-white/5 pb-2 last:border-0">
                        <div>
                          <span className="font-bold text-[#B89A62]">{hist.newStatus}</span>
                          {hist.note && <span className="text-[#8F9897] italic ml-2">({hist.note})</span>}
                          {hist.changedByAdmin && <span className="text-[#8F9897] block text-[10px]">by {hist.changedByAdmin.name} ({hist.changedByAdmin.email})</span>}
                        </div>
                        <span className="text-[#8F9897]">{new Date(hist.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
