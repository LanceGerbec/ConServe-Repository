import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Search, Filter, X, Eye, Calendar, BookOpen, SlidersHorizontal, Sparkles, Info, TrendingUp, Lightbulb, Grid, List, Award, ArrowUpDown, ChevronLeft, ChevronRight, Crown, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const fuzzyMatch = (str, pattern) => {
  const p = pattern.toLowerCase().split('');
  const s = str.toLowerCase();
  let pi = 0;
  for (let si = 0; si < s.length && pi < p.length; si++) {
    if (s[si] === p[pi]) pi++;
  }
  return pi === p.length;
};

const SUBJECT_COLORS = [
  'border-yellow-400 text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20',
  'border-blue-400 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20',
  'border-green-400 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20',
  'border-purple-400 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20',
  'border-pink-400 text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-900/20',
  'border-orange-400 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20',
  'border-teal-400 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20',
];

const CATEGORY_STYLES = {
  Published: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-600',
  Completed: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-600',
};

const CARD_BORDER_COLORS = [
  'border-l-yellow-400', 'border-l-blue-400', 'border-l-green-400',
  'border-l-purple-400', 'border-l-pink-400', 'border-l-orange-400', 'border-l-teal-400',
];

const AwardBadge = memo(({ award, small }) => {
  const colorMap = {
    gold: 'bg-yellow-50 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
    silver: 'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600',
    bronze: 'bg-orange-50 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700',
    blue: 'bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
    green: 'bg-green-50 dark:bg-green-900/40 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
    purple: 'bg-purple-50 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700'
  };
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)} onClick={() => setShowTooltip(!showTooltip)}>
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${colorMap[award.color] || colorMap.gold} ${small ? 'text-xs' : 'text-xs'} font-bold cursor-pointer transition hover:scale-105`}>
        <Award size={small ? 10 : 11} />
        <span className="max-w-[80px] truncate">{award.name}</span>
      </div>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-50 animate-fade-in border border-gray-700">
          {award.name}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
});
AwardBadge.displayName = 'AwardBadge';

// Subject color mapping helper
const useSubjectColorMap = (papers) => useMemo(() => {
  const map = {};
  const subjects = [...new Set(papers.map(p => p.subjectArea).filter(Boolean))];
  subjects.forEach((s, i) => { map[s] = SUBJECT_COLORS[i % SUBJECT_COLORS.length]; });
  return map;
}, [papers]);

const PaperCard = memo(({ paper, onClick, highlight, viewMode, colorIndex, subjectColorMap }) => {
  const borderColor = CARD_BORDER_COLORS[colorIndex % CARD_BORDER_COLORS.length];
  const subjectColor = paper.subjectArea ? subjectColorMap[paper.subjectArea] || SUBJECT_COLORS[0] : '';

  const highlightText = (text) => {
    if (!highlight || !text) return text;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/60 text-gray-900 dark:text-yellow-100 rounded">{part}</mark> : part
    );
  };

  if (viewMode === 'list') {
    return (
      <div onClick={() => onClick(paper._id)} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 ${borderColor} p-3 cursor-pointer hover:shadow-md transition`}>
        <div className="flex gap-3 items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${CATEGORY_STYLES[paper.category] || 'bg-gray-100 text-gray-700'}`}>{paper.category}</span>
              {paper.awards?.length > 0 && paper.awards.slice(0,2).map((a,i) => <AwardBadge key={i} award={a} small />)}
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">{highlightText(paper.title)}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-1">{paper.authors?.join(' • ')}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><Eye size={10} />{paper.views || 0}</span>
              {paper.yearCompleted && <span className="flex items-center gap-1"><Calendar size={10} />{paper.yearCompleted}</span>}
              {paper.subjectArea && <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${subjectColor}`}>{paper.subjectArea}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => onClick(paper._id)} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 ${borderColor} p-4 cursor-pointer hover:shadow-md transition`}>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${CATEGORY_STYLES[paper.category] || 'bg-gray-100 text-gray-700'}`}>{paper.category}</span>
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ml-auto"><Eye size={11} />{paper.views || 0}</div>
      </div>
      <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">{highlightText(paper.title)}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">{paper.authors?.join(' • ')}</p>
      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{highlightText(paper.abstract)}</p>
      {paper.awards?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {paper.awards.slice(0,2).map((a,i) => <AwardBadge key={i} award={a} />)}
          {paper.awards.length > 2 && <span className="text-xs text-gray-400">+{paper.awards.length-2}</span>}
        </div>
      )}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
        {paper.yearCompleted && <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Calendar size={10} />{paper.yearCompleted}</span>}
        {paper.subjectArea && <span className={`px-2 py-0.5 rounded-full border text-xs font-medium truncate max-w-[120px] ${subjectColor}`}>{paper.subjectArea}</span>}
      </div>
    </div>
  );
});
PaperCard.displayName = 'PaperCard';

// Featured paper card (horizontal, prominent)
const FeaturedCard = memo(({ paper, onClick, index, subjectColorMap }) => {
  const borderColors = ['border-t-yellow-400', 'border-t-blue-400', 'border-t-green-400'];
  const borderColor = borderColors[index % borderColors.length];
  const subjectColor = paper.subjectArea ? subjectColorMap[paper.subjectArea] || SUBJECT_COLORS[0] : '';
  return (
    <div onClick={() => onClick(paper._id)} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 border-t-4 ${borderColor} p-4 cursor-pointer hover:shadow-md transition flex flex-col`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${CATEGORY_STYLES[paper.category] || 'bg-gray-100 text-gray-700'}`}>{paper.category}</span>
        <span className="flex items-center gap-1 text-xs text-gray-500 ml-auto"><Eye size={11} />{paper.views || 0}</span>
      </div>
      <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1 flex-1">{paper.title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">{paper.authors?.join(' • ')}</p>
      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{paper.abstract}</p>
      {paper.awards?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {paper.awards.slice(0,2).map((a,i) => <AwardBadge key={i} award={a} />)}
        </div>
      )}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
        {paper.yearCompleted && <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Calendar size={10} />{paper.yearCompleted}</span>}
        {paper.subjectArea && <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${subjectColor}`}>{paper.subjectArea}</span>}
      </div>
    </div>
  );
});
FeaturedCard.displayName = 'FeaturedCard';

