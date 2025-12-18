import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle, X, Home, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', studentId: '', password: '', confirmPassword: '', role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentIdValid, setStudentIdValid] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [checkingId, setCheckingId] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  const checkStudentId = async (id) => {
    if (!id || id.length < 4) {
      setStudentIdValid(null);
      setStudentInfo(null);
      return;
    }

    setCheckingId(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/valid-student-ids/check/${id}`);
      const data = await res.json();
      
      if (data.valid) {
        setStudentIdValid(true);
        setStudentInfo(data.studentInfo);
        setError('');
      } else {
        setStudentIdValid(false);
        setStudentInfo(null);
        setError(data.message || 'Invalid student ID');
      }
    } catch (err) {
      setStudentIdValid(false);
      setStudentInfo(null);
      setError('Failed to verify student ID');
    } finally {
      setCheckingId(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('You must agree to the Terms & Conditions and Privacy Policy to register');
      return;
    }

    if (studentIdValid !== true) {
      setError('Please enter a valid student ID number');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (strength < 3) {
      setError('Password is too weak. Use at least 12 characters with uppercase, lowercase, number, and symbol.');
      return;
    }

    setLoading(true);
    const result = await register(formData);
    
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl p-10 border border-gray-200 dark:border-gray-800 my-8 animate-scale-in relative">
        <div className="absolute top-4 right-4 flex space-x-2">
          <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group" title="Back to Home">
            <Home size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-navy" />
          </Link>
          <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group" title="Close">
            <X size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-red-500" />
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Join ConServe Research Hub</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-navy p-4 rounded-lg mb-6 flex items-start space-x-3">
          <Info size={20} className="text-navy flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Note:</strong> Your account will need admin approval before you can access the system. You'll receive an email once approved.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Juan"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Dela Cruz"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="juan.delacruz@neust.edu.ph"
            />
            <p className="mt-1 text-xs text-gray-500">Use your official NEUST email address</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Student/Faculty ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setFormData({ ...formData, studentId: value });
                  checkStudentId(value);
                }}
                className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none ${
                  studentIdValid === true ? 'border-green-500' :
                  studentIdValid === false ? 'border-red-500' :
                  'border-gray-300 dark:border-gray-700'
                } focus:border-navy bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                placeholder="2021-12345"
              />
              {checkingId && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-navy"></div>
                </div>
              )}
              {!checkingId && studentIdValid === true && (
                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />
              )}
              {!checkingId && studentIdValid === false && (
                <X className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />
              )}
            </div>
            {studentInfo && (
              <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-400">
                  ✓ Valid ID: <strong>{studentInfo.fullName}</strong>
                  {studentInfo.course && ` - ${studentInfo.course}`}
                  {studentInfo.yearLevel && ` (${studentInfo.yearLevel})`}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Min. 12 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded ${i < strength ? strengthColors[strength - 1] : 'bg-gray-300 dark:bg-gray-700'}`} />
                  ))}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {strength > 0 && `Strength: ${strengthLabels[strength - 1]}`}
                </p>
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Must include: uppercase, lowercase, number, and special character
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <CheckCircle className="absolute right-12 top-1/2 -translate-y-1/2 text-green-500" size={20} />
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-5 h-5 text-navy border-gray-300 rounded focus:ring-navy mt-0.5 cursor-pointer"
                required
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <Link to="/terms" target="_blank" className="text-navy hover:underline font-semibold">
                  Terms & Conditions
                </Link>
                {' '}and{' '}
                <Link to="/privacy" target="_blank" className="text-navy hover:underline font-semibold">
                  Privacy Policy
                </Link>
                <span className="text-red-500 ml-1">*</span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !agreedToTerms || studentIdValid !== true}
            className="w-full bg-navy hover:bg-navy-800 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-navy hover:text-navy-700 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;