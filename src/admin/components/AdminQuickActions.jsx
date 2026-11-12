import React from 'react';
import { Plus, Image, Sparkles, ShoppingCart, Sliders } from 'lucide-react';

export default function AdminQuickActions({ onAction }) {
  const actions = [
    { id: 'products', label: 'Add Product', icon: Plus, bg: 'bg-[#C6AE82] text-[#080C0D]' },
    { id: 'banners', label: 'Create Banner', icon: Image, bg: 'bg-[#13191B] text-[#F2EFE8] border border-[#C6AE82]/30' },
    { id: 'cms', label: 'Edit Homepage', icon: Sparkles, bg: 'bg-[#13191B] text-[#F2EFE8] border border-[#C6AE82]/30' },
    { id: 'orders', label: 'View Orders', icon: ShoppingCart, bg: 'bg-[#13191B] text-[#F2EFE8] border border-[#C6AE82]/30' },
    { id: 'inventory', label: 'Adjust Inventory', icon: Sliders, bg: 'bg-[#13191B] text-[#F2EFE8] border border-[#C6AE82]/30' },
  ];

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Executive Quick Actions
        </h2>
        <span className="text-[10px] text-gray-400 font-mono">1-Click Direct Access</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => onAction(act.id)}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer shadow-xs ${act.bg}`}
            >
              <Icon className="w-4 h-4" />
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
