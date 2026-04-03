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
    const t = setInterval(() => setActiveFeature(p => (p + 1) % 3), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/settings`)
      .then(r => r.json())
      .then(d => { if (d.settings?.logos?.heroBg?.url) setHeroBg(d.settings.logos.heroBg.url); })
      .catch(() => {});
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
      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image with very subtle overlay */}
        {heroBg ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${heroBg})`, backgroundAttachment: 'fixed' }}
            />
            {/* Subtle multi-layer overlay — less opaque than before */}
            <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/50 to-navy/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy/30 via-transparent to-navy/30" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-blue-800 to-blue-900 dark:from-gray-900 dark:via-gray-800 dark:to-navy" />
        )}

        {/* Decorative floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 py-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
            <span className="text-sm font-bold tracking-widest text-white/90 uppercase">NEUST College of Nursing</span>
          </div>

          {/* Main title */}
          <h1 className="text-6xl md:text-9xl font-black mb-5 tracking-tight leading-none">
            <span className="text-white drop-shadow-lg">CON</span>
            <span className="text-blue-300 drop-shadow-lg">serve</span>
          </h1>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl font-bold text-white/90 mb-3 drop-shadow-md">
            Where Knowledge Flows and Nursing Grows
          </p>
          <p className="text-base md:text-lg text-blue-200/80 mb-10 font-medium tracking-wide">
            Discover &nbsp;•&nbsp; Secure &nbsp;•&nbsp; Search &nbsp;•&nbsp; Collaborate
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
            {user ? (
              <>
                <Link to="/explore"
                  className="group px-8 py-4 bg-white text-navy font-bold rounded-xl shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
                  <Search size={18} />Browse Research
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button onClick={() => setShowSubmitModal(true)}
                    className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
                    <Upload size={18} />Submit Paper
                  </button>
                )}
              </>
            ) : (
              <>
                <Link to="/register"
                  className="group px-8 py-4 bg-white text-navy font-bold rounded-xl shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
                  Get Started Free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/about"
                  className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
                  Learn More
                </Link>
              </>
            )}
          </div>

          {/* Stats strip */}
          <div className="mt-14 flex items-center justify-center gap-8 flex-wrap">
            {[['Secure', 'IP Protected'], ['Fast', 'Smart Search'], ['Trusted', 'Peer Reviewed']].map(([label, sub], i) => (
              <div key={i} className="text-center">
                <p className="text-lg font-black text-white">{label}</p>
                <p className="text-xs text-blue-300/80 font-medium">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom wave transition */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none">
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none" style={{ height: '60px' }}>
            <path d="M0,40 C360,80 1080,0 1440,50 L1440,80 L0,80 Z" className="fill-gray-50 dark:fill-gray-950" />
          </svg>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-navy dark:text-white mb-3 tracking-tight">Why Choose CONserve?</h2>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium">Professional Tools for Nursing Research Excellence</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} onClick={() => setActiveFeature(i)}
              className={`group bg-white dark:bg-gray-800 p-7 rounded-2xl shadow-md transition-all border-2 cursor-pointer hover:-translate-y-1 ${activeFeature === i ? 'border-navy dark:border-blue-500 shadow-xl' : 'border-gray-100 dark:border-gray-700 hover:border-navy/40'}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg transition-all group-hover:scale-110 ${activeFeature === i ? 'bg-navy dark:bg-blue-600' : 'bg-navy/10 dark:bg-blue-900/40'}`}>
                <f.icon className={activeFeature === i ? 'text-white' : 'text-navy dark:text-blue-400'} size={24} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Benefits ─── */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-navy via-blue-800 to-blue-900 rounded-3xl p-10 lg:p-14 shadow-2xl">
          <h2 className="text-2xl md:text-4xl font-black text-white mb-10 text-center">Everything You Need</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {benefits.map((b, i) => (
              <div key={i} className="group flex flex-col items-center gap-3 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                  <b.icon className="text-white" size={22} />
                </div>
                <p className="text-white font-bold text-sm text-center">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-4 py-16 max-w-4xl mx-auto mb-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-navy via-blue-800 to-blue-900 rounded-3xl p-10 lg:p-14 shadow-2xl text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            {!user ? (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6 shadow-xl">
                  <BookOpen className="text-white" size={28} />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to Transform Your Research?</h2>
                <p className="text-blue-100 mb-8 max-w-xl mx-auto leading-relaxed">
                  Join NEUST College of Nursing's growing research community
                </p>
                <Link to="/register"
                  className="group inline-flex items-center gap-2 px-10 py-4 bg-white text-navy rounded-xl font-black shadow-2xl hover:scale-105 transition-all">
                  Get Started Free
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </Link>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6 shadow-xl">
                  <BookOpen className="text-white" size={28} />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Welcome Back, {user.firstName}!</h2>
                <p className="text-blue-100 mb-8">Continue your research journey</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {(user.role === 'student' || user.role === 'faculty') && (
                    <button onClick={() => setShowSubmitModal(true)}
                      className="group px-8 py-4 bg-white text-navy rounded-xl font-black shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                      <Upload size={18} />Submit Research
                    </button>
                  )}
                  <Link to="/explore"
                    className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-black hover:bg-white/20 transition-all border border-white/30 hover:scale-105 flex items-center justify-center gap-2">
                    <Search size={18} />Browse Papers
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {showSubmitModal && <SubmitResearch onClose={() => setShowSubmitModal(false)} onSuccess={() => setShowSubmitModal(false)} />}
    </div>
  );
};

export default Home;