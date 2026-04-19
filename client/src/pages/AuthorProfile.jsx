// client/src/pages/AuthorProfile.jsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Eye, Heart, Bookmark, Quote, Mail, Globe, Award,
  Calendar, User, ExternalLink, Hash, BarChart3, Briefcase, GraduationCap,
  UserPlus, UserCheck, Users, ChevronDown, ChevronUp, Search, UserX
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const SUBJECT_COLORS = {
  'Community Health Nursing': 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300',
  'Medical-Surgical Nursing': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
  'Pediatric Nursing': 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300',
  'Psychiatric Nursing': 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/30 dark:text-violet-300',
  'Obstetric Nursing': 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300',
  'Geriatric Nursing': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300',
  'Critical Care Nursing': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
  'Nursing Education': 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300',
  'Nursing Research': 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300',
  'Public Health': 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300',
};
const getSubjectColor = (s) => SUBJECT_COLORS[s] || 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300';

const StatPill = ({ icon: Icon, value, label, color }) => (
  <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 ${color}`}>
    <Icon size={16} className="mb-1 opacity-70" />
    <span className="text-xl font-black tabular-nums leading-none">{value ?? 0}</span>
    <span className="text-[10px] font-bold mt-0.5 uppercase tracking-wider opacity-60">{label}</span>
  </div>
);

const YearChart = ({ yearlyData }) => {
  const entries = Object.entries(yearlyData).sort(([a], [b]) => a - b);
  if (!entries.length) return null;
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <div>
      <div className="flex items-end gap-1.5 h-16">
        {entries.map(([year, count]) => (
          <div key={year} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full bg-navy/70 dark:bg-accent/70 rounded-t hover:bg-navy dark:hover:bg-accent transition-all" style={{ height: `${Math.max(4, (count / max) * 52)}px` }} title={`${year}: ${count}`} />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1">{entries.map(([y]) => <div key={y} className="flex-1 text-center text-[9px] text-gray-400 font-semibold">{y}</div>)}</div>
    </div>
  );
};

// Resolve an author name to a link using the paper's coAuthorLinks
const resolveAuthorLink = (name, coAuthorLinks, submittedBy) => {
  if (!name) return null;
  const normalized = name.toLowerCase().trim();
  // Check submittedBy
  if (submittedBy && `${submittedBy.firstName} ${submittedBy.lastName}`.toLowerCase() === normalized) {
    return { type: 'user', id: submittedBy._id };
  }
  // Check coAuthorLinks
  if (coAuthorLinks?.length) {
    const link = coAuthorLinks.find(l => l.name?.toLowerCase().trim() === normalized);
    if (link) {
      if (link.userId) return { type: 'user', id: link.userId._id || link.userId };
      if (link.ghostId) return { type: 'ghost', id: link.ghostId._id || link.ghostId };
    }
  }
  return null;
};

const AuthorNameLink = ({ name, coAuthorLinks, submittedBy }) => {
  const navigate = useNavigate();
  const link = resolveAuthorLink(name, coAuthorLinks, submittedBy);
  if (!link) return <span className="text-gray-500 dark:text-gray-400">{name}</span>;
  const handleClick = () => {
    if (link.type === 'user') navigate(`/author/${link.id}`);
    else navigate(`/ghost-author/${link.id}`);
  };
  return (
    <button onClick={handleClick} className="text-navy dark:text-accent hover:underline font-medium transition-colors" title={`View ${name}'s profile`}>
      {name}
    </button>
  );
};

