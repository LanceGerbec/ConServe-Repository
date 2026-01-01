// client/src/pages/Home.jsx - MOBILE-OPTIMIZED VERSION
import { Link } from 'react-router-dom';
import { BookOpen, Shield, Users, ArrowRight, Search, Upload, Star, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import SubmitResearch from '../components/research/SubmitResearch';
import HomeAnalytics from '../components/home/HomeAnalytics';

const Home = () => {
  const { user } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setActiveFeature(p => (p + 1) % 3), 4000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: BookOpen, title: 'Smart Repository', desc: 'Advanced search across nursing research', color: 'from-blue-500 to-blue-600' },
    { icon: Shield, title: 'Institutional Security', desc: 'Watermarked documents with protection', color: 'from-purple-500 to-purple-600' },
    { icon: Users, title: 'NEUST CON Community', desc: 'Collaborate with faculty and students', color: 'from-green-500 to-green-600' }
  ];

  const benefits = [
    { icon: CheckCircle, text: 'Peer-reviewed research' },
    { icon: Lock, text: 'Protected IP rights' },
    { icon: Search, text: 'Advanced search filters' },
    { icon: Star, text: 'APA, MLA, Chicago citations' }
  ];

  return (
    <div className="space-y-12 md:space-y-20 pb-8 md:pb-12">
      {/* Hero Section - Mobile Optimized */}
      <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-center px-6 py-8 md:py-12 -mt-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-navy-950 dark:to-gray-900"></div>
          <div className="absolute top-10 left-5 w-32 h-32 md:w-72 md:h-72 bg-navy/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-5 w-40 h-40 md:w-96 md:h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg mb-6 border border-navy/20 animate-slide-up">
            <Star className="text-yellow-500 flex-shrink-0" size={14} />
            <span className="text-xs font-bold text-navy dark:text-blue-400">NEUST College of Nursing</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black mb-4 leading-tight tracking-tight bg-gradient-to-r from-navy via-blue-600 to-purple-600 dark:from-blue-400 dark:via-blue-300 dark:to-purple-400 bg-clip-text text-transparent animate-fade-in">
            ConServe
          </h1>
          
          <p className="text-base md:text-2xl text-gray-700 dark:text-gray-300 mb-2 md:mb-3 font-medium animate-slide-up">
            Where Knowledge Flows and Nursing Grows.
          </p>
          
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 md:mb-8 px-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Discover peer-reviewed papers • Secure viewing • Advanced search
          </p>

          <div className="flex flex-col gap-3 md:flex-row md:gap-4 justify-center px-2 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            {user ? (
              <>
                <Link to="/explore" className="group px-6 py-3.5 bg-gradient-to-r from-navy to-blue-600 hover:from-navy-800 hover:to-blue-700 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                  <Search size={18} className="group-hover:rotate-90 transition-transform flex-shrink-0" />
                  Browse Research
                </Link>
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button onClick={() => setShowSubmitModal(true)} className="px-6 py-3.5 bg-white dark:bg-gray-800 text-navy dark:text-white rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all border-2 border-navy/20 flex items-center justify-center gap-2">
                    <Upload size={18} className="flex-shrink-0" />
                    Submit Research
                  </button>
                )}
              </>
            ) : (
              <>
                <Link to="/register" className="group px-6 py-3.5 bg-gradient-to-r from-navy to-blue-600 hover:from-navy-800 hover:to-blue-700 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                  Get Started Free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
                <Link to="/about" className="px-6 py-3.5 bg-white dark:bg-gray-800 text-navy dark:text-white rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all border-2 border-navy/20">
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
      </div>

      {/* Analytics Section */}
      <section className="px-6">
        <HomeAnalytics />
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 dark:bg-gray-950 px-4 text-sm text-gray-500 dark:text-gray-400 font-semibold">Features</span>
          </div>
        </div>
      </div>

      {/* Features Section - Mobile Optimized */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-3xl md:text-5xl font-black text-navy dark:text-white mb-3">Why ConServe?</h2>
          <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 px-4">Enterprise-grade features for academic research</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {features.map((f, i) => (
            <div 
              key={i} 
              className={`group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 cursor-pointer ${
                activeFeature === i 
                  ? 'border-navy dark:border-blue-500 scale-105 ring-4 ring-navy/10 dark:ring-blue-500/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-navy/30 dark:hover:border-blue-500/30'
              }`} 
              onClick={() => setActiveFeature(i)}
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all shadow-lg`}>
                <f.icon className="text-white" size={22} />
              </div>
              <h3 className="text-xl font-bold text-navy dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 dark:bg-gray-950 px-4 text-sm text-gray-500 dark:text-gray-400 font-semibold">Benefits</span>
          </div>
        </div>
      </div>

      {/* Benefits Section - Mobile Optimized */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-navy via-blue-700 to-purple-700 dark:from-gray-900 dark:via-navy-900 dark:to-gray-900 rounded-2xl p-8 md:p-10 shadow-2xl">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
          </div>
          
          <div className="absolute top-10 right-10 w-28 h-28 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-purple-300/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6 md:mb-8 text-center">Everything You Need</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {benefits.map((b, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <b.icon className="text-white" size={18} />
                  </div>
                  <p className="text-white font-semibold text-sm md:text-base">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
      </div>

      {/* CTA Section - Mobile Optimized */}
      {!user ? (
        <section className="px-6 max-w-3xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-navy via-blue-700 to-purple-700 dark:from-gray-900 dark:via-navy-900 dark:to-purple-900 rounded-2xl p-8 md:p-10 shadow-2xl">
            <div className="absolute top-0 right-0 w-40 h-40 md:w-56 md:h-56 bg-blue-300/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 md:w-48 md:h-48 bg-purple-300/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Ready to Transform Your Research?</h2>
              <p className="text-base md:text-lg text-gray-200 mb-6 md:mb-8 px-2">Join NEUST College of Nursing's research community</p>
              <Link 
                to="/register" 
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-navy rounded-xl font-bold shadow-2xl hover:scale-105 hover:shadow-white/20 transition-all"
              >
                Get Started Free
                <ArrowRight size={18} className="flex-shrink-0" />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="px-6 max-w-3xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-navy via-blue-700 to-purple-700 dark:from-gray-900 dark:via-navy-900 dark:to-purple-900 rounded-2xl p-8 md:p-10 shadow-2xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-300 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-5 animate-bounce">
                <span className="text-3xl">👋</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Welcome Back, {user.firstName}!</h2>
              <p className="text-base md:text-lg text-blue-100 mb-6 px-2">Continue your research journey</p>
              <div className="flex flex-col gap-3 md:flex-row md:gap-4 justify-center">
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button 
                    onClick={() => setShowSubmitModal(true)} 
                    className="px-5 py-3 bg-white text-navy rounded-xl font-bold hover:scale-105 transition shadow-xl flex items-center justify-center gap-2"
                  >
                    <Upload size={18} className="flex-shrink-0" />
                    Submit Research
                  </button>
                )}
                <Link 
                  to="/explore" 
                  className="px-5 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:scale-105 hover:bg-white/30 transition border-2 border-white/30 flex items-center justify-center gap-2"
                >
                  <Search size={18} className="flex-shrink-0" />
                  Browse Papers
                </Link>
              </div>
            </div>
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