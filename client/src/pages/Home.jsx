// client/src/pages/Home.jsx - OPTIMIZED WITH ANALYTICS
import { Link } from 'react-router-dom';
import { BookOpen, Shield, Users, ArrowRight, Search, Upload, Star, CheckCircle, Lock, FileText, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, memo } from 'react';
import SubmitResearch from '../components/research/SubmitResearch';

// Memoized Analytics Component
const HomeAnalytics = memo(() => {
  const [stats, setStats] = useState({ papers: 0, users: 0, views: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setStats({ papers: 150, users: 500, views: 12000 }); // Fallback for logged-out users
          setLoading(false);
          return;
        }
        const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/dashboard`, { headers: { Authorization: `Bearer ${token}` }});
        if (res.ok) {
          const data = await res.json();
          setStats({ papers: data.totalPapers || 0, users: data.totalUsers || 0, views: data.totalViews || 0 });
        }
      } catch (error) {
        setStats({ papers: 150, users: 500, views: 12000 }); // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="animate-pulse bg-white/20 rounded-2xl h-24 w-full"></div>;

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-3xl mx-auto">
      {[
        { icon: FileText, label: 'Papers', value: stats.papers, color: 'from-blue-500 to-blue-600' },
        { icon: Users, label: 'Users', value: stats.users, color: 'from-green-500 to-green-600' },
        { icon: TrendingUp, label: 'Views', value: stats.views.toLocaleString(), color: 'from-purple-500 to-purple-600' }
      ].map((stat, i) => (
        <div key={i} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-navy/20">
          <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-2 md:mb-3 mx-auto`}>
            <stat.icon className="text-white" size={20} />
          </div>
          <div className="text-2xl md:text-3xl font-black text-navy dark:text-white text-center mb-1">{stat.value}</div>
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center font-semibold">{stat.label}</div>
        </div>
      ))}
    </div>
  );
});
HomeAnalytics.displayName = 'HomeAnalytics';

