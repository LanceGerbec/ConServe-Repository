import { Link } from 'react-router-dom';
import { BookOpen, Shield, Users, ArrowRight, Search, Upload, CheckCircle, Lock } from 'lucide-react';
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
    { icon: BookOpen, title: 'Smart Repository', desc: 'Advanced search across nursing research with powerful filters' },
    { icon: Shield, title: 'IP Security', desc: 'Comprehensive intellectual property protection with digital watermarking' },
    { icon: Users, title: 'Collaboration', desc: 'Connect with nursing researchers and share knowledge' }
  ];

  const benefits = [
    { icon: CheckCircle, text: 'Peer-reviewed' },
    { icon: Lock, text: 'IP Protected' },
    { icon: Search, text: 'Smart Search' },
    { icon: BookOpen, text: 'Citation Tools' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section - FULL WIDTH */}
      <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center justify-center py-8 md:py-16 bg-white dark:bg-gray-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-navy-900 dark:bg-navy-800 px-4 py-2 md:px-6 md:py-3 rounded-full shadow-lg mb-4 md:mb-8 border border-navy-700">
            <span className="text-xs md:text-sm font-bold tracking-wide text-white uppercase">
              NEUST College of Nursing
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-3 md:mb-6 animate-fade-in tracking-tight leading-tight">
            <span className="text-navy-600 dark:text-white">Con</span><span className="text-navy-900 dark:text-white">Serve</span>
          </h1>
          
          <p className="text-lg md:text-2xl lg:text-3xl text-navy-700 dark:text-gray-300 mb-2 md:mb-4 font-bold tracking-wide">
            Where Knowledge Flows and Nursing Grows
          </p>
          
          <p className="text-sm md:text-lg text-navy-600 dark:text-gray-400 mb-6 md:mb-10 font-medium">
            Discover • Secure • Search • Collaborate
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md md:max-w-2xl mx-auto">
            {user ? (
              <>
                <Link to="/explore" className="group px-6 md:px-10 py-3 md:py-5 bg-navy-900 text-white rounded-lg md:rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 text-base md:text-lg hover:scale-105 hover:bg-navy-950">
                  <Search size={18} className="md:w-6 md:h-6" />
                  Browse Research
                  <ArrowRight size={18} className="md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button onClick={() => setShowSubmitModal(true)} className="px-6 md:px-10 py-3 md:py-5 bg-transparent text-navy-900 dark:text-white rounded-lg md:rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-navy-900 dark:border-navy-600 flex items-center justify-center gap-2 hover:scale-105 text-base md:text-lg hover:bg-navy-900 hover:text-white dark:hover:bg-navy-600">
                    <Upload size={18} className="md:w-6 md:h-6" />
                    Submit Paper
                  </button>
                )}
              </>
            ) : (
              <>
                <Link to="/register" className="group px-6 md:px-10 py-3 md:py-5 bg-navy-900 text-white rounded-lg md:rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 text-base md:text-lg hover:scale-105 hover:bg-navy-950">
                  Get Started Free
                  <ArrowRight size={18} className="md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/about" className="px-6 md:px-10 py-3 md:py-5 bg-transparent text-navy-900 dark:text-white rounded-lg md:rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-navy-900 dark:border-navy-600 hover:scale-105 text-base md:text-lg hover:bg-navy-900 hover:text-white dark:hover:bg-navy-600">
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-1 bg-gradient-to-r from-transparent via-navy-600 dark:via-navy-700 to-transparent"></div>

      {/* Features Section */}
      <section className="px-4 py-12 md:py-20 max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-navy-900 dark:text-white mb-3 md:mb-5 tracking-tight leading-tight">
            Why Choose ConServe?
          </h2>
          <p className="text-base md:text-xl text-navy-700 dark:text-navy-300 font-semibold">Professional Tools for Nursing Research Excellence</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-8 lg:gap-10">
          {features.map((f, i) => (
            <div 
              key={i} 
              className={`group bg-white dark:bg-gray-800 p-6 md:p-8 lg:p-10 rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 cursor-pointer ${
                activeFeature === i 
                  ? 'border-navy-600 dark:border-accent scale-105 shadow-xl' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-navy-400 dark:hover:border-navy-600'
              }`}
              onClick={() => setActiveFeature(i)}
            >
              <div className="w-14 h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-navy-800 to-navy-600 dark:from-navy-700 dark:to-navy-500 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all">
                <f.icon className="text-white" size={24} strokeWidth={2.5} style={{ width: 'clamp(24px, 3vw, 40px)', height: 'clamp(24px, 3vw, 40px)' }} />
              </div>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-navy-900 dark:text-white mb-2 md:mb-4 group-hover:text-navy-700 dark:group-hover:text-accent transition-colors tracking-tight">
                {f.title}
              </h3>
              <p className="text-sm md:text-base text-navy-600 dark:text-gray-400 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="h-1 bg-gradient-to-r from-transparent via-navy-300 dark:via-navy-700 to-transparent mx-auto max-w-6xl"></div>

      {/* Benefits Section */}
      <section className="px-4 py-12 md:py-20 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-blue-900 dark:from-gray-900 dark:via-navy-950 dark:to-gray-950 rounded-2xl md:rounded-3xl p-8 md:p-14 lg:p-20 shadow-2xl border-2 border-navy-700 dark:border-navy-800">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-8 md:mb-12 text-center tracking-tight">
            Everything You Need to Succeed
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-10 max-w-6xl mx-auto">
            {benefits.map((b, i) => (
              <div 
                key={i} 
                className="group flex flex-col items-center gap-3 md:gap-5 bg-white/10 backdrop-blur-md p-5 md:p-7 lg:p-10 rounded-xl md:rounded-2xl border-2 border-white/20 hover:bg-white/20 hover:scale-105 hover:border-white/40 transition-all shadow-lg hover:shadow-2xl"
              >
                <div className="w-14 h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-navy-600 to-blue-600 dark:from-navy-700 dark:to-blue-700 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                  <b.icon className="text-white" style={{ width: 'clamp(22px, 2.5vw, 36px)', height: 'clamp(22px, 2.5vw, 36px)' }} strokeWidth={2.5} />
                </div>
                <p className="text-white font-bold text-sm md:text-base lg:text-lg text-center tracking-wide">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-1 bg-gradient-to-r from-transparent via-navy-300 dark:via-navy-700 to-transparent mx-auto max-w-6xl"></div>

      {/* CTA Section */}
      <section className="px-4 py-12 md:py-20 max-w-4xl md:max-w-5xl mx-auto mb-8">
        <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-blue-900 dark:from-gray-900 dark:via-navy-950 dark:to-gray-950 rounded-2xl md:rounded-3xl p-8 md:p-14 lg:p-20 shadow-2xl text-center border-2 border-navy-700 dark:border-navy-800">
          {!user ? (
            <>
              <div className="inline-flex items-center justify-center w-18 h-18 md:w-22 md:h-22 lg:w-28 lg:h-28 bg-white/10 backdrop-blur-md rounded-full mb-5 md:mb-10 shadow-xl border-2 border-white/20">
                <BookOpen className="text-white" style={{ width: 'clamp(36px, 4vw, 56px)', height: 'clamp(36px, 4vw, 56px)' }} strokeWidth={2} />
              </div>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-8 tracking-tight leading-tight">
                Ready to Transform Your Research?
              </h2>
              <p className="text-sm md:text-lg lg:text-xl text-blue-100 dark:text-blue-200 mb-8 md:mb-12 max-w-xl md:max-w-3xl mx-auto leading-relaxed font-medium">
                Join NEUST College of Nursing's growing research community and access thousands of peer-reviewed papers
              </p>
              <Link 
                to="/register" 
                className="group inline-flex items-center gap-2 md:gap-3 px-10 md:px-14 py-4 md:py-6 bg-white text-navy-900 rounded-xl md:rounded-2xl font-black shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all text-base md:text-lg lg:text-xl tracking-wide"
              >
                Get Started Free
                <ArrowRight className="group-hover:translate-x-1 transition-transform" style={{ width: 'clamp(20px, 2vw, 28px)', height: 'clamp(20px, 2vw, 28px)' }} strokeWidth={3} />
              </Link>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-18 h-18 md:w-22 md:h-22 lg:w-28 lg:h-28 bg-white/10 backdrop-blur-md rounded-full mb-5 md:mb-10 shadow-xl border-2 border-white/20">
                <span className="text-5xl md:text-6xl lg:text-7xl">👋</span>
              </div>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-8 tracking-tight">
                Welcome Back, {user.firstName}!
              </h2>
              <p className="text-sm md:text-lg text-blue-100 dark:text-blue-200 mb-8 md:mb-12 font-medium">Continue your research journey with ConServe</p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-5 justify-center">
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button 
                    onClick={() => setShowSubmitModal(true)} 
                    className="group px-8 md:px-12 py-4 md:py-6 bg-white text-navy-900 rounded-xl md:rounded-2xl font-black shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all flex items-center justify-center gap-2 text-base md:text-lg tracking-wide"
                  >
                    <Upload style={{ width: 'clamp(18px, 2vw, 24px)', height: 'clamp(18px, 2vw, 24px)' }} strokeWidth={2.5} />
                    Submit Research
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" style={{ width: 'clamp(18px, 2vw, 24px)', height: 'clamp(18px, 2vw, 24px)' }} strokeWidth={2.5} />
                  </button>
                )}
                <Link 
                  to="/explore" 
                  className="px-8 md:px-12 py-4 md:py-6 bg-white/10 backdrop-blur-md text-white rounded-xl md:rounded-2xl font-black hover:bg-white/20 transition-all border-2 border-white/30 hover:scale-105 hover:border-white/50 flex items-center justify-center gap-2 text-base md:text-lg shadow-xl tracking-wide"
                >
                  <Search style={{ width: 'clamp(18px, 2vw, 24px)', height: 'clamp(18px, 2vw, 24px)' }} strokeWidth={2.5} />
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