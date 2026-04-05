import { Link } from 'react-router-dom';
import { ArrowRight, Check, BookOpen, FileText, Shield, Award, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import SubmitResearch from '../components/research/SubmitResearch';

const HeroSlideshow = ({ slides }) => {
  const [cur, setCur] = useState(0), [fading, setFading] = useState(false), [paused, setPaused] = useState(false);
  const len = slides.length;
  const go = useCallback((idx) => { if (fading || idx === cur) return; setFading(true); setTimeout(() => { setCur(idx); setFading(false); }, 600); }, [cur, fading]);
  const next = useCallback(() => go((cur + 1) % len), [cur, len, go]);
  const back = useCallback(() => go((cur - 1 + len) % len), [cur, len, go]);
  useEffect(() => { if (paused || len <= 1) return; const t = setInterval(next, 5500); return () => clearInterval(t); }, [next, paused, len]);
  const slide = slides[cur] || {};
  return (
    <div className="relative w-full overflow-hidden" style={{ height: '560px' }}>
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: slide.url ? `url(${slide.url})` : 'none', opacity: fading ? 0 : 1, transition: 'opacity 0.7s ease' }} />
      {!slide.url && <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#0a1628]" />}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628]/85 via-[#0d1f3c]/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <svg viewBox="0 0 1440 90" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none" style={{ height: '90px' }}>
          <path d="M0,0 C360,90 1080,0 1440,60 L1440,90 L0,90 Z" className="fill-gray-50 dark:fill-gray-950" />
        </svg>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 flex items-center h-full pb-16">
        <div className="max-w-xl" style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.5s ease 0.1s' }}>
          <p className="text-xs font-bold tracking-[0.25em] text-blue-300 uppercase mb-4 font-sans">NEUST College of Nursing</p>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase leading-tight mb-5 font-sans" style={{ letterSpacing: '-0.02em' }}>{slide.headline || 'DISCOVER\nNURSING\nRESEARCH'}</h1>
          <p className="text-sm md:text-base text-white/70 mb-8 leading-relaxed max-w-sm font-sans">{slide.sub || 'Access peer-reviewed nursing papers from NEUST-CON. Collaborate, submit, and cite with ease.'}</p>
          <Link to="/explore" className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white text-white font-bold uppercase text-sm tracking-widest hover:bg-white hover:text-[#0d1f3c] transition-all duration-200 font-sans">EXPLORE →</Link>
        </div>
      </div>
      {len > 1 && (
        <>
          <button onClick={back} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition z-20"><ChevronLeft size={20} /></button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition z-20"><ChevronRight size={20} /></button>
          <button onClick={() => setPaused(p => !p)} className="absolute top-4 right-16 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white z-20 transition">{paused ? <Play size={11} /> : <Pause size={11} />}</button>
          <div className="absolute bottom-24 right-8 flex gap-2 z-20">{slides.map((_, i) => <button key={i} onClick={() => go(i)} className={`rounded-full transition-all duration-300 ${i === cur ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`} />)}</div>
          {!paused && <div className="absolute bottom-[88px] left-0 w-full h-0.5 bg-white/10 z-20"><div key={cur} className="h-full bg-white/50" style={{ animation: 'hprogress 5.5s linear forwards' }} /></div>}
        </>
      )}
    </div>
  );
};

const ImgCard = ({ url, alt = '', className = '' }) => (
  <div className={`overflow-hidden bg-[#0d1f3c] ${className}`} style={{ aspectRatio: '4/3' }}>
    {url
      ? <img src={url} alt={alt} className="w-full h-full object-cover" />
      : <div className="w-full h-full bg-gradient-to-br from-[#1e3a8a] to-[#0d1f3c] flex items-center justify-center"><BookOpen size={28} className="text-blue-400 opacity-40" /></div>
    }
  </div>
);

const extractUrl = (img) => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (typeof img === 'object' && img.url) return img.url;
  return '';
};

