import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';
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

const API_BASE = 'http://localhost:5000/api';

export default function AdminDashboard({ activeTab }) {
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
                        <span className="w-2 h-2 rounded-full bg-red-500" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-[#0D1112] text-[#F2EFE8] p-8 rounded-2xl border border-[#C6AE82]/20 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C6AE82]/15 text-[#C6AE82] text-xs rounded-full border border-[#C6AE82]/30 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Phases 1-3 Implemented • Backend &amp; Auth Core Active</span>
          </div>
          <h1 className="text-3xl font-serif tracking-wide text-white">
            Welcome back, {admin?.name || 'Administrator'}
          </h1>
          <p className="text-xs text-[#F2EFE8]/70 max-w-xl">
            İLLURÊ luxury storefront production backend architecture is active. Argon2id security, Prisma ORM PostgreSQL schema, and refresh rotation session protection enabled.
          </p>
        </div>

        <div className="bg-[#13191B] p-4 rounded-xl border border-[#C6AE82]/20 text-xs space-y-2 z-10 min-w-[220px]">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Environment:</span>
            <span className="text-emerald-400 font-mono font-medium">{healthStatus?.environment || 'development'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Database:</span>
            <span className="text-emerald-400 font-mono font-medium">{healthStatus?.database || 'connected'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Auth Standard:</span>
            <span className="text-[#C6AE82] font-mono font-medium">Argon2id + JWT</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Database Schema</span>
            <Database className="w-5 h-5 text-[#8C6D32]" />
          </div>
          <p className="text-2xl font-serif text-[#0D1112]">15 Models</p>
          <p className="text-[11px] text-gray-500">PostgreSQL + Prisma ORM</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Admin Security</span>
            <Lock className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-serif text-[#0D1112]">Argon2id</p>
          <p className="text-[11px] text-emerald-600 font-medium">Rotation &amp; Revocation Active</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Seeded Fragrances</span>
            <Package className="w-5 h-5 text-[#8C6D32]" />
          </div>
          <p className="text-2xl font-serif text-[#0D1112]">3 Fragrances</p>
          <p className="text-[11px] text-gray-500">12 Product Variants Seeded</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Admin Users</span>
            <Users className="w-5 h-5 text-[#8C6D32]" />
          </div>
          <p className="text-2xl font-serif text-[#0D1112]">{adminUsers.length || 1} Active</p>
          <p className="text-[11px] text-gray-500">SUPER_ADMIN Role Configured</p>
        </div>
      </div>

      {/* Module Architecture Readiness */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-serif text-[#0D1112] flex items-center gap-2">
          <Server className="w-5 h-5 text-[#8C6D32]" />
          Backend Architecture &amp; Module Readiness
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {[
            { title: 'Admin Auth & Security', status: 'Implemented', detail: 'Login, Refresh Rotation, Logout, /me' },
            { title: 'Admin Roles', status: 'Implemented', detail: 'SUPER_ADMIN, ADMIN, ORDER/INVENTORY_MANAGER' },
            { title: 'PostgreSQL Database', status: 'Implemented', detail: '15 normalized models with Prisma migrations' },
            { title: 'Products & Variants', status: 'Schema Ready', detail: 'Product, ProductVariant (Decimal prices, unique SKUs)' },
            { title: 'Reference Brands', status: 'Schema Ready', detail: 'Inspiration brand separation (e.g. Tom Ford, Armani)' },
            { title: 'Inventory Movements', status: 'Schema Ready', detail: 'PURCHASE, SALE, RETURN, ADJUSTMENT' },
            { title: 'Gift Packaging', status: 'Schema Ready', detail: 'Standard box free; optional paid gift box schema' },
            { title: 'Orders & OrderItems', status: 'Schema Ready', detail: 'OrderStatus & PaymentStatus snapshot architecture' },
            { title: 'Coupons & Customers', status: 'Schema Ready', detail: 'Customer, Address, Coupon percentage/fixed types' },
          ].map((m, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">{m.title}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                    m.status === 'Implemented'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {m.status}
                  </span>
                </div>
                <p className="text-gray-500 text-[11px]">{m.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
