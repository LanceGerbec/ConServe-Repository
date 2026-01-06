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
      {/* Hero Section */}
      <section className="relative min-h-[65vh] md:min-h-[75vh] flex items-center justify-center py-6 md:py-12 bg-gradient-to-br from-blue-50 via-white to-blue-100/50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-navy-900 dark:bg-navy-800 px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-lg mb-3 md:mb-6 border border-navy-700">
            <span className="text-xs md:text-sm font-bold tracking-wide text-white uppercase">
              NEUST College of Nursing
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-2 md:mb-4 animate-fade-in tracking-tight leading-tight">
            <span className="text-navy-800 dark:text-white">CON</span><span className="text-navy-900 dark:text-white">serve</span>
          </h1>
          
          <p className="text-base md:text-xl lg:text-2xl text-navy-700 dark:text-gray-300 mb-1.5 md:mb-3 font-bold tracking-wide">
            Where Knowledge Flows and Nursing Grows
          </p>
          
          <p className="text-sm md:text-base text-navy-600 dark:text-gray-400 mb-5 md:mb-8 font-medium">
            Discover • Secure • Search • Collaborate
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 md:gap-3 justify-center max-w-md md:max-w-xl mx-auto">
            {user ? (
              <>
                <Link to="/explore" className="group px-5 md:px-8 py-2.5 md:py-3.5 bg-gradient-to-r from-navy-900 to-navy-800 text-white rounded-lg font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-sm md:text-base hover:scale-105">
                  <Search size={16} className="md:w-5 md:h-5" />
                  Browse Research
                  <ArrowRight size={16} className="md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button onClick={() => setShowSubmitModal(true)} className="px-5 md:px-8 py-2.5 md:py-3.5 bg-transparent text-navy-900 dark:text-white rounded-lg font-bold shadow-xl transition-all border-2 border-navy-900 dark:border-navy-600 flex items-center justify-center gap-2 hover:scale-105 text-sm md:text-base hover:bg-navy-900 hover:text-white">
                    <Upload size={16} className="md:w-5 md:h-5" />
                    Submit Paper
                  </button>
                )}
              </>
            ) : (
              <>
                <Link to="/register" className="group px-5 md:px-8 py-2.5 md:py-3.5 bg-gradient-to-r from-navy-900 to-navy-800 text-white rounded-lg font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-sm md:text-base hover:scale-105">
                  Get Started Free
                  <ArrowRight size={16} className="md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/about" className="px-5 md:px-8 py-2.5 md:py-3.5 bg-transparent text-navy-900 dark:text-white rounded-lg font-bold shadow-xl transition-all border-2 border-navy-900 dark:border-navy-600 hover:scale-105 text-sm md:text-base hover:bg-navy-900 hover:text-white">
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-1 bg-gradient-to-r from-blue-400 via-navy-600 to-blue-400"></div>

      {/* Features Section */}
      <section className="px-4 py-8 md:py-14 max-w-7xl mx-auto">
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-navy-900 dark:text-white mb-2 md:mb-3 tracking-tight">
            Why Choose CONserve?
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-navy-700 dark:text-navy-300 font-semibold">Professional Tools for Nursing Research Excellence</p>
        </div>
        
        {/* Mobile Carousel */}
        <div className="flex md:hidden overflow-x-auto gap-4 px-4 pb-4 snap-x snap-mandatory scrollbar-hide -mx-4">
          {features.map((f, i) => (
            <div 
              key={i} 
              className={`flex-shrink-0 w-[80vw] group bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg transition-all border-2 snap-center ${
                activeFeature === i ? 'border-navy-600 scale-105 shadow-xl' : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => setActiveFeature(i)}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-navy-800 to-navy-600 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-all">
                <f.icon className="text-white" size={20} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-black text-navy-900 dark:text-white mb-2 tracking-tight">{f.title}</h3>
              <p className="text-sm text-navy-600 dark:text-gray-400 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-3 gap-6 lg:gap-8">
          {features.map((f, i) => (
            <div 
              key={i} 
              className={`group bg-white dark:bg-gray-800 p-6 lg:p-7 rounded-xl shadow-lg transition-all border-2 cursor-pointer ${
                activeFeature === i ? 'border-navy-600 scale-105 shadow-xl' : 'border-gray-200 dark:border-gray-700 hover:border-navy-400'
              }`}
              onClick={() => setActiveFeature(i)}
            >
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-navy-800 to-navy-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-all">
                <f.icon className="text-white" size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl lg:text-2xl font-black text-navy-900 dark:text-white mb-2 tracking-tight">{f.title}</h3>
              <p className="text-sm text-navy-600 dark:text-gray-400 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="h-1 bg-gradient-to-r from-blue-400 via-navy-600 to-blue-400 mx-auto max-w-6xl"></div>

      {/* Benefits Section */}
      <section className="px-4 py-8 md:py-14 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-navy-900 via-blue-900 to-navy-800 rounded-2xl p-6 md:p-10 lg:p-14 shadow-2xl border-2 border-navy-700">
          <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-white mb-6 md:mb-8 text-center tracking-tight">
            Everything You Need to Succeed
          </h2>
          
          {/* Mobile Scroll */}
          <div className="flex md:hidden overflow-x-auto gap-3 pb-4 snap-x snap-mandatory scrollbar-hide -mx-2 px-2">
            {benefits.map((b, i) => (
              <div 
                key={i} 
                className="flex-shrink-0 w-[60vw] group flex flex-col items-center gap-2.5 bg-white/10 backdrop-blur-md p-4 rounded-xl border-2 border-white/20 hover:bg-white/20 hover:scale-105 transition-all shadow-lg snap-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-navy-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                  <b.icon className="text-white" size={20} strokeWidth={2.5} />
                </div>
                <p className="text-white font-bold text-sm text-center">{b.text}</p>
              </div>
            ))}
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-4 gap-5 lg:gap-7 max-w-5xl mx-auto">
            {benefits.map((b, i) => (
              <div 
                key={i} 
                className="group flex flex-col items-center gap-3 bg-white/10 backdrop-blur-md p-5 lg:p-7 rounded-xl border-2 border-white/20 hover:bg-white/20 hover:scale-105 transition-all shadow-lg"
              >
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-navy-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                  <b.icon className="text-white" size={24} strokeWidth={2.5} />
                </div>
                <p className="text-white font-bold text-sm lg:text-base text-center">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-1 bg-gradient-to-r from-blue-400 via-navy-600 to-blue-400 mx-auto max-w-6xl"></div>

      {/* CTA Section */}
      <section className="px-4 py-8 md:py-14 max-w-4xl mx-auto mb-6">
        <div className="bg-gradient-to-br from-navy-950 via-blue-900/90 to-navy-900 rounded-2xl p-6 md:p-10 lg:p-14 shadow-2xl text-center border-2 border-navy-700">
          {!user ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-full mb-4 md:mb-7 shadow-xl border-2 border-white/20">
                <BookOpen className="text-white" size={32} strokeWidth={2} />
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-3 md:mb-5 tracking-tight">
                Ready to Transform Your Research?
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
                Join NEUST College of Nursing's growing research community and access thousands of peer-reviewed papers
              </p>
              <Link 
                to="/register" 
                className="group inline-flex items-center gap-2 px-8 md:px-12 py-3 md:py-4 bg-white text-navy-900 rounded-xl font-black shadow-2xl hover:scale-105 transition-all text-base md:text-lg"
              >
                Get Started Free
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} strokeWidth={3} />
              </Link>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-full mb-4 md:mb-7 shadow-xl border-2 border-white/20">
                <span className="text-4xl md:text-5xl">👋</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-3 md:mb-5 tracking-tight">
                Welcome Back, {user.firstName}!
              </h2>
              <p className="text-sm md:text-base text-blue-100 mb-6 md:mb-8 font-medium">Continue your research journey with CONserve</p>
              <div className="flex flex-col sm:flex-row gap-2.5 md:gap-4 justify-center">
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button 
                    onClick={() => setShowSubmitModal(true)} 
                    className="group px-6 md:px-10 py-3 md:py-4 bg-white text-navy-900 rounded-xl font-black shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <Upload size={18} strokeWidth={2.5} />
                    Submit Research
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} strokeWidth={2.5} />
                  </button>
                )}
                <Link 
                  to="/explore" 
                  className="px-6 md:px-10 py-3 md:py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-black hover:bg-white/20 transition-all border-2 border-white/30 hover:scale-105 flex items-center justify-center gap-2 text-sm md:text-base shadow-xl"
                >
                  <Search size={18} strokeWidth={2.5} />
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