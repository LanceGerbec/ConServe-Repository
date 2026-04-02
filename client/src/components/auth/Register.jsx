// client/src/components/auth/Register.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle, X, Home, Info, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SuccessModal from '../common/SuccessModal';
import ErrorModal from '../common/ErrorModal';
import LegalModal from '../common/LegalModal';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', studentId: '', password: '', confirmPassword: '', role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldValid, setFieldValid] = useState({});
  const [studentIdStatus, setStudentIdStatus] = useState(null); // null | 'valid' | 'invalid' | 'used'
  const [checkingId, setCheckingId] = useState(false);

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false, uppercase: false, lowercase: false, number: false, special: false
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [legalModal, setLegalModal] = useState({ isOpen: false, tab: 'terms' });
  const [logo, setLogo] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/settings`)
      .then(r => r.json())
      .then(d => { if (d.settings?.logos?.conserve?.url) setLogo(d.settings.logos.conserve.url); })
      .catch(() => {});
  }, []);

  // Re-check ID when role changes
  useEffect(() => {
    if (formData.studentId.length >= 3) checkStudentId(formData.studentId);
    else { setStudentIdStatus(null); setFieldErrors(p => ({ ...p, studentId: '' })); }
  }, [formData.role]);

  // Password requirements – min 8
  useEffect(() => {
    const pwd = formData.password;
    setPasswordRequirements({
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^a-zA-Z0-9]/.test(pwd)
    });
  }, [formData.password]);

  const validateField = (name, value) => {
    let error = '', valid = false;
    switch (name) {
      case 'firstName': case 'lastName':
        valid = value.trim().length >= 2;
        error = valid ? '' : 'Min 2 characters';
        break;
      case 'email':
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        error = valid ? '' : 'Invalid email format';
        break;
      case 'password':
        valid = Object.values(passwordRequirements).every(Boolean);
        error = valid ? '' : 'Must meet all requirements';
        break;
      case 'confirmPassword':
        valid = value === formData.password && value.length > 0;
        error = valid ? '' : 'Passwords must match';
        break;
    }
    setFieldErrors(p => ({ ...p, [name]: error }));
    setFieldValid(p => ({ ...p, [name]: valid }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (name !== 'studentId') validateField(name, value);
  };

  const checkStudentId = async (id) => {
    if (!id || id.length < 3) {
      setStudentIdStatus(null);
      setFieldErrors(p => ({ ...p, studentId: '' }));
      return;
    }
    setCheckingId(true);
    try {
      const endpoint = formData.role === 'faculty'
        ? `valid-faculty-ids/check/${id}`
        : `valid-student-ids/check/${id}`;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`);
      const data = await res.json();

      if (data.valid) {
        // ✅ PRIVACY FIX: Do NOT show the name — just confirm the ID is valid
        setStudentIdStatus('valid');
        setFieldErrors(p => ({ ...p, studentId: '' }));
        setFieldValid(p => ({ ...p, studentId: true }));
      } else if (data.message?.toLowerCase().includes('already')) {
        setStudentIdStatus('used');
        setFieldErrors(p => ({ ...p, studentId: 'This ID is already registered' }));
        setFieldValid(p => ({ ...p, studentId: false }));
      } else {
        setStudentIdStatus('invalid');
        setFieldErrors(p => ({ ...p, studentId: `Invalid ${formData.role === 'faculty' ? 'Faculty' : 'Student'} ID` }));
        setFieldValid(p => ({ ...p, studentId: false }));
      }
    } catch {
      setStudentIdStatus('invalid');
      setFieldErrors(p => ({ ...p, studentId: 'Could not verify ID — check your connection' }));
      setFieldValid(p => ({ ...p, studentId: false }));
    } finally {
      setCheckingId(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = [];
    if (!agreedToTerms) errors.push('Must agree to Terms & Privacy Policy');
    if (studentIdStatus !== 'valid') errors.push(`Enter a valid ${formData.role} ID`);
    if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
    if (!Object.values(passwordRequirements).every(Boolean)) errors.push('Password must meet all requirements');
    if (!fieldValid.email) errors.push('Invalid email address');
    if (errors.length > 0) { setErrorMessages(errors); setShowErrorModal(true); return; }

    setLoading(true);
    const result = await register(formData);
    if (result.success) {
      setShowSuccessModal(true);
    } else {
      const msg = result.error?.includes('email') ? 'Email already registered'
        : result.error?.includes('ID') ? 'Student/Faculty ID already used'
        : result.error || 'Registration failed';
      setErrorMessages([msg]);
      setShowErrorModal(true);
    }
    setLoading(false);
  };

  const fieldClass = (name) => {
    const base = 'w-full px-3 py-2.5 rounded-xl focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition text-sm border-2';
    if (fieldValid[name]) return `${base} border-green-500 bg-green-50 dark:bg-green-900/10`;
    if (fieldErrors[name]) return `${base} border-red-500 bg-red-50 dark:bg-red-900/10`;
    return `${base} border-gray-300 dark:border-gray-700 focus:border-navy dark:focus:border-blue-500`;
  };

  const idStatusColor = studentIdStatus === 'valid' ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
    : studentIdStatus ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
    : 'border-gray-300 dark:border-gray-700 focus:border-navy dark:focus:border-blue-500';

  const allPwdMet = Object.values(passwordRequirements).every(Boolean);

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)}
        title="Account Created!" message="Your account is pending admin approval. Check your email for updates."
        onAction={() => navigate('/login')} />
      <ErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} errors={errorMessages} />
      <LegalModal isOpen={legalModal.isOpen} onClose={() => setLegalModal(p => ({ ...p, isOpen: false }))} defaultTab={legalModal.tab} />

      <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-800 my-4 sm:my-8 animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-navy dark:bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
            {logo ? <img src={logo} alt="ConServe" className="w-full h-full object-cover" /> : <span className="text-white font-bold text-xl sm:text-2xl">C</span>}
          </div>
          <div className="flex space-x-2">
            <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"><Home size={18} className="text-gray-600 dark:text-gray-400" /></Link>
            <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"><X size={18} className="text-gray-600 dark:text-gray-400" /></Link>
          </div>
        </div>

        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Create Account</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Join ConServe Research Hub</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-navy dark:border-blue-500 p-3 rounded-lg mb-4 flex items-start space-x-2">
          <Info size={16} className="text-navy dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            <strong>Note:</strong> Account requires admin approval (24–48 hrs). Your ID number will be verified by the admin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['firstName', 'lastName'].map((field) => (
              <div key={field}>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {field === 'firstName' ? 'First Name' : 'Last Name'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type="text" name={field} required value={formData[field]}
                    onChange={handleInputChange} onBlur={e => validateField(field, e.target.value)}
                    className={fieldClass(field)} placeholder={field === 'firstName' ? 'Juan' : 'Dela Cruz'} />
                  {fieldValid[field] && <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500" size={18} />}
                </div>
                {fieldErrors[field] && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} />{fieldErrors[field]}</p>}
              </div>
            ))}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input type="email" name="email" required value={formData.email}
                onChange={handleInputChange} onBlur={e => validateField('email', e.target.value)}
                className={fieldClass('email')} placeholder="your.email@example.com" />
              {fieldValid.email && <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500" size={18} />}
            </div>
            {fieldErrors.email && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} />{fieldErrors.email}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Role <span className="text-red-500">*</span>
            </label>
            <select value={formData.role}
              onChange={e => { setFormData(p => ({ ...p, role: e.target.value, studentId: '' })); setStudentIdStatus(null); setFieldErrors(p => ({ ...p, studentId: '' })); }}
              className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-navy dark:focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          {/* Student / Faculty ID — PRIVACY: no name shown */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              {formData.role === 'faculty' ? 'Faculty ID' : 'Student ID'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input type="text" name="studentId" required value={formData.studentId}
                onChange={e => {
                  const val = e.target.value.toUpperCase();
                  setFormData(p => ({ ...p, studentId: val }));
                  setStudentIdStatus(null);
                  if (val.length >= 3) checkStudentId(val);
                  else { setStudentIdStatus(null); setFieldErrors(p => ({ ...p, studentId: '' })); }
                }}
                className={`w-full px-3 py-2.5 pr-10 rounded-xl focus:outline-none text-sm border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${idStatusColor}`}
                placeholder={formData.role === 'faculty' ? 'FAC-12345' : '2021-12345'} />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checkingId && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-navy dark:border-blue-500" />}
                {!checkingId && studentIdStatus === 'valid' && <CheckCircle className="text-green-500" size={18} />}
                {!checkingId && studentIdStatus && studentIdStatus !== 'valid' && <X className="text-red-500" size={18} />}
              </div>
            </div>

            {/* Status messages — NO name displayed */}
            {studentIdStatus === 'valid' && (
              <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center gap-1">
                <CheckCircle size={12} /> ID verified successfully
              </p>
            )}
            {fieldErrors.studentId && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={10} />{fieldErrors.studentId}
              </p>
            )}
            {/* Privacy note */}
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              ID details will be verified by the admin during account approval.
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="password" required
                value={formData.password} onChange={handleInputChange}
                onBlur={e => validateField('password', e.target.value)}
                className={`${fieldClass('password')} pr-10`} placeholder="Min. 8 characters" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 p-1">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Requirements */}
            {formData.password && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-1">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Password Requirements:</p>
                {[
                  [passwordRequirements.length, 'Minimum 8 characters'],
                  [passwordRequirements.uppercase, 'At least 1 uppercase letter (A-Z)'],
                  [passwordRequirements.lowercase, 'At least 1 lowercase letter (a-z)'],
                  [passwordRequirements.number, 'At least 1 number (0-9)'],
                  [passwordRequirements.special, 'At least 1 special character (@$!%*?&)'],
                ].map(([met, label], i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs transition-colors ${met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${met ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                      {met && <Check size={10} className="text-white" />}
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" required
                value={formData.confirmPassword} onChange={handleInputChange}
                onBlur={e => validateField('confirmPassword', e.target.value)}
                className={`${fieldClass('confirmPassword')} pr-10`} placeholder="Re-enter password" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 p-1">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {fieldValid.confirmPassword && <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500" size={18} />}
            </div>
            {fieldErrors.confirmPassword && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} />{fieldErrors.confirmPassword}</p>}
          </div>

          {/* Terms */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700">
            <label className="flex items-start space-x-2 cursor-pointer">
              <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 text-navy dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-navy mt-0.5 cursor-pointer flex-shrink-0 bg-white dark:bg-gray-700" required />
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <button type="button" onClick={() => setLegalModal({ isOpen: true, tab: 'terms' })} className="text-navy dark:text-blue-400 hover:underline font-semibold">Terms</button>
                {' '}&amp;{' '}
                <button type="button" onClick={() => setLegalModal({ isOpen: true, tab: 'privacy' })} className="text-navy dark:text-blue-400 hover:underline font-semibold">Privacy</button>
                <span className="text-red-500">*</span>
              </span>
            </label>
          </div>

          {/* Submit */}
          <button type="submit"
            disabled={loading || !agreedToTerms || studentIdStatus !== 'valid' || !allPwdMet}
            className="w-full bg-navy dark:bg-blue-600 hover:bg-navy-800 dark:hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
            <span>{loading ? 'Creating...' : 'Create Account'}</span>
          </button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-4 text-xs sm:text-sm">
          Have an account?{' '}
          <Link to="/login" className="text-navy dark:text-blue-400 hover:text-navy-700 dark:hover:text-blue-300 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;