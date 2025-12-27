import { Link } from 'react-router-dom';
import { BookOpen, Shield, Users, ArrowRight, Search, Upload, Award, Lock, Zap, TrendingUp, FileText, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import SubmitResearch from '../components/research/SubmitResearch';
import OnboardingModal from '../components/onboarding/OnboardingModal';

const Home = () => {
  const { user } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('hasSeenOnboarding')) setShowOnboarding(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActiveFeature(p => (p + 1) % 3), 4000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { 
      icon: BookOpen, 
      title: 'Smart Repository', 
      desc: 'AI-powered search across thousands of nursing research papers',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: Shield, 
      title: 'Military-Grade Security', 
      desc: 'Watermarked documents with comprehensive protection',
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      icon: Users, 
      title: 'Collaborative Network', 
      desc: 'Connect with researchers and share knowledge seamlessly',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const stats = [
    { icon: FileText, value: '2,500+', label: 'Research Papers' },
    { icon: Users, value: '800+', label: 'Active Researchers' },
    { icon: Award, value: '98%', label: 'Satisfaction Rate' },
    { icon: TrendingUp, value: '24/7', label: 'Uptime Guarantee' }
  ];

  const benefits = [
    { icon: CheckCircle, text: 'Instant access to peer-reviewed research' },
    { icon: Lock, text: 'Protected intellectual property rights' },
    { icon: Search, text: 'Advanced search with 20+ filters' },
    { icon: Star, text: 'Citation tools in multiple formats' }
  ];

  return (
    <div className="space-y-16 overflow-hidden">
      {showOnboarding && <OnboardingModal onComplete={() => { localStorage.setItem('hasSeenOnboarding', 'true'); setShowOnboarding(false); }} onSkip={() => { localStorage.setItem('hasSeenOnboarding', 'true'); setShowOnboarding(false); }} />}

      {/* Hero Section - Ultra Modern */}
      <section className="relative min-h-[85vh] flex items-center justify-center -mt-8">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg mb-8 animate-bounce border border-gray-200 dark:border-gray-700">
            <Star className="text-yellow-500" size={18} />
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">NEUST College of Nursing Excellence Hub</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[1.1] tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
              Research,
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
              Reimagined
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-4 max-w-3xl mx-auto font-medium">
            The most advanced research repository platform for nursing academia
          </p>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Discover 2,500+ peer-reviewed papers • Secure watermarked viewing • AI-powered search
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {user ? (
              <>
                <Link to="/browse" className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    <Search size={20} className="group-hover:rotate-90 transition-transform" />
                    Browse Research
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button onClick={() => setShowSubmitModal(true)} className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all border-2 border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <Upload size={20} />
                    Submit Research
                  </button>
                )}
              </>
            ) : (
              <>
                <Link to="/register" className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started Free
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link to="/about" className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all border-2 border-gray-200 dark:border-gray-700">
                  Learn More
                </Link>
              </>
            )}
          </div>

          {/* Stats Bar - Compact */}
          <div className="inline-flex items-center gap-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl px-8 py-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Card Grid */}
      <section className="px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Why <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ConServe?</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">Enterprise-grade features designed for researchers</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className={`group relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 ${activeFeature === i ? 'border-blue-500 scale-105' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'} cursor-pointer`} onClick={() => setActiveFeature(i)}>
              <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity`}></div>
              <div className={`w-16 h-16 bg-gradient-to-br ${f.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg`}>
                <f.icon className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits - Two Column */}
      <section className="px-4 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 text-center">Everything You Need</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/20 backdrop-blur-xl p-6 rounded-2xl border border-white/30">
                  <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <b.icon className="text-white" size={24} />
                  </div>
                  <p className="text-white font-semibold text-lg">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user ? (
        <section className="px-4 max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Ready to Transform Your Research?</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Join 800+ researchers advancing nursing science</p>
              <Link to="/register" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-gray-900 rounded-2xl font-bold shadow-2xl hover:scale-105 transition-all">
                Get Started Free
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="px-4 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center shadow-2xl">
            <h2 className="text-4xl font-black text-white mb-6">Welcome Back, {user.firstName}! 👋</h2>
            <p className="text-xl text-blue-100 mb-8">Continue your research journey</p>
            <div className="flex flex-wrap gap-4 justify-center">
              {(user.role === 'student' || user.role === 'faculty') && (
                <button onClick={() => setShowSubmitModal(true)} className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:scale-105 transition shadow-xl flex items-center gap-2">
                  <Upload size={20} />
                  Submit Research
                </button>
              )}
              <Link to="/browse" className="px-8 py-3 bg-white/20 backdrop-blur-xl text-white rounded-xl font-bold hover:scale-105 transition border-2 border-white/30 flex items-center gap-2">
                <Search size={20} />
                Browse Papers
              </Link>
            </div>
          </div>
        </section>
      )}

      {showSubmitModal && <SubmitResearch onClose={() => setShowSubmitModal(false)} onSuccess={() => setShowSubmitModal(false)} />}
    </div>
  );
};

export default Home;