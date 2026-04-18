import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Mail, Lock, Eye, EyeOff, AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PendingApprovalModal from '../components/common/PendingApprovalModal';

const RETPortal = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (result.success) {
        const u = JSON.parse(localStorage.getItem('user'));
        if (u.role !== 'ret') {
          setError('Access denied. RET department portal only.');
          localStorage.clear(); setLoading(false); return;
        }
        navigate('/dashboard');
      } else {
        if (result.error?.toLowerCase().includes('pending') || result.error?.toLowerCase().includes('approval')) {
          setPendingEmail(form.email); setShowPending(true);
        } else { setError(result.error || 'Invalid credentials'); }
      }
    } catch { setError('Connection error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-blue-900 to-indigo-800 flex items-center justify-center p-4">
        <div className="absolute top-4 left-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/80 hover:text-white transition text-sm font-semibold">
            <Home size={16} /> Home
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FlaskConical size={30} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">RET Portal</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Research, Extension & Training Dept.</p>
          </div>

          <div className="bg-teal-50 border-l-4 border-teal-500 p-3 mb-5 flex items-start gap-2 rounded-r-lg">
            <AlertTriangle size={15} className="text-teal-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-teal-800">Authorized RET personnel only. All activity is monitored and logged.</p>
          </div>

          {error && <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded-r-lg"><p className="text-sm text-red-700">{error}</p></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                  placeholder="ret@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
                  placeholder="Enter password"
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg">
              {loading ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <FlaskConical size={17} />}
              {loading ? 'Authenticating...' : 'Access RET Portal'}
            </button>
          </form>

          <button onClick={() => navigate('/login')} className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center gap-1 transition">
            <ArrowLeft size={13} /> Back to role selection
          </button>
        </div>
      </div>

      <PendingApprovalModal isOpen={showPending} onClose={() => setShowPending(false)} userEmail={pendingEmail} />
    </>
  );
};

export default RETPortal;