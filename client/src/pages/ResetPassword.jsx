import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertTriangle, Home } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link');
      setVerifying(false);
      return;
    }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-reset-token?token=${token}`);
      const data = await res.json();

      if (data.valid) {
        setTokenValid(true);
      } else {
        setError(data.error || 'Invalid or expired reset link');
      }
    } catch (err) {
      setError('Failed to verify reset link');
    } finally {
      setVerifying(false);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const strength = getPasswordStrength(formData.newPassword);
    if (strength < 4) {
      setError('Password must be at least 12 characters with uppercase, lowercase, number, and special character');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: formData.newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-10 text-center">
          <Loader2 className="animate-spin mx-auto text-navy mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-10 text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} className="text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Invalid Link</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link to="/forgot-password" className="inline-block bg-navy text-white px-6 py-3 rounded-xl hover:bg-navy-800 transition font-semibold">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-10 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Password Reset!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Your password has been successfully reset. Redirecting to login...</p>
          <Link to="/login" className="inline-block bg-navy text-white px-6 py-3 rounded-xl hover:bg-navy-800 transition font-semibold">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const strength = getPasswordStrength(formData.newPassword);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-10 border border-gray-200 dark:border-gray-800 animate-scale-in relative">
        <Link to="/" className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <Home size={20} className="text-gray-600 dark:text-gray-400" />
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
          <p className="text-gray-600 dark:text-gray-400">Enter your new password</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 animate-slide-up">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-green-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                placeholder="Min. 12 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded ${i < strength ? strengthColors[strength - 1] : 'bg-gray-300 dark:bg-gray-700'}`} />
                  ))}
                </div>
                {strength > 0 && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Strength: {strengthLabels[strength - 1]}</p>}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-green-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                placeholder="Re-enter password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
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
                <span>Resetting...</span>
              </>
            ) : (
              <>
                <Lock size={20} />
                <span>Reset Password</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;