import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import {
  Search, Filter, X, Eye, Calendar, BookOpen, SlidersHorizontal, Sparkles,
  Info, Grid, List, Award, ChevronLeft, ChevronRight, Play, Pause,
  Edit2, Save, Crown, Cpu, HelpCircle, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const useDebounce = (value, delay) => {
  const [d, setD] = useState(value);
  useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return d;
};

const fuzzyMatch = (str, pattern) => {
  const p = pattern.toLowerCase().split(''), s = str.toLowerCase();
  let pi = 0;
  for (let si = 0; si < s.length && pi < p.length; si++) if (s[si] === p[pi]) pi++;
  return pi === p.length;
};

const SUBJECT_COLORS = {
  'Community Health Nursing': { bg:'bg-emerald-50 dark:bg-emerald-900/30', border:'border-emerald-300 dark:border-emerald-700', text:'text-emerald-700 dark:text-emerald-300', dot:'bg-emerald-500', accent:'#10b981' },
  'Medical-Surgical Nursing': { bg:'bg-blue-50 dark:bg-blue-900/30', border:'border-blue-300 dark:border-blue-700', text:'text-blue-700 dark:text-blue-300', dot:'bg-blue-500', accent:'#3b82f6' },
  'Pediatric Nursing': { bg:'bg-pink-50 dark:bg-pink-900/30', border:'border-pink-300 dark:border-pink-700', text:'text-pink-700 dark:text-pink-300', dot:'bg-pink-500', accent:'#ec4899' },
  'Psychiatric Nursing': { bg:'bg-violet-50 dark:bg-violet-900/30', border:'border-violet-300 dark:border-violet-700', text:'text-violet-700 dark:text-violet-300', dot:'bg-violet-500', accent:'#8b5cf6' },
  'Obstetric Nursing': { bg:'bg-rose-50 dark:bg-rose-900/30', border:'border-rose-300 dark:border-rose-700', text:'text-rose-700 dark:text-rose-300', dot:'bg-rose-500', accent:'#f43f5e' },
  'Geriatric Nursing': { bg:'bg-amber-50 dark:bg-amber-900/30', border:'border-amber-300 dark:border-amber-700', text:'text-amber-700 dark:text-amber-300', dot:'bg-amber-500', accent:'#f59e0b' },
  'Critical Care Nursing': { bg:'bg-red-50 dark:bg-red-900/30', border:'border-red-300 dark:border-red-700', text:'text-red-700 dark:text-red-300', dot:'bg-red-500', accent:'#ef4444' },
  'Nursing Education': { bg:'bg-indigo-50 dark:bg-indigo-900/30', border:'border-indigo-300 dark:border-indigo-700', text:'text-indigo-700 dark:text-indigo-300', dot:'bg-indigo-500', accent:'#6366f1' },
  'Nursing Research': { bg:'bg-cyan-50 dark:bg-cyan-900/30', border:'border-cyan-300 dark:border-cyan-700', text:'text-cyan-700 dark:text-cyan-300', dot:'bg-cyan-500', accent:'#06b6d4' },
  'Public Health': { bg:'bg-teal-50 dark:bg-teal-900/30', border:'border-teal-300 dark:border-teal-700', text:'text-teal-700 dark:text-teal-300', dot:'bg-teal-500', accent:'#14b8a6' },
  'Science and Technology': { bg:'bg-sky-50 dark:bg-sky-900/30', border:'border-sky-300 dark:border-sky-700', text:'text-sky-700 dark:text-sky-300', dot:'bg-sky-500', accent:'#0ea5e9' },
  default: { bg:'bg-slate-50 dark:bg-slate-900/30', border:'border-slate-300 dark:border-slate-600', text:'text-slate-600 dark:text-slate-400', dot:'bg-slate-400', accent:'#94a3b8' },
};

const getSubjectColor = (subjectArea) => {
  if (!subjectArea) return SUBJECT_COLORS.default;
  for (const [key, val] of Object.entries(SUBJECT_COLORS)) {
    if (key !== 'default' && subjectArea.toLowerCase().includes(key.toLowerCase())) return val;
  }
  const colors = Object.values(SUBJECT_COLORS).slice(0, -1);
  return colors[subjectArea.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];
};

const Tooltip = memo(({ content, children, position = 'top' }) => {
  const [show, setShow] = useState(false);
  const posClass = position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2';
  return (
    <div className="relative inline-flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className={`absolute left-1/2 -translate-x-1/2 ${posClass} z-50 w-64 bg-gray-900 dark:bg-gray-950 text-white text-xs rounded-xl shadow-2xl p-3 border border-gray-700 pointer-events-none`}>
          {content}
        </div>
      )}
    </div>
  );
});
Tooltip.displayName = 'Tooltip';

