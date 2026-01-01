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
    { icon: BookOpen, title: 'Smart Repository', desc: 'Advanced search across nursing research' },
    { icon: Shield, title: 'IP Security', desc: 'Military-grade protection with watermarks' },
    { icon: Users, title: 'Collaboration', desc: 'Connect with nursing researchers' }
  ];

  const benefits = [
    { icon: CheckCircle, text: 'Peer-reviewed' },
    { icon: Lock, text: 'IP Protected' },
    { icon: Search, text: 'Smart Search' },
    { icon: Star, text: 'Citation Tools' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section - Optimized for Mobile */}
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center px-4 py-8 md:py-12 bg-white dark:bg-gray-900">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-navy-50 dark:bg-navy-900/30 px-3 py-1.5 rounded-full shadow-sm mb-4 md:mb-6 border border-navy-200 dark:border-navy-800">
            <Star className="text-navy-600 dark:text-navy-400" size={14} />
            <span className="text-xs font-semibold text-navy-700 dark:text-navy-300">
              NEUST College of Nursing
            </span>
          </div>

          {/* Title - Compact for Mobile */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-3 md:mb-4 text-navy-900 dark:text-white animate-fade-in">
            ConServe
          </h1>
          
          <p className="text-base md:text-xl text-navy-700 dark:text-navy-300 mb-2 font-semibold">
            Where Knowledge Flows and Nursing Grows
          </p>
          
          <p className="text-sm text-navy-600 dark:text-navy-400 mb-6 md:mb-8">
            Discover • Secure • Search • Collaborate
          </p>

          {/* CTA Buttons - Stack on Mobile */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            {user ? (
              <>
                <Link to="/explore" className="group px-6 py-3 bg-navy-600 hover:bg-navy-700 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  <Search size={18} />
                  Browse Research
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button onClick={() => setShowSubmitModal(true)} className="px-6 py-3 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-200 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all border-2 border-navy-300 dark:border-navy-700 flex items-center justify-center gap-2 hover:scale-105">
                    <Upload size={18} />
                    Submit Paper
                  </button>
                )}
              </>
            ) : (
              <>
                <Link to="/register" className="group px-6 py-3 bg-navy-600 hover:bg-navy-700 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  Get Started Free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/about" className="px-6 py-3 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-200 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all border-2 border-navy-300 dark:border-navy-700 hover:scale-105">
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section - Compact Cards */}
      <section className="px-4 py-8 md:py-12 max-w-6xl mx-auto">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white mb-2">
            Why Choose ConServe?
          </h2>
          <p className="text-sm text-navy-600 dark:text-navy-400">Enterprise-grade features for academic excellence</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {features.map((f, i) => (
            <div 
              key={i} 
              className={`group bg-white dark:bg-gray-800 p-5 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-all border-2 cursor-pointer ${
                activeFeature === i 
                  ? 'border-navy-600 dark:border-navy-500 scale-105' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-navy-400'
              }`}
              onClick={() => setActiveFeature(i)}
            >
              <div className="w-12 h-12 bg-navy-600 rounded-lg flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                <f.icon className="text-white" size={22} />
              </div>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-2 group-hover:text-navy-600 dark:group-hover:text-navy-400 transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-navy-600 dark:text-navy-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section - Compact Grid */}
      <section className="px-4 py-8 md:py-12 max-w-6xl mx-auto">
        <div className="bg-navy-900 dark:bg-navy-950 rounded-2xl p-6 md:p-8 shadow-xl border border-navy-800">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6 text-center">
            Everything You Need to Succeed
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {benefits.map((b, i) => (
              <div 
                key={i} 
                className="group flex flex-col items-center gap-2 bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 hover:bg-white/20 hover:scale-105 transition-all"
              >
                <div className="w-12 h-12 bg-navy-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                  <b.icon className="text-white" size={20} />
                </div>
                <p className="text-white font-semibold text-sm text-center">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Compact */}
      <section className="px-4 py-8 md:py-12 max-w-4xl mx-auto mb-8">
        <div className="bg-navy-800 dark:bg-navy-900 rounded-2xl p-6 md:p-10 shadow-xl text-center border-2 border-navy-700">
          {!user ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4 shadow-lg">
                <BookOpen className="text-white" size={32} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                Ready to Transform Your Research?
              </h2>
              <p className="text-sm text-navy-200 mb-6 max-w-xl mx-auto">
                Join NEUST College of Nursing's growing research community and access thousands of peer-reviewed papers
              </p>
              <Link 
                to="/register" 
                className="group inline-flex items-center gap-2 px-8 py-3 bg-white text-navy-700 rounded-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                Get Started Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4 shadow-lg">
                <span className="text-4xl">👋</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                Welcome Back, {user.firstName}!
              </h2>
              <p className="text-sm text-navy-200 mb-6">Continue your research journey with ConServe</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button 
                    onClick={() => setShowSubmitModal(true)} 
                    className="group px-6 py-3 bg-white text-navy-700 rounded-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <Upload size={18} />
                    Submit Research
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
                <Link 
                  to="/explore" 
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-bold hover:bg-white/30 transition-all border-2 border-white/30 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Search size={18} />
                  Browse Papers
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

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