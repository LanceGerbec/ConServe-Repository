import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, BookOpen, Loader2, Mail, Lock, X, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PendingApprovalModal from '../common/PendingApprovalModal';

const StudentLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user.role !== 'student') {
        setError('This login is for students only. Please use the correct login page for your role.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }
      navigate('/dashboard');
    } else {
      // Check if error is about pending approval
      if (result.error?.toLowerCase().includes('pending') || result.error?.toLowerCase().includes('approval')) {
        setUserEmail(formData.email);
        setShowPendingModal(true);
      } else {
        setError(result.error || 'Login failed');
      }
    }
    setLoading(false);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-950 via-green-900 to-green-800">
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
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
              <BookOpen className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Student Login</h1>
            <p className="text-gray-600 dark:text-gray-400">Sign in to access your research</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 animate-slide-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-green-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                  placeholder="your.email@neust.edu.ph"
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
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-green-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700 font-semibold transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-105"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <BookOpen size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Don't have an account?{' '}
              <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
                Register here
              </Link>
            </p>
            <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
              ← Back to role selection
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            Need help? <Link to="/help" className="text-green-600 hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>

      <PendingApprovalModal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        userEmail={userEmail}
      />
    </>
  );
};

export default StudentLogin;