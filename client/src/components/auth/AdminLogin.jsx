import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Loader2, Mail, Lock, X, Home, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user.role !== 'admin') {
        setError('This login is for administrators only. Please use the correct login page for your role.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-navy-950 via-gray-900 to-black">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-10 border border-gray-200 dark:border-gray-800 animate-scale-in relative">
        <div className="absolute top-4 right-4 flex space-x-2">
          <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Back to Home">
            <Home size={20} className="text-gray-600 dark:text-gray-400" />
          </Link>
          <Link to="/login" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Close">
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-navy to-navy-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Login</h1>
          <p className="text-gray-600 dark:text-gray-400">System Administration Access</p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-lg mb-6 flex items-start">
          <AlertTriangle className="text-orange-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-orange-700 dark:text-orange-400">
            Restricted access. Unauthorized login attempts are logged and monitored.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 animate-slide-up">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                placeholder="admin@neust.edu.ph"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                placeholder="Enter admin password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-navy to-navy-800 hover:from-navy-800 hover:to-navy-900 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-105"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Shield size={20} />
                <span>Access Admin Panel</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-navy transition-colors">
            ← Back to role selection
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Security Notice: All admin activities are logged
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;