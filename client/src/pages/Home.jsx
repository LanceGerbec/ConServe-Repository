// client/src/pages/Home.jsx - OPTIMIZED VERSION WITHOUT ANALYTICS
import { Link } from 'react-router-dom';
import { BookOpen, Shield, Users, ArrowRight, Search, Upload, Star, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import SubmitResearch from '../components/research/SubmitResearch';

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
    <div className="space-y-16 md:space-y-24 pb-12 md:pb-16">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center px-4 md:px-6 py-12 md:py-16">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-navy-950 dark:to-gray-900"></div>
          <div className="absolute top-10 left-5 w-32 h-32 md:w-72 md:h-72 bg-navy/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-5 w-40 h-40 md:w-96 md:h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg mb-6 md:mb-8 border border-navy/20">
            <Star className="text-yellow-500" size={14} />
            <span className="text-xs font-bold text-navy dark:text-blue-400">NEUST College of Nursing</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 md:mb-6 leading-tight tracking-tight bg-gradient-to-r from-navy via-blue-600 to-purple-600 dark:from-blue-400 dark:via-blue-300 dark:to-purple-400 bg-clip-text text-transparent">
            ConServe
          </h1>
          
          <p className="text-lg md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 mb-3 md:mb-4 font-medium px-4">
            Where Knowledge Flows and Nursing Grows.
          </p>
          
          <p className="text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-8 md:mb-10 px-4 max-w-2xl mx-auto">
            Discover peer-reviewed papers • Secure viewing • Advanced search
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            {user ? (
              <>
                <Link to="/explore" className="group px-8 py-4 bg-gradient-to-r from-navy to-blue-600 hover:from-navy-800 hover:to-blue-700 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                  <Search size={20} className="group-hover:rotate-90 transition-transform" />
                  Browse Research
                </Link>
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button onClick={() => setShowSubmitModal(true)} className="px-8 py-4 bg-white dark:bg-gray-800 text-navy dark:text-white rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all border-2 border-navy/20 flex items-center justify-center gap-2">
                    <Upload size={20} />
                    Submit Research
                  </button>
                )}
              </>
            ) : (
              <>
                <Link to="/register" className="group px-8 py-4 bg-gradient-to-r from-navy to-blue-600 hover:from-navy-800 hover:to-blue-700 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                  Get Started Free
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/about" className="px-8 py-4 bg-white dark:bg-gray-800 text-navy dark:text-white rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all border-2 border-navy/20">
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
      </div>

      {/* Features Section */}
      <section className="px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-navy dark:text-white mb-4">Why ConServe?</h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Enterprise-grade features for academic research</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((f, i) => (
            <div 
              key={i} 
              className={`group bg-white dark:bg-gray-800 p-8 md:p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 cursor-pointer ${
                activeFeature === i 
                  ? 'border-navy dark:border-blue-500 scale-105 ring-4 ring-navy/10 dark:ring-blue-500/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-navy/30 dark:hover:border-blue-500/30'
              }`} 
              onClick={() => setActiveFeature(i)}
            >
              <div className={`w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all shadow-lg`}>
                <f.icon className="text-white" size={28} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-navy dark:text-white mb-3">{f.title}</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 dark:bg-gray-950 px-4 text-sm text-gray-500 dark:text-gray-400 font-semibold">Benefits</span>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <section className="px-4 md:px-6 max-w-7xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-navy via-blue-700 to-purple-700 dark:from-gray-900 dark:via-navy-900 dark:to-gray-900 rounded-2xl p-10 md:p-14 lg:p-16 shadow-2xl">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
          </div>
          
          <div className="absolute top-10 right-10 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 md:w-56 md:h-56 bg-purple-300/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-10 md:mb-12 text-center">Everything You Need</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 max-w-3xl mx-auto">
              {benefits.map((b, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-5 md:p-6 rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <b.icon className="text-white" size={20} />
                  </div>
                  <p className="text-white font-semibold text-base md:text-lg">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
      </div>

      {/* CTA Section */}
      {!user ? (
        <section className="px-4 md:px-6 max-w-3xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-navy via-blue-700 to-purple-700 dark:from-gray-900 dark:via-navy-900 dark:to-purple-900 rounded-2xl p-10 md:p-14 shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-blue-300/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 md:w-56 md:h-56 bg-purple-300/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-5">Ready to Transform Your Research?</h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-200 mb-8 md:mb-10 px-4">Join NEUST College of Nursing's research community</p>
              <Link 
                to="/register" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-navy rounded-xl font-bold shadow-2xl hover:scale-105 hover:shadow-white/20 transition-all text-lg"
              >
                Get Started Free
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="px-4 md:px-6 max-w-3xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-navy via-blue-700 to-purple-700 dark:from-gray-900 dark:via-navy-900 dark:to-purple-900 rounded-2xl p-10 md:p-14 shadow-2xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-56 h-56 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 animate-bounce">
                <span className="text-4xl">👋</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Welcome Back, {user.firstName}!</h2>
              <p className="text-base md:text-lg lg:text-xl text-blue-100 mb-8 px-4">Continue your research journey</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button 
                    onClick={() => setShowSubmitModal(true)} 
                    className="px-8 py-4 bg-white text-navy rounded-xl font-bold hover:scale-105 transition shadow-xl flex items-center justify-center gap-2"
                  >
                    <Upload size={20} />
                    Submit Research
                  </button>
                )}
                <Link 
                  to="/explore" 
                  className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:scale-105 hover:bg-white/30 transition border-2 border-white/30 flex items-center justify-center gap-2"
                >
                  <Search size={20} />
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