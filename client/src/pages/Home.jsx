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
    { icon: BookOpen, title: 'Smart Repository', desc: 'Advanced search across nursing research', color: 'bg-gradient-to-br from-blue-600 to-blue-700' },
    { icon: Shield, title: 'IP Security', desc: 'Military-grade protection with watermarks', color: 'bg-gradient-to-br from-indigo-600 to-indigo-700' },
    { icon: Users, title: 'Collaboration', desc: 'Connect with nursing researchers', color: 'bg-gradient-to-br from-purple-600 to-purple-700' }
  ];

  const benefits = [
    { icon: CheckCircle, text: 'Peer-reviewed', color: 'from-emerald-500 to-emerald-600' },
    { icon: Lock, text: 'IP Protected', color: 'from-blue-500 to-blue-600' },
    { icon: Search, text: 'Smart Search', color: 'from-violet-500 to-violet-600' },
    { icon: Star, text: 'Citation Tools', color: 'from-amber-500 to-amber-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-blue-950">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAzNmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnpNNiAzNmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzFkNGVkOCIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg mb-6 border border-blue-200 dark:border-blue-800">
            <Star className="text-blue-600 dark:text-blue-400" size={16} />
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              NEUST College of Nursing
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-4 bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-400 bg-clip-text text-transparent animate-fade-in" style={{ fontFamily: 'Inter, system-ui, sans-serif', lineHeight: '1.1' }}>
            ConServe
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-3 font-semibold animate-slide-up">
            Where Knowledge Flows and Nursing Grows
          </p>
          
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-8 animate-slide-up">
            Discover • Secure • Search • Collaborate
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto animate-scale-in">
            {user ? (
              <>
                <Link to="/explore" className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-base">
                  <Search size={20} />
                  Browse Research
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button onClick={() => setShowSubmitModal(true)} className="px-8 py-4 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all border-2 border-blue-200 dark:border-blue-700 flex items-center justify-center gap-2 text-base hover:scale-105">
                    <Upload size={20} />
                    Submit Paper
                  </button>
                )}
              </>
            ) : (
              <>
                <Link to="/register" className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-base">
                  Get Started Free
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/about" className="px-8 py-4 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all border-2 border-blue-200 dark:border-blue-700 text-base hover:scale-105">
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Why Choose ConServe?
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-medium">Enterprise-grade features for academic excellence</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((f, i) => (
            <div 
              key={i} 
              className={`group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 cursor-pointer ${
                activeFeature === i 
                  ? 'border-blue-600 dark:border-blue-500 scale-105' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
              onClick={() => setActiveFeature(i)}
            >
              <div className={`w-16 h-16 ${f.color} rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                <f.icon className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {f.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 rounded-3xl p-10 md:p-12 shadow-2xl border border-blue-800 dark:border-blue-900">
          <h2 className="text-2xl md:text-4xl font-black text-white mb-8 text-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Everything You Need to Succeed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {benefits.map((b, i) => (
              <div 
                key={i} 
                className="group flex flex-col items-center gap-3 bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${b.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all`}>
                  <b.icon className="text-white" size={24} />
                </div>
                <p className="text-white font-bold text-base text-center">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 dark:from-blue-800 dark:via-indigo-800 dark:to-blue-900 rounded-3xl p-10 md:p-14 shadow-2xl text-center border-2 border-blue-400 dark:border-blue-700">
          {!user ? (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-6 shadow-xl">
                <BookOpen className="text-white" size={40} />
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-white mb-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Ready to Transform Your Research?
              </h2>
              <p className="text-base md:text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                Join NEUST College of Nursing's growing research community and access thousands of peer-reviewed papers
              </p>
              <Link 
                to="/register" 
                className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-600 rounded-xl font-black shadow-2xl hover:shadow-3xl hover:scale-105 transition-all text-lg"
              >
                Get Started Free
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-6 shadow-xl">
                <span className="text-5xl">👋</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-white mb-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Welcome Back, {user.firstName}!
              </h2>
              <p className="text-base md:text-lg text-blue-100 mb-8">Continue your research journey with ConServe</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button 
                    onClick={() => setShowSubmitModal(true)} 
                    className="group px-8 py-4 bg-white text-blue-600 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 text-base"
                  >
                    <Upload size={20} />
                    Submit Research
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
                <Link 
                  to="/explore" 
                  className="px-8 py-4 bg-white/20 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/30 transition-all border-2 border-white/30 hover:scale-105 flex items-center justify-center gap-2 text-base"
                >
                  <Search size={20} />
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