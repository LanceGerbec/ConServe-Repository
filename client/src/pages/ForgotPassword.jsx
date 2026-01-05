import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle, Home } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-10 border border-gray-200 dark:border-gray-800 animate-scale-in text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Check Your Email</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>📧 Check your inbox</strong><br/>
              The link expires in 1 hour. Check spam folder if not found.
            </p>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-navy text-white px-6 py-3 rounded-xl hover:bg-navy-800 transition font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-10 border border-gray-200 dark:border-gray-800 animate-scale-in relative">
        <Link to="/" className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <Home size={20} className="text-gray-600 dark:text-gray-400" />
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Mail className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h1>
          <p className="text-gray-600 dark:text-gray-400">Enter your email to reset your password</p>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                placeholder="your.email@neust.edu.ph"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-105"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Mail size={20} />
                <span>Send Reset Link</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-1">
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;