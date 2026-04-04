import { Link } from 'react-router-dom';
import { ArrowRight, Check, BookOpen, FileText, Shield, Award, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import SubmitResearch from '../components/research/SubmitResearch';

/* ── Hero Slideshow ── */
const HeroSlideshow = ({ slides }) => {
  const [cur, setCur] = useState(0);
  const [fading, setFading] = useState(false);
  const [paused, setPaused] = useState(false);
  const len = slides.length;

  const go = useCallback((idx) => {
    if (fading || idx === cur) return;
    setFading(true);
    setTimeout(() => { setCur(idx); setFading(false); }, 600);
  }, [cur, fading]);

  const next = useCallback(() => go((cur + 1) % len), [cur, len, go]);
  const back = useCallback(() => go((cur - 1 + len) % len), [cur, len, go]);

  useEffect(() => {
    if (paused || len <= 1) return;
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next, paused, len]);

  const slide = slides[cur] || {};

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: '520px' }}>
      {/* BG */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: slide.url ? `url(${slide.url})` : 'none', opacity: fading ? 0 : 1, transition: 'opacity 0.7s ease' }}
      />
      {!slide.url && <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#0a1628]" />}
      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628]/85 via-[#0d1f3c]/60 to-transparent" />

      {/* wave curve bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <svg viewBox="0 0 1440 90" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none" style={{ height: '90px', display: 'block' }}>
          <path d="M0,0 C360,90 1080,0 1440,60 L1440,90 L0,90 Z" className="fill-gray-50 dark:fill-gray-950" />
        </svg>
      </div>

      {/* content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-36">
        <div className="max-w-xl" style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.5s ease 0.1s' }}>
          <p className="text-xs font-bold tracking-[0.25em] text-blue-300 uppercase mb-4">NEUST College of Nursing</p>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase leading-tight mb-5" style={{ fontFamily: '"Georgia", serif', letterSpacing: '-0.01em' }}>
            {slide.headline || <>{`DISCOVER\nNURSING\nRESEARCH OF\nYOUR DREAMS`}</>}
          </h1>
          <p className="text-sm md:text-base text-white/70 mb-8 leading-relaxed max-w-sm">
            {slide.sub || 'Access peer-reviewed nursing papers from NEUST. Collaborate, submit, and cite with ease.'}
          </p>
          <Link to="/explore"
            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white text-white font-bold uppercase text-sm tracking-widest hover:bg-white hover:text-[#0d1f3c] transition-all duration-200">
            EXPLORE →
          </Link>
        </div>
      </div>

      {/* nav controls */}
      {len > 1 && (
        <>
          <button onClick={back} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition z-20"><ChevronLeft size={20} /></button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition z-20"><ChevronRight size={20} /></button>
          <button onClick={() => setPaused(p => !p)} className="absolute top-4 right-16 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white z-20 transition">
            {paused ? <Play size={11} /> : <Pause size={11} />}
          </button>
          <div className="absolute bottom-24 right-8 flex gap-2 z-20">
            {slides.map((_, i) => (
              <button key={i} onClick={() => go(i)}
                className={`rounded-full transition-all duration-300 ${i === cur ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`} />
            ))}
          </div>
          {!paused && (
            <div className="absolute bottom-[88px] left-0 w-full h-0.5 bg-white/10 z-20">
              <div key={cur} className="h-full bg-white/50" style={{ animation: 'hprogress 5.5s linear forwards' }} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ── Floating image card ── */
const FloatCard = ({ url, delay = 0, className = '' }) => (
  <div
    className={`overflow-hidden shadow-2xl bg-[#0d1f3c] ${className}`}
    style={{ animation: `floatCard 4s ease-in-out ${delay}s infinite`, borderRadius: '16px' }}
  >
    {url
      ? <img src={url} alt="" className="w-full h-full object-cover" />
      : <div className="w-full h-full bg-gradient-to-br from-[#1e3a8a] to-[#0d1f3c] flex items-center justify-center">
          <BookOpen size={28} className="text-blue-400 opacity-40" />
        </div>
    }
  </div>
);

/* ── Main ── */
export default function Home() {
  const { user } = useAuth();
  const [showSubmit, setShowSubmit] = useState(false);
  const [slides, setSlides] = useState([{ url: '', headline: 'DISCOVER NURSING RESEARCH OF YOUR DREAMS', sub: 'Access peer-reviewed nursing papers from NEUST. Collaborate, submit, and cite with ease.' }]);
  const [galleryImgs, setGalleryImgs] = useState(['', '', '']);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/settings`).then(r => r.json()).then(d => {
      const s = d.settings || {};
      const imgs = [];
      if (s.logos?.heroBg?.url) imgs.push({ url: s.logos.heroBg.url, headline: 'DISCOVER NURSING RESEARCH OF YOUR DREAMS', sub: 'Access peer-reviewed nursing papers from NEUST.' });
      (s.bannerImages || []).forEach(b => imgs.push({ url: b.url, headline: (b.caption || 'EXPLORE NURSING RESEARCH').toUpperCase(), sub: 'Discover, cite, and collaborate on nursing research.' }));
      if (imgs.length) setSlides(imgs);
      const gi = (s.bannerImages || []).map(b => b.url);
      setGalleryImgs([gi[0] || '', gi[1] || '', gi[2] || '']);
    }).catch(() => {});
  }, []);

  const SERVICES = [
    { icon: BookOpen, title: 'Research Papers', desc: 'Browse hundreds of peer-reviewed nursing papers organized by subject, category, and year.' },
    { icon: Shield, title: 'IP Protection', desc: 'All papers protected under RA 10173. Digital watermarking and access logging included.' },
    { icon: FileText, title: 'Easy Submission', desc: 'Submit your IMRaD-formatted research with guided steps and receive real-time status updates.' },
    { icon: Award, title: 'Recognition', desc: 'Top papers get awarded and featured, boosting your academic visibility across the repository.' },
  ];

  const TYPES = [
    { title: 'COMPLETED RESEARCH', sub: 'More than 200 papers', desc: 'Finalized nursing research papers completed by students and faculty at NEUST College of Nursing.' },
    { title: 'PUBLISHED RESEARCH', sub: 'More than 100 papers', desc: 'Formally published nursing studies available for citation and academic reference.' },
    { title: 'FACULTY WORKS', sub: 'More than 500 users', desc: 'Research contributed by NEUST nursing faculty — a wealth of expertise and academic insight.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-x-hidden">
      <style>{`
        @keyframes hprogress { from { width: 0 } to { width: 100% } }
        @keyframes floatCard {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          33%      { transform: translateY(-12px) rotate(0.6deg); }
          66%      { transform: translateY(-6px) rotate(-0.4deg); }
        }
      `}</style>

      {/* ══ HERO ══ */}
      <HeroSlideshow slides={slides} />

      {/* ══ ABOUT + FLOATING IMAGES ══ */}
      <section className="bg-gray-50 dark:bg-gray-950 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* LEFT: floating cards */}
          <div className="relative" style={{ height: '460px' }}>
            {/* stat top-left */}
            <div className="absolute top-0 left-0 z-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl px-6 py-4 border border-gray-100 dark:border-gray-700">
              <p className="text-4xl font-black text-[#0d1f3c] dark:text-white leading-none">500+</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Research Papers</p>
            </div>

            {/* top-right tall card */}
            <FloatCard url={galleryImgs[0]} delay={0}
              className="absolute top-6 right-0 w-52"
              style={{ height: '210px' }}
            />

            {/* bottom-left card */}
            <FloatCard url={galleryImgs[1]} delay={0.9}
              className="absolute bottom-0 left-0 w-52"
              style={{ height: '190px' }}
            />

            {/* stat bottom over right card */}
            <div className="absolute bottom-20 right-0 z-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl px-5 py-3 border border-gray-100 dark:border-gray-700">
              <p className="text-3xl font-black text-[#0d1f3c] dark:text-white leading-none">300+</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Active Users</p>
            </div>

            {/* bottom-right small card */}
            <FloatCard url={galleryImgs[2]} delay={1.7}
              className="absolute bottom-0 right-0 w-36"
              style={{ height: '150px' }}
            />
          </div>

          {/* RIGHT: text */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6">
              ABOUT US
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#0d1f3c] dark:text-white uppercase leading-tight mb-5" style={{ fontFamily: '"Georgia", serif' }}>
              FIND AND EXPLORE<br />THE RESEARCH<br />OF YOUR DREAMS
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              CONserve is the official research repository of NEUST's College of Nursing — a secure, organized, IP-protected platform for nursing research discovery and submission.
            </p>
            <div className="space-y-3 mb-8">
              {['Peer-reviewed nursing papers', 'Secure IP protection under RA 10173', 'Faculty and student collaboration tools'].map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#0d1f3c] dark:bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Check size={11} className="text-white" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t}</span>
                </div>
              ))}
            </div>
            <Link to="/explore"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0d1f3c] dark:bg-blue-600 text-white font-bold uppercase text-sm tracking-widest hover:bg-blue-900 dark:hover:bg-blue-700 transition-all">
              EXPLORE →
            </Link>
          </div>
        </div>
      </section>

      {/* ══ SERVICES — dark navy ══ */}
      <section className="bg-[#0d1f3c] py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {SERVICES.map((s, i) => (
            <div key={i} className="group border-l border-white/10 pl-6 hover:border-blue-400 transition-colors cursor-default">
              <div className="w-10 h-10 border border-white/20 group-hover:border-blue-400 flex items-center justify-center mb-4 transition-colors">
                <s.icon size={20} className="text-white/60 group-hover:text-blue-300 transition-colors" />
              </div>
              <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wide">{s.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ RESEARCH TYPES ══ */}
      <section className="bg-gray-50 dark:bg-gray-950 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
                RESEARCH TYPES
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[#0d1f3c] dark:text-white uppercase leading-tight" style={{ fontFamily: '"Georgia", serif' }}>
                WHICH RESEARCH<br />TYPE SUITS<br />YOU BEST?
              </h2>
            </div>
            <Link to="/explore"
              className="self-start inline-flex items-center gap-2 px-8 py-3.5 bg-[#0d1f3c] dark:bg-blue-600 text-white font-bold uppercase text-sm tracking-widest hover:bg-blue-900 dark:hover:bg-blue-700 transition-all whitespace-nowrap">
              SHOW MORE →
            </Link>
          </div>

          {/* 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {TYPES.map((t, i) => (
              <Link to="/explore" key={i}
                className="group relative overflow-hidden bg-[#0d1f3c] block"
                style={{ minHeight: '380px' }}
              >
                {galleryImgs[i]
                  ? <img src={galleryImgs[i]} alt={t.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] to-[#0d1f3c]" />
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* arrow */}
                <div className="absolute top-5 right-5 w-9 h-9 bg-white rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors z-10">
                  <ArrowRight size={16} className="text-[#0d1f3c] group-hover:text-white transition-colors" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <p className="text-xs text-white/60 font-semibold uppercase tracking-widest mb-1">{t.sub}</p>
                  <h3 className="text-2xl font-black text-white uppercase leading-tight mb-2" style={{ fontFamily: '"Georgia", serif' }}>{t.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BOTTOM CTA ══ */}
      <section className="bg-[#0d1f3c] py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-blue-300 uppercase mb-3">Join CONserve</p>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight" style={{ fontFamily: '"Georgia", serif' }}>
              START YOUR RESEARCH<br />JOURNEY TODAY
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/explore"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-bold uppercase text-sm tracking-widest hover:bg-white hover:text-[#0d1f3c] transition-all">
              BROWSE PAPERS →
            </Link>
            {!user && (
              <Link to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold uppercase text-sm tracking-widest hover:bg-blue-500 transition-all">
                REGISTER FREE →
              </Link>
            )}
            {user && (user.role === 'student' || user.role === 'faculty') && (
              <button onClick={() => setShowSubmit(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold uppercase text-sm tracking-widest hover:bg-blue-500 transition-all">
                SUBMIT PAPER →
              </button>
            )}
          </div>
        </div>
      </section>

      {showSubmit && <SubmitResearch onClose={() => setShowSubmit(false)} onSuccess={() => setShowSubmit(false)} />}
    </div>
  );
}