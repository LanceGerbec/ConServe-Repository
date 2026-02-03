import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Users, ArrowRight, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import Toast from '../components/common/Toast';

const RoleSelect = () => {
  const [logo, setLogo] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setToast({ show: true, message: location.state.message, type: 'success' });
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
      hoverGradient: 'hover:from-green-600 hover:to-green-700',
      bgGradient: 'from-green-50 to-green-100',
      darkBg: 'dark:from-green-900/10 dark:to-green-800/10',
      iconBg: 'bg-green-500'
    },
    { 
      path: '/login/faculty', 
      icon: Users, 
      title: 'Faculty', 
      desc: 'Review papers, provide feedback, and submit research', 
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
      bgGradient: 'from-blue-50 to-blue-100',
      darkBg: 'dark:from-blue-900/10 dark:to-blue-800/10',
      iconBg: 'bg-blue-500'
    }
  ];

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4 sm:p-6">
        <Link to="/" className="fixed top-4 left-4 z-50 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all shadow-lg">
          <Home size={20} className="text-white" />
        </Link>

        <div className="w-full max-w-5xl">
          {/* Header Section - Improved Spacing */}
          <div className="text-center mb-10 sm:mb-14 animate-fade-in px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-5 sm:mb-7 shadow-2xl overflow-hidden">
              {logo ? (
                <img src={logo} alt="ConServe" className="w-full h-full object-cover" />
              ) : (
                <span className="text-navy font-bold text-3xl sm:text-4xl">C</span>
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-3 sm:mb-4 leading-tight">
              Welcome to <span className="text-blue-400">CONserve</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 px-2 max-w-2xl mx-auto">
              Select your role to access the research repository
            </p>
          </div>

          {/* Role Cards - Better Balanced Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-12 px-4 max-w-4xl mx-auto">
            {roles.map((role, index) => (
              <Link 
                key={role.path} 
                to={role.path} 
                className="block group transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`bg-gradient-to-br ${role.bgGradient} ${role.darkBg} rounded-2xl sm:rounded-3xl p-8 sm:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-white/20 hover:border-white/40 backdrop-blur-sm h-full flex flex-col`}>
                  {/* Icon */}
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${role.gradient} ${role.hoverGradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    <role.icon className="text-white" size={32} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                      {role.title}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {role.desc}
                    </p>
                  </div>
                  
                  {/* Continue Button */}
                  <div className="flex items-center justify-between mt-6 pt-6 border-t-2 border-gray-900/10 dark:border-white/10">
                    <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      Continue
                    </span>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${role.gradient} rounded-xl flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-md`}>
                      <ArrowRight size={20} className="text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Register Section - Better Spacing */}
          <div className="text-center animate-fade-in px-4 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-white/20 shadow-xl max-w-2xl mx-auto">
              <p className="text-white text-lg sm:text-xl mb-5 font-semibold">
                Don't have an account?
              </p>
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center gap-3 bg-white text-navy px-8 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-gray-100 shadow-lg hover:shadow-2xl hover:scale-105 transition-all group w-full sm:w-auto"
              >
                <span>Register Now</span>
                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs sm:text-sm text-gray-300 px-4">
            © 2026 NEUST College of Nursing • Secure Research Repository
          </p>
        </div>
      </div>
    </>
  );
};

export default RoleSelect;