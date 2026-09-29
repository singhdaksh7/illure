import React, { useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  Award,
  Boxes,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Shield,
  ExternalLink,
} from 'lucide-react';

export default function AdminLayout({ children, activeTab, setActiveTab, onGoToStore }) {
  const { admin, logout } = useAdminAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: 'Future' },
    { id: 'categories', label: 'Categories', icon: Layers, badge: 'Future' },
    { id: 'referenceBrands', label: 'Reference Brands', icon: Award, badge: 'Future' },
    { id: 'inventory', label: 'Inventory', icon: Boxes, badge: 'Future' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: 'Future' },
    { id: 'admins', label: 'Admin Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings, badge: 'Future' },
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#13191B] flex flex-col font-sans">
      {/* Top Charcoal Navbar */}
      <header className="bg-[#0D1112] border-b border-[#C6AE82]/20 text-[#F2EFE8] px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl tracking-widest text-[#F2EFE8]">İLLURÊ</span>
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-[#C6AE82]/20 text-[#C6AE82] border border-[#C6AE82]/30 font-medium">
              Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={onGoToStore}
            className="flex items-center gap-1.5 text-xs text-[#F2EFE8]/70 hover:text-[#C6AE82] transition-colors cursor-pointer"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-[#C6AE82]/20" />

          {admin && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-[#F2EFE8]">{admin.name}</p>
                <p className="text-[10px] text-[#C6AE82] uppercase tracking-wider">{admin.role}</p>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-lg text-[#F2EFE8]/70 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#13191B] border-r border-[#C6AE82]/15 flex flex-col shrink-0">
          <nav className="p-4 space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#C6AE82] text-[#080C0D] font-semibold'
                      : 'text-[#F2EFE8]/70 hover:text-[#F2EFE8] hover:bg-[#C6AE82]/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-normal ${
                        isActive
                          ? 'bg-[#080C0D]/20 text-[#080C0D]'
                          : 'bg-[#C6AE82]/15 text-[#C6AE82]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* System Footer Info */}
          <div className="p-4 border-t border-[#C6AE82]/10 bg-[#080C0D]/50 text-[10px] text-[#F2EFE8]/40 space-y-1">
            <p className="font-semibold text-[#F2EFE8]/60">İLLURÊ Backend Architecture</p>
            <p>PostgreSQL • Prisma ORM • Node.js</p>
            <p>Auth: Argon2id + JWT + Rotation</p>
          </div>
        </aside>

        {/* Main Content Area (Warm Ivory) */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#F9F8F6]">
          {children}
        </main>
      </div>
    </div>
  );
}
