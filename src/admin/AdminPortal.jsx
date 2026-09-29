import React, { useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from './AdminAuthContext';
import AdminLoginPage from './AdminLoginPage';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';

function AdminPortalContent({ onGoToStore }) {
  const { isAuthenticated, loading } = useAdminAuth();
  const [adminTab, setAdminTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080C0D] flex items-center justify-center text-[#C6AE82] font-serif tracking-widest text-sm">
        Authenticating İLLURÊ Admin Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  return (
    <AdminLayout activeTab={adminTab} setActiveTab={setAdminTab} onGoToStore={onGoToStore}>
      <AdminDashboard activeTab={adminTab} />
    </AdminLayout>
  );
}

export default function AdminPortal({ onGoToStore }) {
  return (
    <AdminAuthProvider>
      <AdminPortalContent onGoToStore={onGoToStore} />
    </AdminAuthProvider>
  );
}
