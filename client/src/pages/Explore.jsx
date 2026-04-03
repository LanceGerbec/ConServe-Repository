// client/src/pages/Explore.jsx
import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { Search, Filter, X, Eye, Calendar, BookOpen, SlidersHorizontal, Sparkles, Info, TrendingUp, Lightbulb, Grid, List, Award, ArrowUpDown, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── Debounce hook ─── */
const useDebounce = (value, delay) => {
  const [d, setD] = useState(value);
  useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return d;
};

const fuzzyMatch = (str, pattern) => {
  const p = pattern.toLowerCase().split('');
  const s = str.toLowerCase();
  let pi = 0;
  for (let si = 0; si < s.length && pi < p.length; si++) { if (s[si] === p[pi]) pi++; }
  return pi === p.length;
};

/* ─── Hero Banner Slideshow ─── */
const HeroBanner = memo(({ bannerImages }) => {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback((idx) => {
    if (idx === current) return;
    setFading(true);
    setTimeout(() => { setCurrent(idx); setFading(false); }, 600);
  }, [current]);

  const next = useCallback(() => goTo((current + 1) % bannerImages.length), [current, bannerImages.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + bannerImages.length) % bannerImages.length), [current, bannerImages.length, goTo]);

  useEffect(() => {
    if (paused || bannerImages.length <= 1) return;
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [next, paused, bannerImages.length]);

  if (!bannerImages.length) return null;

  const img = bannerImages[current];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl" style={{ height: 'clamp(180px, 38vw, 400px)' }}>
      {/* Slide image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${img.url})`,
          opacity: fading ? 0 : 1,
          transform: fading ? 'scale(1.03)' : 'scale(1)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy/30 to-transparent" />

      {/* Caption */}
      {img.caption && (
        <div className="absolute bottom-10 left-5 right-16 md:left-8">
          <p
            className="text-white font-bold text-sm md:text-base lg:text-lg drop-shadow-lg max-w-xl"
            style={{ opacity: fading ? 0 : 1, transform: fading ? 'translateY(8px)' : 'translateY(0)', transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s' }}
          >
            {img.caption}
          </p>
        </div>
      )}

      {/* Controls */}
      {bannerImages.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition">
            <ChevronLeft size={18} />
          </button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition">
            <ChevronRight size={18} />
          </button>
          <button onClick={() => setPaused(p => !p)} className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition">
            {paused ? <Play size={13} /> : <Pause size={13} />}
          </button>
          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {bannerImages.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`} />
            ))}
          </div>
          {/* Progress bar */}
          {!paused && (
            <div className="absolute bottom-0 left-0 h-0.5 bg-white/30 w-full">
              <div key={current} className="h-full bg-white/80" style={{ animation: 'progress-bar 5s linear forwards' }} />
            </div>
          )}
        </>
      )}

      {/* Slide counter */}
      <div className="absolute top-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full text-white text-xs font-bold">
        {current + 1} / {bannerImages.length}
      </div>
    </div>
  );
});
HeroBanner.displayName = 'HeroBanner';

/* ─── Award Badge ─── */
const AwardBadge = memo(({ award, small }) => {
  const colorMap = {
    gold: 'bg-yellow-50 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
    silver: 'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600',
    bronze: 'bg-orange-50 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700',
    blue: 'bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
    green: 'bg-green-50 dark:bg-green-900/40 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
    purple: 'bg-purple-50 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700'
  };
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onClick={() => setShow(s => !s)}>
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${colorMap[award.color] || colorMap.gold} text-xs font-bold cursor-pointer transition hover:scale-105`}>
        <Award size={small ? 10 : 12} />
        {!small && <span className="hidden sm:inline max-w-[80px] truncate">{award.name}</span>}
      </div>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-50 animate-fade-in border border-gray-700">
          {award.name}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
        </div>
      )}
    </div>
  );
});
AwardBadge.displayName = 'AwardBadge';

/* ─── Paper Card ─── */
const PaperCard = memo(({ paper, onClick, highlight, viewMode }) => {
  const hl = (text) => {
    if (!highlight || !text) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(regex).map((part, i) => regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/60 text-gray-900 dark:text-yellow-100 rounded px-0.5">{part}</mark> : part);
  };

  if (viewMode === 'list') {
    return (
      <div onClick={() => onClick(paper._id)} className="group bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700/60 p-3 cursor-pointer hover:shadow-lg hover:border-navy/40 dark:hover:border-accent/40 transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-navy/10 to-accent/10 dark:from-navy/30 dark:to-accent/30 rounded-lg flex items-center justify-center">
            <BookOpen size={18} className="text-navy dark:text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-navy dark:group-hover:text-accent transition-colors">{hl(paper.title)}</h3>
              <span className="px-2 py-0.5 bg-navy/10 text-navy dark:bg-accent/20 dark:text-accent rounded text-xs font-semibold whitespace-nowrap flex-shrink-0">{paper.category}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-1.5">{hl(paper.abstract)}</p>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><Eye size={10} />{paper.views || 0}</span>
                {paper.yearCompleted && <span className="flex items-center gap-1"><Calendar size={10} />{paper.yearCompleted}</span>}
              </div>
              {paper.awards?.length > 0 && (
                <div className="flex items-center gap-1">
                  {paper.awards.slice(0, 2).map((a, i) => <AwardBadge key={i} award={a} small />)}
                  {paper.awards.length > 2 && <span className="text-xs text-gray-500">+{paper.awards.length - 2}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => onClick(paper._id)} className="group bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700/60 p-4 cursor-pointer hover:shadow-xl hover:border-navy/40 dark:hover:border-accent/40 transition-all duration-200 hover:-translate-y-1 flex flex-col">
      <div className="flex items-start justify-between mb-2.5">
        <span className="px-2.5 py-1 bg-navy/10 text-navy dark:bg-accent/20 dark:text-accent rounded-lg text-xs font-bold">{paper.category}</span>
        <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500"><Eye size={11} />{paper.views || 0}</span>
      </div>
      <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-navy dark:group-hover:text-accent transition-colors leading-snug">{hl(paper.title)}</h3>
      <div className="mb-2 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600/50">
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1 font-medium">{hl(paper.authors?.join(' • '))}</p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2.5 line-clamp-2 flex-1 leading-relaxed">{hl(paper.abstract)}</p>
      {paper.awards?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {paper.awards.slice(0, 3).map((a, i) => <AwardBadge key={i} award={a} />)}
          {paper.awards.length > 3 && <span className="text-xs text-gray-500 self-center">+{paper.awards.length - 3}</span>}
        </div>
      )}
      <div className="flex flex-wrap gap-2 text-xs text-gray-400 dark:text-gray-500 pt-2.5 border-t border-gray-100 dark:border-gray-700/50 mt-auto">
        {paper.yearCompleted && <span className="flex items-center gap-1"><Calendar size={10} />{paper.yearCompleted}</span>}
        {paper.subjectArea && <span className="flex items-center gap-1 max-w-[55%]"><BookOpen size={10} /><span className="truncate">{paper.subjectArea}</span></span>}
      </div>
    </div>
  );
});
PaperCard.displayName = 'PaperCard';

/* ─── Tips Modal ─── */
const TipsModal = memo(({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-navy/20 dark:border-accent/30" onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 bg-navy/10 dark:bg-accent/20 rounded-xl flex items-center justify-center"><Lightbulb size={22} className="text-navy dark:text-accent" /></div>
        <div><h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Search Tips</h3><p className="text-xs text-gray-500 dark:text-gray-400">Master your search</p></div>
        <button onClick={onClose} className="ml-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X size={18} /></button>
      </div>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {[
          { color: 'blue', title: 'Simple Search', items: ['Type any keyword (diabetes, nursing…)', 'Auto-suggestions as you type', 'Fuzzy matching for similar terms'] },
          { color: 'purple', title: 'Advanced / Boolean', items: ['diabetes AND management', 'pediatric OR children', 'nursing NOT surgery', 'author:Reyes  or  year:2024'] },
          { color: 'yellow', title: 'Awards Filter', items: ['Hover badges to see award names', 'Color-coded award types', 'Recognized research highlighted'] },
        ].map(({ color, title, items }) => (
          <div key={title} className={`p-3 bg-${color}-50 dark:bg-${color}-900/30 rounded-xl border border-${color}-200 dark:border-${color}-700`}>
            <h4 className={`font-bold text-sm text-${color}-900 dark:text-${color}-200 mb-2`}>{title}</h4>
            <ul className={`text-xs text-${color}-800 dark:text-${color}-200 space-y-1`}>{items.map((it, i) => <li key={i}>• {it}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  </div>
));
TipsModal.displayName = 'TipsModal';

/* ─── Pagination ─── */
const Pagination = memo(({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange, totalItems }) => {
  const pages = useMemo(() => {
    const range = [], dots = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) range.push(i);
    }
    let prev = 0;
    for (const i of range) { if (prev + 1 !== i) dots.push('...'); dots.push(i); prev = i; }
    return dots;
  }, [currentPage, totalPages]);
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
        <span className="font-semibold">Showing {start}–{end} of {totalItems}</span>
        <select value={itemsPerPage} onChange={e => onItemsPerPageChange(Number(e.target.value))} className="px-2 py-1 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold">
          {[10,20,50,100].map(n => <option key={n} value={n}>{n}/page</option>)}
        </select>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition"><ChevronLeft size={16} /></button>
          {pages.map((page, idx) => page === '...' ? <span key={`d${idx}`} className="px-2 text-gray-500">…</span> : (
            <button key={page} onClick={() => onPageChange(page)} className={`min-w-[34px] px-2.5 py-1.5 rounded-lg font-bold text-xs transition ${currentPage === page ? 'bg-navy dark:bg-accent text-white shadow-md' : 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{page}</button>
          ))}
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition"><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
});
Pagination.displayName = 'Pagination';

/* ═══════════════════════════════════════ MAIN ═══════════════════════════════════════ */
const Explore = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [allPapers, setAllPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [bannerImages, setBannerImages] = useState([]);
  const [searchMode, setSearchMode] = useState('simple');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('exploreViewMode') || 'grid');
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('exploreSortBy') || 'relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => Number(localStorage.getItem('exploreItemsPerPage')) || 20);
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', yearCompleted: '', subjectArea: '', author: '' });
  const [activeFilters, setActiveFilters] = useState({ category: '', yearCompleted: '', subjectArea: '', author: '' });
  const [semantic, setSemantic] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    localStorage.setItem('exploreViewMode', viewMode);
  }, [viewMode]);
  useEffect(() => {
    localStorage.setItem('exploreSortBy', sortBy);
  }, [sortBy]);
  useEffect(() => {
    localStorage.setItem('exploreItemsPerPage', itemsPerPage);
    setCurrentPage(1);
  }, [itemsPerPage]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);
  useEffect(() => {
    if (initialLoad) fetchInitialData();
  }, []);
  useEffect(() => {
    if (debouncedQuery.length >= 2 && searchMode === 'simple') generateSuggestions(debouncedQuery);
    else { setSuggestions([]); setShowSuggestions(false); }
  }, [debouncedQuery, searchMode]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [res, recRes, settingsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/research?status=approved&limit=1000`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_URL}/search/recommendations?limit=6`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ ok: false })),
        fetch(`${import.meta.env.VITE_API_URL}/settings`).catch(() => ({ ok: false }))
      ]);
      if (res.ok) {
        const data = await res.json();
        const p = data.papers || [];
        setPapers(p); setAllPapers(p);
        setYears([...new Set(p.map(x => x.yearCompleted).filter(Boolean))].sort((a, b) => b - a));
        setSubjects([...new Set(p.map(x => x.subjectArea).filter(Boolean))].sort());
      }
      if (recRes.ok) { const d = await recRes.json(); setRecommendations(d.papers || []); }
      // Load hero banner images from settings
      if (settingsRes.ok) {
        const sd = await settingsRes.json();
        const logos = sd.settings?.logos || {};
        // Use heroBg as the primary banner; fallback to a curated set
        const imgs = [];
        if (logos.heroBg?.url) imgs.push({ url: logos.heroBg.url, caption: 'NEUST College of Nursing Research Repository' });
        // Append school/college logos as slides if no dedicated banners
        if (sd.settings?.bannerImages?.length) {
          sd.settings.bannerImages.forEach(b => imgs.push(b));
        }
        if (!imgs.length) {
          // Fallback gradient banner
          imgs.push({ url: '', caption: 'Discover Nursing Research at NEUST' });
        }
        setBannerImages(imgs);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setInitialLoad(false); }
  };

  const generateSuggestions = useCallback((q) => {
    const title = allPapers.filter(p => fuzzyMatch(p.title, q)).map(p => ({ text: p.title, type: 'title' })).slice(0, 3);
    const author = [...new Set(allPapers.flatMap(p => p.authors || []).filter(a => fuzzyMatch(a, q)))].map(a => ({ text: a, type: 'author' })).slice(0, 2);
    const kw = [...new Set(allPapers.flatMap(p => p.keywords || []).filter(k => fuzzyMatch(k, q)))].map(k => ({ text: k, type: 'keyword' })).slice(0, 2);
    const combined = [...title, ...author, ...kw].slice(0, 6);
    setSuggestions(combined); setShowSuggestions(combined.length > 0);
  }, [allPapers]);

  const sortedPapers = useMemo(() => {
    const s = [...papers];
    switch (sortBy) {
      case 'views-desc': return s.sort((a, b) => (b.views || 0) - (a.views || 0));
      case 'alpha-asc': return s.sort((a, b) => a.title.localeCompare(b.title));
      case 'alpha-desc': return s.sort((a, b) => b.title.localeCompare(a.title));
      case 'date-desc': return s.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'date-asc': return s.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'awards-desc': return s.sort((a, b) => (b.awards?.length || 0) - (a.awards?.length || 0));
      case 'year-desc': return s.sort((a, b) => (b.yearCompleted || 0) - (a.yearCompleted || 0));
      case 'year-asc': return s.sort((a, b) => (a.yearCompleted || 0) - (b.yearCompleted || 0));
      default: return s;
    }
  }, [papers, sortBy]);

  const paginatedPapers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedPapers.slice(start, start + itemsPerPage);
  }, [sortedPapers, currentPage, itemsPerPage]);
  const totalPages = Math.ceil(sortedPapers.length / itemsPerPage);

  const performSearch = async () => {
    setLoading(true); setActiveQuery(query); setActiveFilters(filters); setShowSuggestions(false); setCurrentPage(1);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ status: 'approved', limit: 1000,
        ...(query && { [searchMode === 'advanced' ? 'query' : 'search']: query }),
        ...(filters.category && { category: filters.category }),
        ...(filters.yearCompleted && { yearCompleted: filters.yearCompleted }),
        ...(filters.subjectArea && { subjectArea: filters.subjectArea }),
        ...(filters.author && { author: filters.author }),
        ...(searchMode === 'advanced' && semantic && { semantic: 'true' })
      });
      const endpoint = searchMode === 'advanced' ? '/search/advanced' : '/research';
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setPapers(d.papers || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const clearAll = useCallback(() => {
    setQuery(''); setActiveQuery('');
    setFilters({ category: '', yearCompleted: '', subjectArea: '', author: '' });
    setActiveFilters({ category: '', yearCompleted: '', subjectArea: '', author: '' });
    setSemantic(false); setSuggestions([]); setShowSuggestions(false); setSortBy('relevance'); setCurrentPage(1); setPapers(allPapers);
  }, [allPapers]);

  const activeCount = useMemo(() => Object.values(activeFilters).filter(Boolean).length + (activeQuery ? 1 : 0) + (semantic ? 1 : 0), [activeFilters, activeQuery, semantic]);

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' }, { value: 'views-desc', label: 'Most Viewed' },
    { value: 'date-desc', label: 'Newest' }, { value: 'date-asc', label: 'Oldest' },
    { value: 'alpha-asc', label: 'A → Z' }, { value: 'alpha-desc', label: 'Z → A' },
    { value: 'awards-desc', label: 'Most Awards' }, { value: 'year-desc', label: 'Year ↓' }, { value: 'year-asc', label: 'Year ↑' }
  ];

  if (initialLoad) return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-navy dark:border-accent mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Loading Research…</p>
      </div>
    </div>
  );

  return (
    <>
      {/* CSS for progress bar animation */}
      <style>{`@keyframes progress-bar { from { width: 0% } to { width: 100% } }`}</style>

      <div className="min-h-screen pb-8 bg-gray-50 dark:bg-gray-950">
        {/* ── Hero Banner ── */}
        <div className="mb-5">
          {bannerImages.some(b => b.url) ? (
            <HeroBanner bannerImages={bannerImages.filter(b => b.url)} />
          ) : (
            /* Gradient fallback hero */
            <div className="relative w-full overflow-hidden rounded-2xl shadow-xl" style={{ height: 'clamp(140px, 28vw, 280px)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-navy via-blue-700 to-accent" />
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)' }} />
              {/* Animated dots */}
              <div className="absolute inset-0 overflow-hidden opacity-20">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="absolute rounded-full bg-white" style={{ width: `${6 + (i % 4) * 4}px`, height: `${6 + (i % 4) * 4}px`, top: `${10 + (i * 17) % 80}%`, left: `${5 + (i * 13) % 90}%`, animation: `pulse ${2 + (i % 3)}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }} />
                ))}
              </div>
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-6 text-center">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen size={28} className="opacity-90" />
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight">Explore Research</h1>
                </div>
                <p className="text-blue-100 text-sm md:text-base opacity-90">Discover nursing research papers from NEUST College of Nursing</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-blue-200">
                  <span className="flex items-center gap-1.5"><BookOpen size={12} />{allPapers.length} Papers</span>
                  <span className="w-px h-3 bg-white/30" />
                  <span className="flex items-center gap-1.5"><Award size={12} />Award-Winning Research</span>
                  <span className="w-px h-3 bg-white/30" />
                  <span className="flex items-center gap-1.5"><Sparkles size={12} />AI-Powered Search</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Search Panel ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-5">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button onClick={() => setSearchMode('simple')} className={`px-3 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${searchMode === 'simple' ? 'bg-navy text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              <Search size={15} />Simple
            </button>
            <button onClick={() => setSearchMode('advanced')} className={`px-3 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${searchMode === 'advanced' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              <Sparkles size={15} />Advanced
            </button>
          </div>

          {/* Search Input */}
          <form onSubmit={e => { e.preventDefault(); performSearch(); }} className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              <input
                type="text" value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => suggestions.length && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={searchMode === 'advanced' ? 'e.g. diabetes AND management' : 'Search by title, author, keyword…'}
                className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm transition"
              />
              {query && <button type="button" onClick={() => { setQuery(''); setSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={16} /></button>}
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border-2 border-navy/20 dark:border-accent/30 rounded-xl shadow-2xl z-20 overflow-hidden">
                  {suggestions.map((s, i) => (
                    <button key={i} type="button" onClick={() => { setQuery(s.text); setShowSuggestions(false); setTimeout(performSearch, 100); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center gap-2.5 transition">
                      {s.type === 'title' && <BookOpen size={13} className="text-blue-500 flex-shrink-0" />}
                      {s.type === 'author' && <Search size={13} className="text-green-500 flex-shrink-0" />}
                      {s.type === 'keyword' && <Sparkles size={13} className="text-purple-500 flex-shrink-0" />}
                      <span className="text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{s.text}</span>
                      <span className="ml-auto text-xs text-gray-400 capitalize">{s.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-2 gap-2">
              <button type="submit" disabled={loading} className="py-2.5 bg-navy hover:bg-navy-800 text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg">
                {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Search size={16} />}
                {loading ? 'Searching…' : 'Search'}
              </button>
              <button type="button" onClick={() => setShowFilters(f => !f)} className={`py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition border-2 ${showFilters ? 'bg-navy text-white border-navy shadow-md' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>
                <SlidersHorizontal size={16} />Filters{activeCount > 0 && <span className="bg-red-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full leading-none">{activeCount}</span>}
              </button>
            </div>

            {/* Semantic toggle */}
            {searchMode === 'advanced' && (
              <label className="flex items-center gap-2.5 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-700 cursor-pointer">
                <input type="checkbox" checked={semantic} onChange={e => setSemantic(e.target.checked)} className="w-4 h-4 rounded accent-purple-600" />
                <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-purple-900 dark:text-purple-200">AI Semantic Search</span>
              </label>
            )}

            {/* Tips hint */}
            <button type="button" onClick={() => setShowTips(true)} className="w-full flex items-center gap-2 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700 text-left hover:bg-blue-100 dark:hover:bg-blue-900/30 transition">
              <Info size={13} className="text-blue-500 flex-shrink-0" />
              <span className="text-xs text-blue-800 dark:text-blue-200 font-medium">{searchMode === 'simple' ? 'Tip: type to see suggestions · click for all search tips' : 'Use AND · OR · NOT · field:value — click for examples'}</span>
            </button>

            {/* Filter Dropdowns */}
            {showFilters && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2 animate-fade-in">
                {[
                  { label: 'Category', key: 'category', options: [['', 'All Categories'], ['Completed', 'Completed'], ['Published', 'Published']] },
                ].map(({ label, key, options }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                    <select value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))} className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100">
                      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Year Completed</label>
                  <select value={filters.yearCompleted} onChange={e => setFilters(f => ({ ...f, yearCompleted: e.target.value }))} className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100">
                    <option value="">All Years</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Subject Area</label>
                  <select value={filters.subjectArea} onChange={e => setFilters(f => ({ ...f, subjectArea: e.target.value }))} className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100">
                    <option value="">All Subjects</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <input type="text" value={filters.author} onChange={e => setFilters(f => ({ ...f, author: e.target.value }))} placeholder="Author name…" className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button type="button" onClick={clearAll} className="py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"><X size={14} />Clear</button>
                  <button type="button" onClick={() => { performSearch(); setShowFilters(false); }} className="py-2 bg-navy hover:bg-navy-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition"><Filter size={14} />Apply</button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* ── Results Header ── */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <p className="text-sm text-gray-600 dark:text-gray-300 flex-shrink-0">
            <strong className="text-navy dark:text-accent text-base">{sortedPapers.length}</strong> papers
            {activeCount > 0 && <button onClick={clearAll} className="ml-2 text-xs text-red-500 hover:text-red-600 font-bold flex items-center gap-0.5 inline-flex"><X size={11} />clear</button>}
          </p>
          <div className="flex items-center gap-2">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs border-2 border-gray-300 dark:border-gray-600 rounded-xl px-2.5 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold focus:border-navy dark:focus:border-accent focus:outline-none">
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 p-1 rounded-xl flex-shrink-0">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-600' : ''}`}><Grid size={16} className={viewMode === 'grid' ? 'text-navy dark:text-accent' : 'text-gray-500'} /></button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-600' : ''}`}><List size={16} className={viewMode === 'list' ? 'text-navy dark:text-accent' : 'text-gray-500'} /></button>
            </div>
          </div>
        </div>

        {/* ── Recommendations (when no active search) ── */}
        {!activeQuery && recommendations.length > 0 && (
          <div className="mb-5 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-700/50">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-600 dark:text-purple-400" />Recommended for You
            </h2>
            <div className="space-y-2">
              {recommendations.slice(0, 3).map(paper => (
                <div key={paper._id} onClick={() => navigate(`/research/${paper._id}`)} className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-purple-100 dark:border-purple-700/40 cursor-pointer hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500 transition-all group">
                  <span className="inline-block px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold mb-1">{paper.category}</span>
                  <h3 className="font-bold text-xs text-gray-900 dark:text-gray-100 line-clamp-1 mb-1 group-hover:text-navy dark:group-hover:text-accent transition-colors">{paper.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{paper.abstract}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Papers Grid / List ── */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-navy dark:border-accent mx-auto mb-3" />
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Searching…</p>
            </div>
          </div>
        ) : sortedPapers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <BookOpen size={44} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">No papers found</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Try different keywords or clear your filters</p>
            {activeCount > 0 && <button onClick={clearAll} className="px-5 py-2 bg-navy hover:bg-navy-800 text-white rounded-xl font-bold text-sm transition shadow-md">Show All Papers</button>}
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5' : 'space-y-3 mb-5'}>
              {paginatedPapers.map(paper => (
                <PaperCard key={paper._id} paper={paper} onClick={id => navigate(`/research/${id}`)} highlight={activeQuery} viewMode={viewMode} />
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage} totalItems={sortedPapers.length} />
            </div>
          </>
        )}
      </div>

      {showTips && <TipsModal onClose={() => setShowTips(false)} />}
    </>
  );
};

export default Explore;