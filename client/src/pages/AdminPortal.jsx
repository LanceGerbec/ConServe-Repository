import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, AlertTriangle, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PendingApprovalModal from '../components/common/PendingApprovalModal';

const AdminPortal = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (user.role !== 'admin') {
          setError('Access denied. Admin credentials required.');
          localStorage.clear();
          setLoading(false);
          return;
        }
        
        navigate('/dashboard');
      } else {
        if (result.error?.toLowerCase().includes('pending') || result.error?.toLowerCase().includes('approval')) {
          setUserEmail(formData.email);
          setShowPendingModal(true);
        } else {
          setError(result.error || 'Invalid credentials');
        }
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute top-4 left-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <Home size={20} />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-200">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-slate-800 p-4 rounded-full mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">System Administration</h2>
            <p className="text-slate-500 text-sm mt-1">Authorized Personnel Only</p>
          </div>

          <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4 flex items-start gap-2">
            <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-700">This portal is monitored. Unauthorized access attempts are logged and may result in disciplinary action.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Administrator Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" placeholder="admin@system.local" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full pl-10 pr-12 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" placeholder="Enter password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <span>Authenticating...</span> : <><Shield size={18} />Access Portal</>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">Session timeout: 20 minutes of inactivity</p>
          </div>
        </div>
      </div>

      <PendingApprovalModal isOpen={showPendingModal} onClose={() => setShowPendingModal(false)} userEmail={userEmail} />
    </>
  );
};

export default AdminPortal;