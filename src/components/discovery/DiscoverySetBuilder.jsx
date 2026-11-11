import React, { useState, useEffect } from 'react';
import { ShoppingBag, Check, Sparkles, AlertCircle, ArrowLeft, Layers, ShieldCheck } from 'lucide-react';
import IllureCrest from '../IllureCrest';
import { useFeatures } from '../../context/FeaturesContext';
import { useCart } from '../../context/CartContext';

export default function DiscoverySetBuilder({ slug = 'custom-discovery-set', onBack }) {
  const { isFeatureEnabled, trackFeatureEvent } = useFeatures();
  const { addToCart } = useCart();
  const [discoverySet, setDiscoverySet] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [pricingResult, setPricingResult] = useState(null);
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        const res = await fetch(`/api/discovery-sets/${slug}`);
        const data = await res.json();
        if (data.success && data.data?.set) {
          setDiscoverySet(data.data.set);
          // If prebuilt, pre-populate selections
          if (data.data.set.type === 'PREBUILT' && data.data.set.prebuiltItems?.length > 0) {
            const preselected = data.data.set.prebuiltItems
              .map((item) => {
                const variant =
                  item.variant ||
                  item.product.variants.find((v) => v.sizeLabel.includes('3 ML')) ||
                  item.product.variants[0];
                return variant ? { ...variant, product: item.product } : null;
              })
              .filter(Boolean);
            setSelectedVariants(preselected);
          }
        }
      } catch (err) {
        console.warn('Failed to load discovery set:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, [slug]);

  // Server-side validation whenever selections change
  useEffect(() => {
    if (!discoverySet) return;
    const min = discoverySet.minSelections || 3;
    const max = discoverySet.maxSelections || 3;

    if (selectedVariants.length < min) {
      setPricingResult(null);
      setErrorMsg(null);
      return;
    }

    async function validate() {
      setValidating(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/discovery-sets/${slug}/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectionVariantIds: selectedVariants.map((v) => v.id),
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setPricingResult(data.data);
        } else {
          setErrorMsg(data.error?.message || 'Selection validation failed.');
        }
      } catch (err) {
        setErrorMsg('Network error validating bundle price.');
      } finally {
        setValidating(false);
      }
    }

    validate();
  }, [selectedVariants, discoverySet, slug]);

  const handleToggleProduct = (eligibleItem) => {
    if (!discoverySet || discoverySet.type === 'PREBUILT') return;
    const product = eligibleItem.product;
    const variant =
      eligibleItem.variant ||
      product.variants.find((v) => v.sizeLabel.includes('3 ML')) ||
      product.variants[0];

    if (!variant) return;

    const exists = selectedVariants.some((v) => v.id === variant.id);
    if (exists) {
      setSelectedVariants((prev) => prev.filter((v) => v.id !== variant.id));
    } else {
      if (selectedVariants.length >= (discoverySet.maxSelections || 3)) {
        return;
      }
      setSelectedVariants((prev) => [...prev, { ...variant, product }]);
    }
  };

  const handleAddToCart = async () => {
    if (!pricingResult || selectedVariants.length !== (discoverySet.maxSelections || 3)) return;

    try {
      const primaryVariant = selectedVariants[0];
      await addToCart({
        variantId: primaryVariant.id,
        quantity: 1,
        bundleConfigId: discoverySet.id,
        bundleSelections: {
          bundleTitle: discoverySet.title,
          customPrice: pricingResult.price,
          items: pricingResult.selections,
        },
      });

      trackFeatureEvent('DISCOVERY_SET_ADDED', 'discovery_set', {
        bundleSlug: slug,
        price: pricingResult.price,
      });

      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err) {
      setErrorMsg('Failed to add discovery coffret to cart.');
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 text-center min-h-[60vh] flex items-center justify-center text-[#D8BE82] font-editorial-serif tracking-widest">
        Preparing Ateliers Coffret...
      </div>
    );
  }

  if (!discoverySet) {
    return (
      <div className="pt-32 pb-24 text-center space-y-4">
        <p className="text-sm text-[#AAA297]">This Discovery Set coffret is currently unavailable in reserve.</p>
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-[#C7A866] text-[#080A0B] text-xs font-semibold uppercase tracking-wider"
          >
            Return to Atelier Repertoire
          </button>
        )}
      </div>
    );
  }

  const minCount = discoverySet.minSelections || 3;
  const isComplete = selectedVariants.length === minCount;
  const displayPrice = pricingResult ? pricingResult.price : Number(discoverySet.fixedPrice || 999);

  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto select-none animate-fade-up">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-8 flex items-center space-x-2 text-xs tracking-widest text-[#AAA297] hover:text-[#D8BE82] transition-colors uppercase cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </button>
      )}

      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-8 border-b border-white/[0.08]">
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center space-x-2 text-[#D8BE82]">
            <IllureCrest size={18} className="text-[#D8BE82]" />
            <span className="typography-eyebrow text-[#D8BE82]">ATELIER PRESENTATION COFFRET</span>
          </div>
          <h1 className="typography-display text-3xl sm:text-4xl md:text-5xl text-[#F7F3EA] leading-tight">
            {discoverySet.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#D8D0C3] max-w-2xl leading-relaxed">
            {discoverySet.description}
          </p>
        </div>

        {/* Status / Sticky Summary */}
        <div className="lg:col-span-4 bg-[#14120F] border border-[#C7A866]/30 p-5 rounded-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-[#AAA297]">COFFRET PRICE</span>
            <span className="font-editorial-serif text-2xl text-[#D8BE82]">
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-white/10 pt-3">
            <span className="text-[#D8D0C3]">Selections ({selectedVariants.length} of {minCount})</span>
            <span className={`font-mono text-xs ${isComplete ? 'text-emerald-400 font-semibold' : 'text-[#C7A866]'}`}>
              {isComplete ? '✓ Ready for Coffret' : `Choose ${minCount - selectedVariants.length} more`}
            </span>
          </div>

          {errorMsg && (
            <p className="text-[11px] text-rose-400 bg-rose-950/40 p-2 rounded-xs border border-rose-800/40">
              {errorMsg}
            </p>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!isComplete || validating}
            className={`w-full py-4 text-xs tracking-widest uppercase font-semibold transition-all rounded-xs flex items-center justify-center space-x-2 ${
              isComplete && !validating
                ? 'bg-[#C7A866] hover:bg-[#D8BE82] text-[#080A0B] cursor-pointer shadow-[0_10px_25px_rgba(199,168,102,0.25)]'
                : 'bg-[#1E1E22] text-[#AAA297]/50 border border-white/5 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{added ? 'COFFRET ADDED TO BAG' : validating ? 'CALCULATING...' : `ACQUIRE SET · ₹${displayPrice.toLocaleString('en-IN')}`}</span>
          </button>
        </div>
      </div>

      {/* Selected Slot Trays */}
      <div className="my-10 bg-[#0E1011] border border-[#C7A866]/20 p-6 rounded-xs space-y-4">
        <span className="text-[10px] tracking-[0.25em] text-[#D8BE82] uppercase block font-semibold">
          YOUR COFFRET SLOTS ({selectedVariants.length}/{minCount})
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: minCount }).map((_, idx) => {
            const item = selectedVariants[idx];
            return (
              <div
                key={idx}
                className={`p-4 border rounded-xs transition-all flex items-center justify-between ${
                  item
                    ? 'border-[#C7A866]/50 bg-[#14120F]'
                    : 'border-dashed border-white/10 bg-[#080A0B]/50'
                }`}
              >
                {item ? (
                  <div className="flex items-center space-x-3 truncate">
                    <span className="w-6 h-6 rounded-full bg-[#C7A866]/20 text-[#D8BE82] font-mono text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="font-editorial-serif text-sm text-[#F7F3EA] truncate">{item.product.name}</p>
                      <p className="text-[10px] text-[#AAA297] font-mono">{item.sizeLabel || '3 ML Sample'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 text-[#AAA297]/40">
                    <span className="w-6 h-6 rounded-full border border-dashed border-white/20 font-mono text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs tracking-wider uppercase">Slot {idx + 1} Empty</span>
                  </div>
                )}

                {item && discoverySet.type !== 'PREBUILT' && (
                  <button
                    onClick={() => setSelectedVariants((prev) => prev.filter((v) => v.id !== item.id))}
                    className="text-xs text-[#AAA297] hover:text-rose-400 p-1 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fragrance Repertoire Options */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-[11px] tracking-[0.25em] text-[#D8BE82] uppercase font-semibold">
            AVAILABLE ATELIER EXTRACTS
          </span>
          <span className="text-xs text-[#AAA297]">
            {discoverySet.type === 'PREBUILT'
              ? 'Curated Masterwork Triad'
              : 'Tap to add or replace flacons in your coffret'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(discoverySet.eligibleItems || []).map((eligibleItem) => {
            const product = eligibleItem.product;
            const variant =
              eligibleItem.variant ||
              product.variants.find((v) => v.sizeLabel.includes('3 ML')) ||
              product.variants[0];

            const isSelected = selectedVariants.some((v) => v.id === variant?.id);
            const inStock = variant && variant.stockQuantity > 0;
            const primaryImg =
              product.images.find((img) => img.isPrimary)?.url ||
              product.images[0]?.url ||
              '/images/illure-placeholder.svg';

            return (
              <div
                key={eligibleItem.id}
                onClick={() => inStock && handleToggleProduct(eligibleItem)}
                className={`p-5 rounded-xs border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#C7A866] bg-[#14120F] shadow-[0_0_20px_rgba(199,168,102,0.15)]'
                    : inStock
                    ? 'border-white/[0.08] bg-[#0E1011] hover:border-[#C7A866]/40'
                    : 'border-white/[0.04] bg-[#080A0B]/60 opacity-50 cursor-not-allowed'
                }`}
              >
                {/* Check Indicator */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] tracking-widest text-[#AAA297] uppercase font-mono">
                    {product.fragranceFamily || 'EXTRACT'}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-[#C7A866] bg-[#C7A866] text-[#080A0B]'
                        : 'border-white/20'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </div>
                </div>

                {/* Product Image */}
                <div className="h-44 w-full flex items-center justify-center my-3">
                  <img
                    src={primaryImg}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                    onError={(e) => {
                      e.currentTarget.src = '/images/illure-placeholder.svg';
                    }}
                  />
                </div>

                {/* Product Meta */}
                <div className="space-y-1 pt-3 border-t border-white/[0.06]">
                  <h4 className="font-editorial-serif text-lg text-[#F7F3EA] leading-snug">
                    {product.name}
                  </h4>
                  {product.inspiredByName && (
                    <p className="text-[11px] text-[#AAA297]">Inspired by {product.inspiredByName}</p>
                  )}
                  <p className="text-[10px] font-mono text-[#D8BE82] pt-1">
                    {variant?.sizeLabel || '3 ML Miniature'} {!inStock && '(Out of Reserve)'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
