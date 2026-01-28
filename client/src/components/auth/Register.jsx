import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle, X, Home, Info, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SuccessModal from '../common/SuccessModal';
import ErrorModal from '../common/ErrorModal';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', studentId: '', password: '', confirmPassword: '', role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);
  
  // Field validation states
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldValid, setFieldValid] = useState({});
  const [studentIdValid, setStudentIdValid] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [checkingId, setCheckingId] = useState(false);
  
  // Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  
  const [logo, setLogo] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogo();
  }, []);

  useEffect(() => {
    if (formData.studentId) checkStudentId(formData.studentId);
  }, [formData.studentId, formData.role]);

  const fetchLogo = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
      const data = await res.json();
      if (data.settings?.logos?.conserve?.url) setLogo(data.settings.logos.conserve.url);
    } catch (error) {
      console.error('Failed to fetch logo:', error);
    }
  };

  // Real-time field validation
  const validateField = (name, value) => {
    let error = '';
    let valid = false;

    switch (name) {
      case 'firstName':
      case 'lastName':
        valid = value.trim().length >= 2;
        error = valid ? '' : 'Min 2 characters';
        break;
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        valid = emailRegex.test(value);
        error = valid ? '' : 'Invalid email format';
        break;
      
      case 'password':
        const hasLength = value.length >= 12;
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecial = /[^a-zA-Z0-9]/.test(value);
        valid = hasLength && hasUpper && hasLower && hasNumber && hasSpecial;
        
        if (!hasLength) error = 'Min 12 characters';
        else if (!hasUpper) error = 'Need uppercase';
        else if (!hasLower) error = 'Need lowercase';
        else if (!hasNumber) error = 'Need number';
        else if (!hasSpecial) error = 'Need special char';
        break;
      
      case 'confirmPassword':
        valid = value === formData.password && value.length > 0;
        error = valid ? '' : 'Passwords must match';
        break;
    }

    setFieldErrors(prev => ({ ...prev, [name]: error }));
    setFieldValid(prev => ({ ...prev, [name]: valid }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name !== 'studentId') {
      validateField(name, value);
    }
  };

  const checkStudentId = async (id) => {
    if (!id || id.length < 3) {
      setStudentIdValid(null);
      setStudentInfo(null);
      setFieldErrors(prev => ({ ...prev, studentId: '' }));
      return;
    }

    setCheckingId(true);
    try {
      const endpoint = formData.role === 'faculty' ? `valid-faculty-ids/check/${id}` : `valid-student-ids/check/${id}`;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`);
      const data = await res.json();
      
      if (data.valid) {
        setStudentIdValid(true);
        setStudentInfo(data.studentInfo || data.facultyInfo);
        setFieldErrors(prev => ({ ...prev, studentId: '' }));
        setFieldValid(prev => ({ ...prev, studentId: true }));
      } else {
        setStudentIdValid(false);
        setStudentInfo(null);
        setFieldErrors(prev => ({ ...prev, studentId: data.message || `Invalid ${formData.role} ID` }));
        setFieldValid(prev => ({ ...prev, studentId: false }));
      }
    } catch (err) {
      setStudentIdValid(false);
      setStudentInfo(null);
      setFieldErrors(prev => ({ ...prev, studentId: 'Failed to verify' }));
      setFieldValid(prev => ({ ...prev, studentId: false }));
    } finally {
      setCheckingId(false);
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
    
    const errors = [];
    
    if (!agreedToTerms) {
      errors.push('Must agree to Terms & Privacy Policy');
    }
    
    if (studentIdValid !== true) {
      errors.push(`Enter valid ${formData.role} ID`);
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    const strength = getPasswordStrength(formData.password);
    if (strength < 4) {
      errors.push('Password too weak - Need 12+ chars, uppercase, lowercase, number, special char');
    }
    
    if (!fieldValid.email) {
      errors.push('Invalid email address');
    }
    
    if (errors.length > 0) {
      setErrorMessages(errors);
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    const result = await register(formData);
    
    if (result.success) {
      setShowSuccessModal(true);
    } else {
      const backendErrors = [];
      
      if (result.error.includes('email')) {
        backendErrors.push('Email already registered');
      } else if (result.error.includes('ID')) {
        backendErrors.push('Student/Faculty ID already used');
      } else if (result.error.includes('password')) {
        backendErrors.push('Password does not meet requirements');
      } else {
        backendErrors.push(result.error || 'Registration failed');
      }
      
      setErrorMessages(backendErrors);
      setShowErrorModal(true);
    }
    setLoading(false);
  };

  const strength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  const getFieldClassName = (fieldName) => {
    const baseClass = "w-full px-3 py-2.5 rounded-xl focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition text-sm";
    
    if (fieldValid[fieldName]) {
      return `${baseClass} border-2 border-green-500 bg-green-50 dark:bg-green-900/10`;
    }
    if (fieldErrors[fieldName]) {
      return `${baseClass} border-2 border-red-500 bg-red-50 dark:bg-red-900/10`;
    }
    return `${baseClass} border-2 border-gray-300 dark:border-gray-700 focus:border-navy dark:focus:border-blue-500`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Account Created!"
        message="Your account is pending admin approval. Check your email for updates."
        onAction={() => navigate('/login')}
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        errors={errorMessages}
      />

      <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-800 my-4 sm:my-8 animate-scale-in relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-navy dark:bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
            {logo ? <img src={logo} alt="ConServe" className="w-full h-full object-cover" /> : <span className="text-white font-bold text-xl sm:text-2xl">C</span>}
          </div>
          <div className="flex space-x-2">
            <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Home size={18} className="text-gray-600 dark:text-gray-400" />
            </Link>
            <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <X size={18} className="text-gray-600 dark:text-gray-400" />
            </Link>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Create Account</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Join ConServe Research Hub</p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-navy dark:border-blue-500 p-3 rounded-lg mb-4 flex items-start space-x-2">
          <Info size={16} className="text-navy dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            <strong>Note:</strong> Account requires admin approval
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField('firstName', e.target.value)}
                  className={getFieldClassName('firstName')}
                  placeholder="Juan"
                />
                {fieldValid.firstName && <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500" size={18} />}
              </div>
              {fieldErrors.firstName && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} />{fieldErrors.firstName}</p>}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField('lastName', e.target.value)}
                  className={getFieldClassName('lastName')}
                  placeholder="Dela Cruz"
                />
                {fieldValid.lastName && <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500" size={18} />}
              </div>
              {fieldErrors.lastName && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} />{fieldErrors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                onBlur={(e) => validateField('email', e.target.value)}
                className={getFieldClassName('email')}
                placeholder="your.email@example.com"
              />
              {fieldValid.email && <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500" size={18} />}
            </div>
            {fieldErrors.email && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} />{fieldErrors.email}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => {
                setFormData({ ...formData, role: e.target.value });
                setStudentIdValid(null);
                setStudentInfo(null);
              }}
              className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-navy dark:focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          {/* Student/Faculty ID */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              {formData.role === 'faculty' ? 'Faculty ID' : 'Student ID'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="studentId"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                className={`w-full px-3 py-2.5 pr-10 rounded-xl focus:outline-none text-sm ${
                  studentIdValid === true ? 'border-2 border-green-500 bg-green-50 dark:bg-green-900/10' :
                  studentIdValid === false ? 'border-2 border-red-500 bg-red-50 dark:bg-red-900/10' :
                  'border-2 border-gray-300 dark:border-gray-700 focus:border-navy dark:focus:border-blue-500'
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                placeholder={formData.role === 'faculty' ? 'FAC-12345' : '2021-12345'}
              />
              {checkingId && <div className="absolute right-3 top-1/2 -translate-y-1/2"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-navy dark:border-blue-500"></div></div>}
              {!checkingId && studentIdValid === true && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={18} />}
              {!checkingId && studentIdValid === false && <X className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" size={18} />}
            </div>
            {fieldErrors.studentId && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} />{fieldErrors.studentId}</p>}
            {studentInfo && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-700 dark:text-green-400 break-words">
                  ✓ <strong>{studentInfo.fullName}</strong>
                  {studentInfo.course && ` - ${studentInfo.course}`}
                  {studentInfo.department && ` - ${studentInfo.department}`}
                </p>
              </div>
            )}
          </div>

          {/* Password with Tooltip */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
              Password <span className="text-red-500">*</span>
              <div className="relative inline-block">
                <Info 
                  size={16} 
                  className="text-gray-400 dark:text-gray-500 cursor-help"
                  onMouseEnter={() => setShowPasswordTooltip(true)}
                  onMouseLeave={() => setShowPasswordTooltip(false)}
                />
                {showPasswordTooltip && (
                  <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-2xl border border-gray-700 animate-fade-in">
                    <p className="font-bold mb-2">Password Requirements:</p>
                    <ul className="space-y-1 text-gray-300">
                      <li>• Minimum 12 characters</li>
                      <li>• At least 1 uppercase letter (A-Z)</li>
                      <li>• At least 1 lowercase letter (a-z)</li>
                      <li>• At least 1 number (0-9)</li>
                      <li>• At least 1 special character (@$!%*?&)</li>
                    </ul>
                    <div className="absolute -top-2 left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-800"></div>
                  </div>
                )}
              </div>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                onBlur={(e) => validateField('password', e.target.value)}
                onFocus={() => setShowPasswordTooltip(true)}
                className={`${getFieldClassName('password')} pr-10`}
                placeholder="Min. 12 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} />{fieldErrors.password}</p>}
            {formData.password && (
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

          {/* Confirm Password */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={(e) => validateField('confirmPassword', e.target.value)}
                className={`${getFieldClassName('confirmPassword')} pr-10`}
                placeholder="Re-enter password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 p-1"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {fieldValid.confirmPassword && <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500" size={18} />}
            </div>
            {fieldErrors.confirmPassword && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} />{fieldErrors.confirmPassword}</p>}
          </div>

          {/* Terms Checkbox */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700">
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 text-navy dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-navy dark:focus:ring-blue-500 mt-0.5 cursor-pointer flex-shrink-0 bg-white dark:bg-gray-700"
                required
              />
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                I agree to the <Link to="/terms" target="_blank" className="text-navy dark:text-blue-400 hover:underline font-semibold">Terms</Link>
                {' '}& <Link to="/privacy" target="_blank" className="text-navy dark:text-blue-400 hover:underline font-semibold">Privacy</Link>
                <span className="text-red-500">*</span>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !agreedToTerms || studentIdValid !== true}
            className="w-full bg-navy dark:bg-blue-600 hover:bg-navy-800 dark:hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
            <span>{loading ? 'Creating...' : 'Create Account'}</span>
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 dark:text-gray-400 mt-4 text-xs sm:text-sm">
          Have an account? <Link to="/login" className="text-navy dark:text-blue-400 hover:text-navy-700 dark:hover:text-blue-300 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;