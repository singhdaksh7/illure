import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { customerAddressesApi } from '../api/customer';
import { ordersApi } from '../api/orders';
import { paymentsApi } from '../api/payments';
import { ShieldCheck, Truck, Gift, CreditCard, Tag, ArrowLeft, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function CheckoutPage({ onNavigate, onOrderSuccess }) {
  const { cart, refreshCart } = useCart();
  const { customer, isAuthenticated } = useCustomerAuth();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useNewAddress, setUseNewAddress] = useState(!isAuthenticated);

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    fullName: customer?.name || '',
    phone: customer?.phone || '',
    customerEmail: customer?.email || '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
  });

  // Checkout State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  // Fetch Saved Addresses for authenticated customer
  useEffect(() => {
    if (isAuthenticated) {
      customerAddressesApi
        .list()
        .then((res) => {
          if (res?.data?.addresses) {
            setSavedAddresses(res.data.addresses);
            const defaultAddr = res.data.addresses.find((a) => a.isDefault) || res.data.addresses[0];
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
              setUseNewAddress(false);
            } else {
              setUseNewAddress(true);
            }
          }
        })
        .catch(() => setUseNewAddress(true));
    }
  }, [isAuthenticated]);

  // Load summary on mount or coupon change
  const fetchSummary = async (codeToUse = couponCode) => {
    setLoadingSummary(true);
    setErrorMsg('');
    try {
      const res = await ordersApi.getSummary({ couponCode: codeToUse });
      if (res?.data) {
        setSummary(res.data);
        if (res.data.coupon) {
          setAppliedCoupon(res.data.coupon);
          setCouponMsg(`Coupon '${res.data.coupon.code}' applied! Savings: ₹${res.data.discountAmount}`);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to load checkout summary.';
      setErrorMsg(msg);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchSummary('');
  }, []);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponMsg('');
    try {
      await fetchSummary(couponCode.trim());
    } catch {
      setCouponMsg('Invalid or expired coupon.');
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponMsg('');
    await fetchSummary('');
  };

  // Dynamically load Razorpay SDK script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmittingOrder(true);

    try {
      // 1. Build Payload
      let payload = {
        paymentMethod,
        customerName: addressForm.fullName.trim(),
        customerPhone: addressForm.phone.trim(),
        customerEmail: addressForm.customerEmail.trim() || undefined,
        couponCode: appliedCoupon?.code || undefined,
      };

      if (!useNewAddress && selectedAddressId) {
        payload.addressId = selectedAddressId;
      } else {
        if (
          !addressForm.fullName ||
          !addressForm.phone ||
          !addressForm.addressLine1 ||
          !addressForm.city ||
          !addressForm.state ||
          !addressForm.postalCode
        ) {
          throw new Error('Please fill in all required shipping address fields.');
        }

        payload.address = {
          fullName: addressForm.fullName,
          phone: addressForm.phone,
          addressLine1: addressForm.addressLine1,
          addressLine2: addressForm.addressLine2 || undefined,
          landmark: addressForm.landmark || undefined,
          city: addressForm.city,
          state: addressForm.state,
          postalCode: addressForm.postalCode,
        };
      }

      // 2. Create Order Backend Call
      const orderRes = await ordersApi.createOrder(payload);
      const createdOrder = orderRes.data;

      // 3. Handle COD Flow
      if (paymentMethod === 'COD') {
        await refreshCart();
        setSubmittingOrder(false);
        if (onOrderSuccess) onOrderSuccess(createdOrder.orderNumber);
        return;
      }

      // 4. Handle Razorpay Flow
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay payment SDK. Please check your internet connection.');
      }

      const rzpOrderRes = await paymentsApi.createRazorpayOrder(createdOrder.id);
      const rzpData = rzpOrderRes.data;

      const options = {
        key: rzpData.keyId,
        amount: rzpData.amount,
        currency: rzpData.currency || 'INR',
        name: 'İLLURÊ FRAGRANCE',
        description: `Order #${rzpData.orderNumber}`,
        order_id: rzpData.razorpayOrderId,
        prefill: {
          name: addressForm.fullName,
          email: addressForm.customerEmail,
          contact: addressForm.phone,
        },
        theme: {
          color: '#c9a96e',
        },
        handler: async function (response) {
          try {
            await paymentsApi.verifyRazorpayPayment({
              orderId: createdOrder.id,
              orderNumber: createdOrder.orderNumber,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            await refreshCart();
            setSubmittingOrder(false);
            if (onOrderSuccess) onOrderSuccess(createdOrder.orderNumber);
          } catch (verifyErr) {
            setErrorMsg(verifyErr.response?.data?.error?.message || 'Payment verification failed. Please contact customer support.');
            setSubmittingOrder(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmittingOrder(false);
            setErrorMsg('Payment modal closed. Your order is pending payment.');
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Failed to place order.');
      setSubmittingOrder(false);
    }
  };

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto text-center space-y-6">
        <h1 className="font-editorial-serif text-3xl md:text-5xl text-[#F2EFE8]">YOUR BAG IS EMPTY</h1>
        <p className="text-[#8F9897] font-interface-sans text-sm">Please add fragrances to your shopping bag before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-8 py-4 bg-[#B89A62] text-[#080C0D] font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-[#d4b478] transition-all"
        >
          EXPLORE CATALOGUE
        </button>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <button
          onClick={() => onNavigate('shop')}
          className="flex items-center space-x-2 text-xs font-interface-sans uppercase tracking-widest text-[#8F9897] hover:text-[#B89A62] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO SHOPPING</span>
        </button>
        <div className="flex items-center space-x-2 text-xs font-interface-sans uppercase tracking-widest text-[#B89A62]">
          <ShieldCheck className="w-4 h-4" />
          <span>SECURE LUXURY CHECKOUT</span>
        </div>
      </div>

      <h1 className="font-editorial-serif text-3xl md:text-5xl font-light mb-10">
        FINALISE YOUR <span className="italic text-[#B89A62]">SELECTION</span>
      </h1>

      {errorMsg && (
        <div className="mb-8 p-4 bg-red-950/40 border border-red-800/60 rounded-xs text-red-200 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT COLUMN: CONTACT, ADDRESS & PAYMENT */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* SECTION 1: CONTACT INFORMATION */}
          <div className="bg-[#101617] border border-white/10 p-6 md:p-8 space-y-6 rounded-xs">
            <h2 className="font-editorial-serif text-xl text-[#F2EFE8] flex items-center justify-between">
              <span>1. CONTACT INFORMATION</span>
              {isAuthenticated && <span className="text-xs font-interface-sans text-[#B89A62]">LOGGED IN</span>}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-interface-sans text-[#8F9897] uppercase tracking-wider mb-2">FULL NAME *</label>
                <input
                  type="text"
                  required
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  placeholder="e.g. Lord Randolph"
                  className="w-full bg-[#080C0D] border border-white/10 px-4 py-3 text-sm text-[#F2EFE8] focus:border-[#B89A62] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-interface-sans text-[#8F9897] uppercase tracking-wider mb-2">PHONE NUMBER *</label>
                <input
                  type="tel"
                  required
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full bg-[#080C0D] border border-white/10 px-4 py-3 text-sm text-[#F2EFE8] focus:border-[#B89A62] outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-interface-sans text-[#8F9897] uppercase tracking-wider mb-2">EMAIL ADDRESS (FOR RECEIPT)</label>
                <input
                  type="email"
                  value={addressForm.customerEmail}
                  onChange={(e) => setAddressForm({ ...addressForm, customerEmail: e.target.value })}
                  placeholder="concierge@domain.com"
                  className="w-full bg-[#080C0D] border border-white/10 px-4 py-3 text-sm text-[#F2EFE8] focus:border-[#B89A62] outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: SHIPPING ADDRESS */}
          <div className="bg-[#101617] border border-white/10 p-6 md:p-8 space-y-6 rounded-xs">
            <h2 className="font-editorial-serif text-xl text-[#F2EFE8]">2. SHIPPING ADDRESS</h2>

            {isAuthenticated && savedAddresses.length > 0 && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-xs font-interface-sans uppercase tracking-widest text-[#F2EFE8] cursor-pointer">
                    <input
                      type="radio"
                      name="addressChoice"
                      checked={!useNewAddress}
                      onChange={() => setUseNewAddress(false)}
                      className="accent-[#B89A62]"
                    />
                    <span>SAVED ADDRESSES</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-interface-sans uppercase tracking-widest text-[#F2EFE8] cursor-pointer">
                    <input
                      type="radio"
                      name="addressChoice"
                      checked={useNewAddress}
                      onChange={() => setUseNewAddress(true)}
                      className="accent-[#B89A62]"
                    />
                    <span>NEW ADDRESS</span>
                  </label>
                </div>

                {!useNewAddress && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 border rounded-xs cursor-pointer transition-all ${
                          selectedAddressId === addr.id ? 'border-[#B89A62] bg-[#172022]' : 'border-white/10 bg-[#080C0D] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="font-bold text-sm text-[#F2EFE8]">{addr.fullName}</div>
                        <div className="text-xs text-[#8F9897] mt-1">{addr.addressLine1}, {addr.city}</div>
                        <div className="text-xs text-[#8F9897]">{addr.state} - {addr.postalCode}</div>
                        <div className="text-xs text-[#8F9897] mt-1">Ph: {addr.phone}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(useNewAddress || !isAuthenticated) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-interface-sans text-[#8F9897] uppercase tracking-wider mb-2">ADDRESS LINE 1 *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.addressLine1}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                    placeholder="House / Flat / Suite No, Street Name"
                    className="w-full bg-[#080C0D] border border-white/10 px-4 py-3 text-sm text-[#F2EFE8] focus:border-[#B89A62] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-interface-sans text-[#8F9897] uppercase tracking-wider mb-2">ADDRESS LINE 2 (OPTIONAL)</label>
                  <input
                    type="text"
                    value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                    placeholder="Apartment / Tower"
                    className="w-full bg-[#080C0D] border border-white/10 px-4 py-3 text-sm text-[#F2EFE8] focus:border-[#B89A62] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-interface-sans text-[#8F9897] uppercase tracking-wider mb-2">LANDMARK (OPTIONAL)</label>
                  <input
                    type="text"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    placeholder="Near Royal Residency"
                    className="w-full bg-[#080C0D] border border-white/10 px-4 py-3 text-sm text-[#F2EFE8] focus:border-[#B89A62] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-interface-sans text-[#8F9897] uppercase tracking-wider mb-2">CITY *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full bg-[#080C0D] border border-white/10 px-4 py-3 text-sm text-[#F2EFE8] focus:border-[#B89A62] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-interface-sans text-[#8F9897] uppercase tracking-wider mb-2">STATE *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="w-full bg-[#080C0D] border border-white/10 px-4 py-3 text-sm text-[#F2EFE8] focus:border-[#B89A62] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-interface-sans text-[#8F9897] uppercase tracking-wider mb-2">PINCODE / POSTAL CODE *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    placeholder="400001"
                    className="w-full bg-[#080C0D] border border-white/10 px-4 py-3 text-sm text-[#F2EFE8] focus:border-[#B89A62] outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: PAYMENT METHOD */}
          <div className="bg-[#101617] border border-white/10 p-6 md:p-8 space-y-6 rounded-xs">
            <h2 className="font-editorial-serif text-xl text-[#F2EFE8]">3. PAYMENT METHOD</h2>

            <div className="space-y-4">
              <label className={`flex items-center justify-between p-4 border rounded-xs cursor-pointer transition-all ${
                paymentMethod === 'RAZORPAY' ? 'border-[#B89A62] bg-[#172022]' : 'border-white/10 bg-[#080C0D] opacity-70 hover:opacity-100'
              }`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="RAZORPAY"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-[#B89A62]"
                  />
                  <div>
                    <div className="text-sm font-bold text-[#F2EFE8] flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-[#B89A62]" />
                      <span>ONLINE PAYMENT (RAZORPAY)</span>
                    </div>
                    <div className="text-xs text-[#8F9897] mt-0.5">Credit/Debit Cards, UPI, NetBanking, Wallets</div>
                  </div>
                </div>
                <span className="text-[10px] font-interface-sans tracking-widest text-[#B89A62] border border-[#B89A62]/30 px-2 py-1 uppercase">RECOMMENDED</span>
              </label>

              <label className={`flex items-center justify-between p-4 border rounded-xs cursor-pointer transition-all ${
                paymentMethod === 'COD' ? 'border-[#B89A62] bg-[#172022]' : 'border-white/10 bg-[#080C0D] opacity-70 hover:opacity-100'
              }`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-[#B89A62]"
                  />
                  <div>
                    <div className="text-sm font-bold text-[#F2EFE8] flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-[#B89A62]" />
                      <span>CASH ON DELIVERY</span>
                    </div>
                    <div className="text-xs text-[#8F9897] mt-0.5">Pay via cash upon doorstep delivery</div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY & SUBMIT */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-[#101617] border border-white/10 p-6 md:p-8 space-y-6 rounded-xs sticky top-32">
            <h2 className="font-editorial-serif text-xl text-[#F2EFE8] pb-4 border-b border-white/10">ORDER SUMMARY</h2>

            {/* CART ITEMS BREAKDOWN */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 py-2 border-b border-white/5">
                  <img
                    src={item.primaryImage || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=200'}
                    alt={item.productName}
                    className="w-14 h-14 object-cover rounded-xs border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#F2EFE8] truncate">{item.productName}</div>
                    {item.inspiredByName && (
                      <div className="text-[10px] text-[#B89A62] italic">Inspired by {item.inspiredByName}</div>
                    )}
                    <div className="text-[10px] text-[#8F9897]">Size: {item.sizeLabel} | Qty: {item.quantity}</div>
                    {item.giftPackagingName && (
                      <div className="text-[10px] text-[#B89A62] flex items-center space-x-1 mt-0.5">
                        <Gift className="w-3 h-3" />
                        <span>{item.giftPackagingName} (+₹{item.giftPackagingPrice})</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-bold text-[#F2EFE8]">₹{item.lineTotal}</div>
                </div>
              ))}
            </div>

            {/* COUPON PROMO */}
            <div className="pt-2">
              <label className="block text-xs font-interface-sans text-[#8F9897] uppercase tracking-wider mb-2 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-[#B89A62]" />
                <span>PROMOTION / GIFT COUPON</span>
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-[#172022] border border-[#B89A62]/40 p-3 rounded-xs text-xs text-[#F2EFE8]">
                  <span className="font-bold text-[#B89A62]">{appliedCoupon.code}</span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-400 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="ENTER COUPON CODE"
                    className="flex-1 bg-[#080C0D] border border-white/10 px-3 py-2 text-xs text-[#F2EFE8] uppercase outline-none focus:border-[#B89A62]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#B89A62]/20 border border-[#B89A62] text-[#B89A62] font-bold text-xs uppercase hover:bg-[#B89A62] hover:text-[#080C0D] transition-all cursor-pointer"
                  >
                    APPLY
                  </button>
                </form>
              )}

              {couponMsg && (
                <p className={`text-xs mt-2 ${appliedCoupon ? 'text-green-400' : 'text-red-400'}`}>{couponMsg}</p>
              )}
            </div>

            {/* TOTALS TABLE */}
            {summary && (
              <div className="space-y-2 pt-4 border-t border-white/10 text-xs font-interface-sans">
                <div className="flex justify-between text-[#8F9897]">
                  <span>Subtotal</span>
                  <span className="text-[#F2EFE8]">₹{summary.subtotal}</span>
                </div>

                {summary.giftPackagingAmount > 0 && (
                  <div className="flex justify-between text-[#8F9897]">
                    <span>Gift Packaging</span>
                    <span className="text-[#F2EFE8]">₹{summary.giftPackagingAmount}</span>
                  </div>
                )}

                {summary.discountAmount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-₹{summary.discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#8F9897]">
                  <span>Shipping Fee</span>
                  <span className="text-[#F2EFE8]">
                    {summary.shippingAmount === 0 ? <span className="text-[#B89A62]">COMPLIMENTARY</span> : `₹${summary.shippingAmount}`}
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-[#B89A62] pt-4 border-t border-white/10">
                  <span>GRAND TOTAL</span>
                  <span>₹{summary.grandTotal}</span>
                </div>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={submittingOrder || loadingSummary}
              className="w-full py-4 bg-[#B89A62] text-[#080C0D] font-bold text-xs uppercase tracking-widest hover:bg-[#d4b478] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submittingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PROCESSING ORDER...</span>
                </>
              ) : (
                <span>{paymentMethod === 'COD' ? 'PLACE CASH ON DELIVERY ORDER' : 'PAY WITH RAZORPAY'}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
