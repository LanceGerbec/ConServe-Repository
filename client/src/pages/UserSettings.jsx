// client/src/pages/UserSettings.jsx
import { useState, useRef, useEffect } from 'react';
import { Camera, User, Save, Loader2, AlertCircle, CheckCircle, X, Lock, Trash2, BookOpen, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

const Toast = ({ msg, type, onClose }) => (
  <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold border-2 animate-slide-up ${type === 'error' ? 'bg-red-600 border-red-700 text-white' : 'bg-green-600 border-green-700 text-white'}`}>
    {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}{msg}
    <button onClick={onClose}><X size={14} /></button>
  </div>
);

const UserSettings = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '' });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [savingName, setSavingName] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingExtended, setSavingExtended] = useState(false);
  const [toast, setToast] = useState(null);
  const avatarInputRef = useRef();

  const [extended, setExtended] = useState({
    bio: '', department: '', position: '', institution: '',
    researchInterests: '', website: '', orcid: '',
  });

  useEffect(() => {
    setName({ firstName: user?.firstName || '', lastName: user?.lastName || '' });
    setAvatarPreview(user?.avatar || null);
    setExtended({
      bio: user?.bio || '',
      department: user?.department || '',
      position: user?.position || '',
      institution: user?.institution || '',
      researchInterests: user?.researchInterests || '',
      website: user?.website || '',
      orcid: user?.orcid || '',
    });
  }, [user]);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return showToast('Image must be under 5MB', 'error');
    if (!file.type.startsWith('image/')) return showToast('Images only', 'error');
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
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
      if (!res.ok) return showToast(data.error || 'Failed to update', 'error');
      updateUser({ firstName: data.user.firstName, lastName: data.user.lastName });
      showToast('Name updated successfully!');
    } catch { showToast('Connection error', 'error'); }
    finally { setSavingName(false); }
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return showToast('Please select an image first', 'error');
    setSavingAvatar(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('avatar', avatarFile);
      const res = await fetch(`${API_URL}/settings/avatar`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || 'Upload failed', 'error');
      updateUser({ avatar: data.avatar });
      setAvatarFile(null);
      showToast('Profile picture updated!');
    } catch { showToast('Upload failed', 'error'); }
    finally { setSavingAvatar(false); }
  };

  const handleSaveExtended = async () => {
    setSavingExtended(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/author-profiles/me/extended`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(extended)
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || 'Failed to update', 'error');
      updateUser(extended);
      showToast('Academic profile saved!');
    } catch { showToast('Connection error', 'error'); }
    finally { setSavingExtended(false); }
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
  const isAuthor = user?.role === 'student' || user?.role === 'faculty';

  return (
    <div className="max-w-2xl mx-auto pb-16 animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Account Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your profile and public information</p>
      </div>

      {/* Profile Picture */}
      <Section title="Profile Picture" icon={Camera}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-gray-200 dark:border-gray-600 shadow-lg">
              {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-navy to-accent flex items-center justify-center"><span className="text-3xl font-black text-white">{initials}</span></div>}
            </div>
            <button onClick={() => avatarInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-9 h-9 bg-navy dark:bg-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition border-2 border-white dark:border-gray-800">
              <Camera size={16} className="text-white" />
            </button>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-bold text-gray-900 dark:text-white mb-1 text-lg">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 capitalize">{user?.role} · {user?.studentId}</p>
            <p className="text-xs text-gray-400 mb-3">{user?.email}</p>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <div className="flex gap-2 justify-center sm:justify-start flex-wrap">
              <button onClick={() => avatarInputRef.current?.click()} className="px-4 py-2 border-2 border-navy dark:border-blue-500 text-navy dark:text-blue-400 rounded-xl text-sm font-semibold hover:bg-navy/5 transition">Choose Photo</button>
              {avatarFile && (
                <button onClick={handleSaveAvatar} disabled={savingAvatar} className="px-4 py-2 bg-navy dark:bg-blue-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2">
                  {savingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}{savingAvatar ? 'Uploading...' : 'Save Photo'}
                </button>
              )}
              {avatarPreview && !avatarFile && (
                <button onClick={() => { setAvatarPreview(null); setAvatarFile(null); }} className="px-4 py-2 text-red-600 border-2 border-red-200 dark:border-red-800 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-2">
                  <Trash2 size={14} />Remove
                </button>
              )}
            </div>
            {avatarFile && <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Photo selected — click Save Photo to apply</p>}
            {isAuthor && (
              <button onClick={() => navigate(`/author/${user?._id || user?.id}`)} className="mt-3 text-xs text-navy dark:text-accent hover:underline font-semibold flex items-center gap-1">
                <Globe size={11} />View my public profile
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* Display Name */}
      <Section title="Display Name" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {['firstName', 'lastName'].map(field => (
            <div key={field}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{field === 'firstName' ? 'First Name' : 'Last Name'}</label>
              <input value={name[field]} onChange={e => setName({ ...name, [field]: e.target.value })} placeholder={field === 'firstName' ? 'First name' : 'Last name'}
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            </div>
          ))}
        </div>
        <button onClick={handleSaveName} disabled={savingName} className="flex items-center gap-2 px-6 py-2.5 bg-navy dark:bg-blue-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-50">
          {savingName ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}{savingName ? 'Saving...' : 'Save Name'}
        </button>
      </Section>

      {/* Academic Profile — only for student/faculty */}
      {isAuthor && (
        <Section title="Academic Profile (Public)" icon={BookOpen}>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This information is visible on your public researcher profile page.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Bio <span className="text-xs text-gray-400 font-normal">({extended.bio.length}/500)</span></label>
              <textarea value={extended.bio} onChange={e => setExtended({ ...extended, bio: e.target.value.slice(0, 500) })} rows={3} placeholder="Brief description about yourself and your research focus…"
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'position', label: 'Position / Title', placeholder: 'e.g. Clinical Instructor' },
                { key: 'department', label: 'Department', placeholder: 'e.g. Department of Nursing' },
                { key: 'institution', label: 'Institution', placeholder: 'e.g. NEUST College of Nursing' },
                { key: 'website', label: 'Website / LinkedIn', placeholder: 'https://…' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                  <input value={extended[key]} onChange={e => setExtended({ ...extended, [key]: e.target.value })} placeholder={placeholder}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">ORCID ID</label>
              <input value={extended.orcid} onChange={e => setExtended({ ...extended, orcid: e.target.value })} placeholder="0000-0000-0000-0000"
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Research Interests <span className="text-xs text-gray-400 font-normal">comma-separated</span>
              </label>
              <input value={extended.researchInterests} onChange={e => setExtended({ ...extended, researchInterests: e.target.value })}
                placeholder="e.g. Community Health, Pediatric Nursing, Evidence-Based Practice"
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            </div>
            <button onClick={handleSaveExtended} disabled={savingExtended} className="flex items-center gap-2 px-6 py-2.5 bg-navy dark:bg-blue-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-50">
              {savingExtended ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}{savingExtended ? 'Saving...' : 'Save Academic Profile'}
            </button>
          </div>
        </Section>
      )}

      {/* Account Info */}
      <Section title="Account Information" icon={Lock}>
        <div className="space-y-3">
          {[['Email', user?.email], ['Student / Faculty ID', user?.studentId], ['Role', user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)], ['Account Status', user?.isApproved ? 'Approved' : 'Pending']].map(([label, val]) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{label}</span>
              <span className="text-sm text-gray-900 dark:text-white font-medium">{val}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">To change your email or ID, contact the administrator at conserve2025@gmail.com</p>
      </Section>
    </div>
  );
};

export default UserSettings;