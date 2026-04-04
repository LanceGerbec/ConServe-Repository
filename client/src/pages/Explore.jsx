// client/src/pages/Explore.jsx - Enhanced with floating featured cards, mobile fix, advanced search
import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { Search, Filter, X, Eye, Calendar, BookOpen, SlidersHorizontal, Sparkles, Info, Lightbulb, Grid, List, Award, ChevronLeft, ChevronRight, Play, Pause, Star, Flame, Plus, Edit2, Trash2, Save, Crown, ArrowUp, ChevronDown, ChevronUp, ExternalLink, Hash, User, Clock, Zap, TrendingUp, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const useDebounce = (value, delay) => {
  const [d, setD] = useState(value);
  useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return d;
};

const fuzzyMatch = (str, pattern) => {
  if (!str || !pattern) return false;
  const p = pattern.toLowerCase().split('');
  const s = str.toLowerCase();
  let pi = 0;
  for (let si = 0; si < s.length && pi < p.length; si++) { if (s[si] === p[pi]) pi++; }
  return pi === p.length;
};

const SUBJECT_COLORS = {
  'Community Health Nursing': { bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500', card: 'border-l-emerald-400', glow: 'shadow-emerald-200 dark:shadow-emerald-900/50', gradient: 'from-emerald-500 to-teal-500' },
  'Medical-Surgical Nursing': { bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500', card: 'border-l-blue-400', glow: 'shadow-blue-200 dark:shadow-blue-900/50', gradient: 'from-blue-500 to-indigo-500' },
  'Pediatric Nursing': { bg: 'bg-pink-50 dark:bg-pink-900/30', border: 'border-pink-300 dark:border-pink-700', text: 'text-pink-700 dark:text-pink-300', dot: 'bg-pink-500', card: 'border-l-pink-400', glow: 'shadow-pink-200 dark:shadow-pink-900/50', gradient: 'from-pink-500 to-rose-500' },
  'Psychiatric Nursing': { bg: 'bg-violet-50 dark:bg-violet-900/30', border: 'border-violet-300 dark:border-violet-700', text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-500', card: 'border-l-violet-400', glow: 'shadow-violet-200 dark:shadow-violet-900/50', gradient: 'from-violet-500 to-purple-500' },
  'Obstetric Nursing': { bg: 'bg-rose-50 dark:bg-rose-900/30', border: 'border-rose-300 dark:border-rose-700', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500', card: 'border-l-rose-400', glow: 'shadow-rose-200 dark:shadow-rose-900/50', gradient: 'from-rose-500 to-pink-500' },
  'Geriatric Nursing': { bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500', card: 'border-l-amber-400', glow: 'shadow-amber-200 dark:shadow-amber-900/50', gradient: 'from-amber-500 to-orange-500' },
  'Critical Care Nursing': { bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-300 dark:border-red-700', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500', card: 'border-l-red-400', glow: 'shadow-red-200 dark:shadow-red-900/50', gradient: 'from-red-500 to-orange-500' },
  'Nursing Education': { bg: 'bg-indigo-50 dark:bg-indigo-900/30', border: 'border-indigo-300 dark:border-indigo-700', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500', card: 'border-l-indigo-400', glow: 'shadow-indigo-200 dark:shadow-indigo-900/50', gradient: 'from-indigo-500 to-blue-500' },
  'Nursing Research': { bg: 'bg-cyan-50 dark:bg-cyan-900/30', border: 'border-cyan-300 dark:border-cyan-700', text: 'text-cyan-700 dark:text-cyan-300', dot: 'bg-cyan-500', card: 'border-l-cyan-400', glow: 'shadow-cyan-200 dark:shadow-cyan-900/50', gradient: 'from-cyan-500 to-blue-500' },
  'Public Health': { bg: 'bg-teal-50 dark:bg-teal-900/30', border: 'border-teal-300 dark:border-teal-700', text: 'text-teal-700 dark:text-teal-300', dot: 'bg-teal-500', card: 'border-l-teal-400', glow: 'shadow-teal-200 dark:shadow-teal-900/50', gradient: 'from-teal-500 to-emerald-500' },
  'Science and Technology': { bg: 'bg-sky-50 dark:bg-sky-900/30', border: 'border-sky-300 dark:border-sky-700', text: 'text-sky-700 dark:text-sky-300', dot: 'bg-sky-500', card: 'border-l-sky-400', glow: 'shadow-sky-200 dark:shadow-sky-900/50', gradient: 'from-sky-500 to-cyan-500' },
  'default': { bg: 'bg-slate-50 dark:bg-slate-900/30', border: 'border-slate-300 dark:border-slate-600', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400', card: 'border-l-slate-400', glow: 'shadow-slate-200 dark:shadow-slate-900/50', gradient: 'from-slate-500 to-gray-500' }
};

const getSubjectColor = (subjectArea) => {
  if (!subjectArea) return SUBJECT_COLORS.default;
  for (const [key, val] of Object.entries(SUBJECT_COLORS)) {
    if (key !== 'default' && subjectArea.toLowerCase().includes(key.toLowerCase())) return val;
  }
  const colors = Object.values(SUBJECT_COLORS).filter((_, i, a) => i < a.length - 1);
  const idx = subjectArea.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
};

// ── Hero Banner ──
const HeroBanner = memo(({ bannerImages }) => {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const goTo = useCallback((idx) => {
    if (idx === current) return;
    setFading(true);
    setTimeout(() => { setCurrent(idx); setFading(false); }, 500);
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
    <div className="relative w-full overflow-hidden rounded-xl shadow-xl" style={{ height: 'clamp(160px, 35vw, 360px)' }}>
      <div className="absolute inset-0 bg-cover bg-center transition-all duration-500" style={{ backgroundImage: `url(${img.url})`, opacity: fading ? 0 : 1, transform: fading ? 'scale(1.02)' : 'scale(1)' }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      {img.caption && (
        <div className="absolute bottom-8 left-4 right-12">
          <p className="text-white font-bold text-sm md:text-base drop-shadow-lg">{img.caption}</p>
        </div>
      )}
      {bannerImages.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition"><ChevronLeft size={16} /></button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition"><ChevronRight size={16} /></button>
          <button onClick={() => setPaused(p => !p)} className="absolute top-2 right-2 w-7 h-7 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white">{paused ? <Play size={11} /> : <Pause size={11} />}</button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {bannerImages.map((_, i) => (<button key={i} onClick={() => goTo(i)} className={`rounded-full transition-all ${i === current ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />))}
          </div>
        </>
      )}
      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/40 rounded-full text-white text-xs font-bold">{current + 1}/{bannerImages.length}</div>
    </div>
  );
});
HeroBanner.displayName = 'HeroBanner';

// ── ENHANCED Featured Paper Card (max 3, floating animation, unique design) ──
const FeaturedCard = memo(({ item, index, onClick }) => {
  const [expanded, setExpanded] = useState(false);
  const paper = item.paper || item;
  const caption = item.caption;
  const colors = getSubjectColor(paper.subjectArea);

  const floatDelay = ['0s', '0.4s', '0.8s'][index] || '0s';
  const floatDuration = ['3.5s', '4s', '3.8s'][index] || '3.5s';

  return (
    <div
      className="relative flex-1 min-w-0"
      style={{
        animation: `featuredFloat ${floatDuration} ease-in-out ${floatDelay} infinite`,
      }}
    >
      {/* Crown badge */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-lg border-2 border-yellow-300">
        <Crown size={11} className="text-yellow-900" />
        <span className="text-yellow-900 text-[10px] font-black uppercase tracking-wider">Featured</span>
      </div>

      {/* Card */}
      <div
        onClick={() => onClick(paper._id)}
        className={`relative cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-1 group`}
        style={{ boxShadow: `0 4px 24px -4px rgba(0,0,0,0.12)` }}
      >
        {/* Top gradient accent */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${colors.gradient}`} />

        <div className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${colors.bg} ${colors.border} ${colors.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                {paper.category}
              </span>
              {paper.yearCompleted && (
                <span className="flex items-center gap-0.5 text-xs text-gray-400 dark:text-gray-500">
                  <Calendar size={10} />{paper.yearCompleted}
                </span>
              )}
            </div>
            <span className="flex items-center gap-0.5 text-xs text-gray-400 flex-shrink-0">
              <Eye size={10} />{paper.views || 0}
            </span>
          </div>

          {/* Title */}
          <h3 className={`font-bold text-sm text-gray-900 dark:text-white leading-snug mb-2 group-hover:text-navy dark:group-hover:text-accent transition-colors ${expanded ? '' : 'line-clamp-2'}`}>
            {paper.title}
          </h3>

          {/* Show more toggle for title if long */}
          {paper.title && paper.title.length > 80 && (
            <button
              onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
              className="flex items-center gap-0.5 text-xs text-navy dark:text-accent font-semibold mb-2 hover:underline"
            >
              {expanded ? <><ChevronUp size={12} />Less</> : <><ChevronDown size={12} />See full title</>}
            </button>
          )}

          {/* Abstract */}
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{paper.abstract}</p>

          {/* Caption */}
          {caption && (
            <div className="flex items-start gap-1 mb-2.5 px-2 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <Star size={10} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800 dark:text-yellow-300 italic">{caption}</p>
            </div>
          )}

          {/* Subject tag */}
          {paper.subjectArea && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.border} ${colors.text} mb-3`}>
              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
              <span className="truncate max-w-[120px]">{paper.subjectArea}</span>
            </span>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 truncate flex-1">
              {paper.authors?.[0]}{paper.authors?.length > 1 ? ` +${paper.authors.length - 1}` : ''}
            </p>
            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}>
              <ExternalLink size={10} />View
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
FeaturedCard.displayName = 'FeaturedCard';

// ── Featured Section (max 3) ──
const FeaturedSection = memo(({ papers, onPaperClick, isAdmin, onManage }) => {
  if (!papers.length && !isAdmin) return null;
  const limited = papers.slice(0, 3);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-full border border-yellow-200 dark:border-yellow-800 shadow-sm">
            <Crown size={13} className="text-yellow-600 dark:text-yellow-400" />
            <span className="text-xs font-black text-yellow-700 dark:text-yellow-300 uppercase tracking-wider">Featured Papers</span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{limited.length}/3</span>
        </div>
        {isAdmin && (
          <button onClick={onManage} className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/40 rounded-lg text-xs font-bold text-yellow-700 dark:text-yellow-300 transition">
            <Edit2 size={11} />Manage
          </button>
        )}
      </div>

      {limited.length > 0 ? (
        /* Mobile: horizontal scroll row. sm+: 3-col grid */
        <div className="flex gap-5 overflow-x-auto pb-3 pt-4 scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0">
          {limited.map((item, i) => (
            <div key={`${(item.paper || item)._id}-${i}`} className="flex-shrink-0 w-[75vw] max-w-[280px] sm:w-auto sm:max-w-none">
              <FeaturedCard item={item} index={i} onClick={onPaperClick} />
            </div>
          ))}
        </div>
      ) : isAdmin ? (
        <div className="border-2 border-dashed border-yellow-300 dark:border-yellow-700 rounded-2xl p-8 text-center bg-yellow-50/50 dark:bg-yellow-900/10">
          <Crown size={32} className="mx-auto text-yellow-400 mb-2" />
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">No featured papers yet</p>
          <p className="text-xs text-gray-500 mb-4">Highlight up to 3 papers for visitors</p>
          <button onClick={onManage} className="flex items-center gap-1.5 mx-auto px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold text-xs transition shadow-md">
            <Plus size={13} />Add Featured Papers
          </button>
        </div>
      ) : null}
    </div>
  );
});
FeaturedSection.displayName = 'FeaturedSection';

// ── Award Badge ──
const AwardBadge = memo(({ award, small }) => {
  const colorMap = { gold: 'bg-yellow-50 text-yellow-800 border-yellow-300', silver: 'bg-gray-50 text-gray-800 border-gray-300', bronze: 'bg-orange-50 text-orange-800 border-orange-300', blue: 'bg-blue-50 text-blue-800 border-blue-300', green: 'bg-green-50 text-green-800 border-green-300', purple: 'bg-purple-50 text-purple-800 border-purple-300' };
  return (
    <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border text-xs font-bold ${colorMap[award.color] || colorMap.gold}`}>
      <Award size={small ? 9 : 10} />
      {!small && <span className="max-w-[60px] truncate">{award.name}</span>}
    </div>
  );
});
AwardBadge.displayName = 'AwardBadge';

// ── Subject Badge ──
const SubjectBadge = memo(({ subjectArea, compact }) => {
  if (!subjectArea) return null;
  const colors = getSubjectColor(subjectArea);
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold border ${colors.bg} ${colors.border} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} flex-shrink-0`} />
      <span className={`truncate ${compact ? 'max-w-[80px]' : 'max-w-[120px]'}`}>{subjectArea}</span>
    </span>
  );
});
SubjectBadge.displayName = 'SubjectBadge';

// ── Admin: Featured Papers Manager (max 3) ──
const FeaturedPapersManager = memo(({ allPapers, featuredList, onSave, onClose }) => {
  const [selected, setSelected] = useState(featuredList.map(f => ({ paperId: f.paperId || f.paper?._id || f._id, caption: f.caption || '' })));
  const [search, setSearch] = useState('');
  const filtered = allPapers.filter(p => p.title?.toLowerCase().includes(search.toLowerCase())).slice(0, 20);
  const isSelected = (id) => selected.some(s => s.paperId === id);
  const toggle = (paper) => {
    if (isSelected(paper._id)) setSelected(prev => prev.filter(s => s.paperId !== paper._id));
    else if (selected.length < 3) setSelected(prev => [...prev, { paperId: paper._id, caption: '' }]);
  };
  const updateCaption = (paperId, caption) => setSelected(prev => prev.map(s => s.paperId === paperId ? { ...s, caption } : s));
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2"><Crown size={18} className="text-yellow-600" /><h3 className="font-bold text-gray-900 dark:text-white">Featured Papers ({selected.length}/3)</h3></div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selected.length >= 3 && (
            <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-300 font-semibold">
              Max 3 featured papers reached. Remove one to add another.
            </div>
          )}
          {selected.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">SELECTED</p>
              <div className="space-y-2">
                {selected.map(s => {
                  const paper = allPapers.find(p => p._id === s.paperId);
                  if (!paper) return null;
                  return (
                    <div key={s.paperId} className="flex gap-2 items-start p-2.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">{paper.title}</p>
                        <input value={s.caption} onChange={e => updateCaption(s.paperId, e.target.value)} placeholder="Caption (optional)" className="w-full text-xs px-2 py-1 border border-yellow-300 dark:border-yellow-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none" />
                      </div>
                      <button onClick={() => toggle(paper)} className="p-1 text-red-500 hover:bg-red-50 rounded flex-shrink-0"><X size={14} /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">ADD PAPERS</p>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm mb-2 focus:outline-none dark:bg-gray-700 dark:text-white" />
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {filtered.map(p => (
                <div key={p._id} onClick={() => toggle(p)} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition ${isSelected(p._id) ? 'bg-navy/10 dark:bg-navy/20 border border-navy/30' : selected.length >= 3 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected(p._id) ? 'bg-navy border-navy' : 'border-gray-300'}`}>{isSelected(p._id) && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}</div>
                  <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1">{p.title}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-sm text-gray-700 dark:text-gray-300">Cancel</button>
          <button onClick={() => { onSave(selected); onClose(); }} className="flex-1 px-4 py-2 bg-navy dark:bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"><Save size={14} />Save</button>
        </div>
      </div>
    </div>
  );
});
FeaturedPapersManager.displayName = 'FeaturedPapersManager';

// ── Paper Card with full title expand (mobile fix) ──
const PaperCard = memo(({ paper, onClick, highlight, viewMode }) => {
  const [showFullTitle, setShowFullTitle] = useState(false);
  const colors = getSubjectColor(paper.subjectArea);
  const isLongTitle = paper.title && paper.title.length > 70;

  const hl = (text) => {
    if (!highlight || !text) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(regex).map((part, i) => regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/60 rounded px-0.5">{part}</mark> : part);
  };

  if (viewMode === 'list') {
    return (
      <div className={`group bg-white dark:bg-gray-800 rounded-xl border-l-4 ${colors.card} border border-gray-200 dark:border-gray-700/60 p-3 hover:shadow-md transition-all duration-150 hover:-translate-y-0.5`}>
        <div className="flex gap-2.5">
          <div className="flex-shrink-0 w-9 h-9 bg-navy/8 dark:bg-navy/20 rounded-lg flex items-center justify-center mt-0.5 cursor-pointer" onClick={() => onClick(paper._id)}>
            <BookOpen size={14} className="text-navy dark:text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1.5 mb-0.5">
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-xs text-gray-900 dark:text-gray-100 group-hover:text-navy dark:group-hover:text-accent cursor-pointer ${showFullTitle ? '' : 'line-clamp-2'}`} onClick={() => onClick(paper._id)}>
                  {hl(paper.title)}
                </h3>
                {isLongTitle && (
                  <button onClick={e => { e.stopPropagation(); setShowFullTitle(v => !v); }} className="flex items-center gap-0.5 text-[10px] text-navy dark:text-accent font-semibold mt-0.5 hover:underline">
                    {showFullTitle ? <><ChevronUp size={10} />Less</> : <><ExternalLink size={10} />Full title</>}
                  </button>
                )}
              </div>
              <span className="px-1.5 py-0.5 bg-navy/10 text-navy dark:bg-accent/20 dark:text-accent rounded text-xs font-semibold whitespace-nowrap flex-shrink-0 cursor-pointer" onClick={() => onClick(paper._id)}>{paper.category}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-1 cursor-pointer" onClick={() => onClick(paper._id)}>{hl(paper.abstract)}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-0.5 text-xs text-gray-400"><Eye size={9} />{paper.views || 0}</span>
              {paper.yearCompleted && <span className="flex items-center gap-0.5 text-xs text-gray-400"><Calendar size={9} />{paper.yearCompleted}</span>}
              {paper.subjectArea && <SubjectBadge subjectArea={paper.subjectArea} compact />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid card
  return (
    <div className={`group bg-white dark:bg-gray-800 rounded-xl border-l-4 ${colors.card} border border-gray-200 dark:border-gray-700/60 p-3 hover:shadow-lg transition-all duration-150 hover:-translate-y-0.5 flex flex-col`}>
      <div className="flex items-start justify-between mb-2">
        <span className="px-2 py-0.5 bg-navy/10 text-navy dark:bg-accent/20 dark:text-accent rounded text-xs font-bold cursor-pointer" onClick={() => onClick(paper._id)}>{paper.category}</span>
        <span className="flex items-center gap-0.5 text-xs text-gray-400"><Eye size={10} />{paper.views || 0}</span>
      </div>

      {/* Title with expand on mobile */}
      <div className="mb-1.5">
        <h3 className={`font-bold text-xs text-gray-900 dark:text-gray-100 group-hover:text-navy dark:group-hover:text-accent leading-snug cursor-pointer ${showFullTitle ? '' : 'line-clamp-2'}`} onClick={() => onClick(paper._id)}>
          {hl(paper.title)}
        </h3>
        {isLongTitle && (
          <button
            onClick={e => { e.stopPropagation(); setShowFullTitle(v => !v); }}
            className="flex items-center gap-0.5 text-[10px] text-navy dark:text-accent font-semibold mt-0.5 hover:underline"
          >
            {showFullTitle ? <><ChevronUp size={9} />Less</> : <><ExternalLink size={9} />Full title</>}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 flex-1 mb-2 cursor-pointer" onClick={() => onClick(paper._id)}>{hl(paper.abstract)}</p>
      {paper.awards?.length > 0 && <div className="flex flex-wrap gap-1 mb-2">{paper.awards.slice(0, 2).map((a, i) => <AwardBadge key={i} award={a} small />)}</div>}
      <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 dark:border-gray-700/50 cursor-pointer" onClick={() => onClick(paper._id)}>
        {paper.yearCompleted && <span className="flex items-center gap-0.5 text-xs text-gray-400"><Calendar size={9} />{paper.yearCompleted}</span>}
        {paper.subjectArea && <SubjectBadge subjectArea={paper.subjectArea} compact />}
      </div>
    </div>
  );
});
PaperCard.displayName = 'PaperCard';

// ── Pagination ──
const Pagination = memo(({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange, totalItems }) => {
  const pages = useMemo(() => {
    const range = [], dots = [];
    for (let i = 1; i <= totalPages; i++) { if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) range.push(i); }
    let prev = 0;
    for (const i of range) { if (prev + 1 !== i) dots.push('...'); dots.push(i); prev = i; }
    return dots;
  }, [currentPage, totalPages]);
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
        <span>{start}–{end} of {totalItems}</span>
        <select value={itemsPerPage} onChange={e => onItemsPerPageChange(Number(e.target.value))} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs">
          {[10, 20, 50].map(n => <option key={n} value={n}>{n}/page</option>)}
        </select>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition"><ChevronLeft size={14} /></button>
          {pages.map((page, idx) => page === '...' ? <span key={`d${idx}`} className="px-1 text-gray-400 text-xs">…</span> : (
            <button key={page} onClick={() => onPageChange(page)} className={`min-w-[28px] px-1.5 py-1 rounded-lg font-bold text-xs transition ${currentPage === page ? 'bg-navy dark:bg-accent text-white' : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{page}</button>
          ))}
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition"><ChevronRight size={14} /></button>
        </div>
      )}
    </div>
  );
});
Pagination.displayName = 'Pagination';

// ── Floating Quick Search Bar ──
const FloatingSearch = memo(({ onSearch, visible }) => {
  const [q, setQ] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); if (q.trim()) onSearch(q.trim()); };
  return (
    <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg px-3 py-2">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="Quick search papers..." className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-navy dark:focus:border-accent" autoFocus />
          </div>
          <button type="submit" className="px-4 py-2 bg-navy dark:bg-blue-600 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5"><Search size={14} />Go</button>
        </form>
      </div>
    </div>
  );
});
FloatingSearch.displayName = 'FloatingSearch';

// ── Active filter chip ──
const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-navy/10 dark:bg-accent/20 text-navy dark:text-accent rounded-full text-xs font-semibold border border-navy/20 dark:border-accent/30">
    {label}
    <button onClick={onRemove} className="hover:text-red-500 transition"><X size={10} /></button>
  </span>
);

// ══════════════════ MAIN EXPLORE ══════════════════
const Explore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const API_URL = import.meta.env.VITE_API_URL;
  const resultsRef = useRef(null);

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
  const [featuredPapers, setFeaturedPapers] = useState([]);
  const [showFeaturedManager, setShowFeaturedManager] = useState(false);
  const [showFloatingSearch, setShowFloatingSearch] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Advanced search extras
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [exactPhrase, setExactPhrase] = useState('');
  const [excludeWords, setExcludeWords] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const handleScroll = () => { const y = window.scrollY; setScrollY(y); setShowFloatingSearch(y > 300); };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { localStorage.setItem('exploreViewMode', viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem('exploreSortBy', sortBy); }, [sortBy]);
  useEffect(() => { localStorage.setItem('exploreItemsPerPage', itemsPerPage); setCurrentPage(1); }, [itemsPerPage]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentPage]);
  useEffect(() => { if (initialLoad) fetchInitialData(); }, []);
  useEffect(() => {
    if (debouncedQuery.length >= 2 && searchMode === 'simple') generateSuggestions(debouncedQuery);
    else { setSuggestions([]); setShowSuggestions(false); }
  }, [debouncedQuery, searchMode]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [res, recRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/research?status=approved&limit=1000`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/search/recommendations?limit=6`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ ok: false })),
        fetch(`${API_URL}/settings`).catch(() => ({ ok: false }))
      ]);
      if (res.ok) {
        const data = await res.json();
        const p = data.papers || [];
        setPapers(p); setAllPapers(p);
        setYears([...new Set(p.map(x => x.yearCompleted).filter(Boolean))].sort((a, b) => b - a));
        setSubjects([...new Set(p.map(x => x.subjectArea).filter(Boolean))].sort());
      }
      if (recRes.ok) { const d = await recRes.json(); setRecommendations(d.papers || []); }
      if (settingsRes.ok) {
        const sd = await settingsRes.json();
        const imgs = [];
        if (sd.settings?.logos?.heroBg?.url) imgs.push({ url: sd.settings.logos.heroBg.url, caption: 'NEUST College of Nursing Research Repository' });
        if (sd.settings?.bannerImages?.length) sd.settings.bannerImages.forEach(b => imgs.push(b));
        if (!imgs.length) imgs.push({ url: '', caption: '' });
        setBannerImages(imgs);
        if (sd.settings?.featuredPapers?.length) setFeaturedPapers(sd.settings.featuredPapers);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setInitialLoad(false); }
  };

  const resolvedFeatured = useMemo(() => {
    if (!featuredPapers.length || !allPapers.length) return [];
    return featuredPapers.slice(0, 3).map(f => {
      const paperId = f.paperId || f;
      const paper = allPapers.find(p => p._id === paperId || p._id === paperId?._id);
      return paper ? { paper, caption: f.caption || '' } : null;
    }).filter(Boolean);
  }, [featuredPapers, allPapers]);

  const handleSaveFeatured = async (selected) => {
    setFeaturedPapers(selected);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/settings`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ featuredPapers: selected }) });
    } catch (e) { console.error(e); }
  };

  const generateSuggestions = useCallback((q) => {
    const title = allPapers.filter(p => fuzzyMatch(p.title, q)).map(p => ({ text: p.title, type: 'title' })).slice(0, 3);
    const author = [...new Set(allPapers.flatMap(p => p.authors || []).filter(a => fuzzyMatch(a, q)))].map(a => ({ text: a, type: 'author' })).slice(0, 2);
    const kw = [...new Set(allPapers.flatMap(p => p.keywords || []).filter(k => fuzzyMatch(k, q)))].map(k => ({ text: k, type: 'keyword' })).slice(0, 2);
    const combined = [...title, ...author, ...kw].slice(0, 5);
    setSuggestions(combined); setShowSuggestions(combined.length > 0);
  }, [allPapers]);

  const sortedPapers = useMemo(() => {
    const s = [...papers];
    switch (sortBy) {
      case 'views-desc': return s.sort((a, b) => (b.views || 0) - (a.views || 0));
      case 'alpha-asc': return s.sort((a, b) => a.title.localeCompare(b.title));
      case 'alpha-desc': return s.sort((a, b) => b.title.localeCompare(a.title));
      case 'date-desc': return s.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'year-desc': return s.sort((a, b) => (b.yearCompleted || 0) - (a.yearCompleted || 0));
      default: return s;
    }
  }, [papers, sortBy]);

  const paginatedPapers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedPapers.slice(start, start + itemsPerPage);
  }, [sortedPapers, currentPage, itemsPerPage]);
  const totalPages = Math.ceil(sortedPapers.length / itemsPerPage);

  // Build advanced query string
  const buildAdvancedQuery = () => {
    let q = query.trim();
    if (exactPhrase.trim()) q += ` "${exactPhrase.trim()}"`;
    if (excludeWords.trim()) excludeWords.trim().split(/\s+/).forEach(w => { q += ` NOT ${w}`; });
    return q;
  };

  const performSearch = async (overrideQuery) => {
    const q = overrideQuery !== undefined ? overrideQuery : (searchMode === 'advanced' ? buildAdvancedQuery() : query);
    setLoading(true); setActiveQuery(q); setActiveFilters(filters); setShowSuggestions(false); setCurrentPage(1);
    setTimeout(() => { resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
    try {
      const token = localStorage.getItem('token');
      let finalFilters = { ...filters };
      // Year range support
      if (yearFrom && !yearTo) finalFilters.yearCompleted = yearFrom;
      const params = new URLSearchParams({
        status: 'approved', limit: 1000,
        ...(q && { [searchMode === 'advanced' ? 'query' : 'search']: q }),
        ...(finalFilters.category && { category: finalFilters.category }),
        ...(finalFilters.yearCompleted && { yearCompleted: finalFilters.yearCompleted }),
        ...(finalFilters.subjectArea && { subjectArea: finalFilters.subjectArea }),
        ...(finalFilters.author && { author: finalFilters.author }),
        ...(searchMode === 'advanced' && semantic && { semantic: 'true' })
      });
      const endpoint = searchMode === 'advanced' ? '/search/advanced' : '/research';
      const res = await fetch(`${API_URL}${endpoint}?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        let d = await res.json();
        let results = d.papers || [];
        // Client-side year range filter
        if (yearFrom) results = results.filter(p => p.yearCompleted >= parseInt(yearFrom));
        if (yearTo) results = results.filter(p => p.yearCompleted <= parseInt(yearTo));
        setPapers(results);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const clearAll = useCallback(() => {
    setQuery(''); setActiveQuery(''); setExactPhrase(''); setExcludeWords(''); setYearFrom(''); setYearTo('');
    setFilters({ category: '', yearCompleted: '', subjectArea: '', author: '' });
    setActiveFilters({ category: '', yearCompleted: '', subjectArea: '', author: '' });
    setSemantic(false); setSuggestions([]); setShowSuggestions(false); setSortBy('relevance'); setCurrentPage(1); setPapers(allPapers);
  }, [allPapers]);

  const removeFilter = (key) => {
    const newF = { ...activeFilters, [key]: '' };
    setActiveFilters(newF); setFilters(newF);
    // Re-run with cleared filter
    const params = new URLSearchParams({ status: 'approved', limit: 1000, ...(activeQuery && { search: activeQuery }), ...Object.fromEntries(Object.entries(newF).filter(([, v]) => v)) });
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/research?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setPapers(d.papers || [])).catch(() => {});
  };

  const activeCount = useMemo(() => Object.values(activeFilters).filter(Boolean).length + (activeQuery ? 1 : 0) + (semantic ? 1 : 0), [activeFilters, activeQuery, semantic]);
  const hasActiveFilters = activeCount > 0;

  if (initialLoad) return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-4 border-navy dark:border-accent mx-auto mb-3" /><p className="text-xs text-gray-500 font-semibold">Loading…</p></div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes featuredFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes progress-bar { from { width: 0% } to { width: 100% } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <FloatingSearch onSearch={(q) => { setQuery(q); performSearch(q); }} visible={showFloatingSearch} />

      <div className="min-h-screen pb-8 bg-gray-50 dark:bg-gray-950">

        {/* Hero Banner */}
        <div className="mb-4">
          {bannerImages.some(b => b.url) ? (
            <HeroBanner bannerImages={bannerImages.filter(b => b.url)} />
          ) : (
            <div className="relative w-full overflow-hidden rounded-xl shadow-lg" style={{ height: 'clamp(120px, 25vw, 220px)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-navy via-blue-700 to-accent" />
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4 text-center">
                <div className="flex items-center gap-2 mb-1"><BookOpen size={22} className="opacity-90" /><h1 className="text-xl md:text-2xl font-black">Explore Research</h1></div>
                <p className="text-blue-100 text-xs md:text-sm opacity-90">Discover nursing research at NEUST</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Featured Papers (max 3, floating) ── */}
        <FeaturedSection
          papers={resolvedFeatured}
          onPaperClick={id => navigate(`/research/${id}`)}
          isAdmin={isAdmin}
          onManage={() => setShowFeaturedManager(true)}
        />

        {/* ── Search Panel ── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-3 mb-4">
          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-1.5 mb-2.5">
            <button onClick={() => { setSearchMode('simple'); setShowAdvancedPanel(false); }} className={`px-3 py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${searchMode === 'simple' ? 'bg-navy text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}><Search size={13} />Simple</button>
            <button onClick={() => { setSearchMode('advanced'); setShowAdvancedPanel(true); }} className={`px-3 py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${searchMode === 'advanced' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}><Sparkles size={13} />Advanced</button>
          </div>

          {/* Search Input */}
          <form onSubmit={e => { e.preventDefault(); performSearch(); }} className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text" value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => suggestions.length && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={searchMode === 'advanced' ? 'e.g. diabetes AND management' : 'Title, author, keyword…'}
                className="w-full pl-9 pr-8 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm transition"
              />
              {query && <button type="button" onClick={() => { setQuery(''); setSuggestions([]); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"><X size={14} /></button>}

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-navy/20 dark:border-accent/30 rounded-xl shadow-xl z-20 overflow-hidden">
                  {suggestions.map((s, i) => (
                    <button key={i} type="button" onClick={() => { setQuery(s.text); setShowSuggestions(false); setTimeout(() => performSearch(s.text), 50); }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center justify-between gap-2 transition text-xs">
                      <span className="flex items-center gap-1.5">
                        {s.type === 'author' ? <User size={10} className="text-gray-400" /> : s.type === 'keyword' ? <Hash size={10} className="text-gray-400" /> : <BookOpen size={10} className="text-gray-400" />}
                        <span className="text-gray-900 dark:text-gray-100 line-clamp-1 flex-1">{s.text}</span>
                      </span>
                      <span className="text-gray-400 capitalize flex-shrink-0 bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded text-[10px]">{s.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="flex-1 py-2 bg-navy hover:bg-navy-800 text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-1.5 transition">
                {loading ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" /> : <Search size={14} />}
                {loading ? 'Searching…' : 'Search'}
              </button>
              <button type="button" onClick={() => setShowFilters(f => !f)} className={`px-3 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 transition border ${showFilters ? 'bg-navy text-white border-navy' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50'}`}>
                <SlidersHorizontal size={14} />
                {activeCount > 0 && <span className="bg-red-500 text-white text-xs font-black px-1 py-0.5 rounded-full leading-none">{activeCount}</span>}
              </button>
              <button type="button" onClick={() => setShowTips(true)} className="px-2.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <Info size={14} />
              </button>
              {hasActiveFilters && (
                <button type="button" onClick={clearAll} className="px-2.5 py-2 rounded-xl border border-red-300 dark:border-red-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition" title="Clear all">
                  <RefreshCw size={14} />
                </button>
              )}
            </div>

            {/* Advanced Mode options */}
            {searchMode === 'advanced' && (
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-700 cursor-pointer">
                  <input type="checkbox" checked={semantic} onChange={e => setSemantic(e.target.checked)} className="w-3.5 h-3.5 accent-purple-600" />
                  <Sparkles size={12} className="text-purple-600" />
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-200">AI Semantic Search</span>
                </label>

                <button type="button" onClick={() => setShowAdvancedPanel(p => !p)} className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                  {showAdvancedPanel ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {showAdvancedPanel ? 'Hide' : 'Show'} advanced options
                </button>

                {showAdvancedPanel && (
                  <div className="p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800 space-y-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Exact phrase</label>
                      <input value={exactPhrase} onChange={e => setExactPhrase(e.target.value)} placeholder={`"nursing interventions"`} className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Exclude words</label>
                      <input value={excludeWords} onChange={e => setExcludeWords(e.target.value)} placeholder="e.g. pediatric elderly" className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Year from</label>
                        <input type="number" value={yearFrom} onChange={e => setYearFrom(e.target.value)} placeholder="2018" className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Year to</label>
                        <input type="number" value={yearTo} onChange={e => setYearTo(e.target.value)} placeholder="2024" className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none" />
                      </div>
                    </div>
                    <p className="text-[10px] text-purple-600 dark:text-purple-400">Tip: Use AND, OR, NOT operators · author:Name · year:2024</p>
                  </div>
                )}
              </div>
            )}

            {/* Filters panel */}
            {showFilters && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} className="px-2.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none">
                    <option value="">All Categories</option><option value="Completed">Completed</option><option value="Published">Published</option>
                  </select>
                  <select value={filters.yearCompleted} onChange={e => setFilters(f => ({ ...f, yearCompleted: e.target.value }))} className="px-2.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none">
                    <option value="">All Years</option>{years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <select value={filters.subjectArea} onChange={e => setFilters(f => ({ ...f, subjectArea: e.target.value }))} className="w-full px-2.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none">
                  <option value="">All Subjects</option>{subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="text" value={filters.author} onChange={e => setFilters(f => ({ ...f, author: e.target.value }))} placeholder="Author name…" className="w-full px-2.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none placeholder-gray-400" />
                <div className="flex gap-2">
                  <button type="button" onClick={clearAll} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-xl font-bold text-xs flex items-center justify-center gap-1 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"><X size={12} />Clear</button>
                  <button type="button" onClick={() => { performSearch(); setShowFilters(false); }} className="flex-1 py-2 bg-navy text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition"><Filter size={12} />Apply</button>
                </div>
              </div>
            )}
          </form>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              {activeQuery && <FilterChip label={`"${activeQuery.slice(0, 20)}${activeQuery.length > 20 ? '…' : ''}"`} onRemove={() => { setQuery(''); setActiveQuery(''); setPapers(allPapers); }} />}
              {activeFilters.category && <FilterChip label={activeFilters.category} onRemove={() => removeFilter('category')} />}
              {activeFilters.subjectArea && <FilterChip label={activeFilters.subjectArea.slice(0, 20)} onRemove={() => removeFilter('subjectArea')} />}
              {activeFilters.yearCompleted && <FilterChip label={activeFilters.yearCompleted} onRemove={() => removeFilter('yearCompleted')} />}
              {activeFilters.author && <FilterChip label={activeFilters.author} onRemove={() => removeFilter('author')} />}
              {semantic && <FilterChip label="AI Semantic" onRemove={() => setSemantic(false)} />}
            </div>
          )}
        </div>

        {/* ── Recommendations ── */}
        {!activeQuery && recommendations.length > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
            <div className="flex items-center gap-1.5 mb-2">
              <Flame size={13} className="text-orange-500" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Recommended For You</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {recommendations.slice(0, 4).map(paper => {
                const colors = getSubjectColor(paper.subjectArea);
                return (
                  <div key={paper._id} onClick={() => navigate(`/research/${paper._id}`)} className={`flex-shrink-0 w-[180px] bg-white dark:bg-gray-800 rounded-xl border-l-4 ${colors.card} shadow cursor-pointer hover:shadow-md transition p-2.5`}>
                    <span className="text-xs font-bold text-navy dark:text-accent">{paper.category}</span>
                    <h3 className="font-bold text-xs text-gray-900 dark:text-white line-clamp-2 mt-1 mb-1">{paper.title}</h3>
                    <span className="flex items-center gap-0.5 text-xs text-gray-400"><Eye size={9} />{paper.views || 0}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Results Section ── */}
        <div ref={resultsRef}>
          {/* Results Header */}
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <p className="text-xs text-gray-600 dark:text-gray-300">
              <strong className="text-navy dark:text-accent text-sm">{sortedPapers.length}</strong> papers found
              {hasActiveFilters && <button onClick={clearAll} className="ml-1.5 text-xs text-red-500 font-bold inline-flex items-center gap-0.5"><X size={10} />clear all</button>}
            </p>
            <div className="flex items-center gap-1.5">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold focus:outline-none">
                <option value="relevance">Relevance</option>
                <option value="views-desc">Most Viewed</option>
                <option value="date-desc">Newest</option>
                <option value="alpha-asc">A→Z</option>
                <option value="year-desc">Year↓</option>
              </select>
              <div className="flex gap-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-0.5 rounded-lg">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}><Grid size={14} className={viewMode === 'grid' ? 'text-navy dark:text-accent' : 'text-gray-500'} /></button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}><List size={14} className={viewMode === 'list' ? 'text-navy dark:text-accent' : 'text-gray-500'} /></button>
              </div>
            </div>
          </div>

          {/* Subject Legend */}
          {subjects.length > 0 && !activeQuery && (
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 mb-3 scrollbar-hide">
              {subjects.slice(0, 6).map(s => { const c = getSubjectColor(s); return (<span key={s} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border whitespace-nowrap flex-shrink-0 ${c.bg} ${c.border} ${c.text}`}><span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{s}</span>); })}
            </div>
          )}

          {/* Papers grid/list */}
          {loading ? (
            <div className="flex items-center justify-center py-12"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-4 border-navy dark:border-accent mx-auto mb-2" /><p className="text-xs text-gray-500">Searching…</p></div></div>
          ) : sortedPapers.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <BookOpen size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">No papers found</p>
              <p className="text-xs text-gray-500 mb-3">Try different keywords or clear filters</p>
              {hasActiveFilters && <button onClick={clearAll} className="px-4 py-2 bg-navy text-white rounded-xl font-bold text-xs">Show All</button>}
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-4' : 'space-y-2 mb-4'}>
                {paginatedPapers.map(paper => (<PaperCard key={paper._id} paper={paper} onClick={id => navigate(`/research/${id}`)} highlight={activeQuery} viewMode={viewMode} />))}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage} totalItems={sortedPapers.length} />
              </div>
            </>
          )}
        </div>

        {/* Scroll to top */}
        {scrollY > 500 && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-4 w-10 h-10 bg-navy dark:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-navy-800 transition z-30">
            <ArrowUp size={16} />
          </button>
        )}
      </div>

      {/* Tips Modal */}
      {showTips && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTips(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-navy/20 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><Lightbulb size={18} className="text-navy" /><h3 className="font-bold text-gray-900 dark:text-white">Search Tips</h3></div>
              <button onClick={() => setShowTips(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X size={16} /></button>
            </div>
            <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
                <p className="font-bold mb-1 flex items-center gap-1"><Search size={11} />Simple Search</p>
                <p>Type any keyword: diabetes, nursing, pediatric…</p>
              </div>
              <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-700">
                <p className="font-bold mb-1 flex items-center gap-1"><Sparkles size={11} />Advanced / Boolean</p>
                <p>diabetes AND management</p>
                <p className="mt-0.5">pediatric OR children</p>
                <p className="mt-0.5">author:Reyes · year:2024</p>
              </div>
              <div className="p-2.5 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-700">
                <p className="font-bold mb-1 flex items-center gap-1"><Zap size={11} />Advanced Options</p>
                <p>Use exact phrase, exclude words, and year range filters in Advanced mode.</p>
              </div>
              <div className="p-2.5 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl border border-yellow-200 dark:border-yellow-700">
                <p className="font-bold mb-1 flex items-center gap-1"><TrendingUp size={11} />Color Coded Cards</p>
                <p>Cards are color-coded by subject area for easy scanning.</p>
              </div>
              <div className="p-2.5 bg-orange-50 dark:bg-orange-900/30 rounded-xl border border-orange-200 dark:border-orange-700">
                <p className="font-bold mb-1 flex items-center gap-1"><Clock size={11} />Quick Search</p>
                <p>Scroll down to see a floating search bar for quick access anywhere.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFeaturedManager && isAdmin && (
        <FeaturedPapersManager allPapers={allPapers} featuredList={featuredPapers} onSave={handleSaveFeatured} onClose={() => setShowFeaturedManager(false)} />
      )}
    </>
  );
};

export default Explore;