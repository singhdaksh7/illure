import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { Image, Upload, Trash2, Copy, Check, Search, AlertCircle, RefreshCw } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminMediaLibraryPage() {
  const { accessToken } = useAdminAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState('all');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [testResult, setTestResult] = useState(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/admin/storage/media?folder=${folder}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(data.data.items || []);
      }
    } catch (err) {
      console.error('Fetch media error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [folder, accessToken]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder === 'all' ? 'catalog' : folder);

    try {
      const res = await fetch(`${API_BASE}/admin/storage/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchMedia();
      } else {
        setErrorMsg(data.error?.message || 'Upload failed.');
      }
    } catch (err) {
      setErrorMsg('Failed to complete upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (storageKey) => {
    if (!window.confirm('Delete this media item from storage?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/storage/media/${encodeURIComponent(storageKey)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        fetchMedia();
      } else {
        const data = await res.json();
        alert(data.error?.message || 'Failed to delete media item.');
      }
    } catch (err) {
      console.error('Delete media error:', err);
    }
  };

  const handleCopy = (url, key) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestConnection = async () => {
    setTestResult({ loading: true });
    try {
      const res = await fetch(`${API_BASE}/admin/storage/test-connection`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setTestResult(data.data || { success: false, message: 'Test failed.' });
    } catch (err) {
      setTestResult({ success: false, message: 'Could not connect to storage service.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#0D1112]">Cloudflare R2 Media Library</h1>
          <p className="text-xs text-gray-500 mt-1">
            Centralized assets vault for fragrance bottles, packaging mockups, banners, and marketing photography
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTestConnection}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testResult?.loading ? 'animate-spin' : ''}`} />
            Test R2 Connection
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#C6AE82] hover:bg-[#B38E46] text-[#080C0D] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>

      {testResult && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          <span>{testResult.message}</span>
          <button onClick={() => setTestResult(null)} className="text-gray-400 hover:text-gray-600 font-bold">×</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['all', 'catalog', 'banners', 'brand', 'general'].map((f) => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                folder === f
                  ? 'bg-[#0D1112] text-[#F2EFE8]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search media by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchMedia()}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#C6AE82]"
          />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400 bg-white rounded-xl border border-gray-200">
          Loading media items...
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200 space-y-2">
          <Image className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-sm font-medium text-gray-700">No media assets found</p>
          <p className="text-xs text-gray-400">Upload product bottles or hero photography to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                <img
                  src={item.publicUrl}
                  alt={item.altText || item.fileName}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=400';
                  }}
                />
                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-mono text-white">
                  {item.folder}
                </span>
              </div>

              <div className="p-3 space-y-2">
                <p className="text-xs font-medium text-gray-800 truncate" title={item.fileName}>
                  {item.fileName}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <button
                    onClick={() => handleCopy(item.publicUrl, item.id)}
                    className="inline-flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#8C6D32] transition-colors cursor-pointer"
                  >
                    {copiedKey === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(item.storageKey)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
