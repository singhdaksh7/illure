import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem }) {
  const [selectedSample, setSelectedSample] = useState('Creed Aventus (2ML Sample)');
  const [checkoutStep, setCheckoutStep] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckoutDemo = () => {
    setCheckoutStep(true);
    setTimeout(() => {
      setCheckoutStep(false);
      onClose();
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 select-none">
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#080C0D]/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#101617] border-l border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300 shadow-2xl text-[#F2EFE8]">
        
        {/* DRAWER HEADER */}
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
            <div className="flex items-center space-x-3">
              <span className="font-bodoni text-2xl tracking-[0.2em] text-[#F2EFE8]">
                YOUR BAG
              </span>
              <span className="font-interface-sans text-xs text-[#B89A62] uppercase tracking-widest font-medium">
                ({cartItems.reduce((a, b) => a + b.quantity, 0)} ITEMS)
              </span>
            </div>

            <button 
              onClick={onClose}
              className="p-2 text-[#8F9897] hover:text-[#F2EFE8] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CHECKOUT PROTOTYPE CONFIRMATION BANNER */}
          {checkoutStep && (
            <div className="my-6 p-4 bg-[#161C1D] border border-[#B89A62]/50 text-center space-y-2 animate-in fade-in">
              <Sparkles className="w-6 h-6 text-[#B89A62] mx-auto" />
              <h4 className="font-editorial-serif text-xl text-[#F2EFE8]">PROTOTYPE DEMO ORDER</h4>
              <p className="font-interface-sans text-xs text-[#8F9897]">
                This completes the prototype client demonstration loop! Real payments are disabled for this preview.
              </p>
            </div>
          )}

          {/* CART ITEMS LIST */}
          <div className="py-6 space-y-6 max-h-[45vh] overflow-y-auto no-scrollbar">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4 text-[#8F9897]">
                <p className="font-editorial-serif text-2xl">Your shopping bag is empty.</p>
                <p className="font-interface-sans text-xs font-light">Explore our curated fragrances to begin.</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div 
                  key={`${item.id}-${item.selectedSize}`}
                  className="flex items-center space-x-4 pb-6 border-b border-white/[0.04]"
                >
                  <img 
                    src={item.image || "/images/oud_wood.jpg"} 
                    onError={(e) => { e.target.src = "/images/oud_wood.jpg"; }}
                    alt={item.name} 
                    className="w-16 h-20 object-contain bg-[#080C0D] p-2 border border-white/[0.06]"
                  />

                  <div className="flex-1 space-y-1">
                    <span className="font-interface-sans text-[9px] tracking-[0.25em] text-[#8F9897] uppercase">
                      {item.brand}
                    </span>
                    <h5 className="font-editorial-serif text-lg text-[#F2EFE8]">
                      {item.name}
                    </h5>
                    <p className="font-interface-sans text-[11px] text-[#B89A62]">
                      {item.selectedSize || '100 ML'} · ₹{item.price.toLocaleString('en-IN')}
                    </p>

                    {/* QUANTITY CONTROLS */}
                    <div className="flex items-center space-x-3 pt-2">
                      <div className="flex items-center border border-white/[0.1] text-xs">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                          className="p-1 hover:text-[#B89A62]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 font-interface-sans font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          className="p-1 hover:text-[#B89A62]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button 
                        onClick={() => onRemoveItem(item.id, item.selectedSize)}
                        className="text-[#8F9897] hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DRAWER FOOTER / CHECKOUT */}
        {cartItems.length > 0 && (
          <div className="pt-6 border-t border-white/[0.08] space-y-6">
            
            {/* COMPLIMENTARY SAMPLE SELECTOR */}
            <div className="p-3 bg-[#161C1D] border border-white/[0.06] rounded-xs space-y-2">
              <div className="flex items-center space-x-2 text-[10px] tracking-[0.25em] text-[#B89A62] uppercase">
                <Sparkles className="w-3 h-3" />
                <span>COMPLIMENTARY LUXURY SAMPLE</span>
              </div>
              
              <select 
                value={selectedSample}
                onChange={(e) => setSelectedSample(e.target.value)}
                className="w-full bg-[#101617] border border-white/[0.1] text-xs font-interface-sans text-[#F2EFE8] p-2 focus:outline-none focus:border-[#B89A62]"
              >
                <option value="Creed Aventus (2ML Sample)">Creed Aventus — 2ml Discovery Vial</option>
                <option value="MFK Baccarat Rouge 540 (2ML Sample)">MFK Baccarat Rouge 540 — 2ml Extrait</option>
                <option value="Tom Ford Tobacco Vanille (2ML Sample)">Tom Ford Tobacco Vanille — 2ml Eau de Parfum</option>
              </select>
            </div>

            {/* SUBTOTAL & SHIPPING */}
            <div className="space-y-2 font-interface-sans text-xs">
              <div className="flex justify-between text-[#8F9897]">
                <span>SUBTOTAL</span>
                <span className="text-[#F2EFE8] font-semibold text-sm">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#8F9897]">
                <span>WHITE-GLOVE SHIPPING</span>
                <span className="text-[#B89A62]">COMPLIMENTARY</span>
              </div>
            </div>

            {/* CHECKOUT BUTTON */}
            <button 
              onClick={handleCheckoutDemo}
              disabled={checkoutStep}
              className="w-full py-4 bg-[#B89A62] hover:bg-[#C0A46D] text-[#080C0D] font-interface-sans text-xs font-bold tracking-[0.25em] uppercase transition-all flex items-center justify-center space-x-3"
            >
              <span>{checkoutStep ? 'PROCESSING PROTOTYPE...' : 'PROCEED TO CHECKOUT'}</span>
              {!checkoutStep && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="flex items-center justify-center space-x-2 text-[10px] text-[#8F9897] tracking-widest uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B89A62]" />
              <span>PROTOTYPE CLIENT DEMO VIEW</span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
