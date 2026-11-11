import React from 'react';
import { X, Sparkles, Plus, Check, ShoppingBag } from 'lucide-react';
import IllureCrest from '../IllureCrest';
import { useFeatures } from '../../context/FeaturesContext';

export default function FragranceCompareModal({
  isOpen,
  onClose,
  comparedProducts = [],
  onRemoveProduct,
  onAddToCart,
}) {
  const { isFeatureEnabled, trackFeatureEvent } = useFeatures();

  if (!isOpen || !isFeatureEnabled('fragrance_compare')) return null;

  const handleAdd = (product) => {
    trackFeatureEvent('COMPARE_ADD_TO_CART', 'fragrance_compare', { productId: product.id });
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] bg-[#0E1011] border border-[#D8BE82]/30 p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#AAA297] hover:text-[#D8BE82] transition-colors p-2 z-10"
          aria-label="Close Comparison"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-6 flex-shrink-0">
          <div className="flex items-center justify-center space-x-2">
            <IllureCrest size={20} className="text-[#C7A866]" />
            <span className="font-bodoni text-lg tracking-[0.25em] text-[#F7F3EA] uppercase">
              İLLURÊ
            </span>
          </div>
          <span className="typography-eyebrow text-[#C7A866] block">
            FORMULATION ANALYSIS
          </span>
          <h3 className="typography-h2 text-[#F7F3EA]">
            COMPARE SIGNATURE ACCORDS
          </h3>
        </div>

        {/* Content */}
        {comparedProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <p className="text-sm text-[#AAA297]">
              No fragrances selected for comparison.
            </p>
            <p className="text-xs text-[#80683E]">
              Click "Compare" on any product detail page to evaluate formulations side-by-side.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto flex-grow custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D8BE82]/20">
                  <th className="p-4 w-44 font-interface-sans font-medium text-[#C7A866] uppercase tracking-wider text-[10px]">
                    CRITERIA
                  </th>
                  {comparedProducts.map((p) => (
                    <th key={p.id} className="p-4 min-w-[220px] text-center align-top relative">
                      <button
                        onClick={() => onRemoveProduct && onRemoveProduct(p.id)}
                        className="absolute top-2 right-2 text-[#AAA297] hover:text-red-400 p-1"
                        title="Remove from comparison"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-20 h-20 mx-auto mb-3 bg-[#080A0B] border border-[#D8BE82]/20 p-1 rounded-xs overflow-hidden">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=400'}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-bodoni text-base text-[#F7F3EA] block">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-[#AAA297] tracking-wider block mt-0.5">
                        {p.brand || 'İLLURÊ'}
                      </span>
                      {p.price && (
                        <span className="text-xs font-semibold text-[#D8BE82] block mt-1">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8BE82]/10 text-xs text-[#D8D0C3]">
                {/* Concentration */}
                <tr>
                  <td className="p-4 text-[#AAA297] font-medium text-[11px] uppercase tracking-wider">
                    Concentration
                  </td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-center font-editorial-serif text-sm text-[#F7F3EA]">
                      {p.concentration || 'Eau de Parfum'}
                    </td>
                  ))}
                </tr>

                {/* Fragrance Family */}
                <tr>
                  <td className="p-4 text-[#AAA297] font-medium text-[11px] uppercase tracking-wider">
                    Olfactory Family
                  </td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-center">
                      <span className="px-2.5 py-1 bg-[#14120F] border border-[#D8BE82]/20 text-[10px] uppercase tracking-widest text-[#D8BE82]">
                        {p.fragranceFamily || 'Master Accords'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Top Notes */}
                <tr>
                  <td className="p-4 text-[#AAA297] font-medium text-[11px] uppercase tracking-wider">
                    Top Notes
                  </td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-center text-[11px] leading-relaxed">
                      {p.topNotes?.join(', ') || 'Citrus accords, Saffron'}
                    </td>
                  ))}
                </tr>

                {/* Heart Notes */}
                <tr>
                  <td className="p-4 text-[#AAA297] font-medium text-[11px] uppercase tracking-wider">
                    Heart Notes
                  </td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-center text-[11px] leading-relaxed">
                      {p.heartNotes?.join(', ') || 'Floral bouquet, Precious woods'}
                    </td>
                  ))}
                </tr>

                {/* Base Notes */}
                <tr>
                  <td className="p-4 text-[#AAA297] font-medium text-[11px] uppercase tracking-wider">
                    Base Notes
                  </td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-center text-[11px] leading-relaxed">
                      {p.baseNotes?.join(', ') || 'Amber, Musk, Woods'}
                    </td>
                  ))}
                </tr>

                {/* Longevity / Occasion */}
                <tr>
                  <td className="p-4 text-[#AAA297] font-medium text-[11px] uppercase tracking-wider">
                    Optimal Presence
                  </td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-center text-[11px]">
                      {p.attributes?.occasion || p.attributes?.season || 'Day to Evening versatility'}
                    </td>
                  ))}
                </tr>

                {/* Action CTA */}
                <tr>
                  <td className="p-4 text-[#AAA297] font-medium text-[11px] uppercase tracking-wider">
                    Selection
                  </td>
                  {comparedProducts.map(p => (
                    <td key={p.id} className="p-4 text-center">
                      <button
                        onClick={() => handleAdd(p)}
                        className="px-4 py-2 bg-[#C7A866] hover:bg-[#D8BE82] text-[#080A0B] text-[10px] font-semibold tracking-widest uppercase transition-colors inline-flex items-center space-x-1.5"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>SELECT SCENT</span>
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
