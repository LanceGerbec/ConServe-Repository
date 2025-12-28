import { Link } from 'react-router-dom';
import { BookOpen, Users, Shield, ArrowRight, Home } from 'lucide-react';
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
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'from-green-600 to-green-700',
      iconBg: 'bg-green-500',
      shadow: 'shadow-green-500/20'
    },
    {
      path: '/login/faculty',
      icon: Users,
      title: 'Faculty',
      desc: 'Review papers, provide feedback, and submit research',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'from-blue-600 to-blue-700',
      iconBg: 'bg-blue-500',
      shadow: 'shadow-blue-500/20'
    },
    {
      path: '/login/admin',
      icon: Shield,
      title: 'Admin',
      desc: 'Manage system, users, and approval workflows',
      gradient: 'from-navy to-navy-800',
      hoverGradient: 'from-navy-800 to-navy-900',
      iconBg: 'bg-navy',
      shadow: 'shadow-navy/20'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-green-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Back to Home Button */}
      <Link 
        to="/"
        className="absolute top-6 left-6 p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl transition-all duration-300 group z-10"
        aria-label="Back to Home"
      >
        <Home size={20} className="text-white group-hover:scale-110 transition-transform" />
      </Link>

      <div className="max-w-6xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl"></div>
            <div className="relative w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden">
              {logo ? (
                <img src={logo} alt="ConServe" className="w-full h-full object-cover" />
              ) : (
                <span className="text-navy font-black text-4xl">C</span>
              )}
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
            Welcome to ConServe
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto leading-relaxed">
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
              className="group relative bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              {/* Animated Border */}
              <div className={`absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-current transition-all duration-500 ${hoveredRole === index ? role.iconBg : ''}`}></div>

              {/* Icon */}
              <div className={`relative w-20 h-20 bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${role.shadow} shadow-xl`}>
                <role.icon className="text-white" size={36} />
              </div>

              {/* Content */}
              <div className="relative">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:${role.gradient} transition-all">
                  {role.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed min-h-[3rem]">
                  {role.desc}
                </p>
                
                {/* Continue Button */}
                <div className="flex items-center text-navy dark:text-accent font-bold group-hover:gap-3 transition-all">
                  <span>Continue</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Hover Effect Glow */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${role.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10`}></div>
            </Link>
          ))}
        </div>

        {/* Register Section */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="inline-block bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <p className="text-blue-100 mb-4 text-lg">Don't have an account?</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-navy px-10 py-4 rounded-xl font-bold hover:bg-gray-100 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
            >
              <span>Register Now</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12 text-blue-200/60 text-sm">
          <p>© 2025 NEUST College of Nursing • Secure Research Repository</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;