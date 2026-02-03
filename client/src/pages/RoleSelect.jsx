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
      darkBg: 'dark:from-green-900/10 dark:to-green-800/10'
    },
    { 
      path: '/login/faculty', 
      icon: Users, 
      title: 'Faculty', 
      desc: 'Review papers, provide feedback, and submit research', 
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
      bgGradient: 'from-blue-50 to-blue-100',
      darkBg: 'dark:from-blue-900/10 dark:to-blue-800/10'
    }
  ];

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-3 sm:p-4">
        <Link to="/" className="fixed top-3 left-3 z-50 p-2 sm:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl transition-all shadow-lg">
          <Home size={18} className="sm:w-5 sm:h-5 text-white" />
        </Link>

        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6 animate-fade-in px-2">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-2xl overflow-hidden">
              {logo ? (
                <img src={logo} alt="ConServe" className="w-full h-full object-cover" />
              ) : (
                <span className="text-navy font-bold text-xl sm:text-2xl">C</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-1 sm:mb-2 leading-tight">
              Welcome to <span className="text-blue-400">CONserve</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-200 px-2">
              Select your role to access the research repository
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 px-2 max-w-5xl mx-auto">
            {roles.map((role, index) => (
              <Link 
                key={role.path} 
                to={role.path} 
                className="block group transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`bg-gradient-to-br ${role.bgGradient} ${role.darkBg} rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-white/20 hover:border-white/40 backdrop-blur-sm h-full flex flex-col min-h-[180px] sm:min-h-[200px]`}>
                  {/* Icon */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br ${role.gradient} ${role.hoverGradient} rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg flex-shrink-0`}>
                    <role.icon className="text-white" size={20} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 flex-shrink-0">
                      {role.title}
                    </h2>
                    <p className="text-[11px] sm:text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3 mb-auto">
                      {role.desc}
                    </p>
                  </div>
                  
                  {/* Continue Button */}
                  <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-900/10 dark:border-white/10 flex-shrink-0">
                    <span className="text-xs sm:text-sm md:text-base font-bold text-gray-900 dark:text-white">
                      Continue
                    </span>
                    <div className={`w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br ${role.gradient} rounded-lg sm:rounded-xl flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-md`}>
                      <ArrowRight size={16} className="sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Register Section */}
          <div className="text-center animate-fade-in px-2">
            <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border-2 border-white/20 shadow-xl max-w-3xl mx-auto">
              <p className="text-white text-sm sm:text-base md:text-lg mb-2 sm:mb-3 font-semibold">
                Don't have an account?
              </p>
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center gap-2 bg-white text-navy px-5 sm:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base hover:bg-gray-100 shadow-lg hover:shadow-2xl hover:scale-105 transition-all group w-full sm:w-auto"
              >
                <span>Register Now</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center mt-3 sm:mt-4 text-[10px] sm:text-xs text-gray-300 px-2">
            © 2026 NEUST College of Nursing • Secure Research Repository
          </p>
        </div>
      </div>
    </>
  );
};

export default RoleSelect;