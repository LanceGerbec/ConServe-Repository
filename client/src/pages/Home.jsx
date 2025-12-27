// client/src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { BookOpen, Shield, Users, ArrowRight, Search, Upload, Award, Lock, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import SubmitResearch from '../components/research/SubmitResearch';
// Import the OnboardingModal
import OnboardingModal from '../components/onboarding/OnboardingModal';

const Home = () => {
  const { user } = useAuth();
  const [currentHighlight, setCurrentHighlight] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user has seen onboarding (Logic from Step 2)
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Handle closing the onboarding modal
  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const features = [
    { icon: BookOpen, title: 'Research Archive', desc: 'Access published nursing research papers', color: 'from-blue-500 to-blue-600' },
    { icon: Shield, title: 'Secure Storage', desc: 'Protected with advanced security', color: 'from-green-500 to-green-600' },
    { icon: Users, title: 'Collaboration', desc: 'Connect with fellow researchers', color: 'from-navy to-accent' }
  ];

  const highlights = [
    { 
      icon: '📚', 
      title: 'Research Repository', 
      description: 'Organized collection of nursing research with powerful search capabilities',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: '🔒', 
      title: 'Advanced Security', 
      description: 'Dynamic watermarking, disabled downloads, and comprehensive audit logging',
      gradient: 'from-red-500 to-orange-500'
    },
    { 
      icon: '✅', 
      title: 'Review System', 
      description: 'Faculty review process with ratings and revision management',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const stats = [
    { icon: Award, value: '500+', label: 'Research Papers', color: 'text-blue-600' },
    { icon: Users, value: '200+', label: 'Active Users', color: 'text-green-600' },
    { icon: Lock, value: '100%', label: 'Secure Storage', color: 'text-red-600' },
    { icon: Zap, value: '24/7', label: 'Access Anytime', color: 'text-purple-600' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHighlight((prev) => (prev + 1) % highlights.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-20">
      {/* Onboarding Modal Render */}
      {showOnboarding && (
        <OnboardingModal
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      )}

      {/* Hero Section with Nursing-themed Background */}
      <section className="relative text-center py-20 animate-fade-in overflow-hidden">
        {/* Subtle Nursing-themed Background Pattern */}
        <div className="absolute inset-0 -z-10 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L30 25 M30 35 L30 55 M5 30 L25 30 M35 30 L55 30' stroke='%231e3a8a' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 -z-10 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-navy rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="inline-flex items-center gap-2 bg-navy/10 px-4 py-2 rounded-full mb-6 animate-bounce">
          <span className="text-sm font-semibold text-navy">✨ NEUST College of Nursing</span>
        </div>

        {/* Premium-looking Title (No Gradient) */}
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
          Welcome to <span className="text-navy dark:text-accent">ConServe</span>
        </h1>
        
        <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
          College of Nursing Research Repository
        </p>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          Your gateway to academic excellence. Discover, share, and preserve nursing research with industry-leading security.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-wrap gap-4 justify-center">
          {user ? (
            <>
              <Link to="/browse" className="group flex items-center space-x-2 bg-navy hover:bg-navy-800 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <Search size={20} className="group-hover:rotate-90 transition-transform" />
                <span>Browse Research</span>
              </Link>
              
              {(user.role === 'student' || user.role === 'faculty') && (
                <button 
                  onClick={() => setShowSubmitModal(true)}
                  className="group flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
                  <span>Submit Research</span>
                </button>
              )}
              
              <Link to="/dashboard" className="flex items-center space-x-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-300">
                <ArrowRight size={20} />
                <span>Dashboard</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="group flex items-center space-x-2 bg-navy hover:bg-navy-800 text-white px-10 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300">
                <span>Get Started</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/about" className="flex items-center space-x-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-300">
                <span>Learn More</span>
              </Link>
            </>
          )}
        </div>

        {user && (
          <div className="mt-8 inline-block bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 px-6 py-3 rounded-full shadow-lg animate-slide-up">
            <p className="text-navy dark:text-accent font-semibold flex items-center gap-2">
              <span className="animate-wave">👋</span>
              Welcome back, <span className="font-bold">{user.firstName}</span>!
            </p>
          </div>
        )}
      </section>

      {/* Stats Bar */}
      <section className="bg-gradient-to-r from-navy via-accent to-navy text-white rounded-3xl p-8 shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="text-center group hover:scale-110 transition-transform duration-300">
              <stat.icon className="mx-auto mb-2 group-hover:animate-bounce" size={32} />
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-blue-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features - No Icons, Clean Cards */}
      <section>
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Highlights - Interactive & Elegant */}
      <section className="py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Platform Highlights</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">Explore what makes ConServe powerful</p>
        </div>

        <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-12 shadow-2xl border border-gray-200 dark:border-gray-700">
          {/* Content */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="text-6xl mb-4">{highlights[currentHighlight].icon}</div>
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {highlights[currentHighlight].title}
            </h3>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {highlights[currentHighlight].description}
            </p>
          </div>

          {/* Interactive Dots */}
          <div className="flex justify-center gap-3">
            {highlights.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentHighlight(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentHighlight ? 'w-12 h-3 bg-navy' : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user ? (
        <section className="relative bg-gradient-to-r from-navy via-accent to-navy rounded-3xl p-12 text-center shadow-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Your Research Journey?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join our community of researchers and contribute to the advancement of nursing science.
            </p>
            <Link to="/register" className="inline-flex items-center space-x-2 bg-white text-navy px-10 py-4 rounded-xl font-bold hover:bg-gray-100 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300">
              <span>Join ConServe Today</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>
      ) : (
        <section className="bg-gradient-to-r from-navy to-accent rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-6">
            {user.role === 'student' ? 'Ready to Submit Your Research?' : 
             user.role === 'faculty' ? 'Review Pending Submissions' : 
             'Manage Your Platform'}
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {(user.role === 'student' || user.role === 'faculty') && (
              <>
                <button onClick={() => setShowSubmitModal(true)} className="bg-white text-navy px-8 py-3 rounded-xl font-bold hover:bg-gray-100 hover:scale-105 transition shadow-xl">
                  <Upload size={18} className="inline mr-2" />
                  Submit Research
                </button>
                <Link to="/browse" className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-bold hover:bg-white/30 hover:scale-105 transition">
                  <Search size={18} className="inline mr-2" />
                  Browse Papers
                </Link>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <Link to="/dashboard" className="bg-white text-navy px-8 py-3 rounded-xl font-bold hover:bg-gray-100 hover:scale-105 transition shadow-xl">
                  Admin Dashboard
                </Link>
                <Link to="/browse" className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-bold hover:bg-white/30 hover:scale-105 transition">
                  Browse All Research
                </Link>
              </>
            )}
          </div>
        </section>
      )}

      {showSubmitModal && (
        <SubmitResearch 
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => setShowSubmitModal(false)}
        />
      )}
    </div>
  );
};

export default Home;