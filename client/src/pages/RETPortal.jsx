// client/src/pages/RETPortal.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PendingApprovalModal from '../components/common/PendingApprovalModal';

const RETPortal = () => {
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
        if (user.role !== 'ret') {
          setError('Access denied. RET Department only.');
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
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 flex items-center justify-center p-4">
        <div className="absolute top-4 left-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white hover:text-emerald-200 transition-colors text-sm">
            <ArrowLeft size={18} /><span>Home</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-emerald-600 p-4 rounded-full mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">RET Department</h2>
            <p className="text-gray-500 text-sm mt-1">Research, Extension & Training Portal</p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-3 mb-4 flex items-start gap-2 rounded">
            <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-amber-700">Restricted access. Authorized RET personnel only.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="ret@neust.edu.ph" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md">
              {loading ? <span>Authenticating...</span> : <><Shield size={18} />Access RET Portal</>}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => navigate('/login')} className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center justify-center gap-1 mx-auto">
              <ArrowLeft size={14} />Back to role selection
            </button>
          </div>
        </div>
      </div>

      <PendingApprovalModal isOpen={showPendingModal} onClose={() => setShowPendingModal(false)} userEmail={userEmail} />
    </>
  );
};

export default RETPortal;