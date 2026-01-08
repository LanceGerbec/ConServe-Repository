// client/src/pages/RoleSelect.jsx
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Users, Shield, ArrowRight, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import Toast from '../components/common/Toast';

const RoleSelect = () => {
  const [logo, setLogo] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const location = useLocation();

  useEffect(() => {
    // Check for logout message from state
    if (location.state?.message) {
      setToast({ show: true, message: location.state.message, type: 'success' });
      // Clear state to prevent showing toast again on refresh
      window.history.replaceState({}, document.title);
    }

    fetch(`${import.meta.env.VITE_API_URL}/settings`)
      .then(r => r.json())
      .then(d => d.settings?.logos?.conserve?.url && setLogo(d.settings.logos.conserve.url))
      .catch(() => {});
  }, [location]);

  const roles = [
    { 
      path: '/login/student', 
      icon: BookOpen, 
      title: 'Student', 
      desc: 'Access research papers and submit your work', 
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      darkBg: 'dark:from-green-900/20 dark:to-green-800/20'
    },
    { 
      path: '/login/faculty', 
      icon: Users, 
      title: 'Faculty', 
      desc: 'Review papers, provide feedback, and submit research', 
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      darkBg: 'dark:from-blue-900/20 dark:to-blue-800/20'
    },
    { 
      path: '/login/admin', 
      icon: Shield, 
      title: 'Admin', 
      desc: 'Manage system, users, and approval workflows', 
      gradient: 'from-navy to-navy-800',
      bgGradient: 'from-navy-50 to-navy-100',
      darkBg: 'dark:from-navy-900/20 dark:to-navy-800/20'
    }
  ];

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4 sm:p-6">
        {/* Home Button */}
        <Link to="/" className="fixed top-4 left-4 z-50 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all shadow-lg">
          <Home size={20} className="text-white" />
        </Link>

        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 animate-fade-in px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl overflow-hidden">
              {logo ? <img src={logo} alt="ConServe" className="w-full h-full object-cover" /> : <span className="text-navy font-bold text-3xl sm:text-4xl">C</span>}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-3 sm:mb-4 leading-tight">
              Welcome to <span className="text-blue-400">CONserve</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 px-2">Select your role to access the research repository</p>
          </div>

          {/* Role Cards - HORIZONTAL ON DESKTOP, VERTICAL ON MOBILE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 px-4">
            {roles.map((role, index) => (
              <Link key={role.path} to={role.path} className="block group" style={{ animationDelay: `${index * 100}ms` }}>
                <div className={`bg-gradient-to-br ${role.bgGradient} ${role.darkBg} dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-white/10 h-full`}>
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${role.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                    <role.icon className="text-white" size={28} />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{role.title}</h2>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">{role.desc}</p>
                  </div>
                  <div className="flex items-center text-gray-900 dark:text-white font-bold mt-4 sm:mt-5 gap-2 group-hover:gap-4 transition-all">
                    <span className="text-sm sm:text-base">Continue</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Register Section */}
          <div className="text-center animate-fade-in px-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl">
              <p className="text-white text-base sm:text-lg mb-4 sm:mb-5 font-semibold">Don't have an account?</p>
              <Link to="/register" className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-white text-navy px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold hover:bg-gray-100 shadow-lg hover:shadow-xl hover:scale-105 transition-all group text-sm sm:text-base w-full sm:w-auto">
                <span>Register Now</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-gray-300 px-4">© 2026 NEUST College of Nursing • Secure Research Repository</p>
        </div>
      </div>
    </>
  );
};

export default RoleSelect;