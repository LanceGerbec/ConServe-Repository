import { Link } from 'react-router-dom';
import { BookOpen, Users, Shield, ArrowRight, Home, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const RoleSelect = () => {
  const [logo, setLogo] = useState(null);
  const [hoveredRole, setHoveredRole] = useState(null);

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
      const data = await res.json();
      if (data.settings?.logos?.conserve?.url) {
        setLogo(data.settings.logos.conserve.url);
      }
    } catch (error) {
      console.error('Failed to fetch logo:', error);
    }
  };

  const roles = [
    {
      path: '/login/student',
      icon: BookOpen,
      title: 'Student',
      desc: 'Access research papers and submit your work',
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-500',
      borderColor: 'border-emerald-400',
      textColor: 'text-emerald-600',
      hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
    },
    {
      path: '/login/faculty',
      icon: Users,
      title: 'Faculty',
      desc: 'Review papers, provide feedback, and submit research',
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-500',
      borderColor: 'border-blue-400',
      textColor: 'text-blue-600',
      hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-950/50'
    },
    {
      path: '/login/admin',
      icon: Shield,
      title: 'Admin',
      desc: 'Manage system, users, and approval workflows',
      gradient: 'from-purple-600 to-pink-600',
      bg: 'bg-purple-600',
      borderColor: 'border-purple-400',
      textColor: 'text-purple-600',
      hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-950/50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-400/20 dark:bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Back to Home Button */}
      <Link 
        to="/"
        className="absolute top-6 left-6 p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl z-10 group border border-gray-200 dark:border-gray-700"
        aria-label="Back to Home"
      >
        <Home size={20} className="text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform" />
      </Link>

      <div className="max-w-6xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden border-4 border-white dark:border-gray-700">
              {logo ? (
                <img src={logo} alt="ConServe" className="w-full h-full object-cover" />
              ) : (
                <span className="text-blue-600 dark:text-blue-400 font-black text-4xl">C</span>
              )}
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ConServe</span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Select your role to access the research repository
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {roles.map((role, index) => (
            <Link
              key={role.path}
              to={role.path}
              onMouseEnter={() => setHoveredRole(index)}
              onMouseLeave={() => setHoveredRole(null)}
              className={`group relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border-2 ${role.borderColor} dark:border-opacity-50 ${role.hoverBg}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Overlay on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
              
              {/* Icon */}
              <div className={`relative w-20 h-20 bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                <role.icon className="text-white" size={36} />
              </div>

              {/* Content */}
              <div className="relative">
                <h2 className={`text-3xl font-black text-gray-900 dark:text-white mb-3 ${role.textColor} dark:${role.textColor.replace('text-', 'text-')}`}>
                  {role.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed min-h-[3rem]">
                  {role.desc}
                </p>
                
                {/* Continue Button */}
                <div className={`flex items-center ${role.textColor} dark:${role.textColor.replace('600', '400')} font-bold gap-2 group-hover:gap-3 transition-all`}>
                  <span>Continue</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Sparkle Effect on Hover */}
              {hoveredRole === index && (
                <div className="absolute top-4 right-4">
                  <Sparkles className={`${role.textColor} animate-pulse`} size={24} />
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Register Section */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="inline-block bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 shadow-xl">
            <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg font-semibold">Don't have an account?</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
            >
              <span>Register Now</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12 text-gray-600 dark:text-gray-400 text-sm">
          <p>© 2025 NEUST College of Nursing • Secure Research Repository</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;