const PaperRow = ({ paper, index, onSubjectClick }) => {
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
          {/* Clickable author names */}
          <div className="flex flex-wrap gap-x-1 gap-y-0.5 text-xs text-gray-500 mb-1">
            {paper.authors?.map((author, i) => (
              <span key={i}>
                <AuthorNameLink name={author} coAuthorLinks={paper.coAuthorLinks} submittedBy={paper.submittedBy} />
                {i < paper.authors.length - 1 && <span className="text-gray-300">,</span>}
              </span>
            ))}
          </div>
          {paper.subjectArea && (
            <button onClick={() => onSubjectClick(paper.subjectArea)}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border mb-1.5 hover:opacity-80 transition ${getSubjectColor(paper.subjectArea)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />{paper.subjectArea}
            </button>
          )}
          {expanded && paper.abstract && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed border-l-2 border-gray-200 dark:border-gray-700 pl-2">{paper.abstract}</p>
          )}
          {paper.abstract && (
            <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-0.5 text-[10px] text-navy dark:text-accent font-semibold mt-1 hover:underline">
              {expanded ? <><ChevronUp size={10} />Less</> : <><ChevronDown size={10} />Abstract</>}
            </button>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0 text-xs text-gray-500">
          <div className="flex items-center gap-1"><Eye size={11} /><span className="font-bold text-gray-700 dark:text-gray-300">{paper.views || 0}</span></div>
          <div className="flex items-center gap-1"><Quote size={11} /><span>{paper.citations || 0}</span></div>
          {paper.yearCompleted && <span className="text-gray-400">{paper.yearCompleted}</span>}
        </div>
      </div>
      {paper.awards?.length > 0 && (
        <div className="flex flex-wrap gap-1 ml-8 mt-1">
          {paper.awards.slice(0, 3).map((a, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700 rounded-full text-[10px] font-bold">
              <Award size={9} />{a.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const FollowersModal = ({ isOpen, onClose, title, users }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm max-h-[70vh] flex flex-col border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Users size={16} className="text-navy dark:text-accent" />{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {users.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No users yet</p>
          ) : users.map(u => (
            <button key={u._id} onClick={() => { navigate(`/author/${u._id}`); onClose(); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
                {u.avatar ? <img src={u.avatar} alt={u.firstName} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-navy to-accent flex items-center justify-center"><span className="text-white font-black text-xs">{u.firstName?.[0]}{u.lastName?.[0]}</span></div>}
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{u.firstName} {u.lastName}</p>
                <p className="text-xs text-gray-400 capitalize">{u.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const AuthorProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('views');
  const [filterSubject, setFilterSubject] = useState('');
  const [followLoading, setFollowLoading] = useState(false);
  const [social, setSocial] = useState({ followers: 0, following: 0, isFollowing: false });
  const [followModal, setFollowModal] = useState({ open: false, type: '', users: [] });

  useEffect(() => { fetchProfile(); }, [userId]);

  const fetchProfile = async () => {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/author-profiles/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setError('Author not found'); setLoading(false); return; }
      const d = await res.json();
      setData(d);
      setSocial(d.social || { followers: 0, following: 0, isFollowing: false });
    } catch { setError('Connection error'); }
    finally { setLoading(false); }
  };

  const handleFollow = async () => {
    if (!currentUser || currentUser.id === userId || currentUser._id === userId) return;
    setFollowLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/follows/toggle/${userId}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        setSocial(s => ({ ...s, isFollowing: d.following, followers: d.following ? s.followers + 1 : Math.max(0, s.followers - 1) }));
      }
    } catch { }
    finally { setFollowLoading(false); }
  };

  const openFollowModal = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'followers' ? 'followers' : 'following';
      const res = await fetch(`${API_URL}/follows/${endpoint}/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        setFollowModal({ open: true, type, users: d.followers || d.following || [] });
      }
    } catch { }
  };

  const filteredPapers = useMemo(() => {
    if (!data?.papers) return [];
    let p = [...data.papers];
    if (search.trim()) p = p.filter(x => x.title?.toLowerCase().includes(search.toLowerCase()) || x.keywords?.some(k => k.toLowerCase().includes(search.toLowerCase())));
    if (filterSubject) p = p.filter(x => x.subjectArea === filterSubject);
    switch (sortBy) {
      case 'views': p.sort((a, b) => (b.views || 0) - (a.views || 0)); break;
      case 'citations': p.sort((a, b) => (b.citations || 0) - (a.citations || 0)); break;
      case 'year': p.sort((a, b) => (b.yearCompleted || 0) - (a.yearCompleted || 0)); break;
      case 'alpha': p.sort((a, b) => a.title.localeCompare(b.title)); break;
    }
    return p;
  }, [data, search, sortBy, filterSubject]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-navy dark:border-accent mx-auto mb-3" />
        <p className="text-xs text-gray-500">Loading profile…</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow border max-w-sm w-full">
        <UserX size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="font-bold text-gray-700 dark:text-gray-300 mb-2">Author not found</p>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mx-auto text-navy dark:text-accent text-sm mt-3"><ArrowLeft size={16} />Go back</button>
      </div>
    </div>
  );

  const { author, stats, analytics } = data;
  const initials = `${author.firstName?.[0] || ''}${author.lastName?.[0] || ''}`.toUpperCase();
  const isOwnProfile = currentUser?._id === userId || currentUser?.id === userId;
  const roleColors = { faculty: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', student: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' };

  return (
    <>
      <FollowersModal isOpen={followModal.open} onClose={() => setFollowModal(f => ({ ...f, open: false }))} title={followModal.type === 'followers' ? `${social.followers} Followers` : `${social.following} Following`} users={followModal.users} />

      <div className="max-w-6xl mx-auto pb-12 animate-fade-in">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-navy dark:text-accent hover:underline font-semibold text-sm mb-4 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />Back
        </button>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* LEFT COLUMN */}
          <div className="xl:w-72 flex-shrink-0 space-y-4">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-navy via-blue-700 to-accent" />
              <div className="px-5 pb-5 -mt-8">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg mb-3">
                  {author.avatar
                    ? <img src={author.avatar} alt={author.firstName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-navy to-accent flex items-center justify-center"><span className="text-white text-xl font-black">{initials}</span></div>}
                </div>
                <h1 className="text-xl font-black text-gray-900 dark:text-white mb-0.5">{author.firstName} {author.lastName}</h1>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold capitalize mb-2 ${roleColors[author.role] || ''}`}>{author.role}</span>

                {/* Follow Stats */}
                <div className="flex items-center gap-4 mb-3">
                  <button onClick={() => openFollowModal('followers')} className="text-center hover:opacity-70 transition">
                    <p className="text-lg font-black text-gray-900 dark:text-white">{social.followers}</p>
                    <p className="text-xs text-gray-500">Followers</p>
                  </button>
                  <button onClick={() => openFollowModal('following')} className="text-center hover:opacity-70 transition">
                    <p className="text-lg font-black text-gray-900 dark:text-white">{social.following}</p>
                    <p className="text-xs text-gray-500">Following</p>
                  </button>
                </div>

                {/* Follow / Edit Button */}
                {isOwnProfile ? (
                  <button onClick={() => navigate('/settings')} className="w-full px-3 py-2 border-2 border-navy dark:border-accent text-navy dark:text-accent rounded-xl text-xs font-bold hover:bg-navy/5 transition mb-3">
                    Edit Profile
                  </button>
                ) : (
                  <button onClick={handleFollow} disabled={followLoading}
                    className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition mb-3 ${social.isFollowing ? 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-400 hover:text-red-500' : 'bg-navy dark:bg-blue-600 text-white hover:opacity-90'}`}>
                    {followLoading ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : social.isFollowing ? <><UserCheck size={13} />Following</> : <><UserPlus size={13} />Follow</>}
                  </button>
                )}

                {author.position && <div className="flex items-start gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-1.5"><Briefcase size={13} className="flex-shrink-0 mt-0.5" /><span>{author.position}</span></div>}
                {(author.department || author.institution) && (
                  <div className="flex items-start gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                    <GraduationCap size={13} className="flex-shrink-0 mt-0.5" />
                    <span>{[author.department, author.institution].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5"><Mail size={12} className="flex-shrink-0" /><span className="break-all">{author.email}</span></div>
                {author.website && (
                  <a href={author.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-navy dark:text-accent hover:underline mb-1.5">
                    <Globe size={12} /><span className="truncate">{author.website}</span><ExternalLink size={10} />
                  </a>
                )}
                {author.orcid && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded font-bold text-[10px]">ORCID</span>
                    <span className="font-mono">{author.orcid}</span>
                  </div>
                )}
                {author.bio && <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">{author.bio}</p>}
                {author.researchInterests && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Research Interests</p>
                    <div className="flex flex-wrap gap-1">
                      {author.researchInterests.split(',').map((i, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-navy/8 dark:bg-accent/15 text-navy dark:text-accent border border-navy/20 dark:border-accent/30 rounded-full text-[10px] font-semibold">{i.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1"><Calendar size={10} />Member since {new Date(author.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">STATISTICS</h3>
              <div className="grid grid-cols-2 gap-2">
                <StatPill icon={BookOpen} value={stats.totalPapers} label="Papers" color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800" />
                <StatPill icon={Eye} value={stats.totalViews} label="Views" color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800" />
                <StatPill icon={Quote} value={stats.totalCitations} label="Citations" color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800" />
                <StatPill icon={Heart} value={stats.totalLikes} label="Likes" color="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-red-100 dark:border-red-800" />
              </div>
            </div>

            {/* Year Chart */}
            {Object.keys(analytics.yearlyData).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><BarChart3 size={12} />PUBLICATIONS BY YEAR</h3>
                <YearChart yearlyData={analytics.yearlyData} />
              </div>
            )}

            {/* Clickable Subject Areas */}
            {analytics.subjectAreas.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Hash size={12} />SUBJECT AREAS</h3>
                <div className="space-y-1">
                  {analytics.subjectAreas.map(s => (
                    <button key={s} onClick={() => setFilterSubject(filterSubject === s ? '' : s)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${filterSubject === s ? `${getSubjectColor(s)} border-2 shadow-sm` : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                      <span className="flex items-center gap-1.5">
                        {filterSubject === s && <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />}{s}
                      </span>
                    </button>
                  ))}
                </div>
                {filterSubject && (
                  <button onClick={() => navigate(`/explore?subject=${encodeURIComponent(filterSubject)}`)} className="mt-2 w-full flex items-center justify-center gap-1 text-[10px] text-navy dark:text-accent font-bold hover:underline">
                    <ExternalLink size={10} />Browse all "{filterSubject}" papers
                  </button>
                )}
              </div>
            )}

            {/* Category Breakdown */}
            {Object.keys(analytics.categories).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">CATEGORY BREAKDOWN</h3>
                {Object.entries(analytics.categories).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{cat}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-navy dark:bg-accent rounded-full" style={{ width: `${(count / stats.totalPapers) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-4">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex-1 min-w-0">
            {/* Search & Sort */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[160px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search papers…"
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-semibold bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none">
                  <option value="views">Most Viewed</option>
                  <option value="citations">Most Cited</option>
                  <option value="year">By Year</option>
                  <option value="alpha">Alphabetical</option>
                </select>
                {filterSubject && (
                  <button onClick={() => setFilterSubject('')} className="flex items-center gap-1 px-2.5 py-2 bg-navy/10 text-navy dark:bg-accent/20 dark:text-accent rounded-xl text-xs font-bold border border-navy/20 dark:border-accent/30">
                    <span className="truncate max-w-[80px]">{filterSubject}</span> ×
                  </button>
                )}
              </div>
            </div>

            {/* Papers */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h2 className="font-black text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-navy dark:text-accent" />
                  Papers <span className="text-navy dark:text-accent">({filteredPapers.length})</span>
                </h2>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{stats.totalViews} views</span><span>·</span><span>{stats.totalCitations} citations</span>
                </div>
              </div>
              <div className="px-5 divide-y divide-gray-50 dark:divide-gray-800">
                {filteredPapers.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">{search || filterSubject ? 'No papers match your filters' : 'No published papers yet'}</p>
                  </div>
                ) : (
                  filteredPapers.map((paper, i) => (
                    <PaperRow key={paper._id} paper={paper} index={i} onSubjectClick={(s) => { setFilterSubject(s === filterSubject ? '' : s); }} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthorProfile;