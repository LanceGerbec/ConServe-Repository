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

  // Color Theory: 60-30-10 Rule
  // 60% - White/Light Blue backgrounds (#F0F9FF, #FFFFFF)
  // 30% - Primary Blue (#1E40AF, #1E3A8A) 
  // 10% - Accent Blue (#3B82F6)
  const features = [
    { icon: BookOpen, title: 'Smart Repository', desc: 'Advanced search across nursing research', color: '#1E40AF' },
    { icon: Shield, title: 'Institutional Security', desc: 'Watermarked documents with protection', color: '#1E3A8A' },
    { icon: Users, title: 'NEUST CON Community', desc: 'Collaborate with faculty and students', color: '#3B82F6' }
  ];

  const benefits = [
    { icon: CheckCircle, text: 'Peer-reviewed research' },
    { icon: Lock, text: 'Protected IP rights' },
    { icon: Search, text: 'Advanced search filters' },
    { icon: Star, text: 'APA, MLA, Chicago citations' }
  ];

  return (
    <div className="space-y-28 md:space-y-36 pb-20" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      {/* Hero Section - 60% White Space */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-6 py-20 -mt-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* 60% White/Light Blue Background */}
          <div className="absolute inset-0 bg-white dark:bg-slate-900"></div>
          <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-blue-50 dark:bg-blue-950/30 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="relative z-10 text-center max-w-6xl mx-auto">
          {/* Badge - 10% Accent */}
          <div className="inline-flex items-center gap-3 bg-blue-50 dark:bg-blue-950/50 px-8 py-4 rounded-full shadow-2xl mb-12 border-2 border-blue-200 dark:border-blue-800 backdrop-blur-sm">
            <Star className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={20} />
            <span className="text-base md:text-lg font-bold text-blue-900 dark:text-blue-100 tracking-wide">NEUST College of Nursing</span>
          </div>

          {/* Main Heading - High Contrast */}
          <h1 className="text-7xl md:text-[10rem] font-black mb-8 leading-none tracking-tighter text-blue-950 dark:text-white" style={{ letterSpacing: '-0.04em' }}>
            ConServe
          </h1>
          
          {/* Subheading - 30% Primary Blue */}
          <p className="text-2xl md:text-4xl text-blue-800 dark:text-blue-200 mb-6 font-bold px-6 tracking-tight" style={{ fontWeight: 700 }}>
            Where Knowledge Flows and Nursing Grows
          </p>
          
          {/* Description - Balanced Contrast */}
          <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-16 px-6 max-w-4xl mx-auto leading-relaxed font-medium">
            Discover peer-reviewed papers • Secure viewing • Advanced search
          </p>

          {/* CTA Buttons - 30% Primary with 60% White Balance */}
          <div className="flex flex-col md:flex-row gap-6 justify-center px-6">
            {user ? (
              <>
                <Link 
                  to="/explore" 
                  className="group px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all flex items-center justify-center gap-3 border-2 border-blue-700"
                >
                  <Search size={24} className="group-hover:rotate-12 transition-transform flex-shrink-0" />
                  <span className="tracking-wide">Browse Research</span>
                </Link>
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button 
                    onClick={() => setShowSubmitModal(true)} 
                    className="px-12 py-6 bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-100 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-blue-300/50 hover:scale-105 transition-all border-3 border-blue-200 dark:border-blue-700 flex items-center justify-center gap-3"
                  >
                    <Upload size={24} className="flex-shrink-0" />
                    <span className="tracking-wide">Submit Research</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="group px-14 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all flex items-center justify-center gap-3 border-2 border-blue-700"
                >
                  <span className="tracking-wide">Get Started Free</span>
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform flex-shrink-0" />
                </Link>
                <Link 
                  to="/about" 
                  className="px-14 py-6 bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-100 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-blue-300/50 hover:scale-105 transition-all border-3 border-blue-200 dark:border-blue-700"
                >
                  <span className="tracking-wide">Learn More</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section - White Background with Blue Accents */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-5xl md:text-7xl font-black text-blue-950 dark:text-white mb-6 tracking-tight" style={{ fontWeight: 900 }}>
            Why ConServe?
          </h2>
          <p className="text-2xl md:text-3xl text-slate-700 dark:text-slate-300 max-w-4xl mx-auto font-semibold">
            Enterprise-grade features for academic research
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {features.map((f, i) => (
            <div 
              key={i} 
              className={`group bg-white dark:bg-slate-800 p-12 md:p-14 rounded-3xl shadow-2xl hover:shadow-blue-400/40 transition-all duration-500 border-4 cursor-pointer ${
                activeFeature === i 
                  ? 'border-blue-600 dark:border-blue-500 scale-105 shadow-blue-500/50 ring-4 ring-blue-100 dark:ring-blue-900' 
                  : 'border-blue-100 dark:border-blue-900 hover:border-blue-300 dark:hover:border-blue-700'
              }`} 
              onClick={() => setActiveFeature(i)}
            >
              <div 
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-2xl"
                style={{ backgroundColor: f.color }}
              >
                <f.icon className="text-white" size={40} />
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-blue-950 dark:text-white mb-5 tracking-tight" style={{ fontWeight: 900 }}>
                {f.title}
              </h3>
              <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section - 30% Blue Background */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="relative overflow-hidden bg-blue-900 dark:bg-blue-950 rounded-3xl p-14 md:p-20 shadow-2xl">
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="2"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
          </div>
          <div className="absolute top-20 right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-black text-white mb-12 md:mb-16 text-center tracking-tight" style={{ fontWeight: 900 }}>
              Everything You Need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-5xl mx-auto">
              {benefits.map((b, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-6 md:gap-8 bg-white/10 backdrop-blur-md p-8 md:p-10 rounded-2xl border-3 border-white/30 hover:bg-white/20 hover:border-white/50 hover:scale-105 transition-all duration-300 shadow-2xl"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl">
                    <b.icon className="text-blue-900" size={28} />
                  </div>
                  <p className="text-white font-bold text-xl md:text-2xl tracking-wide" style={{ fontWeight: 700 }}>
                    {b.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Balanced Blue & White */}
      {!user ? (
        <section className="px-6 max-w-6xl mx-auto">
          <div className="relative overflow-hidden bg-blue-800 dark:bg-blue-950 rounded-3xl p-14 md:p-20 shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 md:w-96 md:h-96 bg-blue-600/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 md:w-80 md:h-80 bg-blue-700/30 rounded-full blur-3xl"></div>
            <div className="relative z-10 text-center">
              <h2 className="text-5xl md:text-7xl font-black text-white mb-6 md:mb-8 tracking-tight" style={{ fontWeight: 900 }}>
                Ready to Transform Your Research?
              </h2>
              <p className="text-2xl md:text-3xl text-blue-50 mb-12 md:mb-16 max-w-3xl mx-auto font-semibold leading-relaxed">
                Join NEUST College of Nursing's research community
              </p>
              <Link 
                to="/register" 
                className="inline-flex items-center gap-4 px-14 py-7 bg-white text-blue-900 rounded-2xl font-bold text-xl shadow-2xl hover:scale-105 hover:shadow-white/40 transition-all border-3 border-blue-100"
              >
                <span className="tracking-wide">Get Started Free</span>
                <ArrowRight size={28} className="flex-shrink-0" />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="px-6 max-w-6xl mx-auto">
          <div className="relative overflow-hidden bg-blue-800 dark:bg-blue-950 rounded-3xl p-14 md:p-20 shadow-2xl">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600 rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-28 h-28 bg-white rounded-full mb-10 shadow-2xl">
                <span className="text-6xl">👋</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-8 md:mb-10 tracking-tight" style={{ fontWeight: 900 }}>
                Welcome Back, {user.firstName}!
              </h2>
              <p className="text-2xl md:text-3xl text-blue-50 mb-12 md:mb-14 font-semibold">
                Continue your research journey
              </p>
              <div className="flex flex-col md:flex-row gap-6 justify-center">
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button 
                    onClick={() => setShowSubmitModal(true)} 
                    className="px-12 py-6 bg-white text-blue-900 rounded-2xl font-bold text-lg hover:scale-105 transition shadow-2xl flex items-center justify-center gap-3 border-2 border-blue-100"
                  >
                    <Upload size={24} className="flex-shrink-0" />
                    <span className="tracking-wide">Submit Research</span>
                  </button>
                )}
                <Link 
                  to="/explore" 
                  className="px-12 py-6 bg-blue-700 text-white rounded-2xl font-bold text-lg hover:scale-105 hover:bg-blue-600 transition border-3 border-blue-600 flex items-center justify-center gap-3 shadow-2xl"
                >
                  <Search size={24} className="flex-shrink-0" />
                  <span className="tracking-wide">Browse Papers</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {showSubmitModal && <SubmitResearch onClose={() => setShowSubmitModal(false)} onSuccess={() => setShowSubmitModal(false)} />}
    </div>
  );
};

export default Home;