// Memoized Onboarding Modal
const OnboardingModal = memo(({ onComplete, onSkip }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 border-2 border-navy/20 animate-scale-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-navy to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <BookOpen className="text-white" size={32} />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-navy dark:text-white mb-2">Welcome to ConServe!</h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Your nursing research hub</p>
      </div>
      <div className="space-y-3 mb-6">
        {[
          { icon: Search, text: 'Search thousands of papers' },
          { icon: Shield, text: 'Secure watermarked viewing' },
          { icon: Upload, text: 'Submit your research' }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <item.icon className="text-navy dark:text-accent" size={18} />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.text}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <button onClick={onComplete} className="w-full py-3 bg-navy text-white rounded-xl font-bold hover:bg-navy-800 transition shadow-lg">Get Started</button>
        <button onClick={onSkip} className="w-full py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">Skip Tour</button>
      </div>
    </div>
  </div>
));
OnboardingModal.displayName = 'OnboardingModal';

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
    { icon: BookOpen, title: 'Smart Repository', desc: 'Advanced search across nursing research' },
    { icon: Shield, title: 'Institutional Security', desc: 'Watermarked documents with protection' },
    { icon: Users, title: 'Collaborative Network', desc: 'Connect with researchers globally' }
  ];

  const benefits = [
    { icon: CheckCircle, text: 'Peer-reviewed research' },
    { icon: Lock, text: 'Protected IP rights' },
    { icon: Search, text: '20+ search filters' },
    { icon: Star, text: 'Multi-format citations' }
  ];

  return (
    <div className="space-y-8 pb-8">
      {showOnboarding && <OnboardingModal onComplete={() => { localStorage.setItem('hasSeenOnboarding', 'true'); setShowOnboarding(false); }} onSkip={() => { localStorage.setItem('hasSeenOnboarding', 'true'); setShowOnboarding(false); }} />}

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-navy-950 dark:to-gray-900"></div>
          <div className="absolute top-10 left-5 w-40 h-40 md:w-72 md:h-72 bg-navy/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-5 w-48 h-48 md:w-96 md:h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 md:px-6 md:py-3 rounded-full shadow-lg mb-6 md:mb-8 border border-navy/20">
            <Star className="text-yellow-500 flex-shrink-0" size={16} />
            <span className="text-xs md:text-sm font-bold text-navy dark:text-blue-400">NEUST College of Nursing</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black mb-4 md:mb-6 leading-tight tracking-tight text-navy dark:text-white">ConServe</h1>
          <p className="text-lg md:text-2xl text-gray-700 dark:text-gray-300 mb-3 md:mb-4 font-medium px-4">Where Knowledge Flows and Nursing Grows.</p>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-8 md:mb-10 px-4">Discover peer-reviewed papers • Secure viewing • AI search</p>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-8 px-4">
            {user ? (
              <>
                <Link to="/explore" className="group px-6 py-4 bg-navy hover:bg-navy-800 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                  <Search size={20} className="group-hover:rotate-90 transition-transform flex-shrink-0" />Browse Research
                </Link>
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button onClick={() => setShowSubmitModal(true)} className="px-6 py-4 bg-white dark:bg-gray-800 text-navy dark:text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all border-2 border-navy/20 flex items-center justify-center gap-2">
                    <Upload size={20} className="flex-shrink-0" />Submit Research
                  </button>
                )}
              </>
            ) : (
              <>
                <Link to="/register" className="group px-8 py-4 bg-navy hover:bg-navy-800 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                  Get Started Free<ArrowRight size={20} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
                <Link to="/about" className="px-6 py-4 bg-white dark:bg-gray-800 text-navy dark:text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all border-2 border-navy/20">Learn More</Link>
              </>
            )}
          </div>

          {/* Analytics */}
          <HomeAnalytics />
        </div>
      </section>

      {/* Features */}
      <section className="px-4 max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-navy dark:text-white mb-3 md:mb-4">Why ConServe?</h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">Enterprise-grade features</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {features.map((f, i) => (
            <div key={i} className={`group bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 ${activeFeature === i ? 'border-navy scale-105' : 'border-transparent hover:border-navy/30'} cursor-pointer`} onClick={() => setActiveFeature(i)}>
              <div className="w-14 h-14 md:w-16 md:h-16 bg-navy dark:bg-blue-600 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-all shadow-lg">
                <f.icon className="text-white" size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-navy dark:text-white mb-2 md:mb-3">{f.title}</h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 max-w-7xl mx-auto">
        <div className="bg-navy dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg"><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="1"/></pattern><rect width="100%" height="100%" fill="url(#grid)"/></svg>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 md:mb-8 text-center">Everything You Need</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3 md:gap-4 bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-white/20">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0"><b.icon className="text-white" size={20} /></div>
                  <p className="text-white font-semibold text-base md:text-lg">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user ? (
        <section className="px-4 max-w-4xl mx-auto text-center">
          <div className="bg-navy dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-3 md:mb-4">Ready to Transform Your Research?</h2>
              <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8">Join researchers advancing nursing science</p>
              <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-navy rounded-2xl font-bold shadow-2xl hover:scale-105 transition-all">Get Started Free<ArrowRight size={20} className="flex-shrink-0" /></Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="px-4 max-w-4xl mx-auto">
          <div className="bg-navy dark:bg-gray-900 rounded-3xl p-8 md:p-12 text-center shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 md:mb-6">Welcome Back, {user.firstName}! 👋</h2>
            <p className="text-lg md:text-xl text-blue-100 mb-6 md:mb-8">Continue your research journey</p>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
              {(user.role === 'student' || user.role === 'faculty') && (
                <button onClick={() => setShowSubmitModal(true)} className="px-6 py-3 bg-white text-navy rounded-xl font-bold hover:scale-105 transition shadow-xl flex items-center justify-center gap-2"><Upload size={20} className="flex-shrink-0" />Submit Research</button>
              )}
              <Link to="/explore" className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:scale-105 transition border-2 border-white/30 flex items-center justify-center gap-2"><Search size={20} className="flex-shrink-0" />Browse Papers</Link>
            </div>
          </div>
        </section>
      )}

      {showSubmitModal && <SubmitResearch onClose={() => setShowSubmitModal(false)} onSuccess={() => setShowSubmitModal(false)} />}
    </div>
  );
};

export default Home;