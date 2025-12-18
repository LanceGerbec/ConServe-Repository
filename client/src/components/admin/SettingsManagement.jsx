import { useState, useEffect } from 'react';
import { Settings, Image, Upload, Save, AlertCircle, CheckCircle } from 'lucide-react';

const SettingsManagement = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ school: false, college: false, conserve: false });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
      const data = await res.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (type, file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage('Image size must be less than 2MB');
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
        setMessage(`✓ ${type.charAt(0).toUpperCase() + type.slice(1)} logo uploaded successfully!`);
        await fetchSettings();
        
        // Force header to reload logos
        window.dispatchEvent(new Event('logosUpdated'));
        
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Upload failed - connection error');
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
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setMessage('✓ Settings saved successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Save failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage('Save failed - connection error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings size={28} />
          System Settings
        </h2>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-xl hover:bg-navy-800 transition disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`border-l-4 p-4 rounded ${
          message.startsWith('✓') 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-500'
        }`}>
          <div className="flex items-center gap-2">
            {message.startsWith('✓') ? (
              <CheckCircle className="text-green-500" size={20} />
            ) : (
              <AlertCircle className="text-red-500" size={20} />
            )}
            <p className={message.startsWith('✓') ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
              {message}
            </p>
          </div>
        </div>
      )}

      {/* Logo Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Image size={20} />
          Logo Management
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['school', 'college', 'conserve'].map((type) => (
            <div key={type} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
              <p className="font-semibold text-gray-900 dark:text-white mb-3 capitalize">{type} Logo</p>
              
              {settings?.logos?.[type]?.url ? (
                <div className="mb-4">
                  <img 
                    src={settings.logos[type].url} 
                    alt={`${type} logo`}
                    className="w-32 h-32 object-contain mx-auto mb-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-2"
                  />
                  <p className="text-xs text-gray-500">
                    Uploaded: {new Date(settings.logos[type].uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Image className="text-gray-400" size={32} />
                </div>
              )}

              <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                uploading[type]
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-navy text-white hover:bg-navy-800'
              }`}>
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
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading[type]}
                  onChange={(e) => handleLogoUpload(type, e.target.files[0])}
                />
              </label>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-blue-700 dark:text-blue-400">
              <p className="font-semibold mb-1">Logo Guidelines:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Recommended size: 200x200px</li>
                <li>Accepted formats: PNG, JPG, JPEG</li>
                <li>Max file size: 2MB</li>
                <li>Transparent background recommended for PNG</li>
                <li>Logo will appear in header and footer</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">General Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={settings?.siteName || ''}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Site Description
            </label>
            <input
              type="text"
              value={settings?.siteDescription || ''}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Features</h3>
        
        <div className="space-y-4">
          {[
            { key: 'allowRegistration', label: 'Allow New Registrations', desc: 'Users can create new accounts' },
            { key: 'requireApproval', label: 'Require Admin Approval', desc: 'New users need approval before access' },
            { key: 'enableNotifications', label: 'Email Notifications', desc: 'Send email notifications for events' },
            { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Disable public access (admins only)' }
          ].map((feature) => (
            <label key={feature.key} className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition">
              <input
                type="checkbox"
                checked={settings?.features?.[feature.key] || false}
                onChange={(e) => setSettings({
                  ...settings,
                  features: { ...settings.features, [feature.key]: e.target.checked }
                })}
                className="w-5 h-5 text-navy border-gray-300 rounded focus:ring-navy mt-0.5 cursor-pointer"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{feature.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Security Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Max Login Attempts
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={settings?.security?.maxLoginAttempts || 5}
              onChange={(e) => setSettings({
                ...settings,
                security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
              })}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              min="10"
              max="120"
              value={settings?.security?.sessionTimeout || 20}
              onChange={(e) => setSettings({
                ...settings,
                security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
              })}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Min Password Length
            </label>
            <input
              type="number"
              min="8"
              max="20"
              value={settings?.security?.passwordMinLength || 12}
              onChange={(e) => setSettings({
                ...settings,
                security: { ...settings.security, passwordMinLength: parseInt(e.target.value) }
              })}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;