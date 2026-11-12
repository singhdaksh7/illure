import React, { useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import AdminGlobalSearchModal from './components/AdminGlobalSearchModal';
import {
  LayoutDashboard,
  BarChart3,
  SlidersHorizontal,
  Package,
  Layers,
  Award,
  Boxes,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Image,
  Sparkles,
  Bell,
  FileText,
  Key,
  Truck,
  Gift,
  Search,
} from 'lucide-react';

export default function AdminLayout({ children, activeTab, setActiveTab, onGoToStore }) {
  const { admin, logout } = useAdminAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analytics', label: 'Executive Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'CATALOG & MEDIA',
      items: [
        { id: 'products', label: 'Products & Variants', icon: Package },
        { id: 'categories', label: 'Categories', icon: Layers },
        { id: 'referenceBrands', label: 'Reference Brands', icon: Award },
        { id: 'discoverySets', label: 'Discovery Sets', icon: Boxes },
        { id: 'inventory', label: 'Inventory Stock', icon: Boxes },
        { id: 'mediaLibrary', label: 'R2 Media Library', icon: Image },
      ],
    },
    {
      title: 'STOREFRONT CMS',
      items: [
        { id: 'cms', label: 'Homepage Builder', icon: Sparkles },
        { id: 'banners', label: 'Banners', icon: Image },
        { id: 'tickers', label: 'Announcement Ticker', icon: Bell },
        { id: 'pages', label: 'Static Pages & Policies', icon: FileText },
        { id: 'features', label: 'Commerce Features', icon: SlidersHorizontal },
      ],
    },
    {
      title: 'COMMERCE & OPERATIONS',
      items: [
        { id: 'orders', label: 'Orders & Timeline', icon: ShoppingCart },
        { id: 'shipments', label: 'Shipments & Shiprocket', icon: Truck },
        { id: 'giftPackaging', label: 'Gift Packaging', icon: Gift },
      ],
    },
    {
      title: 'SYSTEM & SECURITY',
      items: [
        { id: 'integrations', label: 'Integrations Vault', icon: Key },
        { id: 'admins', label: 'Admin Staff', icon: Users },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#13191B] flex flex-col font-sans">
      {/* Top Charcoal Navbar */}
      <header className="bg-[#0D1112] border-b border-[#C6AE82]/20 text-[#F2EFE8] px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl tracking-widest text-[#F2EFE8]">İLLURÊ</span>
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-[#C6AE82]/20 text-[#C6AE82] border border-[#C6AE82]/30 font-medium">
              OPERATING SYSTEM
            </span>
          </div>

          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#13191B] border border-[#C6AE82]/30 text-xs text-gray-400 hover:text-[#F2EFE8] hover:border-[#C6AE82]/60 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#C6AE82]" />
            <span>Search products, orders, SKUs...</span>
            <kbd className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
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
        <aside className="w-64 bg-[#13191B] border-r border-[#C6AE82]/15 flex flex-col shrink-0 overflow-y-auto">
          <nav className="p-4 space-y-6 flex-1">
            {navSections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <span className="px-3 text-[10px] uppercase tracking-widest text-[#C6AE82]/60 font-semibold block mb-1.5">
                  {sec.title}
                </span>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#C6AE82] text-[#080C0D] font-semibold shadow-sm'
                          : 'text-[#F2EFE8]/70 hover:text-[#F2EFE8] hover:bg-[#C6AE82]/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* System Footer Info */}
          <div className="p-4 border-t border-[#C6AE82]/10 bg-[#080C0D]/50 text-[10px] text-[#F2EFE8]/40 space-y-1">
            <p className="font-semibold text-[#F2EFE8]/60">İLLURÊ Operating System</p>
            <p>PostgreSQL • Cloudflare R2 • Shiprocket</p>
            <p>Vault: AES-256-GCM Encrypted</p>
          </div>
        </aside>

        {/* Main Content Area (Warm Ivory) */}
        <main className="flex-1 overflow-y-auto bg-[#F9F8F6] p-8">
          {children}
        </main>
      </div>

      {/* Global Admin Search Modal */}
      <AdminGlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setSearchOpen(false);
        }}
      />
    </div>
  );
}
