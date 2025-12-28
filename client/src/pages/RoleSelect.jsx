import { Link } from 'react-router-dom';
import { BookOpen, Users, Shield, ArrowRight, Home } from 'lucide-react';
import { useState, useEffect } from 'react';

const RoleSelect = () => {
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/settings`)
      .then(r => r.json())
      .then(d => d.settings?.logos?.conserve?.url && setLogo(d.settings.logos.conserve.url))
      .catch(() => {});
  }, []);

  const roles = [
    {
      path: '/login/student',
      icon: BookOpen,
      title: 'Student',
      desc: 'Access research papers and submit your work',
      gradient: 'from-[#1e3a8a] to-[#2563eb]',
      iconBg: 'bg-[#1e3a8a]',
      border: 'border-[#60a5fa]',
      text: 'text-[#1e3a8a]',
      hover: 'hover:bg-blue-50 dark:hover:bg-[#0f1f47]'
    },
    {
      path: '/login/faculty',
      icon: Users,
      title: 'Faculty',
      desc: 'Review papers, provide feedback, and submit research',
      gradient: 'from-[#1e40af] to-[#3b82f6]',
      iconBg: 'bg-[#1e40af]',
      border: 'border-[#3b82f6]',
      text: 'text-[#1e40af]',
      hover: 'hover:bg-blue-50 dark:hover:bg-[#0a1628]'
    },
    {
      path: '/login/admin',
      icon: Shield,
      title: 'Admin',
      desc: 'Manage system, users, and approval workflows',
      gradient: 'from-[#172554] to-[#1e3a8a]',
      iconBg: 'bg-[#172554]',
      border: 'border-[#1e3a8a]',
      text: 'text-[#172554]',
      hover: 'hover:bg-blue-50 dark:hover:bg-[#050a1a]'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-[#0f1f47] dark:to-[#0a1628] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Home Button */}
      <Link to="/" className="absolute top-6 left-6 p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all shadow-lg hover:shadow-xl z-10 group border border-gray-200 dark:border-gray-700" aria-label="Home">
        <Home size={20} className="text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform" />
      </Link>

      <div className="max-w-6xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl blur-xl opacity-30 animate-pulse" />
            <div className="relative w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden border-4 border-white dark:border-gray-700">
              {logo ? (
                <img src={logo} alt="ConServe" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#1e3a8a] font-black text-4xl">C</span>
              )}
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Welcome to <span className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] bg-clip-text text-transparent">ConServe</span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Select your role to access the research repository
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {roles.map((r, i) => (
            <Link
              key={r.path}
              to={r.path}
              className={`group relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border-2 ${r.border} ${r.hover}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${r.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />
              
              <div className={`relative w-20 h-20 ${r.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                <r.icon className="text-white" size={36} />
              </div>

              <div className="relative">
                <h2 className={`text-3xl font-black text-gray-900 dark:text-white mb-3`}>
                  {r.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed min-h-[3rem]">
                  {r.desc}
                </p>
                
                <div className={`flex items-center ${r.text} font-bold gap-2 group-hover:gap-3 transition-all`}>
                  <span>Continue</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Register */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="inline-block bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 shadow-xl">
            <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg font-semibold">Don't have an account?</p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white px-10 py-4 rounded-xl font-bold hover:from-[#172554] hover:to-[#2563eb] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
              <span>Register Now</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="text-center mt-12 text-gray-600 dark:text-gray-400 text-sm">
          <p>© 2025 NEUST College of Nursing • Secure Research Repository</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;