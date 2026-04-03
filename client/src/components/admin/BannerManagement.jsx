// client/src/components/admin/BannerManagement.jsx
// Drop this file in your admin components folder.
// Add <BannerManagement /> inside SettingsManagement.jsx under the "Hero Background Image" Section.
// Also add a route in your backend: POST /api/settings/banners  and  DELETE /api/settings/banners/:index

import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Image, Loader2, CheckCircle, AlertCircle, GripVertical, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [toast, setToast] = useState(null);
  const inputRef = useRef();

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`);
      const d = await res.json();
      setBanners(d.settings?.bannerImages || []);
    } catch { showToast('Failed to load banners', 'error'); }
    finally { setLoading(false); }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return showToast('Max 10MB', 'error');
    if (!file.type.startsWith('image/')) return showToast('Images only', 'error');
    if (banners.length >= 8) return showToast('Max 8 banners allowed', 'error');
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('image', file);
      if (caption.trim()) fd.append('caption', caption.trim());
      const res = await fetch(`${API_URL}/settings/banners`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const d = await res.json();
      if (res.ok) { setBanners(d.bannerImages || []); setCaption(''); showToast('Banner added!'); }
      else showToast(d.error || 'Upload failed', 'error');
    } catch { showToast('Upload failed', 'error'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (idx) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/settings/banners/${idx}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      if (res.ok) { setBanners(d.bannerImages || []); showToast('Banner removed'); }
      else showToast(d.error || 'Delete failed', 'error');
    } catch { showToast('Delete failed', 'error'); }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-navy dark:text-accent" size={24} /></div>;

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border ${toast.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700'}`}>
          {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}{toast.msg}
        </div>
      )}

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-xl text-sm text-blue-800 dark:text-blue-300">
        <strong>Explore Page Banner Slideshow</strong> — Add up to 8 images. Best size: <strong>1920×600px</strong> or wider. These appear in the auto-scrolling hero on the Explore page.
      </div>

      {/* Upload area */}
      <div className="space-y-2">
        <input type="text" value={caption} onChange={e => setCaption(e.target.value)} placeholder="Optional caption for this banner…" className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-navy dark:hover:border-accent transition cursor-pointer"
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files[0]); }}
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e.target.files[0])} />
          {uploading
            ? <div className="flex flex-col items-center gap-2"><Loader2 size={22} className="animate-spin text-navy dark:text-accent" /><p className="text-sm text-gray-600 dark:text-gray-300">Uploading…</p></div>
            : <div className="flex flex-col items-center gap-2"><Upload size={22} className="text-gray-400" /><p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drop image or <span className="text-navy dark:text-accent">browse</span></p><p className="text-xs text-gray-400">PNG, JPG, WebP · max 10MB · {banners.length}/8 used</p></div>
          }
        </div>
      </div>

      {/* Current banners */}
      {banners.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Current Banners ({banners.length})</h4>
          {banners.map((b, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <GripVertical size={16} className="text-gray-400 flex-shrink-0 cursor-grab" />
              <div className="w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700">
                <img src={b.url} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white mb-0.5">Banner {idx + 1}</p>
                {b.caption ? <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{b.caption}</p> : <p className="text-xs text-gray-400 italic">No caption</p>}
              </div>
              <button onClick={() => handleDelete(idx)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition text-red-600 flex-shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerManagement;