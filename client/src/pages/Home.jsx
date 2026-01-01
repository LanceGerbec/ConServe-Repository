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
    { icon: BookOpen, title: 'Smart Repository', desc: 'Advanced search across nursing research', color: '#1e40af' },
    { icon: Shield, title: 'Institutional Security', desc: 'Watermarked documents with protection', color: '#1e3a8a' },
    { icon: Users, title: 'NEUST CON Community', desc: 'Collaborate with faculty and students', color: '#1d4ed8' }
  ];

  const benefits = [
    { icon: CheckCircle, text: 'Peer-reviewed research' },
    { icon: Lock, text: 'Protected IP rights' },
    { icon: Search, text: 'Advanced search filters' },
    { icon: Star, text: 'APA, MLA, Chicago citations' }
  ];

  return (
    <div className="space-y-24 md:space-y-32 pb-16">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-16 -mt-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-blue-50 dark:bg-gray-900"></div>
          <div className="absolute top-20 left-10 w-64 h-64 md:w-96 md:h-96 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 md:w-[500px] md:h-[500px] bg-blue-300/20 dark:bg-blue-800/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 px-6 py-3 md:px-8 md:py-4 rounded-full shadow-xl mb-10 border-2 border-blue-100 dark:border-blue-900">
            <Star className="text-yellow-500 flex-shrink-0" size={18} />
            <span className="text-sm md:text-base font-bold text-blue-900 dark:text-blue-300">NEUST College of Nursing</span>
          </div>

          <h1 className="text-6xl md:text-9xl font-black mb-6 md:mb-8 leading-tight tracking-tight text-blue-900 dark:text-blue-100 drop-shadow-2xl">
            ConServe
          </h1>
          <p className="text-xl md:text-3xl text-blue-800 dark:text-blue-200 mb-5 md:mb-6 font-semibold px-6">
            Where Knowledge Flows and Nursing Grows.
          </p>
          <p className="text-base md:text-lg text-blue-700 dark:text-blue-300 mb-12 md:mb-14 px-6 max-w-3xl mx-auto leading-relaxed">
            Discover peer-reviewed papers • Secure viewing • Advanced search
          </p>

          <div className="flex flex-col md:flex-row gap-5 md:gap-6 justify-center px-6">
            {user ? (
              <>
                <Link 
                  to="/explore" 
                  className="group px-8 py-5 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all flex items-center justify-center gap-3"
                >
                  <Search size={22} className="group-hover:rotate-90 transition-transform flex-shrink-0" />
                  Browse Research
                </Link>
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button 
                    onClick={() => setShowSubmitModal(true)} 
                    className="px-8 py-5 bg-white dark:bg-gray-800 text-blue-900 dark:text-blue-100 rounded-2xl font-bold shadow-2xl hover:shadow-blue-400/30 hover:scale-105 transition-all border-3 border-blue-200 dark:border-blue-800 flex items-center justify-center gap-3"
                  >
                    <Upload size={22} className="flex-shrink-0" />
                    Submit Research
                  </button>
                )}
              </>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="group px-10 py-5 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all flex items-center justify-center gap-3"
                >
                  Get Started Free
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
                <Link 
                  to="/about" 
                  className="px-10 py-5 bg-white dark:bg-gray-800 text-blue-900 dark:text-blue-100 rounded-2xl font-bold shadow-2xl hover:shadow-blue-400/30 hover:scale-105 transition-all border-3 border-blue-200 dark:border-blue-800"
                >
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14 md:mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-blue-900 dark:text-blue-100 mb-5 md:mb-6 drop-shadow-lg">
            Why ConServe?
          </h2>
          <p className="text-xl md:text-2xl text-blue-700 dark:text-blue-300 max-w-3xl mx-auto">
            Enterprise-grade features for academic research
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {features.map((f, i) => (
            <div 
              key={i} 
              className={`group bg-white dark:bg-gray-800 p-10 md:p-12 rounded-3xl shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 border-3 cursor-pointer ${
                activeFeature === i 
                  ? 'border-blue-600 dark:border-blue-400 scale-105 shadow-blue-600/40' 
                  : 'border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600'
              }`} 
              onClick={() => setActiveFeature(i)}
            >
              <div 
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center mb-7 md:mb-8 group-hover:scale-110 transition-all shadow-xl"
                style={{ backgroundColor: f.color }}
              >
                <f.icon className="text-white" size={32} />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-100 mb-4 md:mb-5">
                {f.title}
              </h3>
              <p className="text-base md:text-lg text-blue-700 dark:text-blue-300 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="relative overflow-hidden bg-blue-900 dark:bg-blue-950 rounded-3xl p-12 md:p-16 shadow-2xl">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
          </div>
          <div className="absolute top-16 right-16 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 left-16 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-10 md:mb-12 text-center drop-shadow-lg">
              Everything You Need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
              {benefits.map((b, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-5 md:gap-6 bg-blue-800/40 backdrop-blur-sm p-6 md:p-8 rounded-2xl border-2 border-blue-700/50 hover:bg-blue-700/50 hover:border-blue-600 hover:scale-105 transition-all duration-300 shadow-xl"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <b.icon className="text-white" size={24} />
                  </div>
                  <p className="text-white font-semibold text-lg md:text-xl">
                    {b.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user ? (
        <section className="px-6 max-w-5xl mx-auto">
          <div className="relative overflow-hidden bg-blue-800 dark:bg-blue-950 rounded-3xl p-12 md:p-16 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 md:w-80 md:h-80 bg-blue-600/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-56 h-56 md:w-72 md:h-72 bg-blue-700/30 rounded-full blur-3xl"></div>
            <div className="relative z-10 text-center">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-5 md:mb-6 drop-shadow-lg">
                Ready to Transform Your Research?
              </h2>
              <p className="text-xl md:text-2xl text-blue-100 mb-10 md:mb-12 max-w-2xl mx-auto">
                Join NEUST College of Nursing's research community
              </p>
              <Link 
                to="/register" 
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-900 rounded-2xl font-bold shadow-2xl hover:scale-105 hover:shadow-white/30 transition-all"
              >
                Get Started Free
                <ArrowRight size={22} className="flex-shrink-0" />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="px-6 max-w-5xl mx-auto">
          <div className="relative overflow-hidden bg-blue-800 dark:bg-blue-950 rounded-3xl p-12 md:p-16 shadow-2xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-700 rounded-full mb-8 shadow-xl">
                <span className="text-5xl">👋</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 md:mb-8 drop-shadow-lg">
                Welcome Back, {user.firstName}!
              </h2>
              <p className="text-xl md:text-2xl text-blue-100 mb-10 md:mb-12">
                Continue your research journey
              </p>
              <div className="flex flex-col md:flex-row gap-5 md:gap-6 justify-center">
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button 
                    onClick={() => setShowSubmitModal(true)} 
                    className="px-8 py-4 bg-white text-blue-900 rounded-xl font-bold hover:scale-105 transition shadow-2xl flex items-center justify-center gap-3"
                  >
                    <Upload size={22} className="flex-shrink-0" />
                    Submit Research
                  </button>
                )}
                <Link 
                  to="/explore" 
                  className="px-8 py-4 bg-blue-700 backdrop-blur-sm text-white rounded-xl font-bold hover:scale-105 hover:bg-blue-600 transition border-2 border-blue-600 flex items-center justify-center gap-3 shadow-xl"
                >
                  <Search size={22} className="flex-shrink-0" />
                  Browse Papers
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