const SubjectBadge = memo(({ subjectArea }) => {
  if (!subjectArea) return null;
  const c = getSubjectColor(subjectArea);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.border} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} flex-shrink-0`} />
      <span className="truncate max-w-[100px]">{subjectArea}</span>
    </span>
  );
});
SubjectBadge.displayName = 'SubjectBadge';

const AwardBadge = memo(({ award, small }) => {
  const colorMap = {
    gold: 'bg-yellow-50 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
    silver: 'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600',
    bronze: 'bg-orange-50 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700',
    blue: 'bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
    green: 'bg-green-50 dark:bg-green-900/40 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
    purple: 'bg-purple-50 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700',
  };
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${colorMap[award.color] || colorMap.gold} text-xs font-bold cursor-pointer hover:scale-105 transition`}>
        <Award size={small ? 10 : 12} />{!small && <span className="hidden sm:inline max-w-[80px] truncate">{award.name}</span>}
      </div>
      {show && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-50 border border-gray-700">{award.name}<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" /></div>}
    </div>
  );
});
AwardBadge.displayName = 'AwardBadge';

const HeroBanner = memo(({ bannerImages }) => {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const [paused, setPaused] = useState(false);
  const goTo = useCallback((idx) => {
    if (idx === current) return;
    setFading(true); setTimeout(() => { setCurrent(idx); setFading(false); }, 600);
  }, [current]);
  const next = useCallback(() => goTo((current + 1) % bannerImages.length), [current, bannerImages.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + bannerImages.length) % bannerImages.length), [current, bannerImages.length, goTo]);
  useEffect(() => {
    if (paused || bannerImages.length <= 1) return;
    const t = setInterval(next, 5000); return () => clearInterval(t);
  }, [next, paused, bannerImages.length]);
  if (!bannerImages.length) return null;
  const img = bannerImages[current];
  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl" style={{ height: 'clamp(160px, 32vw, 320px)' }}>
      <div className="absolute inset-0 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url(${img.url})`, opacity: fading ? 0 : 1, transform: fading ? 'scale(1.03)' : 'scale(1)' }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      {img.caption && <div className="absolute bottom-10 left-5 right-16 md:left-8"><p className="text-white font-bold text-sm md:text-base drop-shadow-lg max-w-xl" style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.5s ease 0.1s' }}>{img.caption}</p></div>}
      {bannerImages.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition"><ChevronLeft size={18} /></button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition"><ChevronRight size={18} /></button>
          <button onClick={() => setPaused(p => !p)} className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition">{paused ? <Play size={13} /> : <Pause size={13} />}</button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {bannerImages.map((_, i) => <button key={i} onClick={() => goTo(i)} className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`} />)}
          </div>
          {!paused && <div className="absolute bottom-0 left-0 h-0.5 bg-white/30 w-full"><div key={current} className="h-full bg-white/80" style={{ animation: 'progress-bar 5s linear forwards' }} /></div>}
        </>
      )}
      <div className="absolute top-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full text-white text-xs font-bold">{current + 1} / {bannerImages.length}</div>
    </div>
  );
});
HeroBanner.displayName = 'HeroBanner';

