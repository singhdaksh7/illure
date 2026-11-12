import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import AdminQuickActions from './components/AdminQuickActions';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminCmsPage from './pages/AdminCmsPage';
import AdminFeaturesPage from './pages/AdminFeaturesPage';
import AdminDiscoverySetsPage from './pages/AdminDiscoverySetsPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminReferenceBrandsPage from './pages/AdminReferenceBrandsPage';
import AdminInventoryPage from './pages/AdminInventoryPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminGiftPackagingPage from './pages/AdminGiftPackagingPage';
import AdminMediaLibraryPage from './pages/AdminMediaLibraryPage';
import AdminBannersPage from './pages/AdminBannersPage';
import AdminTickerPage from './pages/AdminTickerPage';
import AdminPagesPage from './pages/AdminPagesPage';
import AdminIntegrationsPage from './pages/AdminIntegrationsPage';
import AdminShipmentsPage from './pages/AdminShipmentsPage';
import {
  ShieldCheck,
  CheckCircle,
  Database,
  Lock,
  Package,
  Layers,
  Award,
  Users,
  AlertTriangle,
  Server,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminDashboard({ activeTab, setActiveTab }) {
  const { admin, accessToken } = useAdminAuth();
  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch(`${API_BASE}/health`);
        const data = await res.json();
        if (data.success) {
          setHealthStatus(data.data);
        }
      } catch (err) {
        console.error('Health check error:', err);
      }
    }
    fetchHealth();
  }, []);

  useEffect(() => {
    async function fetchAdminUsers() {
      if (activeTab === 'admins' || activeTab === 'dashboard') {
        setLoadingAdmins(true);
        try {
          const res = await fetch(`${API_BASE}/admin/users`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setAdminUsers(data.data.admins || []);
          }
        } catch (err) {
          console.error('Fetch admin users error:', err);
        } finally {
          setLoadingAdmins(false);
        }
      }
    }
    fetchAdminUsers();
  }, [activeTab, accessToken]);

  // Tab Dispatching
  if (activeTab === 'analytics') return <AdminAnalyticsPage />;
  if (activeTab === 'features') return <AdminFeaturesPage />;
  if (activeTab === 'discoverySets') return <AdminDiscoverySetsPage />;
  if (activeTab === 'cms') return <AdminCmsPage />;
  if (activeTab === 'products') return <AdminProductsPage />;
  if (activeTab === 'categories') return <AdminCategoriesPage />;
  if (activeTab === 'referenceBrands') return <AdminReferenceBrandsPage />;
  if (activeTab === 'inventory') return <AdminInventoryPage />;
  if (activeTab === 'orders') return <AdminOrdersPage />;
  if (activeTab === 'giftPackaging') return <AdminGiftPackagingPage />;
  if (activeTab === 'mediaLibrary') return <AdminMediaLibraryPage />;
  if (activeTab === 'banners') return <AdminBannersPage />;
  if (activeTab === 'tickers') return <AdminTickerPage />;
  if (activeTab === 'pages') return <AdminPagesPage />;
  if (activeTab === 'integrations') return <AdminIntegrationsPage />;
  if (activeTab === 'shipments') return <AdminShipmentsPage />;

  if (activeTab === 'admins') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif text-[#0D1112]">Admin User Management</h1>
            <p className="text-xs text-gray-500 mt-1">
              Active administrative staff and role-based permissions
            </p>
          </div>
          <span className="px-3 py-1 bg-[#C6AE82]/20 text-[#8C6D32] font-medium text-xs rounded-full border border-[#C6AE82]/30">
            {adminUsers.length} Admin User(s)
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-[#0D1112] text-[#F2EFE8] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Last Login</th>
                <th className="px-6 py-3.5">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {loadingAdmins ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Loading admin users...
                  </td>
                </tr>
              ) : adminUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-sans font-medium text-gray-900">{u.name}</td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-[#C6AE82]/15 text-[#8C6D32] border border-[#C6AE82]/30 text-[10px] font-semibold">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-sans font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-red-500 font-sans font-medium">
                        <span className="w-2 h-2 rounded-full bg-red-500" /> Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Dashboard Overview
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#0D1112] text-[#F2EFE8] rounded-2xl p-6 sm:p-8 border border-[#C6AE82]/30 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-[#C6AE82]/20 text-[#C6AE82] border border-[#C6AE82]/40 text-[10px] uppercase tracking-widest font-semibold">
              Live Production Staging
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Healthy
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#F2EFE8]">
            Welcome to İLLURÊ Commerce Operating System
          </h1>
          <p className="text-xs text-[#F2EFE8]/70 leading-relaxed font-sans">
            Store owners command catalog variants, Cloudflare R2 media assets, dynamic homepage sections, banners, ticker, Shiprocket fulfillment, and integration secrets with real-time database persistence.
          </p>
        </div>
      </div>

      {/* Executive Quick Actions */}
      <AdminQuickActions onAction={(tab) => setActiveTab && setActiveTab(tab)} />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Database Models</span>
            <Database className="w-5 h-5 text-[#8C6D32]" />
          </div>
          <p className="text-2xl font-serif text-[#0D1112]">25 Models</p>
          <p className="text-[11px] text-gray-500">PostgreSQL + Prisma Formally Migrated</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Secrets Vault</span>
            <Lock className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-serif text-[#0D1112]">AES-256-GCM</p>
          <p className="text-[11px] text-emerald-600 font-medium">Application-Level Encrypted</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Shipping &amp; Courier</span>
            <Package className="w-5 h-5 text-[#8C6D32]" />
          </div>
          <p className="text-2xl font-serif text-[#0D1112]">Shiprocket</p>
          <p className="text-[11px] text-gray-500">Serviceability &amp; Neutral Webhooks</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Admin Staff</span>
            <Users className="w-5 h-5 text-[#8C6D32]" />
          </div>
          <p className="text-2xl font-serif text-[#0D1112]">{adminUsers.length || 1} Active</p>
          <p className="text-[11px] text-gray-500">Role-Based Access Control</p>
        </div>
      </div>
    </div>
  );
}
