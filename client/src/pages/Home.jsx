import { Link } from 'react-router-dom';
import { BookOpen, Shield, Users, ArrowRight, Search, Upload, Award, Lock, Zap, FileText, CheckCircle, Star, Activity } from 'lucide-react';
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
    { icon: BookOpen, title: 'Smart Repository', desc: 'Advanced search across thousands of nursing research papers' },
    { icon: Shield, title: 'Institutional Security', desc: 'Watermarked documents with comprehensive academic protection' },
    { icon: Users, title: 'Collaborative Network', desc: 'Connect with researchers and share knowledge seamlessly' }
  ];

  const stats = [
    { icon: FileText, value: '2,500+', label: 'Research Papers' },
    { icon: Users, value: '800+', label: 'Active Researchers' },
    { icon: Award, value: '98%', label: 'Satisfaction Rate' }
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

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center -mt-8">
        {/* Nursing-themed Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-navy-950 dark:to-gray-900"></div>
          
          {/* Subtle Nursing Symbols - Optimized */}
          <svg className="absolute w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            {/* Stethoscope */}
            <path d="M50 100 Q 60 80, 70 100" stroke="#1e3a8a" strokeWidth="2" fill="none"/>
            <circle cx="50" cy="95" r="8" fill="#1e3a8a"/>
            <circle cx="70" cy="95" r="8" fill="#1e3a8a"/>
            
            {/* Medical Cross */}
            <g transform="translate(200, 100)">
              <rect x="-5" y="-15" width="10" height="30" fill="#1e3a8a"/>
              <rect x="-15" y="-5" width="30" height="10" fill="#1e3a8a"/>
            </g>
            
            {/* Heartbeat */}
            <path d="M300 120 L310 120 L315 110 L320 130 L325 120 L335 120" stroke="#1e3a8a" strokeWidth="2" fill="none"/>
            
            {/* Repeat Pattern */}
            <use href="#pattern" x="400"/>
            <use href="#pattern" x="800"/>
            <use href="#pattern" y="200"/>
            <use href="#pattern" x="400" y="200"/>
          </svg>

          {/* Animated Orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-navy/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-8 border border-navy/20">
            <Star className="text-yellow-500" size={18} />
            <span className="text-sm font-bold text-navy dark:text-blue-400">NEUST College of Nursing Excellence Hub</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[1.1] tracking-tight text-navy dark:text-white">
            ConServe
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
                <Link to="/browse" className="group px-8 py-4 bg-navy hover:bg-navy-800 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2">
                  <Search size={20} className="group-hover:rotate-90 transition-transform" />
                  Browse Research
                </Link>
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button onClick={() => setShowSubmitModal(true)} className="px-8 py-4 bg-white dark:bg-gray-800 text-navy dark:text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all border-2 border-navy/20 flex items-center gap-2">
                    <Upload size={20} />
                    Submit Research
                  </button>
                )}
              </>
            ) : (
              <>
                <Link to="/register" className="group px-10 py-4 bg-navy hover:bg-navy-800 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2">
                  Get Started Free
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/about" className="px-8 py-4 bg-white dark:bg-gray-800 text-navy dark:text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all border-2 border-navy/20">
                  Learn More
                </Link>
              </>
            )}
          </div>

          {/* Stats Bar - Compact */}
          <div className="inline-flex items-center gap-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-xl border border-navy/20">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-black text-navy dark:text-blue-400">{stat.value}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-navy dark:text-white mb-4">Why ConServe?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">Enterprise-grade features for researchers</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className={`group bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 ${activeFeature === i ? 'border-navy scale-105' : 'border-transparent hover:border-navy/30'} cursor-pointer`} onClick={() => setActiveFeature(i)}>
              <div className="w-16 h-16 bg-navy dark:bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all shadow-lg">
                <f.icon className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-navy dark:text-white mb-3">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 max-w-7xl mx-auto">
        <div className="bg-navy dark:bg-gray-900 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 text-center">Everything You Need</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
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
          <div className="bg-navy dark:bg-gray-900 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Ready to Transform Your Research?</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Join 800+ researchers advancing nursing science</p>
              <Link to="/register" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-navy rounded-2xl font-bold shadow-2xl hover:scale-105 transition-all">
                Get Started Free
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="px-4 max-w-4xl mx-auto">
          <div className="bg-navy dark:bg-gray-900 rounded-3xl p-12 text-center shadow-2xl">
            <h2 className="text-4xl font-black text-white mb-6">Welcome Back, {user.firstName}! 👋</h2>
            <p className="text-xl text-blue-100 mb-8">Continue your research journey</p>
            <div className="flex flex-wrap gap-4 justify-center">
              {(user.role === 'student' || user.role === 'faculty') && (
                <button onClick={() => setShowSubmitModal(true)} className="px-8 py-3 bg-white text-navy rounded-xl font-bold hover:scale-105 transition shadow-xl flex items-center gap-2">
                  <Upload size={20} />
                  Submit Research
                </button>
              )}
              <Link to="/browse" className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:scale-105 transition border-2 border-white/30 flex items-center gap-2">
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