import React, { useState, useEffect } from 'react';
import { ordersApi } from '../api/orders';
import { CheckCircle2, Package, Truck, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function OrderSuccessPage({ orderNumber, onNavigate }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) return;

    // Try fetching order details via customer endpoint or guest lookup
    ordersApi
      .getCustomerOrderDetails(orderNumber)
      .then((res) => {
        if (res?.data) setOrder(res.data);
      })
      .catch(() => {
        // Fallback: guest lookup
        ordersApi
          .guestLookup(orderNumber, '')
          .then((res) => {
            if (res?.data) setOrder(res.data);
          })
          .catch((err) => console.error('Notice loading order details:', err))
          .finally(() => setLoading(false));
      })
      .finally(() => setLoading(false));
  }, [orderNumber]);

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto min-h-screen">
      <div className="bg-[#101617] border border-white/10 p-8 md:p-12 text-center space-y-8 rounded-xs">
        
        {/* CREST / ICON */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#172022] border border-[#B89A62]/40 rounded-full text-[#B89A62]">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase">
            HAUTE PARFUMERIE ORDER CONFIRMED
          </span>
          <h1 className="font-editorial-serif text-3xl md:text-5xl font-light text-[#F2EFE8]">
            THANK YOU FOR YOUR <span className="italic text-[#B89A62]">ORDER</span>
          </h1>
          <p className="text-sm font-interface-sans text-[#8F9897] max-w-md mx-auto">
            Your fragrance selection has been placed into artisan preparation. An order confirmation email has been dispatched.
          </p>
        </div>

        {/* ORDER NUMBER BADGE */}
        <div className="inline-block bg-[#080C0D] border border-[#B89A62]/30 px-6 py-3 rounded-xs text-[#B89A62] font-mono text-sm tracking-widest uppercase">
          ORDER NUMBER: #{orderNumber}
        </div>

        {loading ? (
          <div className="py-8 flex justify-center text-[#B89A62]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : order ? (
          <div className="space-y-8 text-left pt-6 border-t border-white/10">
            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-interface-sans">
              <div className="bg-[#080C0D] p-4 border border-white/5 space-y-2">
                <div className="text-[#B89A62] font-bold uppercase tracking-wider flex items-center space-x-2">
                  <Truck className="w-4 h-4" />
                  <span>SHIPPING ADDRESS</span>
                </div>
                {order.shippingAddress ? (
                  <div className="text-[#8F9897] space-y-1">
                    <div className="text-[#F2EFE8] font-bold">{order.shippingAddress.fullName}</div>
                    <div>{order.shippingAddress.addressLine1}</div>
                    <div>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</div>
                    <div>Phone: {order.shippingAddress.phone}</div>
                  </div>
                ) : (
                  <div className="text-[#8F9897]">Standard Courier Delivery</div>
                )}
              </div>

              <div className="bg-[#080C0D] p-4 border border-white/5 space-y-2">
                <div className="text-[#B89A62] font-bold uppercase tracking-wider flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>PAYMENT SUMMARY</span>
                </div>
                <div className="text-[#8F9897] space-y-1">
                  <div>Status: <span className="text-[#F2EFE8] font-bold">{order.paymentStatus}</span></div>
                  <div>Grand Total: <span className="text-[#B89A62] font-bold">₹{order.totalAmount}</span></div>
                  <div>Date: <span className="text-[#F2EFE8]">{new Date(order.createdAt).toLocaleDateString()}</span></div>
                </div>
              </div>
            </div>

            {/* ITEMS TABLE */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-[#B89A62] uppercase tracking-widest flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>ORDER ITEMS</span>
              </div>
              <div className="bg-[#080C0D] border border-white/5 divide-y divide-white/5">
                {order.items?.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#F2EFE8]">{item.productName}</div>
                      {item.inspiredByName && <div className="text-[10px] text-[#B89A62] italic">Inspired by {item.inspiredByName}</div>}
                      <div className="text-[#8F9897]">Size: {item.sizeLabel} | Qty: {item.quantity}</div>
                    </div>
                    <div className="font-bold text-[#F2EFE8]">₹{item.lineTotal}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <button
            onClick={() => onNavigate('account')}
            className="w-full sm:w-auto px-8 py-4 bg-[#B89A62] text-[#080C0D] font-bold text-xs uppercase tracking-widest hover:bg-[#d4b478] transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>VIEW IN MY ACCOUNT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('shop')}
            className="w-full sm:w-auto px-8 py-4 bg-[#172022] border border-white/10 text-[#F2EFE8] font-bold text-xs uppercase tracking-widest hover:border-[#B89A62] transition-all cursor-pointer"
          >
            CONTINUE SHOPPING
          </button>
        </div>

      </div>
    </div>
  );
}