const TipsModal = memo(({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-navy/20 dark:border-accent/30" onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-navy/10 dark:bg-accent/20 rounded-xl flex items-center justify-center">
          <Lightbulb size={20} className="text-navy dark:text-accent" />
        </div>
        <div><h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Search Tips</h3><p className="text-xs text-gray-500 dark:text-gray-400">Master your search</p></div>
        <button onClick={onClose} className="ml-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"><X size={18} className="text-gray-600 dark:text-gray-300" /></button>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {[
          { color: 'blue', icon: Search, title: 'Simple Search', items: ['Type any keyword (diabetes, nursing, etc.)', 'Auto-suggestions appear as you type', 'Fuzzy matching finds similar terms'] },
          { color: 'purple', icon: Sparkles, title: 'Advanced Search', items: ['AND - diabetes AND management', 'OR - pediatric OR children', 'NOT - nursing NOT surgery'] },
          { color: 'green', icon: ArrowUpDown, title: 'Sorting', items: ['Most Viewed - Popular papers first', 'Alphabetical - A-Z sorting', 'By Date - Newest or oldest', 'Most Awards - Award-winning first'] },
        ].map(({ color, icon: Icon, title, items }) => (
          <div key={title} className={`p-3 bg-${color}-50 dark:bg-${color}-900/30 rounded-lg border border-${color}-200 dark:border-${color}-700`}>
            <h4 className={`font-semibold text-sm text-${color}-900 dark:text-${color}-200 mb-2 flex items-center gap-2`}><Icon size={14} />{title}</h4>
            <ul className={`text-xs text-${color}-800 dark:text-${color}-200 space-y-1`}>{items.map(i => <li key={i}>• {i}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  </div>
));
TipsModal.displayName = 'TipsModal';

const Pagination = memo(({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange, totalItems }) => {
  const pages = useMemo(() => {
    const delta = 1, range = [], rangeWithDots = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) range.push(i);
    }
    let prev = 0;
    for (const i of range) {
      if (prev + 1 !== i) rangeWithDots.push('...');
      rangeWithDots.push(i);
      prev = i;
    }
    return rangeWithDots;
  }, [currentPage, totalPages]);

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-xs text-gray-600 dark:text-gray-300">
        <span className="font-semibold">Showing {start}–{end} of {totalItems}</span>
        <select value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))} className="px-2 py-1 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold">
          {[10,20,50,100].map(n => <option key={n} value={n}>{n}/page</option>)}
        </select>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <ChevronLeft size={16} className="text-gray-700 dark:text-gray-200" />
          </button>
          {pages.map((page, idx) => page === '...'
            ? <span key={`d-${idx}`} className="px-2 text-gray-500 dark:text-gray-400">...</span>
            : <button key={page} onClick={() => onPageChange(page)} className={`min-w-[36px] px-3 py-2 rounded-lg font-semibold text-sm transition ${currentPage === page ? 'bg-navy dark:bg-accent text-white shadow-md' : 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{page}</button>
          )}
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <ChevronRight size={16} className="text-gray-700 dark:text-gray-200" />
          </button>
        </div>
      )}
    </div>
  );
});
Pagination.displayName = 'Pagination';

// ─── Banner / Hero Slider ───────────────────────────────────────────────────
const HeroBanner = memo(({ heroBgUrl }) => {
  const [slide, setSlide] = useState(0);
  const slides = [
    { title: 'NEUST College of Nursing', subtitle: 'Research Repository', desc: 'Discover peer-reviewed nursing research from NEUST.' },
    { title: 'Advancing Nursing Knowledge', subtitle: 'Explore & Learn', desc: 'Browse research papers curated by faculty and students.' },
  ];
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden mb-6 shadow-lg" style={{ minHeight: 220 }}>
      {heroBgUrl
        ? <img src={heroBgUrl} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
        : <div className="absolute inset-0 bg-gradient-to-r from-navy via-blue-700 to-accent" />
      }
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex flex-col justify-center items-center text-center text-white px-6 py-12 min-h-[220px]">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-2">{slides[slide].subtitle}</p>
        <h1 className="text-2xl md:text-3xl font-black mb-2 drop-shadow">{slides[slide].title}</h1>
        <p className="text-sm text-blue-100 max-w-md">{slides[slide].desc}</p>
        <div className="flex gap-2 mt-4">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} className={`w-2 h-2 rounded-full transition-all ${i === slide ? 'bg-white scale-125' : 'bg-white/40'}`} />
          ))}
        </div>
      </div>
      <button onClick={() => setSlide(s => (s - 1 + slides.length) % slides.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition z-10">
        <ChevronLeft size={18} />
      </button>
      <button onClick={() => setSlide(s => (s + 1) % slides.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition z-10">
        <ChevronRight size={18} />
      </button>
    </div>
  );
});
HeroBanner.displayName = 'HeroBanner';

// ─── Main Explore Page ──────────────────────────────────────────────────────
const Explore = () => {
  const navigate = useNavigate();
  const [allPapers, setAllPapers] = useState([]);
  const [papers, setPapers] = useState([]);
  const [featuredPapers, setFeaturedPapers] = useState([]);
  const [heroBgUrl, setHeroBgUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchMode, setSearchMode] = useState('simple');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('exploreViewMode') || 'grid');
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('exploreSortBy') || 'relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => Number(localStorage.getItem('exploreItemsPerPage')) || 20);
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', yearCompleted: '', subjectArea: '', author: '' });
  const [semantic, setSemantic] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const subjectColorMap = useSubjectColorMap(allPapers);

  useEffect(() => { if (initialLoad) fetchInitialData(); }, []);
  useEffect(() => { localStorage.setItem('exploreViewMode', viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem('exploreSortBy', sortBy); }, [sortBy]);
  useEffect(() => { localStorage.setItem('exploreItemsPerPage', itemsPerPage); setCurrentPage(1); }, [itemsPerPage]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentPage]);
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2 && searchMode === 'simple') generateSuggestions(debouncedQuery);
    else { setSuggestions([]); setShowSuggestions(false); }
  }, [debouncedQuery, searchMode]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [res, settingsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/research?status=approved&limit=1000`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_URL}/settings`).catch(() => ({ ok: false }))
      ]);
      if (res.ok) {
        const data = await res.json();
        const ps = data.papers || [];
        setAllPapers(ps);
        setPapers(ps);
        setYears([...new Set(ps.map(p => p.yearCompleted).filter(Boolean))].sort((a,b) => b-a));
        setSubjects([...new Set(ps.map(p => p.subjectArea).filter(Boolean))].sort());
        // Featured = papers with awards, or top by views
        const withAwards = ps.filter(p => p.awards?.length > 0).slice(0,3);
        setFeaturedPapers(withAwards.length >= 3 ? withAwards : ps.slice().sort((a,b) => (b.views||0)-(a.views||0)).slice(0,3));
      }
      if (settingsRes.ok) {
        const sd = await settingsRes.json();
        if (sd.settings?.logos?.heroBg?.url) setHeroBgUrl(sd.settings.logos.heroBg.url);
      }
    } catch (error) { console.error('Fetch error:', error); }
    finally { setLoading(false); setInitialLoad(false); }
  };

  const generateSuggestions = useCallback((q) => {
    const titleMatches = allPapers.filter(p => fuzzyMatch(p.title, q)).map(p => ({ text: p.title, type: 'title' })).slice(0,3);
    const authorMatches = [...new Set(allPapers.flatMap(p => p.authors).filter(a => fuzzyMatch(a, q)))].map(a => ({ text: a, type: 'author' })).slice(0,2);
    const keywordMatches = [...new Set(allPapers.flatMap(p => p.keywords || []).filter(k => fuzzyMatch(k, q)))].map(k => ({ text: k, type: 'keyword' })).slice(0,2);
    const combined = [...titleMatches, ...authorMatches, ...keywordMatches].slice(0,5);
    setSuggestions(combined);
    setShowSuggestions(combined.length > 0);
  }, [allPapers]);

  const sortedPapers = useMemo(() => {
    if (!papers.length) return [];
    const sorted = [...papers];
    switch (sortBy) {
      case 'views-desc': return sorted.sort((a,b) => (b.views||0)-(a.views||0));
      case 'alpha-asc': return sorted.sort((a,b) => a.title.localeCompare(b.title));
      case 'alpha-desc': return sorted.sort((a,b) => b.title.localeCompare(a.title));
      case 'date-desc': return sorted.sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
      case 'date-asc': return sorted.sort((a,b) => new Date(a.createdAt)-new Date(b.createdAt));
      case 'awards-desc': return sorted.sort((a,b) => (b.awards?.length||0)-(a.awards?.length||0));
      case 'year-desc': return sorted.sort((a,b) => (b.yearCompleted||0)-(a.yearCompleted||0));
      case 'year-asc': return sorted.sort((a,b) => (a.yearCompleted||0)-(b.yearCompleted||0));
      default: return sorted;
    }
  }, [papers, sortBy]);

  const paginatedPapers = useMemo(() => {
    const start = (currentPage-1)*itemsPerPage;
    return sortedPapers.slice(start, start+itemsPerPage);
  }, [sortedPapers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedPapers.length / itemsPerPage);

  const performSearch = async () => {
    setLoading(true);
    setActiveQuery(query);
    setShowSuggestions(false);
    setCurrentPage(1);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        status: 'approved', limit: 1000,
        ...(query && { [searchMode === 'advanced' ? 'query' : 'search']: query }),
        ...(filters.category && { category: filters.category }),
        ...(filters.yearCompleted && { yearCompleted: filters.yearCompleted }),
        ...(filters.subjectArea && { subjectArea: filters.subjectArea }),
        ...(filters.author && { author: filters.author }),
        ...(searchMode === 'advanced' && semantic && { semantic: 'true' })
      });
      const endpoint = searchMode === 'advanced' ? '/search/advanced' : '/research';
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setPapers(data.papers || []); }
    } catch (error) { console.error('Search error:', error); }
    finally { setLoading(false); }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    setTimeout(() => performSearch(), 100);
  };

  const clearAll = useCallback(() => {
    setQuery(''); setActiveQuery('');
    setFilters({ category: '', yearCompleted: '', subjectArea: '', author: '' });
    setSemantic(false); setSuggestions([]); setShowSuggestions(false);
    setSortBy('relevance'); setCurrentPage(1); setPapers(allPapers);
  }, [allPapers]);

  const activeCount = useMemo(() =>
    Object.values(filters).filter(Boolean).length + (activeQuery ? 1 : 0) + (semantic ? 1 : 0),
    [filters, activeQuery, semantic]
  );

  // Unique subjects for legend
  const usedSubjects = useMemo(() => [...new Set(paginatedPapers.map(p => p.subjectArea).filter(Boolean))], [paginatedPapers]);

  if (initialLoad) return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-navy dark:border-accent mx-auto mb-3"></div>
        <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-8 bg-gray-50 dark:bg-gray-900">
      {showTips && <TipsModal onClose={() => setShowTips(false)} />}

      {/* ── 1. BANNER ─────────────────────────────────────────────────────── */}
      <HeroBanner heroBgUrl={heroBgUrl} />

      {/* ── 2. FEATURED PAPERS ────────────────────────────────────────────── */}
      {featuredPapers.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Crown size={18} className="text-yellow-500" />
            <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Featured Research</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">Curated by administrators</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredPapers.map((paper, i) => (
              <FeaturedCard key={paper._id} paper={paper} onClick={(id) => navigate(`/research/${id}`)} index={i} subjectColorMap={subjectColorMap} />
            ))}
          </div>
        </div>
      )}

      {/* ── 3. SEARCH ENGINE ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Search size={18} className="text-navy dark:text-accent" />
          <span className="font-black text-gray-900 dark:text-white text-base">Search & Filter</span>
          {activeCount > 0 && <span className="ml-auto text-xs bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">{activeCount} active</span>}
        </div>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button onClick={() => setSearchMode('simple')} className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${searchMode === 'simple' ? 'bg-navy text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600'}`}>
            <Search size={15} />Simple Search
          </button>
          <button onClick={() => setSearchMode('advanced')} className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${searchMode === 'advanced' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600'}`}>
            <Sparkles size={15} />Advanced
          </button>
        </div>

        {/* Search input */}
        <form onSubmit={(e) => { e.preventDefault(); performSearch(); }} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              type="text" value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={searchMode === 'advanced' ? 'diabetes AND management' : 'Search by title, author, keyword...'}
              className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            />
            {query && <button type="button" onClick={() => { setQuery(''); setSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border-2 border-navy/20 dark:border-accent/30 rounded-xl shadow-xl z-10 max-h-56 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <button key={i} type="button" onClick={() => handleSuggestionClick(s)} className="w-full text-left px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center gap-2">
                    {s.type === 'title' && <BookOpen size={13} className="text-blue-500 flex-shrink-0" />}
                    {s.type === 'author' && <Search size={13} className="text-green-500 flex-shrink-0" />}
                    {s.type === 'keyword' && <Sparkles size={13} className="text-purple-500 flex-shrink-0" />}
                    <span className="text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{s.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="submit" disabled={loading} className="py-3 bg-navy hover:bg-navy-800 text-white rounded-xl font-bold disabled:opacity-50 text-sm flex items-center justify-center gap-2 transition">
              {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Search size={15} />}
              Search
            </button>
            <button type="button" onClick={() => setShowFilters(!showFilters)} className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${showFilters ? 'bg-navy text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600'}`}>
              <SlidersHorizontal size={15} />Filters{activeCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>}
            </button>
          </div>

          {searchMode === 'advanced' && (
            <label className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-700 cursor-pointer">
              <input type="checkbox" checked={semantic} onChange={(e) => setSemantic(e.target.checked)} className="w-4 h-4 rounded" />
              <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">AI Semantic Search</span>
            </label>
          )}

          <button type="button" onClick={() => setShowTips(true)} className="w-full flex items-center gap-2 p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700 text-left hover:bg-blue-100 dark:hover:bg-blue-900/40 transition">
            <Info size={13} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-xs text-blue-800 dark:text-blue-200 font-medium">Click for search tips & examples</span>
          </button>
        </form>

        {/* Filters panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm">
                <option value="">All Categories</option>
                <option value="Completed">Completed</option>
                <option value="Published">Published</option>
              </select>
              <select value={filters.yearCompleted} onChange={(e) => setFilters({ ...filters, yearCompleted: e.target.value })} className="px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm">
                <option value="">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <select value={filters.subjectArea} onChange={(e) => setFilters({ ...filters, subjectArea: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm">
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="text" value={filters.author} onChange={(e) => setFilters({ ...filters, author: e.target.value })} placeholder="Author name" className="w-full px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm" />
            <div className="flex gap-2">
              <button onClick={clearAll} className="flex-1 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"><X size={14} />Clear</button>
              <button onClick={() => { performSearch(); setShowFilters(false); }} className="flex-1 py-2.5 bg-navy text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-navy-800 transition"><Filter size={14} />Apply</button>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. RESULTS ────────────────────────────────────────────────────── */}
      <div>
        {/* Results header */}
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-navy dark:text-accent" />
            <span className="font-black text-gray-900 dark:text-white text-sm">
              <strong className="text-navy dark:text-accent text-base">{sortedPapers.length}</strong> Papers
            </span>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold flex items-center gap-1">
                <X size={11} />Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-xs border-2 border-gray-300 dark:border-gray-600 rounded-xl px-2 py-2 focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold">
              {(activeQuery ? [{ value: 'relevance', label: 'Relevance' }] : []).concat([
                { value: 'views-desc', label: 'Most Viewed' },
                { value: 'date-desc', label: 'Newest First' },
                { value: 'date-asc', label: 'Oldest First' },
                { value: 'alpha-asc', label: 'A to Z' },
                { value: 'alpha-desc', label: 'Z to A' },
                { value: 'awards-desc', label: 'Most Awards' },
                { value: 'year-desc', label: 'Year (New)' },
                { value: 'year-asc', label: 'Year (Old)' },
              ]).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 p-1 rounded-xl">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-600' : ''}`}>
                <Grid size={15} className={viewMode === 'grid' ? 'text-navy dark:text-accent' : 'text-gray-500 dark:text-gray-400'} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-600' : ''}`}>
                <List size={15} className={viewMode === 'list' ? 'text-navy dark:text-accent' : 'text-gray-500 dark:text-gray-400'} />
              </button>
            </div>
          </div>
        </div>

        {/* Subject legend */}
        {usedSubjects.length > 0 && viewMode === 'grid' && (
          <div className="mb-3">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Subject Legend</p>
            <div className="flex flex-wrap gap-1.5">
              {usedSubjects.map(s => (
                <span key={s} className={`px-2.5 py-1 rounded-full border text-xs font-medium ${subjectColorMap[s] || SUBJECT_COLORS[0]}`}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Paper list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-navy dark:border-accent mx-auto mb-2"></div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold">Searching...</p>
            </div>
          </div>
        ) : sortedPapers.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <BookOpen size={40} className="mx-auto text-gray-400 mb-2 opacity-30" />
            <p className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">No papers found</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Try different keywords or clear filters</p>
            {activeCount > 0 && <button onClick={clearAll} className="px-5 py-2 bg-navy text-white rounded-xl font-bold text-sm hover:opacity-90 transition">Show all</button>}
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6' : 'space-y-3 mb-6'}>
              {paginatedPapers.map((paper, i) => (
                <PaperCard key={paper._id} paper={paper} onClick={(id) => navigate(`/research/${id}`)} highlight={activeQuery} viewMode={viewMode} colorIndex={i} subjectColorMap={subjectColorMap} />
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage} totalItems={sortedPapers.length} />
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;