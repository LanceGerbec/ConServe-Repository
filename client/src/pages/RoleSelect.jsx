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
    { path: '/login/student', icon: BookOpen, title: 'Student', desc: 'Access research papers and submit your work', color: 'green' },
    { path: '/login/faculty', icon: Users, title: 'Faculty', desc: 'Review papers, provide feedback, and submit research', color: 'blue' },
    { path: '/login/admin', icon: Shield, title: 'Admin', desc: 'Manage system, users, and approval workflows', color: 'navy' }
  ];

  const colors = {
    green: { gradient: 'from-green-950 via-green-900 to-green-800', bg: 'bg-green-500', hover: 'hover:bg-green-600' },
    blue: { gradient: 'from-blue-950 via-blue-900 to-blue-800', bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
    navy: { gradient: 'from-navy-950 via-navy-900 to-navy-800', bg: 'bg-navy', hover: 'hover:bg-navy-800' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4">
      <Link to="/" className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition z-10">
        <Home size={20} className="text-white" />
      </Link>

      <div className="max-w-5xl w-full">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl overflow-hidden">
            {logo ? <img src={logo} alt="ConServe" className="w-full h-full object-cover" /> : <span className="text-navy font-bold text-3xl">C</span>}
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">Welcome to <span className="text-blue-400">ConServe</span></h1>
          <p className="text-xl text-gray-300">Select your role to access the research repository</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roles.map((r, i) => {
            const c = colors[r.color];
            return (
              <Link key={r.path} to={r.path} 
                className={`bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-200 dark:border-gray-800 group`}
                style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`w-16 h-16 ${c.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg`}>
                  <r.icon className="text-white" size={28} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{r.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{r.desc}</p>
                <div className={`flex items-center ${c.bg.replace('bg-', 'text-')} font-bold gap-2 group-hover:gap-3 transition-all`}>
                  <span>Continue</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center animate-fade-in">
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-white mb-4 font-semibold">Don't have an account?</p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-navy px-8 py-3 rounded-xl font-bold hover:bg-gray-100 shadow-lg hover:shadow-xl hover:scale-105 transition-all group">
              <span>Register Now</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>

        <p className="text-center mt-8 text-gray-400 text-sm">© 2025 NEUST College of Nursing • Secure Research Repository</p>
      </div>
    </div>
  );
};

export default RoleSelect;