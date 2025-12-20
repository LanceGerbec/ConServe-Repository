import { Link } from 'react-router-dom';
import { BookOpen, Shield, TrendingUp, Users, ArrowRight, Search, Upload, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const Home = () => {
  const { user } = useAuth();
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    { icon: BookOpen, title: 'Research Archive', desc: 'Access published nursing research papers', color: 'text-blue-600' },
    { icon: Shield, title: 'Secure Storage', desc: 'Protected with advanced security', color: 'text-green-600' },
    { icon: TrendingUp, title: 'Impact Metrics', desc: 'Track research views and engagement', color: 'text-purple-600' },
    { icon: Users, title: 'Collaboration', desc: 'Connect with fellow researchers', color: 'text-navy' }
  ];

  const interactiveFeatures = [
    {
      title: '🔒 Advanced Security',
      description: 'Dynamic watermarking, disabled downloads, and comprehensive audit logging',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      title: '📚 Research Repository',
      description: 'Organized collection of nursing research with powerful search capabilities',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: '✅ Review System',
      description: 'Faculty review process with ratings and revision management',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: '📊 Analytics Dashboard',
      description: 'Track views, citations, and research impact metrics',
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % interactiveFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center py-16 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to <span className="text-navy">ConServe</span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4 max-w-3xl mx-auto">
          College of Nursing Research Repository
        </p>
        
        <p className="text-lg text-gray-500 dark:text-gray-500 mb-10 max-w-2xl mx-auto">
          Your gateway to academic excellence and research preservation. Discover, share, and preserve nursing research.
        </p>
        
        {/* Dynamic buttons based on login status */}
        <div className="flex flex-wrap gap-4 justify-center">
          {user ? (
            <>
              <Link
                to="/browse"
                className="flex items-center space-x-2 bg-navy hover:bg-navy-800 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Search size={20} />
                <span>Browse Research</span>
              </Link>
              
              {user.role === 'student' && (
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <Upload size={20} />
                  <span>Submit Research</span>
                </Link>
              )}
              
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-300"
              >
                <ArrowRight size={20} />
                <span>Go to Dashboard</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="flex items-center space-x-2 bg-navy hover:bg-navy-800 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <span>Get Started</span>
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/about"
                className="flex items-center space-x-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-300"
              >
                <span>Learn More</span>
              </Link>
            </>
          )}
        </div>

        {/* Show welcome message for logged in users */}
        {user && (
          <div className="mt-6 inline-block bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-6 py-3 rounded-full">
            <p className="text-navy dark:text-accent font-semibold">
              👋 Welcome back, {user.firstName}! Ready to explore?
            </p>
          </div>
        )}
      </section>

      {/* Interactive Feature Showcase */}
      <section className="py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
            <Sparkles className="text-navy" size={32} />
            Platform Highlights
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Explore what makes ConServe powerful</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl border border-gray-200 dark:border-gray-700 relative overflow-hidden">
          {/* Animated background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${interactiveFeatures[currentFeature].gradient} opacity-10 transition-all duration-1000`}></div>
          
          <div className="relative z-10 text-center">
            <div className="mb-6 animate-fade-in">
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {interactiveFeatures[currentFeature].title}
              </h3>
              <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                {interactiveFeatures[currentFeature].description}
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-3 mt-8">
              {interactiveFeatures.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentFeature 
                      ? 'w-12 h-3 bg-navy' 
                      : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                  }`}
                  aria-label={`Feature ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
          >
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <feature.icon className={feature.color} size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA Section - Only for non-logged in users */}
      {!user && (
        <section className="bg-gray-100 dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Start Your Research Journey?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Join our community of researchers and contribute to the advancement of nursing science.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 bg-navy text-white px-10 py-4 rounded-xl font-bold hover:bg-navy-800 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <span>Join ConServe Today</span>
            <ArrowRight size={20} />
          </Link>
        </section>
      )}

      {/* Quick Actions for Logged In Users */}
      {user && (
        <section className="bg-gradient-to-r from-navy to-accent rounded-3xl p-12 text-center shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-6">
            {user.role === 'student' ? 'Ready to Submit Your Research?' : 
             user.role === 'faculty' ? 'Review Pending Submissions' : 
             'Manage Your Platform'}
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {user.role === 'student' && (
              <>
                <Link to="/dashboard" className="bg-white text-navy px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition">
                  <Upload size={18} className="inline mr-2" />
                  Submit Research
                </Link>
                <Link to="/browse" className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-bold hover:bg-white/30 transition">
                  <Search size={18} className="inline mr-2" />
                  Browse Papers
                </Link>
              </>
            )}
            {user.role === 'faculty' && (
              <>
                <Link to="/dashboard" className="bg-white text-navy px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition">
                  Review Submissions
                </Link>
                <Link to="/browse" className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-bold hover:bg-white/30 transition">
                  Browse Research
                </Link>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <Link to="/dashboard" className="bg-white text-navy px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition">
                  Admin Dashboard
                </Link>
                <Link to="/browse" className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-bold hover:bg-white/30 transition">
                  Browse All Research
                </Link>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;