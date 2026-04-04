import { Link } from 'react-router-dom';
import { ArrowRight, Search, MapPin, Star, BookOpen, Shield, Users, ChevronLeft, ChevronRight, Play, Pause, FileText, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import SubmitResearch from '../components/research/SubmitResearch';

const FADE_DURATION = 700;

/* ─── safer interval hook ─── */
const useInterval = (callback, delay) => {
  const savedCallback = useRef();
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current && savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
};

/* ─── HERO SLIDESHOW ─── */
const HeroSlideshow = ({ slides }) => {
  if (!slides || slides.length === 0) return null;

  const [cur, setCur] = useState(0);
  const [prev, setPrev] = useState(null);
  const [fading, setFading] = useState(false);
  const [paused, setPaused] = useState(false);

  const len = slides.length;

  const go = useCallback((idx) => {
    if (fading || idx === cur) return;
    setPrev(cur);
    setFading(true);
    setTimeout(() => {
      setCur(idx);
      setPrev(null);
      setFading(false);
    }, FADE_DURATION);
  }, [cur, fading]);

  useInterval(() => {
    setCur(c => (c + 1) % len);
  }, paused || len <= 1 ? null : 5000);

  const slide = slides[cur];
  const prevSlide = prev !== null ? slides[prev] : null;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl" style={{ height: 'clamp(320px, 48vw, 520px)' }}>
      {prevSlide && (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${prevSlide.url})`, opacity: fading ? 0 : 1, transition: `opacity ${FADE_DURATION}ms ease` }} />
      )}

      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.url || ''})`, opacity: 1, transition: `opacity ${FADE_DURATION}ms ease` }}>
        {!slide.url && <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-700 to-sky-500" />}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />

      {/* indicators */}
      {len > 1 && (
        <div className="absolute left-5 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
          {slides.map((_, i) => (
            <button key={i} aria-label={`Go to slide ${i+1}`} onClick={() => go(i)} className={`w-2 rounded-full ${i===cur?'h-8 bg-white':'h-2 bg-white/40'}`} />
          ))}
        </div>
      )}

      {/* content */}
      <div className="relative z-10 h-full flex flex-col justify-center pl-16 pr-6 md:pl-20 md:pr-60">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4">{slide.headline}</h1>
        <p className="text-white/80 mb-6 max-w-md">{slide.sub}</p>

        <div className="flex gap-3 flex-wrap">
          <Link to="/explore" className="px-6 py-3 bg-blue-600 text-white rounded-full">Explore Research <ArrowRight size={16}/></Link>
          <Link to="/about" className="px-5 py-3 bg-white/20 text-white rounded-full">Learn More</Link>
        </div>
      </div>

      {/* controls */}
      {len > 1 && (
        <>
          <button aria-label="Previous slide" onClick={() => go((cur-1+len)%len)} className="absolute left-10 top-1/2 -translate-y-1/2"><ChevronLeft/></button>
          <button aria-label="Next slide" onClick={() => go((cur+1)%len)} className="absolute right-4 top-1/2 -translate-y-1/2"><ChevronRight/></button>
          <button aria-label="Toggle autoplay" onClick={() => setPaused(p=>!p)} className="absolute top-4 right-4">{paused?<Play size={12}/>:<Pause size={12}/>}</button>
        </>
      )}
    </div>
  );
};

/* ─── DATA ─── */
const WHY = [
  { icon: Shield, title: 'IP Protected', loc: 'RA 10173 Compliant', rating: 5.0 },
  { icon: Search, title: 'Smart Search', loc: 'AI + Boolean', rating: 4.9 },
  { icon: Users, title: 'Collaborate', loc: 'Students & Faculty', rating: 4.8 }
];

const STEPS = [
  { icon: Search, title: 'Find Research', desc: 'Search instantly using smart filters.' },
  { icon: FileText, title: 'Submit Paper', desc: 'Upload and track research easily.' },
  { icon: Award, title: 'Get Recognized', desc: 'Gain visibility and citations.' }
];

const STATS = [
  { value: '500+', label: 'Research Papers' },
  { value: '1,200+', label: 'Users' },
  { value: '98%', label: 'Satisfaction' },
  { value: '4', label: 'Citation Styles' }
];

/* ─── MAIN ─── */
export default function Home() {
  const { user } = useAuth();
  const [showSubmit, setShowSubmit] = useState(false);
  const [slides, setSlides] = useState([{ url:'', headline:'Advancing Nursing Research', sub:'Explore and contribute research.' }]);

  useEffect(() => {
    let mounted = true;
    fetch(`${import.meta.env.VITE_API_URL}/settings`)
      .then(r=>r.json())
      .then(d=>{
        if(!mounted) return;
        const s=d.settings||{};
        const imgs=[];
        if(s.logos?.heroBg?.url) imgs.push({ url:s.logos.heroBg.url, headline:'Advancing Nursing Research', sub:'Explore peer-reviewed papers.' });
        (s.bannerImages||[]).forEach((b,i)=> imgs.push({ url:b.url, headline:b.caption||`Research ${i+1}`, sub:'Discover and collaborate.' }));
        if(imgs.length) setSlides(imgs);
      }).catch(()=>{});
    return ()=>{ mounted=false };
  },[]);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <section className="px-4 pt-6 pb-10 max-w-7xl mx-auto">
        <HeroSlideshow slides={slides} />
      </section>

      {/* WHY */}
      <section className="py-16 max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-6">
        {WHY.map((w,i)=> (
          <div key={i} className="bg-white p-6 rounded-xl shadow">
            <w.icon className="mb-3"/>
            <h3 className="font-bold">{w.title}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={12}/>{w.loc}</p>
            <p className="text-sm flex items-center gap-1"><Star size={12}/> {w.rating}</p>
          </div>
        ))}
      </section>

      {/* STEPS */}
      <section className="py-16 bg-white text-center">
        <h2 className="text-3xl font-black mb-8">Research Made Simple</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {STEPS.map((s,i)=> (
            <div key={i} className="p-6 border rounded-xl">
              <s.icon className="mb-3"/>
              <h3 className="font-bold">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {STATS.map((s,i)=> (
          <div key={i}>
            <p className="text-3xl font-black text-blue-600">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-black mb-4">Unleash Your Research Potential</h2>
        <Link to={user?'/explore':'/register'} className="px-8 py-4 bg-black text-white rounded-xl">
          {user?'Browse Papers':'Join Now'} <ArrowRight size={16}/>
        </Link>
      </section>

      {showSubmit && <SubmitResearch onClose={()=>setShowSubmit(false)} onSuccess={()=>setShowSubmit(false)} />}
    </div>
  );
}
