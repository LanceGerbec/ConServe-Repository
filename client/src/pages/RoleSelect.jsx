import { Link } from 'react-router-dom';
import { BookOpen, Users, Shield, ArrowRight } from 'lucide-react';

const RoleSelect = () => {
  const roles = [
    {
      path: '/login/student',
      icon: BookOpen,
      title: 'Student',
      desc: 'Access research papers and submit your work',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      path: '/login/faculty',
      icon: Users,
      title: 'Faculty',
      desc: 'Review submissions and manage research',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      path: '/login/admin',
      icon: Shield,
      title: 'Admin',
      desc: 'Manage system and user accounts',
      color: 'from-navy to-navy-800',
      hoverColor: 'hover:from-navy-800 hover:to-navy-900'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-navy font-bold text-3xl">C</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to ConServe</h1>
          <p className="text-blue-200 text-lg">Select your role to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Link
              key={role.path}
              to={role.path}
              className="group bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${role.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <role.icon className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{role.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{role.desc}</p>
              <div className="flex items-center text-navy dark:text-accent font-semibold group-hover:gap-3 transition-all">
                <span>Continue</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-blue-200 mb-4">Don't have an account?</p>
          <Link
            to="/register"
            className="inline-block bg-white text-navy px-8 py-3 rounded-xl font-bold hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Register Now
          </Link>
        </div>

        <Link
          to="/"
          className="block text-center mt-8 text-blue-200 hover:text-white transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default RoleSelect;