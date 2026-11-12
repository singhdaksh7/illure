import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Bookmark, 
  RotateCcw, 
  Download, 
  RefreshCw,
  IndianRupee,
  Clock,
  MousePointerClick
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState(null);
  const [bestsellers, setBestsellers] = useState([]);
  const [clickData, setClickData] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('executive');

  const fetchMetrics = async (selectedDays = days) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminAccessToken') || localStorage.getItem('token');
      const [resExec, resClicks] = await Promise.all([
        fetch(`/api/admin/analytics/executive?days=${selectedDays}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/admin/analytics/clicks?days=${selectedDays}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const dataExec = await resExec.json();
      if (dataExec.success && dataExec.data) {
        setMetrics(dataExec.data.metrics);
        setBestsellers(dataExec.data.bestsellers || []);
      }

      const dataClicks = await resClicks.json();
      if (dataClicks.success && dataClicks.data) {
        setClickData(dataClicks.data);
      }
    } catch (err) {
      console.error('Failed to load executive metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(days);
  }, [days]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('adminAccessToken') || localStorage.getItem('token');
      const res = await fetch('/api/admin/analytics/export/orders.csv', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `illure-orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2D30] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#D8BE82] font-semibold">İLLURÊ EXECUTIVE SUITE</span>
          <h1 className="text-3xl font-serif text-[#F7F4EE] mt-1">Commerce Control &amp; Analytics</h1>
          <p className="text-sm text-[#A98A52] mt-1">
            Real calculated metrics, inventory risks, fulfillment breakdown, and orders archive.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#161819] border border-[#2A2D30] rounded p-1">
            <button
              onClick={() => setActiveTab('executive')}
              className={`px-3 py-1.5 text-xs tracking-wider transition ${
                activeTab === 'executive' ? 'bg-[#C7A866] text-[#080A0B] font-medium' : 'text-[#AAA297]'
              }`}
            >
              COMMERCE
            </button>
            <button
              onClick={() => setActiveTab('clicks')}
              className={`px-3 py-1.5 text-xs tracking-wider transition ${
                activeTab === 'clicks' ? 'bg-[#C7A866] text-[#080A0B] font-medium' : 'text-[#AAA297]'
              }`}
            >
              CLICK TRACKING
            </button>
          </div>

          <div className="flex bg-[#161819] border border-[#2A2D30] rounded p-1">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-xs tracking-wider transition ${
                  days === d
                    ? 'bg-[#C7A866] text-[#080A0B] font-medium'
                    : 'text-[#AAA297] hover:text-[#F7F4EE]'
                }`}
              >
                {d} DAYS
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchMetrics(days)}
            className="p-2 border border-[#2A2D30] bg-[#161819] text-[#AAA297] hover:text-[#D8BE82] rounded transition"
            title="Refresh Metrics"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center gap-2 bg-[#C7A866] hover:bg-[#D8BE82] text-[#080A0B] px-4 py-2 text-xs font-semibold tracking-wider uppercase transition rounded"
          >
            <Download size={14} />
            <span>{exporting ? 'EXPORTING...' : 'EXPORT ORDERS CSV'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'clicks' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-[#121415] border border-[#2A2D30] p-6 rounded">
              <span className="text-xs uppercase tracking-wider font-mono text-[#A98A52]">Total Tracked Clicks</span>
              <div className="text-2xl font-serif text-[#F7F4EE] mt-2">{clickData?.totalClicks || 0}</div>
              <span className="text-[11px] text-[#7A7267] mt-1 block">Past {days} days storefront activity</span>
            </div>
            <div className="bg-[#121415] border border-[#2A2D30] p-6 rounded">
              <span className="text-xs uppercase tracking-wider font-mono text-[#A98A52]">Product Card Clicks</span>
              <div className="text-2xl font-serif text-[#F7F4EE] mt-2">{clickData?.clicksByType?.PRODUCT || 0}</div>
              <span className="text-[11px] text-[#7A7267] mt-1 block">Fragrance detail navigations</span>
            </div>
            <div className="bg-[#121415] border border-[#2A2D30] p-6 rounded">
              <span className="text-xs uppercase tracking-wider font-mono text-[#A98A52]">Hero CTA Clicks</span>
              <div className="text-2xl font-serif text-[#F7F4EE] mt-2">{clickData?.clicksByType?.HERO_CTA || 0}</div>
              <span className="text-[11px] text-[#7A7267] mt-1 block">Homepage explore actions</span>
            </div>
            <div className="bg-[#121415] border border-[#2A2D30] p-6 rounded">
              <span className="text-xs uppercase tracking-wider font-mono text-[#A98A52]">Banner Clicks</span>
              <div className="text-2xl font-serif text-[#F7F4EE] mt-2">{clickData?.clicksByType?.BANNER || 0}</div>
              <span className="text-[11px] text-[#7A7267] mt-1 block">Promotional banner taps</span>
            </div>
          </div>

          <div className="bg-[#121415] border border-[#2A2D30] rounded p-6">
            <h2 className="text-lg font-serif text-[#F7F4EE] mb-4">Top Clicked Items & Sections</h2>
            {clickData?.topClickedItems?.length === 0 ? (
              <div className="text-sm text-[#7A7267] py-6 text-center">No click telemetry recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#2A2D30] text-[#A98A52] text-xs font-mono uppercase tracking-wider">
                      <th className="pb-3">Element / Product</th>
                      <th className="pb-3">Target Type</th>
                      <th className="pb-3 text-right">Click Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2D30]">
                    {clickData?.topClickedItems?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#181A1B]">
                        <td className="py-3 font-medium text-[#F7F4EE]">{item.title}</td>
                        <td className="py-3 font-mono text-xs text-[#C7A866]">{item.type}</td>
                        <td className="py-3 text-right font-mono text-[#D8BE82]">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#121415] border border-[#2A2D30] p-6 rounded relative overflow-hidden">
          <div className="flex items-center justify-between text-[#A98A52] mb-3">
            <span className="text-xs uppercase tracking-wider font-mono">Gross Revenue</span>
            <IndianRupee size={18} className="text-[#D8BE82]" />
          </div>
          <div className="text-2xl font-serif text-[#F7F4EE]">
            ₹{(metrics?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#7A7267] mt-1 block">Past {days} days total</span>
        </div>

        <div className="bg-[#121415] border border-[#2A2D30] p-6 rounded relative overflow-hidden">
          <div className="flex items-center justify-between text-[#A98A52] mb-3">
            <span className="text-xs uppercase tracking-wider font-mono">Orders Placed</span>
            <ShoppingBag size={18} className="text-[#D8BE82]" />
          </div>
          <div className="text-2xl font-serif text-[#F7F4EE]">
            {metrics?.totalOrders || 0}
          </div>
          <span className="text-[11px] text-[#7A7267] mt-1 block">
            {metrics?.prepaidOrders || 0} Prepaid · {metrics?.codOrders || 0} COD
          </span>
        </div>

        <div className="bg-[#121415] border border-[#2A2D30] p-6 rounded relative overflow-hidden">
          <div className="flex items-center justify-between text-[#A98A52] mb-3">
            <span className="text-xs uppercase tracking-wider font-mono">Average Order Value</span>
            <TrendingUp size={18} className="text-[#D8BE82]" />
          </div>
          <div className="text-2xl font-serif text-[#F7F4EE]">
            ₹{(metrics?.aov || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#7A7267] mt-1 block">Per customer acquisition</span>
        </div>

        <div className="bg-[#121415] border border-[#2A2D30] p-6 rounded relative overflow-hidden">
          <div className="flex items-center justify-between text-[#A98A52] mb-3">
            <span className="text-xs uppercase tracking-wider font-mono">New Customers</span>
            <Users size={18} className="text-[#D8BE82]" />
          </div>
          <div className="text-2xl font-serif text-[#F7F4EE]">
            {metrics?.newCustomers || 0}
          </div>
          <span className="text-[11px] text-[#7A7267] mt-1 block">Registered in period</span>
        </div>
      </div>

      {/* Secondary Operations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#121415] border border-[#2A2D30] p-5 rounded flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-amber-500/10 text-amber-400">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="text-sm font-medium text-[#F7F4EE]">Low Stock Alerts</div>
              <div className="text-xs text-[#7A7267]">Variants with &le; 5 units</div>
            </div>
          </div>
          <div className="text-xl font-mono text-[#D8BE82]">
            {metrics?.lowStockAlerts || 0}
          </div>
        </div>

        <div className="bg-[#121415] border border-[#2A2D30] p-5 rounded flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-rose-500/10 text-rose-400">
              <Bookmark size={18} />
            </div>
            <div>
              <div className="text-sm font-medium text-[#F7F4EE]">Wishlist Saves</div>
              <div className="text-xs text-[#7A7267]">Active customer saved items</div>
            </div>
          </div>
          <div className="text-xl font-mono text-[#D8BE82]">
            {metrics?.wishlistSaves || 0}
          </div>
        </div>

        <div className="bg-[#121415] border border-[#2A2D30] p-5 rounded flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-blue-500/10 text-blue-400">
              <RotateCcw size={18} />
            </div>
            <div>
              <div className="text-sm font-medium text-[#F7F4EE]">Pending Returns</div>
              <div className="text-xs text-[#7A7267]">Awaiting concierge review</div>
            </div>
          </div>
          <div className="text-xl font-mono text-[#D8BE82]">
            {metrics?.pendingReturns || 0}
          </div>
        </div>
      </div>

      {/* Bestseller Fragrances Table */}
      <div className="bg-[#121415] border border-[#2A2D30] rounded p-6">
        <h2 className="text-lg font-serif text-[#F7F4EE] mb-4">Top Performing Fragrances</h2>
        {bestsellers.length === 0 ? (
          <div className="text-sm text-[#7A7267] py-6 text-center">
            No product sales recorded in this period yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#2A2D30] text-[#A98A52] text-xs font-mono uppercase tracking-wider">
                  <th className="pb-3">Fragrance</th>
                  <th className="pb-3 text-right">Units Sold</th>
                  <th className="pb-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2D30]">
                {bestsellers.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#181A1B]">
                    <td className="py-3 font-serif text-[#F7F4EE]">{item.name}</td>
                    <td className="py-3 text-right font-mono text-[#D8D0C3]">{item.quantity}</td>
                    <td className="py-3 text-right font-mono text-[#D8BE82]">
                      ₹{item.revenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}