const FeaturedPapersSection = memo(({ papers, onPaperClick, isAdmin, onManage }) => {
  const [hoveredId, setHoveredId] = useState(null);
  if (!papers.length && !isAdmin) return null;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 dark:from-amber-500/20 dark:to-yellow-500/20 rounded-full border border-amber-300/50 dark:border-amber-600/50">
            <Crown size={15} className="text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Featured Research</span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">Curated by administrators</span>
        </div>
        {isAdmin && (
          <button onClick={onManage} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 transition">
            <Edit2 size={12} />Manage Featured
          </button>
        )}
      </div>
      {papers.length === 0 && isAdmin ? (
        <div className="border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-2xl p-8 text-center bg-amber-50/30 dark:bg-amber-900/10">
          <Crown size={32} className="mx-auto text-amber-400 mb-2" />
          <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1 text-sm">No featured papers yet</p>
          <button onClick={onManage} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition shadow-md mt-2"><Plus size={14} />Add Featured Papers</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {papers.map((item, i) => {
            const paper = item.paper || item;
            const caption = item.caption || '';
            const colors = getSubjectColor(paper.subjectArea);
            const isHovered = hoveredId === paper._id;
            return (
              <div key={paper._id} onClick={() => onPaperClick(paper._id)} onMouseEnter={() => setHoveredId(paper._id)} onMouseLeave={() => setHoveredId(null)}
                className="group relative cursor-pointer" style={{ animation: isHovered ? 'none' : `float-card ${3.5 + (i % 3) * 0.6}s ease-in-out ${i * 0.4}s infinite` }}>
                <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-300 blur-sm" style={{ background: `linear-gradient(135deg, ${colors.accent}40, ${colors.accent}20)` }} />
                <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 overflow-hidden ${isHovered ? '-translate-y-2 scale-[1.02]' : ''}`}
                  style={{ border: '1px solid rgba(0,0,0,0.06)', borderLeft: `4px solid ${colors.accent}` }}>
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent}60, transparent)` }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${colors.accent}20` }}><Crown size={12} style={{ color: colors.accent }} /></div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colors.bg} ${colors.border} ${colors.text}`}>{paper.category}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400"><Eye size={10} />{paper.views || 0}</div>
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2 leading-snug group-hover:text-navy dark:group-hover:text-accent transition-colors">{paper.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">{paper.abstract}</p>
                    {caption && (
                      <div className="flex items-start gap-2 px-2.5 py-2 rounded-xl mb-3" style={{ background: `${colors.accent}10`, border: `1px solid ${colors.accent}30` }}>
                        <Info size={11} style={{ color: colors.accent }} className="flex-shrink-0 mt-0.5" />
                        <p className="text-xs italic line-clamp-2" style={{ color: colors.accent }}>{caption}</p>
                      </div>
                    )}
                    {paper.awards?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {paper.awards.slice(0, 2).map((a, j) => <AwardBadge key={j} award={a} small />)}
                        {paper.awards.length > 2 && <span className="text-xs text-gray-400">+{paper.awards.length - 2}</span>}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-gray-700">
                      <SubjectBadge subjectArea={paper.subjectArea} />
                      {paper.yearCompleted && <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar size={10} />{paper.yearCompleted}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
FeaturedPapersSection.displayName = 'FeaturedPapersSection';

const FeaturedPapersManager = memo(({ allPapers, featuredList, onSave, onClose }) => {
  const [selected, setSelected] = useState(featuredList.map(f => ({ paperId: (f.paperId || f.paper?._id || f._id)?.toString(), caption: f.caption || '' })));
  const [search, setSearch] = useState('');
  const filtered = allPapers.filter(p => p.title?.toLowerCase().includes(search.toLowerCase())).slice(0, 20);
  const isSelected = (id) => selected.some(s => s.paperId === id?.toString());
  const toggle = (paper) => {
    const id = paper._id?.toString();
    if (isSelected(id)) setSelected(prev => prev.filter(s => s.paperId !== id));
    else { if (selected.length >= 8) return; setSelected(prev => [...prev, { paperId: id, caption: '' }]); }
  };
  const updateCaption = (paperId, caption) => setSelected(prev => prev.map(s => s.paperId === paperId ? { ...s, caption } : s));
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border-2 border-amber-300/40">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Crown size={20} className="text-amber-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">Manage Featured Papers</h3>
            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">{selected.length}/8</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {selected.length > 0 && (
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Selected ({selected.length})</p>
              <div className="space-y-2">
                {selected.map(s => {
                  const paper = allPapers.find(p => p._id?.toString() === s.paperId);
                  if (!paper) return null;
                  return (
                    <div key={s.paperId} className="flex gap-2 items-start p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">{paper.title}</p>
                        <input value={s.caption} onChange={e => updateCaption(s.paperId, e.target.value)} placeholder="Optional caption shown to users" className="w-full text-xs px-2.5 py-1.5 border border-amber-300 dark:border-amber-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-500" />
                      </div>
                      <button onClick={() => toggle(paper)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex-shrink-0"><X size={14} /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Add Papers</p>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search papers..." className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm mb-2 focus:outline-none focus:border-navy dark:bg-gray-700 dark:text-white" />
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {filtered.map(p => (
                <div key={p._id} onClick={() => toggle(p)} className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition ${isSelected(p._id) ? 'bg-navy/10 dark:bg-navy/20 border border-navy/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'}`}>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${isSelected(p._id) ? 'bg-navy border-navy' : 'border-gray-300 dark:border-gray-600'}`}>
                    {isSelected(p._id) && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1">{p.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{p.subjectArea} · {p.yearCompleted}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
          <button onClick={() => { onSave(selected); onClose(); }} className="flex-1 px-4 py-2.5 bg-navy dark:bg-blue-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-2"><Save size={15} />Save Featured</button>
        </div>
      </div>
    </div>
  );
});
FeaturedPapersManager.displayName = 'FeaturedPapersManager';

const PaperCard = memo(({ paper, onClick, highlight, viewMode }) => {
  const colors = getSubjectColor(paper.subjectArea);
  const hl = (text) => {
    if (!highlight || !text) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(regex).map((part, i) => regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/60 text-gray-900 dark:text-yellow-100 rounded px-0.5">{part}</mark> : part);
  };
  if (viewMode === 'list') return (
    <div onClick={() => onClick(paper._id)} className="group bg-white dark:bg-gray-800/80 rounded-xl border-l-4 border border-gray-200 dark:border-gray-700/60 p-3 cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5" style={{ borderLeftColor: colors.accent }}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-navy/10 to-accent/10 rounded-lg flex items-center justify-center"><BookOpen size={18} className="text-navy dark:text-accent" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-navy dark:group-hover:text-accent transition-colors">{hl(paper.title)}</h3>
            <span className="px-2 py-0.5 bg-navy/10 text-navy dark:bg-accent/20 dark:text-accent rounded text-xs font-semibold whitespace-nowrap flex-shrink-0">{paper.category}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-1.5">{hl(paper.abstract)}</p>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-500"><Eye size={10} />{paper.views || 0}</span>
              {paper.yearCompleted && <span className="flex items-center gap-1 text-xs text-gray-500"><Calendar size={10} />{paper.yearCompleted}</span>}
              {paper.subjectArea && <SubjectBadge subjectArea={paper.subjectArea} />}
            </div>
            {paper.awards?.length > 0 && <div className="flex items-center gap-1">{paper.awards.slice(0, 2).map((a, i) => <AwardBadge key={i} award={a} small />)}{paper.awards.length > 2 && <span className="text-xs text-gray-500">+{paper.awards.length - 2}</span>}</div>}
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div onClick={() => onClick(paper._id)} className="group bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700/60 p-4 cursor-pointer hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col overflow-hidden relative" style={{ borderLeft: `4px solid ${colors.accent}` }}>
      <div className="flex items-start justify-between mb-2.5">
        <span className="px-2.5 py-1 bg-navy/10 text-navy dark:bg-accent/20 dark:text-accent rounded-lg text-xs font-bold">{paper.category}</span>
        <span className="flex items-center gap-1 text-xs text-gray-400"><Eye size={11} />{paper.views || 0}</span>
      </div>
      <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-navy dark:group-hover:text-accent transition-colors leading-snug">{hl(paper.title)}</h3>
      <div className="mb-2 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600/50">
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1 font-medium">{hl(paper.authors?.join(' • '))}</p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2.5 line-clamp-2 flex-1 leading-relaxed">{hl(paper.abstract)}</p>
      {paper.awards?.length > 0 && <div className="flex flex-wrap gap-1.5 mb-2.5">{paper.awards.slice(0, 3).map((a, i) => <AwardBadge key={i} award={a} />)}{paper.awards.length > 3 && <span className="text-xs text-gray-500 self-center">+{paper.awards.length - 3}</span>}</div>}
      <div className="flex flex-wrap gap-2 text-xs text-gray-400 dark:text-gray-500 pt-2.5 border-t border-gray-100 dark:border-gray-700/50 mt-auto">
        {paper.yearCompleted && <span className="flex items-center gap-1"><Calendar size={10} />{paper.yearCompleted}</span>}
        {paper.subjectArea && <SubjectBadge subjectArea={paper.subjectArea} />}
      </div>
    </div>
  );
});
PaperCard.displayName = 'PaperCard';

const Pagination = memo(({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange, totalItems }) => {
  const pages = useMemo(() => {
    const range = [], dots = [];
    for (let i = 1; i <= totalPages; i++) { if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) range.push(i); }
    let prev = 0;
    for (const i of range) { if (prev + 1 !== i) dots.push('...'); dots.push(i); prev = i; }
    return dots;
  }, [currentPage, totalPages]);
  const start = (currentPage - 1) * itemsPerPage + 1, end = Math.min(currentPage * itemsPerPage, totalItems);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
        <span className="font-semibold">Showing {start}–{end} of {totalItems}</span>
        <select value={itemsPerPage} onChange={e => onItemsPerPageChange(Number(e.target.value))} className="px-2 py-1 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold">
          {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/page</option>)}
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

// ══════════════════════════════════════════════
// MAIN EXPLORE COMPONENT
// ══════════════════════════════════════════════
const Explore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const API_URL = import.meta.env.VITE_API_URL;

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
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [featuredPapers, setFeaturedPapers] = useState([]);
  const [showFeaturedManager, setShowFeaturedManager] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

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
      const [res, settingsRes] = await Promise.all([
        fetch(`${API_URL}/research?status=approved&limit=1000`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/settings`).catch(() => ({ ok: false }))
      ]);
      if (res.ok) {
        const data = await res.json();
        const p = data.papers || [];
        setPapers(p); setAllPapers(p);
        setYears([...new Set(p.map(x => x.yearCompleted).filter(Boolean))].sort((a, b) => b - a));
        setSubjects([...new Set(p.map(x => x.subjectArea).filter(Boolean))].sort());
      }
      if (settingsRes.ok) {
        const sd = await settingsRes.json();
        const imgs = [];
        if (sd.settings?.logos?.heroBg?.url) imgs.push({ url: sd.settings.logos.heroBg.url, caption: 'NEUST College of Nursing Research Repository' });
        if (sd.settings?.bannerImages?.length) sd.settings.bannerImages.forEach(b => imgs.push(b));
        if (!imgs.length) imgs.push({ url: '', caption: '' });
        setBannerImages(imgs);
        // ✅ Load featuredPapers for ALL users from settings
        if (sd.settings?.featuredPapers?.length) setFeaturedPapers(sd.settings.featuredPapers);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setInitialLoad(false); }
  };

  // ✅ FIX: Robust ID matching with toString() for all users
  const resolvedFeatured = useMemo(() => {
    if (!featuredPapers.length || !allPapers.length) return [];
    return featuredPapers.map(f => {
      const paperId = (f.paperId || f)?.toString?.() || String(f.paperId || f);
      const paper = allPapers.find(p => p._id?.toString() === paperId);
      return paper ? { paper, caption: f.caption || '' } : null;
    }).filter(Boolean);
  }, [featuredPapers, allPapers]);

  const handleSaveFeatured = async (selected) => {
    setFeaturedPapers(selected);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/settings`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ featuredPapers: selected })
      });
    } catch (e) { console.error('Failed to save featured papers', e); }
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

  const paginatedPapers = useMemo(() => sortedPapers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [sortedPapers, currentPage, itemsPerPage]);
  const totalPages = Math.ceil(sortedPapers.length / itemsPerPage);

  const performSearch = async () => {
    setLoading(true); setActiveQuery(query); setActiveFilters(filters); setShowSuggestions(false); setCurrentPage(1);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        status: 'approved', limit: 1000,
        ...(query && { [searchMode === 'advanced' ? 'query' : 'search']: query }),
        ...(filters.category && { category: filters.category }),
        ...(filters.yearCompleted && { yearCompleted: filters.yearCompleted }),
        ...(filters.subjectArea && { subjectArea: filters.subjectArea }),
        ...(filters.author && { author: filters.author }),
        ...(searchMode === 'advanced' && semantic && { semantic: 'true' }),
      });
      const endpoint = searchMode === 'advanced' ? '/search/advanced' : '/research';
      const res = await fetch(`${API_URL}${endpoint}?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setPapers(d.papers || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const clearAll = useCallback(() => {
    setQuery(''); setActiveQuery('');
    setFilters({ category: '', yearCompleted: '', subjectArea: '', author: '' });
    setActiveFilters({ category: '', yearCompleted: '', subjectArea: '', author: '' });
    setSemantic(false); setSuggestions([]); setShowSuggestions(false);
    setSortBy('relevance'); setCurrentPage(1); setPapers(allPapers);
  }, [allPapers]);

  const activeCount = useMemo(() => Object.values(activeFilters).filter(Boolean).length + (activeQuery ? 1 : 0) + (semantic ? 1 : 0), [activeFilters, activeQuery, semantic]);
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' }, { value: 'views-desc', label: 'Most Viewed' },
    { value: 'date-desc', label: 'Newest' }, { value: 'date-asc', label: 'Oldest' },
    { value: 'alpha-asc', label: 'A → Z' }, { value: 'alpha-desc', label: 'Z → A' },
    { value: 'awards-desc', label: 'Most Awards' }, { value: 'year-desc', label: 'Year ↓' }, { value: 'year-asc', label: 'Year ↑' },
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
      <style>{`
        @keyframes progress-bar { from { width: 0% } to { width: 100% } }
        @keyframes float-card {
          0% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-6px) rotate(0.3deg); }
          66% { transform: translateY(-3px) rotate(-0.3deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}</style>

      <div className="min-h-screen pb-8 bg-gray-50 dark:bg-gray-950 space-y-5">

        {/* ══ SECTION 1: HERO BANNER ══ */}
        <div>
          {bannerImages.some(b => b.url) ? (
            <HeroBanner bannerImages={bannerImages.filter(b => b.url)} />
          ) : (
            <div className="relative w-full overflow-hidden rounded-2xl shadow-xl" style={{ height: 'clamp(140px, 28vw, 260px)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-navy via-blue-700 to-accent" />
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-6 text-center">
                <div className="flex items-center gap-3 mb-2"><BookOpen size={28} className="opacity-90" /><h1 className="text-2xl md:text-3xl font-black tracking-tight">Explore Research</h1></div>
                <p className="text-blue-100 text-sm md:text-base opacity-90">Discover nursing research papers from NEUST College of Nursing</p>
              </div>
            </div>
          )}
        </div>

        {/* ══ SECTION 2: FEATURED PAPERS ══ */}
        {(resolvedFeatured.length > 0 || isAdmin) && (
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <FeaturedPapersSection papers={resolvedFeatured} onPaperClick={id => navigate(`/research/${id}`)} isAdmin={isAdmin} onManage={() => setShowFeaturedManager(true)} />
          </div>
        )}

        {/* ══ SECTION 3: SEARCH & FILTER ══ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-navy/5 to-white dark:from-navy/20 dark:to-gray-800">
            <div className="w-8 h-8 bg-navy dark:bg-blue-600 rounded-lg flex items-center justify-center"><Search size={16} className="text-white" /></div>
            <span className="font-bold text-gray-800 dark:text-gray-200">Search & Filter</span>
            {activeCount > 0 && <span className="ml-auto text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-bold px-2 py-0.5 rounded-full">{activeCount} active</span>}
          </div>
          <div className="p-5 space-y-4">
            {/* Mode Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setSearchMode('simple')} className={`px-3 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${searchMode === 'simple' ? 'bg-navy text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'}`}><Search size={15} />Simple Search</button>
              <button onClick={() => setSearchMode('advanced')} className={`px-3 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${searchMode === 'advanced' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'}`}><Sparkles size={15} />Advanced</button>
            </div>
            {/* Search Input */}
            <form onSubmit={e => { e.preventDefault(); performSearch(); }}>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                  onFocus={() => suggestions.length && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder={searchMode === 'advanced' ? 'e.g. diabetes AND management OR author:Reyes' : 'Search by title, author, keyword…'}
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm transition" />
                {query && <button type="button" onClick={() => { setQuery(''); setSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border-2 border-navy/20 dark:border-accent/30 rounded-xl shadow-2xl z-20 overflow-hidden">
                    {suggestions.map((s, i) => (
                      <button key={i} type="button" onClick={() => { setQuery(s.text); setShowSuggestions(false); setTimeout(performSearch, 100); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center gap-2.5 transition">
                        <span className="text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{s.text}</span>
                        <span className="ml-auto text-xs text-gray-400 capitalize">{s.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {searchMode === 'advanced' && (
                <label className="flex items-center gap-2.5 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-700 cursor-pointer mb-3">
                  <input type="checkbox" checked={semantic} onChange={e => setSemantic(e.target.checked)} className="w-4 h-4 rounded accent-purple-600" />
                  <Cpu size={14} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex-1">AI Semantic Search</span>
                  <Tooltip position="bottom" content={<div className="space-y-1.5"><p className="font-bold text-white text-xs">AI Semantic Search</p><p className="text-gray-300 text-xs leading-relaxed">Understands meaning — finds related papers even with different wording.</p><p className="text-yellow-300 text-xs mt-1">⚡ Uses TF-IDF ranking.</p></div>}>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-800/50 rounded-full text-purple-600 dark:text-purple-300 text-xs font-semibold cursor-help hover:bg-purple-200 transition"><HelpCircle size={11} />What's this?</div>
                  </Tooltip>
                </label>
              )}
              {searchMode === 'advanced' && (
                <div className="px-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 mb-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300"><strong>Tips:</strong> <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">AND</code> <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">OR</code> <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">NOT</code> · Field: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">author:Reyes</code> <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">year:2024</code></p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button type="submit" disabled={loading} className="py-2.5 bg-navy hover:bg-navy-800 text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition shadow-md">
                  {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Search size={16} />}{loading ? 'Searching…' : 'Search'}
                </button>
                <button type="button" onClick={() => setShowFilters(f => !f)} className={`py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition border-2 ${showFilters ? 'bg-navy text-white border-navy shadow-md' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50'}`}>
                  <SlidersHorizontal size={16} />Filters{activeCount > 0 && <span className="bg-red-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full leading-none">{activeCount}</span>}
                </button>
              </div>
            </form>
            {showFilters && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 animate-fade-in">
                <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100">
                  <option value="">All Categories</option><option value="Completed">Completed</option><option value="Published">Published</option>
                </select>
                <select value={filters.yearCompleted} onChange={e => setFilters(f => ({ ...f, yearCompleted: e.target.value }))} className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100">
                  <option value="">All Years</option>{years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={filters.subjectArea} onChange={e => setFilters(f => ({ ...f, subjectArea: e.target.value }))} className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100">
                  <option value="">All Subjects</option>{subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="text" value={filters.author} onChange={e => setFilters(f => ({ ...f, author: e.target.value }))} placeholder="Filter by author name…" className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400" />
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button type="button" onClick={clearAll} className="py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"><X size={14} />Clear All</button>
                  <button type="button" onClick={() => { performSearch(); setShowFilters(false); }} className="py-2 bg-navy hover:bg-navy-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition"><Filter size={14} />Apply</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ SECTION 4: RESULTS ══ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex-wrap">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-navy dark:text-accent" />
              <span className="font-bold text-sm text-gray-800 dark:text-gray-200"><strong className="text-navy dark:text-accent">{sortedPapers.length}</strong> Papers</span>
              {activeCount > 0 && <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-600 font-bold inline-flex items-center gap-0.5 ml-1"><X size={11} />clear filters</button>}
            </div>
            <div className="flex items-center gap-2">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs border-2 border-gray-300 dark:border-gray-600 rounded-xl px-2.5 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold focus:border-navy focus:outline-none">
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 p-1 rounded-xl">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-600' : ''}`}><Grid size={16} className={viewMode === 'grid' ? 'text-navy dark:text-accent' : 'text-gray-500'} /></button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-600' : ''}`}><List size={16} className={viewMode === 'list' ? 'text-navy dark:text-accent' : 'text-gray-500'} /></button>
              </div>
            </div>
          </div>

          {subjects.length > 0 && (
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Subject Legend</p>
              <div className="flex flex-wrap gap-1.5">
                {subjects.slice(0, 8).map(s => {
                  const c = getSubjectColor(s);
                  return <button key={s} onClick={() => setFilters(f => ({ ...f, subjectArea: f.subjectArea === s ? '' : s }))} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition hover:scale-105 ${c.bg} ${c.border} ${c.text} ${filters.subjectArea === s ? 'ring-2 ring-offset-1' : ''}`}><span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{s}</button>;
                })}
                {subjects.length > 8 && <span className="text-xs text-gray-400 self-center">+{subjects.length - 8} more</span>}
              </div>
            </div>
          )}

          <div className="p-5">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-4 border-navy dark:border-accent mx-auto mb-3" /><p className="text-xs text-gray-500 font-semibold">Searching…</p></div>
              </div>
            ) : sortedPapers.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen size={44} className="mx-auto text-gray-300 mb-3" />
                <p className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">No papers found</p>
                <p className="text-xs text-gray-500 mb-4">Try different keywords or clear filters</p>
                {activeCount > 0 && <button onClick={clearAll} className="px-5 py-2 bg-navy text-white rounded-xl font-bold text-sm transition shadow-md">Show All Papers</button>}
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5' : 'space-y-3 mb-5'}>
                  {paginatedPapers.map(paper => <PaperCard key={paper._id} paper={paper} onClick={id => navigate(`/research/${id}`)} highlight={activeQuery} viewMode={viewMode} />)}
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage} totalItems={sortedPapers.length} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showFeaturedManager && isAdmin && (
        <FeaturedPapersManager allPapers={allPapers} featuredList={featuredPapers} onSave={handleSaveFeatured} onClose={() => setShowFeaturedManager(false)} />
      )}
    </>
  );
};

export default Explore;