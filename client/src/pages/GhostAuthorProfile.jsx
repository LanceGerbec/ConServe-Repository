// client/src/pages/GhostAuthorProfile.jsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Eye, Quote, Hash, User, ChevronDown, ChevronUp, Award, Info } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const SUBJECT_COLORS = {
  'Community Health Nursing': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Medical-Surgical Nursing': 'bg-blue-100 text-blue-800 border-blue-300',
  'Pediatric Nursing': 'bg-pink-100 text-pink-800 border-pink-300',
  'Psychiatric Nursing': 'bg-violet-100 text-violet-800 border-violet-300',
  'Obstetric Nursing': 'bg-rose-100 text-rose-800 border-rose-300',
  'Geriatric Nursing': 'bg-amber-100 text-amber-800 border-amber-300',
  'Critical Care Nursing': 'bg-red-100 text-red-800 border-red-300',
  'Nursing Education': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'Nursing Research': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'Public Health': 'bg-teal-100 text-teal-800 border-teal-300',
};
const getSubjectColor = (s) => SUBJECT_COLORS[s] || 'bg-slate-100 text-slate-700 border-slate-300';

const PaperRow = ({ paper, index }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0 py-3 group">
      <div className="flex gap-3">
        <span className="text-xs text-gray-400 font-mono w-5 flex-shrink-0 pt-0.5">{index + 1}.</span>
        <div className="flex-1 min-w-0">
          <button onClick={() => navigate(`/research/${paper._id}`)} className="text-left w-full">
            <h3 className="font-semibold text-sm text-navy dark:text-accent hover:underline leading-snug mb-1">{paper.title}</h3>
          </button>
          <p className="text-xs text-gray-500 mb-1">{paper.authors?.join(', ')}</p>
          {paper.subjectArea && (
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border mb-1.5 ${getSubjectColor(paper.subjectArea)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />{paper.subjectArea}
            </span>
          )}
          {expanded && paper.abstract && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed border-l-2 border-gray-200 pl-2">{paper.abstract}</p>}
          {paper.abstract && (
            <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-0.5 text-[10px] text-navy dark:text-accent font-semibold mt-1 hover:underline">
              {expanded ? <><ChevronUp size={10} />Less</> : <><ChevronDown size={10} />Abstract</>}
            </button>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0 text-xs text-gray-500">
          <div className="flex items-center gap-1"><Eye size={11} /><span className="font-bold">{paper.views || 0}</span></div>
          <div className="flex items-center gap-1"><Quote size={11} /><span>{paper.citations || 0}</span></div>
          {paper.yearCompleted && <span className="text-gray-400">{paper.yearCompleted}</span>}
        </div>
      </div>
      {paper.awards?.length > 0 && (
        <div className="flex flex-wrap gap-1 ml-8 mt-1">
          {paper.awards.slice(0, 2).map((a, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-800 border border-yellow-300 rounded-full text-[10px] font-bold"><Award size={9} />{a.name}</span>
          ))}
        </div>
      )}
    </div>
  );
};

const GhostAuthorProfile = () => {
  const { ghostId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  useEffect(() => { fetchProfile(); }, [ghostId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/ghost-authors/${ghostId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setError('Author not found'); setLoading(false); return; }
      setData(await res.json());
    } catch { setError('Connection error'); }
    finally { setLoading(false); }
  };

  const filteredPapers = useMemo(() => {
    if (!data?.papers) return [];
    return filterSubject ? data.papers.filter(p => p.subjectArea === filterSubject) : data.papers;
  }, [data, filterSubject]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-4 border-navy dark:border-accent" /></div>;
  if (error || !data) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow border max-w-sm w-full">
        <User size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="font-bold text-gray-700 dark:text-gray-300 mb-2">Author not found</p>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mx-auto text-navy dark:text-accent text-sm mt-3"><ArrowLeft size={16} />Go back</button>
      </div>
    </div>
  );

  const { ghost, stats, analytics } = data;
  const initials = ghost.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-navy dark:text-accent hover:underline font-semibold text-sm mb-4 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />Back
      </button>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* LEFT */}
        <div className="xl:w-64 flex-shrink-0 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="h-14 bg-gradient-to-r from-gray-500 to-gray-600" />
            <div className="px-5 pb-5 -mt-7">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 border-4 border-white dark:border-gray-800 shadow-lg mb-3 flex items-center justify-center">
                <span className="text-white text-lg font-black">{initials}</span>
              </div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white mb-1">{ghost.name}</h1>
              {ghost.affiliation && <p className="text-sm text-gray-500 mb-2">{ghost.affiliation}</p>}

              {/* No-account notice */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-xs text-amber-800 dark:text-amber-300 mb-3">
                <Info size={13} className="flex-shrink-0 mt-0.5" />
                <span>This author doesn't have a platform account. Their papers are attributed from co-authorship records.</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                  <p className="text-lg font-black text-blue-600">{stats.totalPapers}</p>
                  <p className="text-[10px] text-gray-500">Papers</p>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                  <p className="text-lg font-black text-purple-600">{stats.totalViews}</p>
                  <p className="text-[10px] text-gray-500">Views</p>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                  <p className="text-lg font-black text-green-600">{stats.totalCitations}</p>
                  <p className="text-[10px] text-gray-500">Cited</p>
                </div>
              </div>
            </div>
          </div>

          {/* Clickable Subject Areas */}
          {analytics.subjectAreas.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Hash size={12} />SUBJECT AREAS</h3>
              {analytics.subjectAreas.map(s => (
                <button key={s} onClick={() => setFilterSubject(filterSubject === s ? '' : s)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border mb-1 ${filterSubject === s ? `${getSubjectColor(s)} border-2` : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <h2 className="font-black text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <BookOpen size={14} className="text-navy dark:text-accent" />Papers ({filteredPapers.length})
              </h2>
            </div>
            <div className="px-5 divide-y divide-gray-50 dark:divide-gray-800">
              {filteredPapers.length === 0
                ? <div className="text-center py-12"><BookOpen size={32} className="mx-auto text-gray-300 mb-2" /><p className="text-sm text-gray-500">No papers</p></div>
                : filteredPapers.map((p, i) => <PaperRow key={p._id} paper={p} index={i} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GhostAuthorProfile;