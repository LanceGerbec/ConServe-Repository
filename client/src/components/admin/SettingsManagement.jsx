import { useState, useEffect } from 'react';
import { Settings, Image, Upload, Save, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const SettingsManagement = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ school: false, college: false, conserve: false });
  const [message, setMessage] = useState('');
  const [expandedSection, setExpandedSection] = useState('logos');

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
      const data = await res.json();
      setSettings(data.settings);
    } catch (error) {
      setMessage('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (type, file) => {
    if (!file || !file.type.startsWith('image/')) {
      setMessage('Image file required');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage('Max 2MB');
      return;
    }
    setUploading({ ...uploading, [type]: true });
    const formData = new FormData();
    formData.append('logo', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings/logo/${type}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✓ ${type} logo uploaded!`);
        await fetchSettings();
        window.dispatchEvent(new Event('logosUpdated'));
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed');
      }
    } catch (error) {
      setMessage('Error');
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setMessage('✓ Saved');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed');
      }
    } catch (error) {
      setMessage('Error');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  const Section = ({ id, title, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button onClick={() => toggleSection(id)} className="w-full flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white">{title}</h3>
        {expandedSection === id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {expandedSection === id && <div className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700">{children}</div>}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings size={24} className="flex-shrink-0" />
          Settings
        </h2>
        <button onClick={handleSaveSettings} disabled={saving} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy-800 transition disabled:opacity-50 text-sm font-bold">
          <Save size={16} />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {message && (
        <div className={`border-l-4 p-3 rounded text-sm ${message.startsWith('✓') ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : 'bg-red-50 dark:bg-red-900/20 border-red-500'}`}>
          <div className="flex items-center gap-2">
            {message.startsWith('✓') ? <CheckCircle className="text-green-500 flex-shrink-0" size={16} /> : <AlertCircle className="text-red-500 flex-shrink-0" size={16} />}
            <p className={message.startsWith('✓') ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>{message}</p>
          </div>
        </div>
      )}

      {/* LOGOS - HORIZONTAL SCROLL ON MOBILE */}
      <Section id="logos" title="Logo Management">
        {/* MOBILE: HORIZONTAL SCROLL */}
        <div className="flex md:hidden gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-3 px-3">
          {['school', 'college', 'conserve'].map((type) => (
            <div key={type} className="flex-shrink-0 w-[75vw] sm:w-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center snap-center">
              <p className="font-bold text-gray-900 dark:text-white mb-2 text-sm capitalize">{type} Logo</p>
              {settings?.logos?.[type]?.url ? (
                <div className="mb-3">
                  <img src={settings.logos[type].url} alt={`${type} logo`} className="w-24 h-24 object-contain mx-auto mb-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-2" />
                  <p className="text-xs text-gray-500">
                    {new Date(settings.logos[type].uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Image className="text-gray-400" size={24} />
                </div>
              )}
              <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${uploading[type] ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-navy text-white hover:bg-navy-800'}`}>
                {uploading[type] ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={12} />
                    {settings?.logos?.[type]?.url ? 'Change' : 'Upload'}
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" disabled={uploading[type]} onChange={(e) => handleLogoUpload(type, e.target.files[0])} />
              </label>
            </div>
          ))}
        </div>

        {/* DESKTOP: GRID */}
        <div className="hidden md:grid grid-cols-3 gap-4">
          {['school', 'college', 'conserve'].map((type) => (
            <div key={type} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center">
              <p className="font-bold text-gray-900 dark:text-white mb-3 capitalize">{type} Logo</p>
              {settings?.logos?.[type]?.url ? (
                <div className="mb-4">
                  <img src={settings.logos[type].url} alt={`${type} logo`} className="w-32 h-32 object-contain mx-auto mb-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-2" />
                  <p className="text-xs text-gray-500">
                    Uploaded: {new Date(settings.logos[type].uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Image className="text-gray-400" size={32} />
                </div>
              )}
              <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${uploading[type] ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-navy text-white hover:bg-navy-800'}`}>
                {uploading[type] ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    {settings?.logos?.[type]?.url ? 'Change' : 'Upload'}
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" disabled={uploading[type]} onChange={(e) => handleLogoUpload(type, e.target.files[0])} />
              </label>
            </div>
          ))}
        </div>

        <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={16} />
            <div className="text-xs text-blue-700 dark:text-blue-400">
              <p className="font-bold mb-1">Guidelines:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>200x200px recommended</li>
                <li>PNG/JPG, max 2MB</li>
              </ul>
            </div>
          </div>
          </div>
  </Section>

  {/* GENERAL */}
  <Section id="general" title="General Settings">
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Site Name</label>
        <input type="text" value={settings?.siteName || ''} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <input type="text" value={settings?.siteDescription || ''} onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm" />
      </div>
    </div>
  </Section>

  {/* FEATURES */}
  <Section id="features" title="Features">
    <div className="space-y-2">
      {[
        { key: 'allowRegistration', label: 'Allow Registrations', desc: 'Users can create accounts' },
        { key: 'requireApproval', label: 'Require Approval', desc: 'New users need approval' },
        { key: 'enableNotifications', label: 'Notifications', desc: 'Send email notifications' },
        { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Disable public access' }
      ].map((feature) => (
        <label key={feature.key} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition">
          <input type="checkbox" checked={settings?.features?.[feature.key] || false} onChange={(e) => setSettings({ ...settings, features: { ...settings.features, [feature.key]: e.target.checked } })} className="w-4 h-4 text-navy border-gray-300 rounded focus:ring-navy mt-0.5 cursor-pointer flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white text-sm">{feature.label}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{feature.desc}</p>
          </div>
        </label>
      ))}
    </div>
  </Section>

  {/* SECURITY - HORIZONTAL ON MOBILE */}
  <Section id="security" title="Security">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Max Login Attempts</label>
        <input type="number" min="3" max="10" value={settings?.security?.maxLoginAttempts || 5} onChange={(e) => setSettings({ ...settings, security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) } })} className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Session Timeout (min)</label>
        <input type="number" min="10" max="120" value={settings?.security?.sessionTimeout || 20} onChange={(e) => setSettings({ ...settings, security: { ...settings.security, sessionTimeout: parseInt(e.target.value) } })} className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Min Password Length</label>
        <input type="number" min="8" max="20" value={settings?.security?.passwordMinLength || 12} onChange={(e) => setSettings({ ...settings, security: { ...settings.security, passwordMinLength: parseInt(e.target.value) } })} className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm" />
      </div>
    </div>
  </Section>
</div>
);
};
export default SettingsManagement;