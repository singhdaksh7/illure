import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import {
  Boxes,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function AdminDiscoverySetsPage() {
  const { accessToken } = useAdminAuth();
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // list | create | edit
  const [editingSet, setEditingSet] = useState(null);

  const fetchSets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/discovery-sets', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSets(data.data.sets || []);
      }
    } catch (err) {
      console.warn('Failed to load discovery sets for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSets();
  }, [accessToken]);

  const handleToggleStatus = async (set) => {
    const newStatus = set.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/discovery-sets/${set.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchSets();
      }
    } catch (err) {
      console.warn('Failed to update discovery set status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#0D1112]">Discovery Sets &amp; Coffrets</h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure custom 3-flacon discovery sets and prebuilt curated coffrets.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-[#C6AE82]/20 text-[#8C6D32] font-medium text-xs rounded-full border border-[#C6AE82]/30">
            {sets.length} Coffrets Configured
          </span>
        </div>
      </div>

      {/* Grid of Configured Discovery Sets */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400">Loading discovery set configurations...</div>
      ) : sets.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-gray-200 space-y-2">
          <Boxes className="w-8 h-8 text-[#C6AE82] mx-auto opacity-70" />
          <h4 className="text-base font-medium text-gray-800">No Discovery Sets Configured</h4>
          <p className="text-xs text-gray-500">Seed defaults or create a new set configuration.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sets.map((set) => (
            <div
              key={set.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                      set.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {set.status}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                    {set.type}
                  </span>
                </div>

                <h3 className="text-lg font-serif text-gray-900">{set.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{set.description}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Pricing Mode:</span>
                  <span className="font-mono font-medium text-gray-800">{set.pricingMode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Fixed Bundle Price:</span>
                  <span className="font-mono font-semibold text-[#8C6D32]">
                    ₹{Number(set.fixedPrice || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Required Selections:</span>
                  <span className="font-mono text-gray-700">{set.minSelections} Flacons</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Eligible Products:</span>
                  <span className="font-mono text-gray-700">
                    {set.type === 'PREBUILT'
                      ? `${set.prebuiltItems?.length || 0} prebuilt items`
                      : `${set.eligibleItems?.length || 0} active products`}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <a
                  href={`/discovery-set/${set.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#8C6D32] hover:text-[#5E481D] font-medium flex items-center gap-1"
                >
                  <span>Preview Builder</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleToggleStatus(set)}
                  className={`px-3 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                    set.status === 'ACTIVE'
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {set.status === 'ACTIVE' ? 'Set to Draft' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
