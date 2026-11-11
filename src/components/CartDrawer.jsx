import React from 'react';
import { X, Trash2, Plus, Minus, ShieldCheck, ArrowRight, Sparkles, Gift } from 'lucide-react';
import { useCms } from '../context/CmsContext';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems = [], 
  onUpdateQuantity, 
  onRemoveItem, 
  onNavigateToCheckout 
}) {
  const { shipping } = useCms();

  if (!isOpen) return null;

  const hasFreeShipping = shipping?.isEnabled !== false && shipping?.freeShippingThreshold !== null && shipping?.freeShippingThreshold !== undefined;
  const freeThreshold = hasFreeShipping ? Number(shipping.freeShippingThreshold) : 0;
  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price || 0) * item.quantity), 0);
  const remainingForFreeShipping = hasFreeShipping ? Math.max(0, freeThreshold - subtotal) : 0;
  const isFreeShipping = hasFreeShipping ? (subtotal >= freeThreshold) : true;
  const progressPercent = hasFreeShipping && freeThreshold > 0 
    ? Math.min(100, (subtotal / freeThreshold) * 100) 
    : 100;

  const handleCheckout = () => {
    onClose();
    if (onNavigateToCheckout) {
      onNavigateToCheckout();
    }
  };

  return (
    <div className="fixed inset-0 z-50 select-none">
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0B0B0C]/85 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0B0B0C] border-l border-[#B89A62]/20 p-6 sm:p-8 flex flex-col justify-between z-10 shadow-[0_0_60px_rgba(0,0,0,0.95)] text-[#F7F4EE] animate-fade-up">
        
        {/* Top: Header & Shipping Progress */}
        <div>
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
            <div className="flex items-center space-x-3">
              <span className="font-bodoni text-2xl tracking-[0.2em] text-[#F7F4EE] uppercase">
                YOUR BAG
              </span>
              <span className="font-interface-sans text-xs text-[#B89A62] uppercase tracking-widest font-medium">
                ({cartItems.reduce((a, b) => a + b.quantity, 0)})
              </span>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 text-[#A1A1AA] hover:text-[#F7F4EE] transition-colors"
              aria-label="Close Bag"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* DYNAMIC FREE SHIPPING PROGRESS INDICATOR */}
          {hasFreeShipping && freeThreshold > 0 ? (
            <div className="py-4 border-b border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs tracking-wider">
                {remainingForFreeShipping > 0 ? (
                  <span className="text-[#A1A1AA] text-[11px]">
                    <span className="text-[#B89A62] font-semibold">₹{remainingForFreeShipping.toLocaleString('en-IN')}</span> away from free shipping
                  </span>
                ) : (
                  <span className="text-[#B89A62] text-[11px] font-medium flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#B89A62]" />
                    <span>Free shipping unlocked</span>
                  </span>
                )}
                <span className="text-[10px] text-[#A1A1AA] font-mono">
                  {Math.round(progressPercent)}%
                </span>
              </div>

              <div className="h-1.5 w-full bg-[#18181B] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#A98B55] to-[#B89A62] transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="py-3 border-b border-white/[0.06] flex items-center space-x-2 text-[11px] text-[#B89A62]">
              <Sparkles className="w-3.5 h-3.5 text-[#B89A62]" />
              <span>Free shipping & gift presentation active</span>
            </div>
          )}

          {/* CART ITEMS LIST */}
          <div className="py-5 space-y-5 max-h-[46vh] overflow-y-auto no-scrollbar">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3 text-[#A1A1AA]">
                <p className="font-editorial-serif text-2xl text-[#F7F4EE]">YOUR BAG IS EMPTY.</p>
                <p className="font-interface-sans text-xs font-light">Find something worth adding.</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div 
                  key={`${item.id}-${item.selectedSize}`}
                  className="flex items-center space-x-4 pb-5 border-b border-white/[0.04] group"
                >
                  <div className="w-16 h-20 bg-[#121214] border border-white/[0.08] p-2 flex items-center justify-center rounded-xs shrink-0">
                    <img 
                      src={item.image || "/images/illure-placeholder.svg"} 
                      onError={(e) => { e.currentTarget.src = "/images/illure-placeholder.svg"; }}
                      alt={item.name} 
                      className="max-h-full max-w-full object-contain filter drop-shadow-md"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] tracking-[0.25em] text-[#B89A62] uppercase block">
                          {item.brand}
                        </span>
                        <h5 className="font-editorial-serif text-lg text-[#F7F4EE] leading-tight">
                          {item.name}
                        </h5>
                      </div>
                      {onRemoveItem && (
                        <button 
                          onClick={() => onRemoveItem(item.id, item.selectedSize)}
                          className="text-[#A1A1AA] hover:text-red-400 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-[#A1A1AA] font-mono">
                      {item.selectedSize || 'Standard'} · ₹{Number(item.price || 0).toLocaleString('en-IN')}
                    </p>

                    {item.giftPackaging && (
                      <span className="inline-flex items-center space-x-1 text-[9px] tracking-wider text-[#B89A62] bg-[#18181B] px-1.5 py-0.5 border border-[#B89A62]/30 rounded-xs">
                        <Gift className="w-2.5 h-2.5" />
                        <span>Gift Box Included</span>
                      </span>
                    )}

                    {/* Quantity Controls */}
                    {onUpdateQuantity && (
                      <div className="flex items-center space-x-3 pt-2">
                        <div className="flex items-center border border-white/[0.1] bg-[#121214] rounded-xs">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                            className="p-1 hover:text-[#B89A62] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-xs px-2 text-[#F7F4EE]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                            className="p-1 hover:text-[#B89A62] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-mono text-xs text-[#F7F4EE] font-medium ml-auto">
                          ₹{(Number(item.price || 0) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Checkout Actions */}
        <div className="pt-6 border-t border-white/[0.08] space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span>SUBTOTAL</span>
              <span className="text-[#F7F4EE] font-mono text-sm font-semibold">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span>SHIPPING</span>
              <span className="text-[#B89A62] font-mono">
                {isFreeShipping ? 'COMPLIMENTARY' : (shipping?.flatRate !== undefined && shipping?.flatRate !== null ? `₹${shipping.flatRate}` : 'Calculated at checkout')}
              </span>
            </div>
          </div>

          <button 
            disabled={cartItems.length === 0}
            onClick={handleCheckout}
            className="w-full py-4 px-6 bg-[#B89A62] hover:bg-[#C0A46D] disabled:opacity-30 disabled:cursor-not-allowed text-[#0B0B0C] font-interface-sans text-xs tracking-[0.28em] font-semibold uppercase transition-all duration-300 flex items-center justify-center space-x-3 rounded-xs shadow-[0_10px_25px_rgba(184,154,98,0.2)]"
          >
            <span>CHECKOUT</span>
            <ArrowRight className="w-4 h-4 text-[#0B0B0C]" />
          </button>

          <div className="flex items-center justify-center space-x-2 text-[10px] tracking-wider text-[#A1A1AA] uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B89A62]" />
            <span>Secure Checkout · Protected Packaging</span>
          </div>
        </div>

      </div>

    </div>
  );
}
