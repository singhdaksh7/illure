import React, { useEffect } from 'react';
import { X, ArrowRight, ShoppingBag } from 'lucide-react';
import IllureCrest from '../IllureCrest';
import { useFeatures } from '../../context/FeaturesContext';

export default function FragranceCompareModal({
  isOpen,
  onClose,
  comparedProducts = [],
  onRemoveProduct,
  onAddToCart,
  onViewProduct,
}) {
  const { isFeatureEnabled, trackFeatureEvent } = useFeatures();

  useEffect(() => {
    if (isOpen && isFeatureEnabled('fragrance_compare')) {
      trackFeatureEvent('COMPARE_OPENED', 'fragrance_compare', { count: comparedProducts.length });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !isFeatureEnabled('fragrance_compare')) return null;

  const handleAction = (product) => {
    const activeVariants = (product.variants || []).filter((v) => v.isActive !== false);

    // If exactly 1 active purchasable variant, direct Add to Bag is safe
    if (activeVariants.length === 1 && (activeVariants[0].stockQuantity === null || activeVariants[0].stockQuantity > 0)) {
      trackFeatureEvent('COMPARE_RESULT_CLICKED', 'fragrance_compare', { productId: product.id, action: 'add_to_cart' });
      if (onAddToCart) {
        onAddToCart({
          ...product,
          variantId: activeVariants[0].id,
          size: activeVariants[0].sizeLabel,
          price: Number(activeVariants[0].price),
        });
      }
    } else {
      // Multiple sizes or requires size selection -> redirect to product view
      trackFeatureEvent('COMPARE_RESULT_CLICKED', 'fragrance_compare', { productId: product.id, action: 'view_product' });
      if (onViewProduct) {
        onViewProduct(product.id);
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0E1011] border border-[#D8BE82]/30 p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#AAA297] hover:text-[#D8BE82] p-2 transition-colors focus:outline-none z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-6 flex-shrink-0">
          <div className="flex items-center justify-center space-x-2">
            <IllureCrest size={18} className="text-[#C7A866]" />
            <span className="font-bodoni text-base tracking-[0.25em] text-[#F7F3EA] uppercase">
              İLLURÊ
            </span>
          </div>
          <h2 id="compare-modal-title" className="font-bodoni text-xl md:text-2xl text-[#F7F3EA] tracking-wide uppercase pt-1">
            COMPARE FRAGRANCES
          </h2>
          <p className="text-xs text-[#AAA297]">
            Side-by-side profile and notes comparison.
          </p>
        </div>

        {/* Empty State */}
        {comparedProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <p className="text-sm text-[#F7F3EA]">
              Choose at least two fragrances to compare.
            </p>
            <p className="text-xs text-[#AAA297] max-w-sm mx-auto">
              Click the compare icon on any fragrance card or product page to evaluate notes and profiles together.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto flex-grow custom-scrollbar border-t border-[#D8BE82]/15">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D8BE82]/20">
                  <th className="p-3 w-40 font-interface-sans font-medium text-[#C7A866] uppercase tracking-wider text-[10px]">
                    CRITERIA
                  </th>
                  {comparedProducts.map((p) => (
                    <th key={p.id} className="p-3 min-w-[200px] text-center align-top relative">
                      <button
                        onClick={() => {
                          trackFeatureEvent('COMPARE_PRODUCT_REMOVED', 'fragrance_compare', { productId: p.id });
                          if (onRemoveProduct) onRemoveProduct(p.id);
                        }}
                        className="absolute top-2 right-2 text-[#AAA297] hover:text-red-400 p-1"
                        aria-label={`Remove ${p.name}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-16 h-16 mx-auto mb-2 bg-[#080A0B] border border-[#D8BE82]/20 p-1 overflow-hidden">
                        <img
                          src={p.images?.[0]?.url || p.images?.[0] || p.image || '/images/illure-placeholder.svg'}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-bodoni text-sm text-[#F7F3EA] block">
                        {p.name}
                      </span>
                      {p.price && (
                        <span className="text-xs font-semibold text-[#D8BE82] block mt-0.5">
                          ₹{Number(p.price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8BE82]/10 text-xs text-[#D8D0C3]">
                {/* Fragrance Family */}
                <tr>
                  <td className="p-3 text-[#AAA297] font-medium text-[10px] uppercase tracking-wider">
                    Fragrance Family
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3 text-center">
                      <span className="text-[11px] text-[#F7F3EA]">
                        {p.fragranceFamily || 'Master Accords'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Available Sizes */}
                <tr>
                  <td className="p-3 text-[#AAA297] font-medium text-[10px] uppercase tracking-wider">
                    Available Sizes
                  </td>
                  {comparedProducts.map((p) => {
                    const sizes = p.variants && p.variants.length > 0
                      ? p.variants.map((v) => v.sizeLabel).join(', ')
                      : (p.sizes ? p.sizes.map((s) => s.size || s).join(', ') : 'Standard Fragrance');
                    return (
                      <td key={p.id} className="p-3 text-center text-[11px] text-[#AAA297]">
                        {sizes}
                      </td>
                    );
                  })}
                </tr>

                {/* Top Notes */}
                <tr>
                  <td className="p-3 text-[#AAA297] font-medium text-[10px] uppercase tracking-wider">
                    Top Notes
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3 text-center text-[11px] leading-relaxed">
                      {p.topNotes && p.topNotes.length > 0 ? p.topNotes.join(', ') : '—'}
                    </td>
                  ))}
                </tr>

                {/* Heart Notes */}
                <tr>
                  <td className="p-3 text-[#AAA297] font-medium text-[10px] uppercase tracking-wider">
                    Heart Notes
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3 text-center text-[11px] leading-relaxed">
                      {p.heartNotes && p.heartNotes.length > 0 ? p.heartNotes.join(', ') : '—'}
                    </td>
                  ))}
                </tr>

                {/* Base Notes */}
                <tr>
                  <td className="p-3 text-[#AAA297] font-medium text-[10px] uppercase tracking-wider">
                    Base Notes
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3 text-center text-[11px] leading-relaxed">
                      {p.baseNotes && p.baseNotes.length > 0 ? p.baseNotes.join(', ') : '—'}
                    </td>
                  ))}
                </tr>

                {/* Best For (Occasion / Season) */}
                <tr>
                  <td className="p-3 text-[#AAA297] font-medium text-[10px] uppercase tracking-wider">
                    Best For
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3 text-center text-[11px]">
                      {p.occasion || p.season || 'All seasons'}
                    </td>
                  ))}
                </tr>

                {/* Projection / Intensity */}
                <tr>
                  <td className="p-3 text-[#AAA297] font-medium text-[10px] uppercase tracking-wider">
                    Projection
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3 text-center text-[11px]">
                      {p.projection || 'Moderate'}
                    </td>
                  ))}
                </tr>

                {/* Safe Selection Button */}
                <tr>
                  <td className="p-3 text-[#AAA297] font-medium text-[10px] uppercase tracking-wider">
                    Action
                  </td>
                  {comparedProducts.map((p) => {
                    const activeVariants = (p.variants || []).filter((v) => v.isActive !== false);
                    const isSingleVariant = activeVariants.length === 1;

                    return (
                      <td key={p.id} className="p-3 text-center">
                        <button
                          onClick={() => handleAction(p)}
                          className="px-3.5 py-2 bg-[#C7A866] hover:bg-[#D8BE82] text-[#080A0B] text-[10px] font-semibold tracking-wider uppercase transition-colors inline-flex items-center space-x-1 shadow-sm"
                        >
                          {isSingleVariant ? (
                            <>
                              <ShoppingBag className="w-3 h-3" />
                              <span>ADD TO BAG</span>
                            </>
                          ) : (
                            <>
                              <span>CHOOSE SIZE</span>
                              <ArrowRight className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
