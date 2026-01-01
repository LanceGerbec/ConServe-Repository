import { Link } from 'react-router-dom';
import { BookOpen, Shield, Users, ArrowRight, Search, Upload, Star, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import SubmitResearch from '../components/research/SubmitResearch';

const Home = () => {
  const { user } = useAuth();
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const features = [
    { 
      icon: BookOpen, 
      title: 'Smart Repository', 
      desc: 'Advanced search and filtering across thousands of peer-reviewed nursing research papers with intelligent categorization.' 
    },
    { 
      icon: Shield, 
      title: 'IP Security', 
      desc: 'Military-grade protection with dynamic watermarking, signed URLs, and comprehensive audit logging for all documents.' 
    },
    { 
      icon: Users, 
      title: 'Collaboration', 
      desc: 'Connect with fellow nursing researchers, share insights, and build upon collective knowledge in a secure environment.' 
    }
  ];

  const benefits = [
    { icon: CheckCircle, text: 'Peer-Reviewed Quality' },
    { icon: Lock, text: 'IP Protected' },
    { icon: Search, text: 'Smart Search' },
    { icon: Star, text: 'Citation Tools' }
  ];

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0d1d35] to-[#0a1628] opacity-50"></div>
        
        <div className="relative z-10 text-center max-w-5xl mx-auto animate-fade-in">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10 mb-8">
              <Star className="text-blue-400" size={18} />
              <span className="text-sm font-semibold text-white/90 tracking-wide">
                NEUST COLLEGE OF NURSING
              </span>
            </div>
          </div>

          <h1 className="text-7xl md:text-9xl font-black text-white mb-6 tracking-tight leading-none">
            ConServe
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-4 font-light tracking-wide">
            Professional Research Repository System
          </p>
          
          <p className="text-base md:text-lg text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover, secure, and collaborate on nursing research with enterprise-grade protection and intelligent search capabilities
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            {user ? (
              <>
                <Link 
                  to="/explore" 
                  className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
                >
                  <Search size={20} />
                  Browse Research
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button 
                    onClick={() => setShowSubmitModal(true)} 
                    className="px-8 py-4 bg-transparent border-2 border-white/20 text-white rounded-lg font-semibold hover:border-blue-500 hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
                  >
                    <Upload size={20} />
                    Submit Paper
                  </button>
                )}
              </>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
                >
                  Get Started
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/about" 
                  className="px-8 py-4 bg-transparent border-2 border-white/20 text-white rounded-lg font-semibold hover:border-blue-500 hover:bg-white/5 transition-all duration-300 hover:scale-105"
                >
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Enterprise Features
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Professional-grade tools designed for academic excellence
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="group bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-blue-600/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600/30 transition-colors">
                <f.icon className="text-blue-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {f.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-24 max-w-7xl mx-auto">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center tracking-tight">
            Everything You Need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((b, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <b.icon className="text-blue-400" size={24} />
                </div>
                <p className="text-white font-semibold text-center">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl p-12 md:p-16 text-center border border-blue-500/30">
          {!user ? (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600/20 rounded-full mb-8">
                <BookOpen className="text-blue-400" size={40} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Join NEUST College of Nursing's research community and access thousands of peer-reviewed papers
              </p>
              <Link 
                to="/register" 
                className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                Get Started Free
                <ArrowRight size={24} />
              </Link>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600/20 rounded-full mb-8">
                <span className="text-5xl">👋</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                Welcome Back, {user.firstName}
              </h2>
              <p className="text-lg text-slate-300 mb-8">
                Continue your research journey with ConServe
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {(user.role === 'student' || user.role === 'faculty') && (
                  <button 
                    onClick={() => setShowSubmitModal(true)} 
                    className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
                  >
                    <Upload size={20} />
                    Submit Research
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
                <Link 
                  to="/explore" 
                  className="px-8 py-4 bg-transparent border-2 border-white/20 text-white rounded-lg font-semibold hover:border-blue-500 hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
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