export default function Home() {
  const { user } = useAuth();
  const [showSubmit, setShowSubmit] = useState(false);
  const [slides, setSlides] = useState([{ url: '', headline: 'DISCOVER NURSING RESEARCH', sub: 'Access peer-reviewed nursing papers from NEUST. Collaborate, submit, and cite with ease.' }]);
  const [homeImages, setHomeImages] = useState({ about: ['', '', ''], types: ['', '', ''] });
  const [stats, setStats] = useState({ papers: '500+', users: '300+', completed: '200+', published: '100+', faculty: '500+' });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/settings`).then(r => r.json()).then(d => {
      const s = d.settings || {};
      const imgs = [];
      if (s.logos?.heroBg?.url) imgs.push({ url: s.logos.heroBg.url, headline: 'DISCOVER NURSING RESEARCH', sub: 'Access peer-reviewed nursing papers from NEUST.' });
      (s.bannerImages || []).forEach(b => imgs.push({ url: b.url, headline: (b.caption || 'EXPLORE NURSING RESEARCH').toUpperCase(), sub: 'Discover, cite, and collaborate on nursing research.' }));
      if (imgs.length) setSlides(imgs);
      if (s.homeImages) {
        setHomeImages({
          about: (s.homeImages.about || []).map(extractUrl),
          types: (s.homeImages.types || []).map(extractUrl),
        });
      } else {
        const bi = (s.bannerImages || []).map(b => b.url);
        setHomeImages({ about: [bi[0] || '', bi[1] || '', bi[2] || ''], types: [bi[0] || '', bi[1] || '', bi[2] || ''] });
      }
      if (s.homeStats) setStats(s.homeStats);
    }).catch(() => {});
  }, []);

  const SERVICES = [
    { icon: BookOpen, title: 'Research Papers', desc: 'Browse hundreds of peer-reviewed nursing papers organized by subject, category, and year.' },
    { icon: Shield, title: 'IP Protection', desc: 'All papers protected under RA 10173. Digital watermarking and access logging included.' },
    { icon: FileText, title: 'Easy Submission', desc: 'Submit your IMRaD-formatted research with guided steps and receive real-time status updates.' },
    { icon: Award, title: 'Recognition', desc: 'Top papers get awarded and featured, boosting your academic visibility across the repository.' },
  ];

  const TYPES = [
    { title: 'COMPLETED RESEARCH', sub: `More than ${stats.completed} papers`, desc: 'Finalized nursing research papers completed by students and faculty at NEUST College of Nursing.' },
    { title: 'PUBLISHED RESEARCH', sub: `More than ${stats.published} papers`, desc: 'Formally published nursing studies available for citation and academic reference.' },
    { title: 'FACULTY WORKS', sub: `More than ${stats.faculty} users`, desc: 'Research contributed by NEUST nursing faculty — a wealth of expertise and academic insight.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-x-hidden font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .font-sans { font-family: 'Inter', system-ui, -apple-system, sans-serif !important; }
        @keyframes hprogress { from { width: 0 } to { width: 100% } }

        /* Floating animations — each image gets a unique rhythm */
        @keyframes float-1 {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          33%      { transform: translateY(-12px) rotate(0.4deg); }
          66%      { transform: translateY(-5px) rotate(-0.3deg); }
        }
        @keyframes float-2 {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          40%      { transform: translateY(-9px) rotate(-0.5deg); }
          70%      { transform: translateY(-4px) rotate(0.4deg); }
        }
        @keyframes float-3 {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          30%      { transform: translateY(-14px) rotate(0.6deg); }
          65%      { transform: translateY(-6px) rotate(-0.4deg); }
        }
        @keyframes float-badge {
          0%,100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-7px) scale(1.03); }
        }

        .about-img-1      { animation: float-1     7s   ease-in-out         infinite; will-change: transform; }
        .about-img-2      { animation: float-2     5.5s ease-in-out 0.8s    infinite; will-change: transform; }
        .about-img-3      { animation: float-3     6.5s ease-in-out 1.5s    infinite; will-change: transform; }
        .about-badge-1    { animation: float-badge 4s   ease-in-out 0.4s    infinite; will-change: transform; }
        .about-badge-2    { animation: float-badge 4s   ease-in-out 1.2s    infinite; will-change: transform; }

        /* Pause on hover for comfortable reading */
        .about-img-1:hover,
        .about-img-2:hover,
        .about-img-3:hover { animation-play-state: paused; }
      `}</style>

      <HeroSlideshow slides={slides} />

      {/* ── ABOUT ── */}
      <section className="bg-gray-50 dark:bg-gray-950 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Floating image grid */}
          <div className="grid grid-cols-2 gap-3" style={{ perspective: '1200px' }}>

            {/* Image 1 — wide top card, slowest float */}
            <div className="col-span-2 about-img-1">
              <ImgCard url={homeImages.about[0]} alt="About 1" className="w-full rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-500" />
            </div>

            {/* Image 2 — bottom-left, medium float */}
            <div className="about-img-2">
              <div className="relative mt-1">
                <div className="about-badge-1 absolute -top-4 -left-4 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg px-4 py-3 border border-gray-100 dark:border-gray-700">
                  <p className="text-3xl font-black text-[#0d1f3c] dark:text-white leading-none font-sans">{stats.papers}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 font-sans">Research Papers</p>
                </div>
                <ImgCard url={homeImages.about[1]} alt="About 2" className="w-full rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-500 mt-6" />
              </div>
            </div>

            {/* Image 3 — bottom-right, fastest float */}
            <div className="about-img-3">
              <div className="relative">
                <ImgCard url={homeImages.about[2]} alt="About 3" className="w-full rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-500" />
                <div className="about-badge-2 absolute -bottom-4 -right-4 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg px-4 py-3 border border-gray-100 dark:border-gray-700">
                  <p className="text-3xl font-black text-[#0d1f3c] dark:text-white leading-none font-sans">{stats.users}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 font-sans">Active Users</p>
                </div>
              </div>
            </div>

          </div>

          {/* Text */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6 font-sans">ABOUT US</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#0d1f3c] dark:text-white uppercase leading-tight mb-5 font-sans" style={{ letterSpacing: '-0.02em' }}>FIND AND EXPLORE<br />THE RESEARCH<br />OF YOUR DREAMS</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 max-w-sm font-sans">CONserve is the official research repository of NEUST's College of Nursing — a secure, organized, IP-protected platform for nursing research discovery and submission.</p>
            <div className="space-y-3 mb-8">
              {['Peer-reviewed nursing papers', 'Secure IP protection under RA 10173', 'Faculty and student collaboration tools'].map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#0d1f3c] dark:bg-blue-600 flex items-center justify-center flex-shrink-0"><Check size={11} className="text-white" /></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-sans">{t}</span>
                </div>
              ))}
            </div>
            <Link to="/explore" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0d1f3c] dark:bg-blue-600 text-white font-bold uppercase text-sm tracking-widest hover:bg-blue-900 dark:hover:bg-blue-700 transition-all font-sans">EXPLORE →</Link>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="bg-[#0d1f3c] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex gap-6 overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-4 md:gap-8 scrollbar-hide snap-x snap-mandatory">
            {SERVICES.map((s, i) => (
              <div key={i} className="group border-l border-white/10 pl-5 hover:border-blue-400 transition-colors cursor-default flex-shrink-0 w-64 md:w-auto snap-start">
                <div className="w-9 h-9 border border-white/20 group-hover:border-blue-400 flex items-center justify-center mb-3 transition-colors">
                  <s.icon size={18} className="text-white/60 group-hover:text-blue-300 transition-colors" />
                </div>
                <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wide font-sans">{s.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed font-sans">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESEARCH TYPES ── */}
      <section className="bg-gray-50 dark:bg-gray-950 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 font-sans">RESEARCH TYPES</span>
              <h2 className="text-2xl md:text-4xl font-black text-[#0d1f3c] dark:text-white uppercase leading-tight font-sans" style={{ letterSpacing: '-0.02em' }}>FIND THE<br />NURSING RESEARCH<br />YOU NEED</h2>
            </div>
            <Link to="/explore" className="self-start inline-flex items-center gap-2 px-6 py-3 bg-[#0d1f3c] dark:bg-blue-600 text-white font-bold uppercase text-sm tracking-widest hover:bg-blue-900 dark:hover:bg-blue-700 transition-all whitespace-nowrap font-sans">SHOW MORE →</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-3 md:gap-1 scrollbar-hide snap-x snap-mandatory">
            {TYPES.map((t, i) => (
              <Link to="/explore" key={i} className="group relative overflow-hidden bg-[#0d1f3c] block flex-shrink-0 w-72 md:w-auto snap-start rounded-xl md:rounded-none" style={{ aspectRatio: '3/4' }}>
                {homeImages.types[i]
                  ? <img src={homeImages.types[i]} alt={t.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] to-[#0d1f3c]" />
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors z-10"><ArrowRight size={14} className="text-[#0d1f3c] group-hover:text-white transition-colors" /></div>
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  <p className="text-xs text-white/60 font-semibold uppercase tracking-widest mb-1 font-sans">{t.sub}</p>
                  <h3 className="text-xl font-black text-white uppercase leading-tight mb-2 font-sans">{t.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed font-sans">{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#0d1f3c] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-blue-300 uppercase mb-3 font-sans">Join CONserve</p>
            <h2 className="text-2xl md:text-4xl font-black text-white uppercase leading-tight font-sans" style={{ letterSpacing: '-0.02em' }}>START YOUR RESEARCH<br />JOURNEY TODAY</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link to="/explore" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-white text-white font-bold uppercase text-sm tracking-widest hover:bg-white hover:text-[#0d1f3c] transition-all font-sans">BROWSE PAPERS →</Link>
            {!user && <Link to="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-bold uppercase text-sm tracking-widest hover:bg-blue-500 transition-all font-sans">REGISTER FREE →</Link>}
            {user && (user.role === 'student' || user.role === 'faculty') && (
              <button onClick={() => setShowSubmit(true)} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-bold uppercase text-sm tracking-widest hover:bg-blue-500 transition-all font-sans">SUBMIT PAPER →</button>
            )}
          </div>
        </div>
      </section>

      {showSubmit && <SubmitResearch onClose={() => setShowSubmit(false)} onSuccess={() => setShowSubmit(false)} />}
    </div>
  );
}