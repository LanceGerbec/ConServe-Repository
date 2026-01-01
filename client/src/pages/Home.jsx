// client/src/pages/Home.jsx - DESKTOP LAYOUT ON MOBILE (NO SCROLLING)
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
    { icon: BookOpen, title: 'Smart Repository', desc: 'Advanced search across nursing research', color: 'bg-blue-500' },
    { icon: Shield, title: 'Security', desc: 'Watermarked documents', color: 'bg-blue-600' },
    { icon: Users, title: 'Community', desc: 'Collaborate with peers', color: 'bg-blue-700' }
  ];

  const benefits = [
    { icon: CheckCircle, text: 'Peer-reviewed' },
    { icon: Lock, text: 'IP Protected' },
    { icon: Search, text: 'Advanced Search' },
    { icon: Star, text: 'Citations' }
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Section - Fits Screen */}
      <section className="relative min-h-[75vh] flex items-center justify-center px-4 py-6">
        <div className="absolute inset-0 -z-10 bg-blue-50 dark:bg-gray-900"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-md mb-3 border border-blue-200 dark:border-blue-800">
            <Star className="text-blue-500" size={12} />
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">NEUST College of Nursing</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-2 text-blue-900 dark:text-blue-400" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            ConServe
          </h1>
          
          <p className="text-base md:text-xl text-gray-700 dark:text-gray-300 mb-1 font-medium">
            Where Knowledge Flows and Nursing Grows
          </p>
          
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4">
            Discover • Secure • Search
          </p>

          <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto">
            {user ? (
              <>
                <Link to="/explore" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg transition-all flex items-center justify-center gap-2 text-sm">
                  <Search size={16} />
                  Browse
                </Link>
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button onClick={() => setShowSubmitModal(true)} className="px-5 py-2.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-lg font-semibold shadow-lg transition-all border-2 border-blue-200 dark:border-blue-800 flex items-center justify-center gap-2 text-sm">
                    <Upload size={16} />
                    Submit
                  </button>
                )}
              </>
            ) : (
              <>
                <Link to="/register" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg transition-all flex items-center justify-center gap-2 text-sm">
                  Get Started
                  <ArrowRight size={16} />
                </Link>
                <Link to="/about" className="px-5 py-2.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-lg font-semibold shadow-lg transition-all border-2 border-blue-200 dark:border-blue-800 text-sm">
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section - 3 Column Grid (Mobile & Desktop) */}
      <section className="px-4 max-w-7xl mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-xl md:text-3xl font-black text-blue-900 dark:text-white mb-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Why ConServe?
          </h2>
          <p className="text-xs md:text-base text-gray-600 dark:text-gray-400">Enterprise-grade features</p>
        </div>
        
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          {features.map((f, i) => (
            <div 
              key={i} 
              className={`bg-white dark:bg-gray-800 p-3 md:p-6 rounded-lg md:rounded-xl shadow-lg transition-all border-2 ${
                activeFeature === i 
                  ? 'border-blue-600 dark:border-blue-500 scale-105' 
                  : 'border-blue-100 dark:border-gray-700'
              }`}
              onClick={() => setActiveFeature(i)}
            >
              <div className={`w-8 h-8 md:w-14 md:h-14 ${f.color} rounded-lg flex items-center justify-center mb-2 md:mb-3 shadow-md mx-auto`}>
                <f.icon className="text-white" size={16} />
              </div>
              <h3 className="text-xs md:text-lg font-bold text-blue-900 dark:text-white mb-1 md:mb-2 text-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {f.title}
              </h3>
              <p className="text-[10px] md:text-sm text-gray-600 dark:text-gray-400 leading-tight text-center">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section - 2x2 Grid */}
      <section className="px-4 max-w-7xl mx-auto">
        <div className="bg-blue-600 dark:bg-blue-900 rounded-lg md:rounded-xl p-4 md:p-8 shadow-xl">
          <h2 className="text-lg md:text-2xl font-black text-white mb-3 md:mb-5 text-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Everything You Need
          </h2>
          <div className="grid grid-cols-2 gap-2 md:gap-4 max-w-3xl mx-auto">
            {benefits.map((b, i) => (
              <div 
                key={i} 
                className="flex items-center gap-2 md:gap-3 bg-white/10 backdrop-blur-sm p-2.5 md:p-4 rounded-lg border border-white/20"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <b.icon className="text-white" size={14} />
                </div>
                <p className="text-white font-semibold text-xs md:text-sm">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user ? (
        <section className="px-4 max-w-3xl mx-auto">
          <div className="bg-blue-600 dark:bg-blue-900 rounded-lg md:rounded-xl p-6 md:p-10 shadow-xl text-center">
            <h2 className="text-lg md:text-2xl font-black text-white mb-2 md:mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Ready to Transform Your Research?
            </h2>
            <p className="text-xs md:text-sm text-blue-100 mb-4 md:mb-5">Join NEUST College of Nursing's research community</p>
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-lg font-semibold shadow-lg hover:scale-105 transition-all text-sm"
            >
              Get Started Free
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      ) : (
        <section className="px-4 max-w-3xl mx-auto">
          <div className="bg-blue-600 dark:bg-blue-900 rounded-lg md:rounded-xl p-6 md:p-10 shadow-xl text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full mb-3">
              <span className="text-2xl md:text-3xl">👋</span>
            </div>
            <h2 className="text-lg md:text-2xl font-black text-white mb-2 md:mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Welcome Back, {user.firstName}!
            </h2>
            <p className="text-xs md:text-sm text-blue-100 mb-4 md:mb-5">Continue your research journey</p>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center">
              {(user.role === 'student' || user.role === 'faculty') && (
                <button 
                  onClick={() => setShowSubmitModal(true)} 
                  className="px-5 py-2.5 bg-white text-blue-600 rounded-lg font-semibold shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Upload size={16} />
                  Submit Research
                </button>
              )}
              <Link 
                to="/explore" 
                className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-all border-2 border-white/30 flex items-center justify-center gap-2 text-sm"
              >
                <Search size={16} />
                Browse Papers
              </Link>
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