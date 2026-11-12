import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { Search, X, Package, ShoppingCart, Users, Gift, Tag, ArrowRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminGlobalSearchModal({ isOpen, onClose, onNavigateTab }) {
  const { accessToken } = useAdminAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    products: [],
    orders: [],
    customers: [],
    giftCards: [],
  });

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ products: [], orders: [], customers: [], giftCards: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ products: [], orders: [], customers: [], giftCards: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [prodRes, ordRes] = await Promise.all([
          fetch(`${API_BASE}/admin/products?search=${encodeURIComponent(query)}&pageSize=5`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_BASE}/admin/orders?search=${encodeURIComponent(query)}&pageSize=5`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        const prodData = await prodRes.json();
        const ordData = await ordRes.json();

        setResults({
          products: prodData.success ? prodData.data?.items || [] : [],
          orders: ordData.success ? ordData.data?.orders || [] : [],
          customers: [],
          giftCards: [],
        });
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, accessToken]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-start justify-center p-4 pt-20 z-50">
      <div className="bg-[#13191B] border border-[#C6AE82]/30 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-[#C6AE82]/20 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#C6AE82]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search catalog, SKUs, orders, customers across OS..."
            className="flex-1 bg-transparent text-[#F2EFE8] placeholder-gray-500 text-sm focus:outline-none font-sans"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-[#F2EFE8]">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-mono px-2 py-1 bg-gray-800 text-gray-300 rounded hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Search Results Area */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {loading && (
            <p className="text-xs text-gray-400 font-mono py-4 text-center">
              Scanning database records...
            </p>
          )}

          {!loading && !query && (
            <p className="text-xs text-gray-400 font-sans py-6 text-center">
              Type at least 2 characters to search across products, variants, SKUs, and orders.
            </p>
          )}

          {!loading && query && results.products.length === 0 && results.orders.length === 0 && (
            <p className="text-xs text-gray-400 font-sans py-6 text-center">
              No matching records found for "{query}".
            </p>
          )}

          {/* Products Results */}
          {results.products.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-[#C6AE82] block">
                Fragrance Catalog ({results.products.length})
              </span>
              <div className="space-y-1">
                {results.products.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onNavigateTab('products');
                      onClose();
                    }}
                    className="p-3 rounded-lg bg-[#0D1112] hover:bg-[#1A2224] border border-[#C6AE82]/15 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-[#C6AE82]" />
                      <div>
                        <p className="text-xs font-serif text-[#F2EFE8]">{prod.name}</p>
                        <p className="text-[10px] font-mono text-gray-400">{prod.slug}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Results */}
          {results.orders.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-[#C6AE82] block">
                Client Orders ({results.orders.length})
              </span>
              <div className="space-y-1">
                {results.orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      onNavigateTab('orders');
                      onClose();
                    }}
                    className="p-3 rounded-lg bg-[#0D1112] hover:bg-[#1A2224] border border-[#C6AE82]/15 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-4 h-4 text-[#C6AE82]" />
                      <div>
                        <p className="text-xs font-mono font-bold text-[#F2EFE8]">{ord.orderNumber}</p>
                        <p className="text-[10px] text-gray-400">
                          {ord.customerName} • ₹{Number(ord.totalAmount).toLocaleString()} • {ord.status}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
