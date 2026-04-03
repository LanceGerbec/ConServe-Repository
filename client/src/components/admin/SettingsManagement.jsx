// client/src/components/admin/SettingsManagement.jsx
import { useState, useEffect, useRef } from 'react';
import { Settings, Upload, Image, Bell, Shield, Save, CheckCircle, AlertCircle, Loader2, X, Eye, User, Pencil, Camera, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-5">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <div className="w-9 h-9 bg-navy/10 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
        <Icon size={18} className="text-navy dark:text-accent" />
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const LogoUpload = ({ label, currentUrl, endpoint, onSuccess, hint, isImage = false }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const [toast, setToast] = useState(null);
  const inputRef = useRef();

  useEffect(() => { setPreview(currentUrl); }, [currentUrl]);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleFile = async (file) => {
    if (!file) return;
    const maxMB = isImage ? 10 : 2;
    if (file.size > maxMB * 1024 * 1024) return showToast(`Max ${maxMB}MB allowed`, 'error');
    if (!file.type.startsWith('image/')) return showToast('Images only', 'error');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append(isImage ? 'image' : 'logo', file);
      const res = await fetch(`${API_URL}/settings/${endpoint}`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd
      });
      const data = await res.json();
      if (res.ok) { setPreview(data.logo?.url); showToast(`${label} updated!`); onSuccess?.(data.logo?.url); }
      else showToast(data.error || 'Upload failed', 'error');
    } catch { showToast('Upload failed', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      {hint && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      {preview && (
        <div className={`relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 ${isImage ? 'h-40' : 'h-24 w-24'}`}>
          <img src={preview} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition flex items-center justify-center opacity-0 hover:opacity-100">
            <Eye size={20} className="text-white" />
          </div>
        </div>
      )}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-navy dark:hover:border-accent transition cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        {loading
          ? <div className="flex flex-col items-center gap-2"><Loader2 size={24} className="animate-spin text-navy dark:text-accent" /><p className="text-sm text-gray-600">Uploading...</p></div>
          : <div className="flex flex-col items-center gap-2"><Upload size={24} className="text-gray-400" /><p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drop or <span className="text-navy dark:text-accent">click to browse</span></p><p className="text-xs text-gray-500">PNG, JPG, WebP</p></div>
        }
      </div>
      {toast && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700' : 'bg-green-50 dark:bg-green-900/20 text-green-700'}`}>
          {toast.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}{toast.msg}
        </div>
      )}
    </div>
  );
};

const SettingsManagement = () => {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Profile state
  const [name, setName] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '' });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [savingName, setSavingName] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const avatarInputRef = useRef();

  const [form, setForm] = useState({ siteName: '', siteDescription: '' });
  const [features, setFeatures] = useState({ allowRegistration: true, requireApproval: true, enableNotifications: true, maintenanceMode: false });
  const [security, setSecurity] = useState({ maxLoginAttempts: 5, sessionTimeout: 20, passwordMinLength: 12 });

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    fetchSettings();
    setName({ firstName: user?.firstName || '', lastName: user?.lastName || '' });
    setAvatarPreview(user?.avatar || null);
  }, [user]);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`);
      const data = await res.json();
      const s = data.settings || {};
      setSettings(s);
      setForm({ siteName: s.siteName || 'ConServe', siteDescription: s.siteDescription || '' });
      setFeatures(f => ({ ...f, ...(s.features || {}) }));
      setSecurity(sec => ({ ...sec, ...(s.security || {}) }));
    } catch { showToast('Failed to load settings', 'error'); }
    finally { setLoading(false); }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName: form.siteName, siteDescription: form.siteDescription, features, security })
      });
      if (res.ok) { showToast('Settings saved!'); fetchSettings(); }
      else { const d = await res.json(); showToast(d.error || 'Save failed', 'error'); }
    } catch { showToast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleSaveName = async () => {
    if (!name.firstName.trim() || !name.lastName.trim()) return showToast('Both fields required', 'error');
    setSavingName(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/settings/profile`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: name.firstName.trim(), lastName: name.lastName.trim() })
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || 'Failed', 'error');
      updateUser({ firstName: data.user.firstName, lastName: data.user.lastName });
      showToast('Name updated!');
    } catch { showToast('Connection error', 'error'); }
    finally { setSavingName(false); }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return showToast('Max 5MB', 'error');
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    setSavingAvatar(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('avatar', avatarFile);
      const res = await fetch(`${API_URL}/settings/avatar`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || 'Upload failed', 'error');
      updateUser({ avatar: data.avatar });
      setAvatarFile(null);
      showToast('Profile picture updated!');
    } catch { showToast('Upload failed', 'error'); }
    finally { setSavingAvatar(false); }
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-navy dark:text-accent" size={32} /></div>;

  return (
    <div className="space-y-2 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-navy dark:bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Settings size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Settings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage configuration & appearance</p>
          </div>
        </div>
        <button onClick={handleSaveSettings} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-navy dark:bg-blue-600 text-white rounded-xl font-bold hover:opacity-90 transition shadow-lg disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold border-2 animate-slide-up ${toast.type === 'error' ? 'bg-red-600 border-red-700 text-white' : 'bg-green-600 border-green-700 text-white'}`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}{toast.msg}
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      {/* ── Admin Profile: Avatar + Name ── */}
      <Section title="My Profile" icon={User}>
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-gray-200 dark:border-gray-600 shadow-lg">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-navy to-accent flex items-center justify-center">
                  <span className="text-3xl font-black text-white">{initials}</span>
                </div>
              )}
            </div>
            <button onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-navy dark:bg-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition border-2 border-white dark:border-gray-800">
              <Camera size={14} className="text-white" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="font-bold text-gray-900 dark:text-white text-lg">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{user?.email} · Admin</p>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
              <button onClick={() => avatarInputRef.current?.click()}
                className="px-3 py-1.5 border-2 border-navy dark:border-blue-500 text-navy dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-navy/5 transition">
                Choose Photo
              </button>
              {avatarFile && (
                <button onClick={handleSaveAvatar} disabled={savingAvatar}
                  className="px-3 py-1.5 bg-navy dark:bg-blue-600 text-white rounded-lg text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1">
                  {savingAvatar ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  {savingAvatar ? 'Uploading...' : 'Save Photo'}
                </button>
              )}
            </div>
            {avatarFile && <p className="text-xs text-blue-500 mt-2">New photo selected — click Save Photo to apply</p>}
          </div>
        </div>

        {/* Name edit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">First Name</label>
            <input value={name.firstName} onChange={e => setName({ ...name, firstName: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Last Name</label>
            <input value={name.lastName} onChange={e => setName({ ...name, lastName: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
        </div>
        <button onClick={handleSaveName} disabled={savingName}
          className="flex items-center gap-2 px-5 py-2.5 bg-navy dark:bg-blue-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-50">
          {savingName ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {savingName ? 'Saving...' : 'Save Name'}
        </button>
      </Section>

      {/* ── General ── */}
      <Section title="General Information" icon={Settings}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Site Name</label>
            <input value={form.siteName} onChange={e => setForm({ ...form, siteName: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Site Description</label>
            <input value={form.siteDescription} onChange={e => setForm({ ...form, siteDescription: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
        </div>
      </Section>

      {/* ── Hero BG ── */}
      <Section title="Hero Background Image" icon={Image}>
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg text-sm text-blue-800 dark:text-blue-300">
          Full-screen background on home page. Best: <strong>1920×1080px</strong>. Max 10MB.
        </div>
        <LogoUpload label="Hero Background" currentUrl={settings?.logos?.heroBg?.url} endpoint="hero-background" isImage onSuccess={fetchSettings} />
      </Section>

      {/* ── Logos ── */}
      <Section title="Site Logos" icon={Image}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LogoUpload label="School Logo (NEUST)" currentUrl={settings?.logos?.school?.url} endpoint="logo/school" hint="200×200px. Links to neust.edu.ph" onSuccess={fetchSettings} />
          <LogoUpload label="College Logo (CON)" currentUrl={settings?.logos?.college?.url} endpoint="logo/college" hint="200×200px. Links to NEUSTCON Facebook" onSuccess={fetchSettings} />
          <LogoUpload label="CONserve Logo" currentUrl={settings?.logos?.conserve?.url} endpoint="logo/conserve" hint="200×200px. Links to home page" onSuccess={fetchSettings} />
        </div>
      </Section>

      {/* ── Features ── */}
      <Section title="Feature Toggles" icon={Bell}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ['allowRegistration',   'Allow New Registrations',  'Students & faculty can register'],
            ['requireApproval',     'Require Admin Approval',   'New accounts need approval'],
            ['enableNotifications', 'Enable Notifications',     'Send in-app & email notifications'],
            ['maintenanceMode',     'Maintenance Mode',         'Show maintenance page to non-admins'],
          ].map(([key, label, desc]) => (
            <label key={key} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${features[key] ? 'border-navy/30 bg-navy/5 dark:border-blue-700 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="relative flex-shrink-0 mt-0.5">
                <input type="checkbox" checked={features[key]} onChange={e => setFeatures({ ...features, [key]: e.target.checked })} className="sr-only" />
                <div className={`w-11 h-6 rounded-full transition-colors ${features[key] ? 'bg-navy dark:bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${features[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </div>
              <div><p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p></div>
            </label>
          ))}
        </div>
      </Section>

      {/* ── Security ── */}
      <Section title="Security Settings" icon={Shield}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[['maxLoginAttempts','Max Login Attempts',1,20],['sessionTimeout','Session Timeout (min)',5,120],['passwordMinLength','Min Password Length',8,32]].map(([key, label, min, max]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
              <input type="number" min={min} max={max} value={security[key]}
                onChange={e => setSecurity({ ...security, [key]: parseInt(e.target.value) || min })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
            </div>
          ))}
        </div>
      </Section>

      <div className="flex justify-end pt-2">
        <button onClick={handleSaveSettings} disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-navy dark:bg-blue-600 text-white rounded-xl font-bold hover:opacity-90 transition shadow-lg disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
};

export default SettingsManagement;