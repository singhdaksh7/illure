import React, { useState, useEffect } from 'react';
import { User, MapPin, Package, LogOut, Plus, Trash2, Check, Star, AlertCircle, ChevronRight, Loader2, X, Clock, ShieldCheck } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { customerAddressesApi } from '../api/customer';
import { ordersApi } from '../api/orders';

export default function CustomerAccountPage({ onNavigate }) {
  const { customer, logout } = useCustomerAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressError, setAddressError] = useState(null);

  // Address form fields
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await customerAddressesApi.list();
      if (res?.data?.addresses) {
        setAddresses(res.data.addresses);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (customer) {
      fetchAddresses();
    }
  }, [customer]);

  if (!customer) {
    return (
      <div className="min-h-screen bg-[#080C0D] pt-32 pb-24 text-[#F2EFE8] flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="font-editorial-serif text-2xl">Please sign in to view your account.</p>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-3 bg-[#B89A62] text-[#080C0D] font-interface-sans text-xs font-bold uppercase tracking-widest"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setFormData({
      fullName: customer.name || '',
      phone: customer.phone || '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      postalCode: '',
      isDefault: addresses.length === 0,
    });
    setAddressError(null);
    setShowAddressModal(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingAddress(addr);
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault,
    });
    setAddressError(null);
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressError(null);
    try {
      if (editingAddress) {
        await customerAddressesApi.update(editingAddress.id, formData);
      } else {
        await customerAddressesApi.create(formData);
      }
      setShowAddressModal(false);
      fetchAddresses();
    } catch (err) {
      setAddressError(err.message || 'Failed to save address.');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await customerAddressesApi.delete(id);
      fetchAddresses();
    } catch (err) {
      alert(err.message || 'Failed to delete address.');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await customerAddressesApi.setDefault(id);
      fetchAddresses();
    } catch (err) {
      alert(err.message || 'Failed to set default address.');
    }
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-[#080C0D] pt-28 pb-24 text-[#F2EFE8] select-none">
      <div className="max-w-6xl mx-auto px-6 md:px-12 space-y-12">
        
        {/* HEADER & CLIENT SALUTATION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-white/[0.08] gap-4">
          <div>
            <span className="font-interface-sans text-[10px] tracking-[0.35em] text-[#B89A62] uppercase font-semibold">
              MEMBERSHIP DASHBOARD
            </span>
            <h1 className="font-editorial-serif text-4xl sm:text-5xl text-[#F2EFE8] font-light">
              Welcome, {customer.name}
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-2 px-5 py-2.5 border border-white/10 hover:border-red-400/50 text-[#8F9897] hover:text-red-400 text-xs font-interface-sans tracking-widest uppercase transition-colors rounded-xs self-start md:self-auto cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* ACCOUNT TABS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* TAB SIDEBAR */}
          <div className="md:col-span-3 space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full p-4 text-left font-interface-sans text-xs tracking-widest uppercase transition-all rounded-xs flex items-center space-x-3 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#161C1D] border border-[#B89A62] text-[#F2EFE8]'
                  : 'bg-[#101617] border border-white/[0.06] text-[#8F9897] hover:border-white/20'
              }`}
            >
              <User className="w-4 h-4 text-[#B89A62]" />
              <span>Client Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full p-4 text-left font-interface-sans text-xs tracking-widest uppercase transition-all rounded-xs flex items-center space-x-3 cursor-pointer ${
                activeTab === 'addresses'
                  ? 'bg-[#161C1D] border border-[#B89A62] text-[#F2EFE8]'
                  : 'bg-[#101617] border border-white/[0.06] text-[#8F9897] hover:border-white/20'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#B89A62]" />
              <span>Saved Addresses</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full p-4 text-left font-interface-sans text-xs tracking-widest uppercase transition-all rounded-xs flex items-center space-x-3 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#161C1D] border border-[#B89A62] text-[#F2EFE8]'
                  : 'bg-[#101617] border border-white/[0.06] text-[#8F9897] hover:border-white/20'
              }`}
            >
              <Package className="w-4 h-4 text-[#B89A62]" />
              <span>Order History</span>
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="md:col-span-9 bg-[#101617] border border-white/[0.08] p-8 rounded-xs min-h-[400px]">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-editorial-serif text-2xl text-[#F2EFE8]">Personal Details</h3>
                  <p className="font-interface-sans text-xs text-[#8F9897] font-light">Your verified account information.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 font-interface-sans">
                  <div className="p-4 bg-[#080C0D] border border-white/[0.06] rounded-xs space-y-1">
                    <span className="text-[10px] text-[#8F9897] uppercase tracking-wider">FULL NAME</span>
                    <p className="text-sm font-medium text-[#F2EFE8]">{customer.name}</p>
                  </div>

                  <div className="p-4 bg-[#080C0D] border border-white/[0.06] rounded-xs space-y-1">
                    <span className="text-[10px] text-[#8F9897] uppercase tracking-wider">EMAIL ADDRESS</span>
                    <p className="text-sm font-medium text-[#F2EFE8]">{customer.email || 'N/A'}</p>
                  </div>

                  <div className="p-4 bg-[#080C0D] border border-white/[0.06] rounded-xs space-y-1">
                    <span className="text-[10px] text-[#8F9897] uppercase tracking-wider">MOBILE NUMBER</span>
                    <p className="text-sm font-medium text-[#F2EFE8]">{customer.phone}</p>
                  </div>

                  <div className="p-4 bg-[#080C0D] border border-white/[0.06] rounded-xs space-y-1">
                    <span className="text-[10px] text-[#8F9897] uppercase tracking-wider">ACCOUNT STATUS</span>
                    <p className="text-sm font-medium text-emerald-400">ACTIVE MEMBER</p>
                  </div>
                </div>
              </div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-editorial-serif text-2xl text-[#F2EFE8]">Shipping Addresses</h3>
                    <p className="font-interface-sans text-xs text-[#8F9897] font-light">Manage your delivery addresses for express shipping.</p>
                  </div>

                  <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2.5 bg-[#B89A62] text-[#080C0D] font-interface-sans text-xs font-bold tracking-wider uppercase rounded-xs flex items-center space-x-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Address</span>
                  </button>
                </div>

                {loadingAddresses ? (
                  <div className="py-12 text-center text-[#8F9897] font-interface-sans text-xs">
                    Loading addresses...
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="py-12 text-center text-[#8F9897] font-interface-sans space-y-3 border border-dashed border-white/10 rounded-xs">
                    <MapPin className="w-8 h-8 text-[#B89A62] mx-auto opacity-50" />
                    <p className="text-sm">No saved addresses found.</p>
                    <button
                      onClick={handleOpenAddModal}
                      className="text-xs text-[#B89A62] underline font-semibold cursor-pointer"
                    >
                      Add your first shipping address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-5 bg-[#080C0D] border rounded-xs relative flex flex-col justify-between space-y-4 ${
                          addr.isDefault ? 'border-[#B89A62]' : 'border-white/[0.08]'
                        }`}
                      >
                        {addr.isDefault && (
                          <span className="absolute top-3 right-3 text-[9px] font-interface-sans tracking-widest font-bold text-[#B89A62] border border-[#B89A62]/40 px-2 py-0.5 bg-[#B89A62]/10 uppercase rounded-xs flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-current" />
                            <span>DEFAULT</span>
                          </span>
                        )}

                        <div className="space-y-1 font-interface-sans text-xs">
                          <p className="font-semibold text-[#F2EFE8] text-sm">{addr.fullName}</p>
                          <p className="text-[#8F9897]">{addr.addressLine1}</p>
                          {addr.addressLine2 && <p className="text-[#8F9897]">{addr.addressLine2}</p>}
                          {addr.landmark && <p className="text-[#8F9897]">Landmark: {addr.landmark}</p>}
                          <p className="text-[#8F9897]">{addr.city}, {addr.state} - {addr.postalCode}</p>
                          <p className="text-[#8F9897] pt-1">Phone: {addr.phone}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs font-interface-sans">
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefault(addr.id)}
                              className="text-[#B89A62] hover:underline cursor-pointer"
                            >
                              Make Default
                            </button>
                          )}
                          <div className="flex items-center space-x-3 ml-auto">
                            <button
                              onClick={() => handleOpenEditModal(addr)}
                              className="text-[#8F9897] hover:text-[#F2EFE8] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-[#8F9897] hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ORDERS TAB (REAL) */}
            {activeTab === 'orders' && (
              <CustomerOrderHistorySection />
            )}

          </div>

        </div>

      </div>

      {/* ADDRESS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 select-none">
          <div className="fixed inset-0 bg-[#080C0D]/80 backdrop-blur-md" onClick={() => setShowAddressModal(false)} />

          <div className="relative z-10 w-full max-w-lg bg-[#101617] border border-white/[0.08] p-8 rounded-xs space-y-6 text-[#F2EFE8] max-h-[90vh] overflow-y-auto">
            <h3 className="font-editorial-serif text-2xl text-[#F2EFE8]">
              {editingAddress ? 'Edit Shipping Address' : 'Add New Shipping Address'}
            </h3>

            {addressError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-interface-sans rounded-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addressError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-4 font-interface-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8F9897] uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[#080C0D] border border-white/[0.1] p-3 rounded-xs text-[#F2EFE8] focus:outline-none focus:border-[#B89A62]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#8F9897] uppercase">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#080C0D] border border-white/[0.1] p-3 rounded-xs text-[#F2EFE8] focus:outline-none focus:border-[#B89A62]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#8F9897] uppercase">Address Line 1</label>
                <input
                  type="text"
                  required
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="House/Flat No., Building Name, Street"
                  className="w-full bg-[#080C0D] border border-white/[0.1] p-3 rounded-xs text-[#F2EFE8] focus:outline-none focus:border-[#B89A62]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#8F9897] uppercase">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  placeholder="Apartment, suite, unit, etc."
                  className="w-full bg-[#080C0D] border border-white/[0.1] p-3 rounded-xs text-[#F2EFE8] focus:outline-none focus:border-[#B89A62]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8F9897] uppercase">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#080C0D] border border-white/[0.1] p-3 rounded-xs text-[#F2EFE8] focus:outline-none focus:border-[#B89A62]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#8F9897] uppercase">State</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-[#080C0D] border border-white/[0.1] p-3 rounded-xs text-[#F2EFE8] focus:outline-none focus:border-[#B89A62]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#8F9897] uppercase">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full bg-[#080C0D] border border-white/[0.1] p-3 rounded-xs text-[#F2EFE8] focus:outline-none focus:border-[#B89A62]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded-xs border-white/20 text-[#B89A62] focus:ring-0"
                />
                <label htmlFor="isDefault" className="text-xs text-[#8F9897] cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-5 py-2.5 border border-white/10 text-[#8F9897] hover:text-[#F2EFE8] uppercase tracking-wider text-xs rounded-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#B89A62] text-[#080C0D] font-bold uppercase tracking-wider text-xs rounded-xs hover:bg-[#C0A46D]"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function CustomerOrderHistorySection() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    ordersApi
      .getCustomerOrders()
      .then((res) => {
        if (res?.data) setOrders(res.data);
      })
      .catch((err) => console.error('Error fetching customer orders:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenDetail = async (orderNumber) => {
    setLoadingDetail(true);
    try {
      const res = await ordersApi.getCustomerOrderDetails(orderNumber);
      if (res?.data) setSelectedOrder(res.data);
    } catch (err) {
      console.error('Error loading order detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center text-[#B89A62]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-editorial-serif text-2xl text-[#F2EFE8]">Order History</h3>
        <p className="font-interface-sans text-xs text-[#8F9897] font-light">View your previous orders and status history.</p>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center text-[#8F9897] font-interface-sans space-y-3 border border-dashed border-white/10 rounded-xs">
          <Package className="w-10 h-10 text-[#B89A62] mx-auto opacity-40" />
          <p className="text-sm">No orders placed yet.</p>
          <p className="text-xs text-[#8F9897]/60">Your order history will appear here after checkout.</p>
        </div>
      ) : (
        <div className="space-y-4 font-interface-sans text-xs">
          {orders.map((ord) => (
            <div
              key={ord.id}
              onClick={() => handleOpenDetail(ord.orderNumber)}
              className="p-5 bg-[#080C0D] border border-white/[0.08] hover:border-[#B89A62]/60 transition-all rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-[#F2EFE8] text-sm group-hover:text-[#B89A62] transition-colors">
                    #{ord.orderNumber}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-xs ${
                    ord.status === 'DELIVERED' ? 'bg-green-950/60 text-green-400 border border-green-800/40' :
                    ord.status === 'CANCELLED' ? 'bg-red-950/60 text-red-400 border border-red-800/40' :
                    'bg-[#172022] text-[#B89A62] border border-[#B89A62]/30'
                  }`}>
                    {ord.status}
                  </span>
                </div>
                <div className="text-[#8F9897] flex items-center space-x-4 text-[11px]">
                  <span>Date: {new Date(ord.createdAt).toLocaleDateString()}</span>
                  <span>Items: {ord.itemCount}</span>
                  <span>Payment: <strong className="text-[#F2EFE8]">{ord.paymentStatus}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                <span className="text-sm font-bold text-[#B89A62]">₹{ord.totalAmount}</span>
                <ChevronRight className="w-4 h-4 text-[#8F9897] group-hover:text-[#B89A62] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 select-none">
          <div className="fixed inset-0 bg-[#080C0D]/80 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />

          <div className="relative z-10 w-full max-w-2xl bg-[#101617] border border-white/[0.08] p-6 md:p-8 rounded-xs space-y-6 text-[#F2EFE8] max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-interface-sans text-[#B89A62] tracking-widest uppercase">ORDER DETAILS</span>
                <h3 className="font-editorial-serif text-2xl text-[#F2EFE8]">#{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-[#8F9897] hover:text-[#F2EFE8] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STATUS TIMELINE */}
            <div className="space-y-2">
              <span className="text-[10px] font-interface-sans text-[#8F9897] uppercase tracking-wider flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-[#B89A62]" />
                <span>ORDER TIMELINE</span>
              </span>
              <div className="bg-[#080C0D] p-4 border border-white/5 rounded-xs space-y-2">
                {selectedOrder.statusHistory?.map((hist, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs border-b border-white/5 pb-2 last:border-b-0 last:pb-0">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-[#B89A62]" />
                      <span className="font-bold text-[#F2EFE8]">{hist.newStatus}</span>
                      {hist.note && <span className="text-[#8F9897] italic">({hist.note})</span>}
                    </div>
                    <span className="text-[10px] text-[#8F9897]">{new Date(hist.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ITEMS LIST */}
            <div className="space-y-2">
              <span className="text-[10px] font-interface-sans text-[#8F9897] uppercase tracking-wider">FRAGRANCE ITEMS</span>
              <div className="bg-[#080C0D] border border-white/5 divide-y divide-white/5 rounded-xs">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#F2EFE8]">{item.productName}</div>
                      {item.inspiredByName && <div className="text-[10px] text-[#B89A62] italic">Inspired by {item.inspiredByName}</div>}
                      <div className="text-[#8F9897]">Size: {item.sizeLabel} | Qty: {item.quantity}</div>
                      {item.giftPackagingName && <div className="text-[10px] text-[#B89A62]">🎁 {item.giftPackagingName}</div>}
                      {item.giftMessage && <div className="text-[10px] text-[#8F9897] italic">"{item.giftMessage}"</div>}
                    </div>
                    <div className="font-bold text-[#F2EFE8]">₹{item.lineTotal}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* SUMMARY BREAKDOWN */}
            <div className="bg-[#080C0D] p-4 border border-white/5 rounded-xs space-y-2 text-xs font-interface-sans">
              <div className="flex justify-between text-[#8F9897]"><span>Subtotal</span><span>₹{selectedOrder.subtotal}</span></div>
              {selectedOrder.giftPackagingAmount > 0 && (
                <div className="flex justify-between text-[#8F9897]"><span>Gift Packaging</span><span>₹{selectedOrder.giftPackagingAmount}</span></div>
              )}
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{selectedOrder.discountAmount}</span></div>
              )}
              <div className="flex justify-between text-[#8F9897]"><span>Shipping</span><span>{selectedOrder.shippingAmount === 0 ? 'FREE' : `₹${selectedOrder.shippingAmount}`}</span></div>
              <div className="flex justify-between text-sm font-bold text-[#B89A62] pt-2 border-t border-white/10">
                <span>Grand Total</span>
                <span>₹{selectedOrder.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

