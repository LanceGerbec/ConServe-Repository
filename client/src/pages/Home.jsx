import { Link } from 'react-router-dom';
import { BookOpen, Shield, Users, ArrowRight, Search, Upload, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import SubmitResearch from '../components/research/SubmitResearch';

const Home = () => {
  const { user } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [heroBg, setHeroBg] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setActiveFeature(p => (p + 1) % 3), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/settings`)
      .then(r => r.json())
      .then(d => { if (d.settings?.logos?.heroBg?.url) setHeroBg(d.settings.logos.heroBg.url); })
      .catch(() => {});
  }, []);

  const features = [
    { icon: BookOpen, title: 'Smart Repository', desc: 'Advanced search across nursing research with powerful filters' },
    { icon: Shield,   title: 'IP Security',      desc: 'Comprehensive intellectual property protection with digital watermarking' },
    { icon: Users,    title: 'Collaboration',    desc: 'Connect with nursing researchers and share knowledge' }
  ];

  const benefits = [
    { icon: CheckCircle, text: 'Peer-reviewed' },
    { icon: Lock,        text: 'IP Protected' },
    { icon: Search,      text: 'Smart Search' },
    { icon: BookOpen,    text: 'Citation Tools' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ─── Hero ─── */}
      <section
        className="relative min-h-screen flex items-center justify-center py-8"
        style={heroBg ? { backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : {}}
      >
        {/* Overlay */}
        <div className={`absolute inset-0 ${heroBg
          ? 'bg-gradient-to-br from-navy-950/85 via-navy-900/80 to-navy-800/75'
          : 'bg-gradient-to-br from-blue-50 via-white to-blue-100/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'}`}
        />
        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0L0 0 0 10' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E\")" }}
        />

        <div className={`relative z-10 text-center max-w-5xl mx-auto px-4 ${heroBg ? 'text-white' : ''}`}>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg mb-6 border ${heroBg ? 'bg-white/10 backdrop-blur-sm border-white/20' : 'bg-navy-900 border-navy-700'}`}>
            <span className="text-sm font-bold tracking-wide text-white uppercase">NEUST College of Nursing</span>
          </div>

          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black mb-4 tracking-tight leading-tight animate-fade-in">
            <span className={heroBg ? 'text-white' : 'text-navy-800 dark:text-white'}>CON</span>
            <span className={heroBg ? 'text-blue-300' : 'text-navy-900 dark:text-white'}>serve</span>
          </h1>

          <p className={`text-xl md:text-3xl lg:text-4xl mb-3 font-bold tracking-wide ${heroBg ? 'text-blue-100' : 'text-navy-700 dark:text-gray-300'}`}>
            Where Knowledge Flows and Nursing Grows
          </p>
          <p className={`text-base md:text-lg mb-8 font-medium ${heroBg ? 'text-blue-200' : 'text-navy-600 dark:text-gray-400'}`}>
            Discover • Secure • Search • Collaborate
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
            {user ? (
              <>
                <Link to="/explore"
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-navy-900 to-navy-800 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 hover:scale-105 text-sm sm:text-base whitespace-nowrap">
                  <Search size={18} />Browse Research<ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button onClick={() => setShowSubmitModal(true)}
                    className={`px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold shadow-xl transition-all border-2 flex items-center justify-center gap-2 hover:scale-105 text-sm sm:text-base whitespace-nowrap ${heroBg ? 'bg-white/10 backdrop-blur-sm border-white/40 text-white hover:bg-white/20' : 'bg-transparent text-navy-900 dark:text-white border-navy-900 dark:border-navy-600 hover:bg-navy-900 hover:text-white'}`}>
                    <Upload size={18} />Submit Paper
                  </button>
                )}
              </>
            ) : (
              <>
                <Link to="/register"
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-navy-900 to-navy-800 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 hover:scale-105 text-sm sm:text-base whitespace-nowrap">
                  Get Started Free<ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/about"
                  className={`px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold shadow-xl transition-all border-2 hover:scale-105 text-sm sm:text-base whitespace-nowrap ${heroBg ? 'bg-white/10 backdrop-blur-sm border-white/40 text-white hover:bg-white/20' : 'bg-transparent text-navy-900 dark:text-white border-navy-900 dark:border-navy-600 hover:bg-navy-900 hover:text-white'}`}>
                  Learn More
                </Link>
              </>
            )}
          </div>

          {/* Scroll indicator */}
          {heroBg && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
              <span className="text-white/60 text-xs font-semibold tracking-widest uppercase">Scroll</span>
              <div className="w-px h-8 bg-gradient-to-b from-white/60 to-transparent" />
            </div>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="h-1 bg-gradient-to-r from-blue-400 via-navy-600 to-blue-400 dark:from-blue-500 dark:via-blue-600 dark:to-blue-500" />

      {/* ─── Features ─── */}
      <section className="px-4 py-14 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black text-navy-900 dark:text-white mb-3 tracking-tight">Why Choose CONserve?</h2>
          <p className="text-base md:text-lg text-navy-700 dark:text-navy-300 font-semibold">Professional Tools for Nursing Research Excellence</p>
        </div>
        {/* Mobile */}
        <div className="flex md:hidden overflow-x-auto gap-4 px-4 pb-4 snap-x snap-mandatory scrollbar-hide -mx-4">
          {features.map((f, i) => (
            <div key={i} onClick={() => setActiveFeature(i)}
              className={`flex-shrink-0 w-[80vw] group bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg transition-all border-2 snap-center ${activeFeature === i ? 'border-navy-600 dark:border-blue-500 scale-105 shadow-xl' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="w-12 h-12 bg-gradient-to-br from-navy-800 to-navy-600 dark:from-blue-600 dark:to-blue-800 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                <f.icon className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-black text-navy-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-navy-600 dark:text-gray-400 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
        {/* Desktop */}
        <div className="hidden md:grid grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} onClick={() => setActiveFeature(i)}
              className={`group bg-white dark:bg-gray-800 p-7 rounded-xl shadow-lg transition-all border-2 cursor-pointer ${activeFeature === i ? 'border-navy-600 dark:border-blue-500 scale-105 shadow-xl' : 'border-gray-200 dark:border-gray-700 hover:border-navy-400'}`}>
              <div className="w-16 h-16 bg-gradient-to-br from-navy-800 to-navy-600 dark:from-blue-600 dark:to-blue-800 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-all">
                <f.icon className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-black text-navy-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-navy-600 dark:text-gray-400 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-blue-400 via-navy-600 to-blue-400 mx-auto max-w-6xl" />

      {/* ─── Benefits ─── */}
      <section className="px-4 py-14 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-navy-900 via-blue-900 to-navy-800 dark:from-blue-800 dark:via-blue-900 dark:to-gray-900 rounded-2xl p-10 lg:p-14 shadow-2xl border-2 border-navy-700 dark:border-blue-700">
          <h2 className="text-2xl md:text-4xl font-black text-white mb-8 text-center tracking-tight">Everything You Need to Succeed</h2>
          <div className="flex md:hidden overflow-x-auto gap-3 pb-4 snap-x snap-mandatory scrollbar-hide -mx-2 px-2">
            {benefits.map((b, i) => (
              <div key={i} className="flex-shrink-0 w-[60vw] group flex flex-col items-center gap-2.5 bg-white/10 backdrop-blur-md p-4 rounded-xl border-2 border-white/20 hover:bg-white/20 hover:scale-105 transition-all shadow-lg snap-center">
                <div className="w-12 h-12 bg-gradient-to-br from-navy-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg"><b.icon className="text-white" size={20} /></div>
                <p className="text-white font-bold text-sm text-center">{b.text}</p>
              </div>
            ))}
          </div>
          <div className="hidden md:grid grid-cols-4 gap-7 max-w-5xl mx-auto">
            {benefits.map((b, i) => (
              <div key={i} className="group flex flex-col items-center gap-3 bg-white/10 backdrop-blur-md p-7 rounded-xl border-2 border-white/20 hover:bg-white/20 hover:scale-105 transition-all shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-navy-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all"><b.icon className="text-white" size={24} /></div>
                <p className="text-white font-bold text-base text-center">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-blue-400 via-navy-600 to-blue-400 mx-auto max-w-6xl" />

      {/* ─── CTA ─── */}
      <section className="px-4 py-14 max-w-4xl mx-auto mb-6">
        <div className="bg-gradient-to-br from-navy-950 via-blue-900/90 to-navy-900 dark:from-blue-900 dark:via-blue-800 dark:to-gray-900 rounded-2xl p-10 lg:p-14 shadow-2xl text-center border-2 border-navy-700 dark:border-blue-700">
          {!user ? (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-full mb-7 shadow-xl border-2 border-white/20">
                <BookOpen className="text-white" size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-5 tracking-tight">Ready to Transform Your Research?</h2>
              <p className="text-base md:text-lg text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
                Join NEUST College of Nursing's growing research community
              </p>
              <Link to="/register"
                className="group inline-flex items-center gap-2 px-10 sm:px-12 py-3 sm:py-4 bg-white text-navy-900 dark:text-blue-900 rounded-xl font-black shadow-2xl hover:scale-105 transition-all text-base sm:text-lg">
                Get Started Free<ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-full mb-7 shadow-xl border-2 border-white/20">
                <BookOpen className="text-white" size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-5 tracking-tight">Welcome Back, {user.firstName}!</h2>
              <p className="text-base text-blue-100 mb-8 font-medium">Continue your research journey with CONserve</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button onClick={() => setShowSubmitModal(true)}
                    className="group px-8 sm:px-10 py-3 sm:py-4 bg-white text-navy-900 dark:text-blue-900 rounded-xl font-black shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
                    <Upload size={18} />Submit Research<ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                  </button>
                )}
                <Link to="/explore"
                  className="px-8 sm:px-10 py-3 sm:py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-black hover:bg-white/20 transition-all border-2 border-white/30 hover:scale-105 flex items-center justify-center gap-2 shadow-xl text-sm sm:text-base">
                  <Search size={18} />Browse Papers
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {showSubmitModal && <SubmitResearch onClose={() => setShowSubmitModal(false)} onSuccess={() => setShowSubmitModal(false)} />}
    </div>
  );
};

export default Home;