import React, { useState, useEffect } from 'react';
import { User, MapPin, Package, LogOut, Plus, Trash2, Check, Star, AlertCircle, ChevronRight, Loader2, X, Clock, ShieldCheck, Sparkles, Compass } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { customerAddressesApi } from '../api/customer';
import { ordersApi } from '../api/orders';
import IllureCrest from '../components/IllureCrest';

export default function CustomerAccountPage({ onNavigate }) {
  const { customer, logout } = useCustomerAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview | orders | addresses | profile

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
      <div className="min-h-screen bg-[#0B0B0C] pt-32 pb-24 text-[#F7F4EE] flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-md">
          <IllureCrest size={40} className="text-[#B89A62] mx-auto opacity-80" />
          <h2 className="typography-h2 text-[#F7F4EE]">YOUR ACCOUNT</h2>
          <p className="typography-body text-xs text-[#A1A1AA]">
            Please sign in to view your orders, saved addresses, and profile details.
          </p>
          <button
            onClick={() => onNavigate && onNavigate('login')}
            className="px-8 py-3.5 bg-[#B89A62] text-[#0B0B0C] font-semibold text-xs uppercase tracking-[0.28em] rounded-xs"
          >
            SIGN IN
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
    if (onNavigate) onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] pt-28 pb-32 text-[#F7F4EE] select-none">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-12">
        
        {/* CLIENT PORTAL HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-white/[0.08] gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <IllureCrest size={18} className="text-[#B89A62]" />
              <span className="typography-eyebrow text-[#B89A62]">
                PATRON CLIENT ARCHIVE
              </span>
            </div>
            <h1 className="typography-h1 text-[#F7F4EE]">
              Welcome, {customer.name}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate && onNavigate('shop')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#121214] border border-[#B89A62]/30 hover:border-[#B89A62] text-[#F7F4EE] text-xs font-interface-sans tracking-widest uppercase transition-colors rounded-xs"
            >
              <span>EXPLORE FLACONS</span>
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-2 px-4 py-2.5 border border-white/10 hover:border-red-400/50 text-[#A1A1AA] hover:text-red-400 text-xs font-interface-sans tracking-widest uppercase transition-colors rounded-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>SIGN OUT</span>
            </button>
          </div>
        </div>

        {/* ACCOUNT NAVIGATION TABS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* TAB SIDEBAR (RESTYLED TO CLIENT SALON TILES) */}
          <div className="md:col-span-3 space-y-2">
            {[
              { id: 'overview', label: 'OVERVIEW', icon: Compass },
              { id: 'orders', label: 'ORDERS ARCHIVE', icon: Package },
              { id: 'addresses', label: 'DELIVERY ADDRESSES', icon: MapPin },
              { id: 'profile', label: 'PATRON PROFILE', icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full p-4 text-left font-interface-sans text-xs tracking-[0.25em] uppercase transition-all rounded-xs flex items-center space-x-3 cursor-pointer ${
                    isActive
                      ? 'bg-[#18181B] border border-[#B89A62] text-[#F7F4EE] shadow-[0_0_15px_rgba(184,154,98,0.15)]'
                      : 'bg-[#121214] border border-white/[0.06] text-[#A1A1AA] hover:border-white/20'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#B89A62]' : 'text-[#A1A1AA]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT PANE */}
          <div className="md:col-span-9 bg-[#121214] border border-white/[0.08] p-8 md:p-10 rounded-xs min-h-[460px]">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fade-up">
                <div>
                  <span className="typography-eyebrow text-[#B89A62]">
                    MEMBERSHIP STATUS
                  </span>
                  <h3 className="typography-h2 text-[#F7F4EE]">
                    Private Client Privilège
                  </h3>
                  <p className="typography-body text-xs text-[#A1A1AA] mt-1">
                    Your account is enrolled in complimentary white-glove shipping on all order values.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 bg-[#0B0B0C] border border-[#B89A62]/30 rounded-xs space-y-2">
                    <span className="text-[10px] tracking-widest text-[#B89A62] uppercase block">
                      TIER STATUS
                    </span>
                    <p className="font-editorial-serif text-2xl text-[#F7F4EE]">
                      GOLD PATRON
                    </p>
                    <span className="text-[11px] text-[#A1A1AA] block">
                      Guaranteed priority dispatch
                    </span>
                  </div>

                  <div className="p-6 bg-[#0B0B0C] border border-white/[0.06] rounded-xs space-y-2">
                    <span className="text-[10px] tracking-widest text-[#B89A62] uppercase block">
                      ACTIVE ADDRESSES
                    </span>
                    <p className="font-editorial-serif text-2xl text-[#F7F4EE]">
                      {addresses.length} SAVED
                    </p>
                    <button
                      onClick={() => setActiveTab('addresses')}
                      className="text-[11px] text-[#B89A62] hover:underline block"
                    >
                      Manage addresses →
                    </button>
                  </div>

                  <div className="p-6 bg-[#0B0B0C] border border-white/[0.06] rounded-xs space-y-2">
                    <span className="text-[10px] tracking-widest text-[#B89A62] uppercase block">
                      CONCIERGE CONTACT
                    </span>
                    <p className="font-editorial-serif text-lg text-[#F7F4EE]">
                      WHITE-GLOVE
                    </p>
                    <span className="text-[11px] text-[#A1A1AA] block">
                      concierge@illurefragrance.com
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-[#0B0B0C] border border-white/[0.06] rounded-xs space-y-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#B89A62]" />
                    <span className="text-xs uppercase tracking-widest text-[#F7F4EE] font-semibold">
                      AUTHENTICITY & STANDARDS
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] font-light leading-relaxed">
                    All formulations dispatched under your account undergo rigorous quality checks. Every flacon is tamper-sealed and protected in signature packaging.
                  </p>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <CustomerOrderHistorySection />
            )}

            {/* ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="space-y-6 animate-fade-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="typography-h2 text-[#F7F4EE]">Saved Addresses</h3>
                    <p className="typography-body text-xs text-[#A1A1AA]">Manage destination addresses for fast, seamless checkout.</p>
                  </div>

                  <button
                    onClick={handleOpenAddModal}
                    className="px-5 py-3 bg-[#B89A62] text-[#0B0B0C] font-interface-sans text-xs font-semibold tracking-wider uppercase rounded-xs flex items-center space-x-2 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ADD NEW ADDRESS</span>
                  </button>
                </div>

                {loadingAddresses ? (
                  <div className="py-16 text-center text-[#A1A1AA] font-interface-sans text-xs">
                    Loading addresses from vault...
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="py-16 text-center text-[#A1A1AA] font-interface-sans space-y-3 border border-dashed border-white/10 rounded-xs">
                    <MapPin className="w-8 h-8 text-[#B89A62] mx-auto opacity-50" />
                    <p className="text-sm">No saved delivery addresses found.</p>
                    <button
                      onClick={handleOpenAddModal}
                      className="text-xs text-[#B89A62] underline font-semibold cursor-pointer"
                    >
                      Inscribe your first shipping address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-6 bg-[#0B0B0C] border rounded-xs relative flex flex-col justify-between space-y-4 ${
                          addr.isDefault ? 'border-[#B89A62]' : 'border-white/[0.08]'
                        }`}
                      >
                        {addr.isDefault && (
                          <span className="absolute top-4 right-4 text-[9px] font-interface-sans tracking-widest font-bold text-[#B89A62] border border-[#B89A62]/40 px-2 py-0.5 bg-[#B89A62]/10 uppercase rounded-xs flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-current" />
                            <span>DEFAULT</span>
                          </span>
                        )}

                        <div className="space-y-1 font-interface-sans text-xs">
                          <p className="font-semibold text-[#F7F4EE] text-sm">{addr.fullName}</p>
                          <p className="text-[#A1A1AA]">{addr.addressLine1}</p>
                          {addr.addressLine2 && <p className="text-[#A1A1AA]">{addr.addressLine2}</p>}
                          {addr.landmark && <p className="text-[#A1A1AA]">Landmark: {addr.landmark}</p>}
                          <p className="text-[#A1A1AA]">{addr.city}, {addr.state} - {addr.postalCode}</p>
                          <p className="text-[#B89A62] pt-1">Phone: {addr.phone}</p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs font-interface-sans">
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
                              className="text-[#A1A1AA] hover:text-[#F7F4EE] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-[#A1A1AA] hover:text-red-400 cursor-pointer"
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

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-up">
                <div>
                  <h3 className="typography-h2 text-[#F7F4EE]">Patron Profile</h3>
                  <p className="typography-body text-xs text-[#A1A1AA]">Your verified client identification.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 font-interface-sans">
                  <div className="p-5 bg-[#0B0B0C] border border-white/[0.06] rounded-xs space-y-1">
                    <span className="text-[10px] text-[#B89A62] uppercase tracking-wider block">FULL PATRON NAME</span>
                    <p className="text-sm font-medium text-[#F7F4EE]">{customer.name}</p>
                  </div>

                  <div className="p-5 bg-[#0B0B0C] border border-white/[0.06] rounded-xs space-y-1">
                    <span className="text-[10px] text-[#B89A62] uppercase tracking-wider block">CONTACT EMAIL</span>
                    <p className="text-sm font-medium text-[#F7F4EE]">{customer.email || 'N/A'}</p>
                  </div>

                  <div className="p-5 bg-[#0B0B0C] border border-white/[0.06] rounded-xs space-y-1">
                    <span className="text-[10px] text-[#B89A62] uppercase tracking-wider block">MOBILE NUMBER</span>
                    <p className="text-sm font-medium text-[#F7F4EE]">{customer.phone}</p>
                  </div>

                  <div className="p-5 bg-[#0B0B0C] border border-white/[0.06] rounded-xs space-y-1">
                    <span className="text-[10px] text-[#B89A62] uppercase tracking-wider block">ACCOUNT CLASSIFICATION</span>
                    <p className="text-sm font-medium text-[#B89A62]">VERIFIED PATRON</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ADDRESS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 select-none animate-fade-up">
          <div className="fixed inset-0 bg-[#0B0B0C]/85 backdrop-blur-md" onClick={() => setShowAddressModal(false)} />

          <div className="relative z-10 w-full max-w-lg bg-[#121214] border border-[#B89A62]/30 p-8 rounded-xs space-y-6 text-[#F7F4EE] max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="typography-h2 text-[#F7F4EE]">
              {editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
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
                  <label className="text-[10px] text-[#B89A62] uppercase">Full Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[#0B0B0C] border border-white/[0.1] p-3 rounded-xs text-[#F7F4EE] focus:outline-none focus:border-[#B89A62]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#B89A62] uppercase">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#0B0B0C] border border-white/[0.1] p-3 rounded-xs text-[#F7F4EE] focus:outline-none focus:border-[#B89A62]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#B89A62] uppercase">Address Line 1</label>
                <input
                  type="text"
                  required
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="House/Apartment No., Street"
                  className="w-full bg-[#0B0B0C] border border-white/[0.1] p-3 rounded-xs text-[#F7F4EE] focus:outline-none focus:border-[#B89A62]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#B89A62] uppercase">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  placeholder="Suite, Floor, Wing"
                  className="w-full bg-[#0B0B0C] border border-white/[0.1] p-3 rounded-xs text-[#F7F4EE] focus:outline-none focus:border-[#B89A62]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#B89A62] uppercase">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#0B0B0C] border border-white/[0.1] p-3 rounded-xs text-[#F7F4EE] focus:outline-none focus:border-[#B89A62]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#B89A62] uppercase">State</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-[#0B0B0C] border border-white/[0.1] p-3 rounded-xs text-[#F7F4EE] focus:outline-none focus:border-[#B89A62]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#B89A62] uppercase">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full bg-[#0B0B0C] border border-white/[0.1] p-3 rounded-xs text-[#F7F4EE] focus:outline-none focus:border-[#B89A62]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefaultCheckbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 accent-[#B89A62]"
                />
                <label htmlFor="isDefaultCheckbox" className="text-xs text-[#A1A1AA] cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-5 py-2.5 border border-white/10 text-xs uppercase tracking-wider text-[#A1A1AA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#B89A62] text-[#0B0B0C] font-semibold text-xs uppercase tracking-wider"
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

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await ordersApi.getCustomerOrders();
        if (res?.data?.orders) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-[#A1A1AA] text-xs">
        Accessing orders archive...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-20 text-center text-[#A1A1AA] space-y-3 border border-dashed border-white/10 rounded-xs">
        <Package className="w-8 h-8 text-[#B89A62] mx-auto opacity-50" />
        <p className="text-sm">No historical orders found in your archive.</p>
        <p className="text-xs">Your completed acquisitions will be logged and tracked here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h3 className="typography-h2 text-[#F7F4EE]">Orders Archive</h3>
        <p className="typography-body text-xs text-[#A1A1AA]">
          Review past order receipts, tracking numbers, and preparation states.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-6 bg-[#0B0B0C] border border-white/[0.08] hover:border-[#B89A62]/40 transition-colors rounded-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.06] gap-2">
              <div>
                <span className="font-mono text-xs font-semibold text-[#B89A62]">
                  {order.orderNumber}
                </span>
                <span className="text-[10px] text-[#A1A1AA] block">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-[10px] tracking-wider uppercase font-mono px-2 py-0.5 border border-[#B89A62]/30 text-[#B89A62] bg-[#121214] rounded-xs">
                  {order.status}
                </span>
                <span className="font-editorial-serif text-lg text-[#F7F4EE]">
                  ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {order.items?.map((item, iIdx) => (
                <div key={iIdx} className="flex items-center justify-between text-xs text-[#A1A1AA]">
                  <span>{item.quantity}x {item.productName} ({item.sizeLabel})</span>
                  <span className="font-mono text-[#F7F4EE]">₹{Number(item.lineTotal).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
