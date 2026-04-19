// client/src/pages/ResearchDetail.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Eye, Calendar, User, Tag, FileText, Bookmark, Quote, Check,
  AlertTriangle, XCircle, Lock, MessageSquare, Award, CheckCircle, Clock,
  Heart, Info, BookOpen, Search, ChevronRight, ChevronLeft, Hash,
  Sparkles, TrendingUp, X, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CitationModal from '../components/research/CitationModal';
import ProtectedPDFViewer from '../components/research/ProtectedPDFViewer';
import ReviewForm from '../components/review/ReviewForm';
import ReviewsModal from '../components/review/ReviewsModal';
import SimilarPapers from '../components/research/SimilarPapers';
import AwardsModal from '../components/admin/AwardsModal';
import Tooltip from '../components/common/Tooltip';
import AuthorLink from '../components/research/AuthorLink';

// ── Subject color map ──
const SUBJECT_COLORS = {
  'Community Health Nursing': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-300',
  'Medical-Surgical Nursing': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300',
  'Pediatric Nursing': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-300',
  'Psychiatric Nursing': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border-violet-300',
  'Obstetric Nursing': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-300',
  'Geriatric Nursing': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300',
  'Critical Care Nursing': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300',
  'Nursing Education': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-300',
  'Nursing Research': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-300',
  'Public Health': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border-teal-300',
};

const getSubjectColor = s =>
  SUBJECT_COLORS[s] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300';

const API_URL = import.meta.env.VITE_API_URL;

const StatCard = ({ icon: Icon, value, label, color }) => {
  const map = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-red-100 dark:border-red-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 flex-1 hover:scale-105 transition-all cursor-default ${map[color]}`}>
      <Icon size={18} className="mb-1 opacity-80" />
      <span className="text-2xl font-black leading-none tabular-nums">{value ?? 0}</span>
      <span className="text-[10px] font-bold mt-1 uppercase tracking-widest opacity-60">{label}</span>
    </div>
  );
};

const ActionBtn = ({ icon: Icon, label, active, activeClass, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
      active
        ? activeClass
        : `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 ${className}`
    }`}
  >
    <Icon size={15} />
    {label}
  </button>
);

// ── Left Sidebar ──
const ResearchSidebar = ({ paper, sidebarOpen, setSidebarOpen, onSubjectClick, navigate }) => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);

  const SUBJECTS = [
    'Community Health Nursing',
    'Medical-Surgical Nursing',
    'Pediatric Nursing',
    'Psychiatric Nursing',
    'Obstetric Nursing',
    'Geriatric Nursing',
    'Critical Care Nursing',
    'Nursing Education',
    'Nursing Research',
    'Public Health',
  ];

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);

    const t = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${API_URL}/research?search=${encodeURIComponent(search)}&status=approved&limit=8`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const d = await res.json();
        setSearchResults(d.papers || []);
      } catch {
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [search]);

  return (
    <>
      <button
        onClick={() => setSidebarOpen(o => !o)}
        className={`fixed top-1/2 -translate-y-1/2 z-40 bg-navy dark:bg-blue-600 text-white rounded-r-xl p-2 shadow-lg hover:bg-navy-800 transition-all duration-300 ${sidebarOpen ? 'left-72' : 'left-0'}`}
        title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] z-30 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-300 flex flex-col overflow-hidden ${sidebarOpen ? 'w-72' : 'w-0'}`}
      >
        {sidebarOpen && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-navy/5 to-blue-50 dark:from-navy/20 dark:to-gray-900">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={16} className="text-navy dark:text-accent" />
                <span className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-widest">
                  Quick Access
                </span>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search papers..."
                  className="w-full pl-8 pr-8 py-2 text-xs border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-navy dark:focus:border-accent focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setSearchResults([]);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {(search || searching) && (
                <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Results</p>
                  {searching ? (
                    <div className="flex items-center gap-2 text-xs text-gray-400 p-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-navy" />
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <p className="text-xs text-gray-400 p-2">No results found</p>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map(p => (
                        <button
                          key={p._id}
                          onClick={() => {
                            navigate(`/research/${p._id}`);
                            setSearch('');
                          }}
                          className="w-full text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition group"
                        >
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-navy dark:group-hover:text-accent">
                            {p.title}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <Eye size={9} />
                            {p.views || 0} views
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {paper && !search && (
                <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Current Paper</p>
                  <div className="p-2.5 bg-navy/5 dark:bg-navy/20 rounded-xl border border-navy/20 dark:border-navy/30">
                    <p className="text-xs font-bold text-navy dark:text-accent line-clamp-3 leading-tight">
                      {paper.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500 flex-wrap">
                      <span className="flex items-center gap-0.5">
                        <Eye size={9} />
                        {paper.views}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Heart size={9} />
                        {paper.likes || 0}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Quote size={9} />
                        {paper.citations || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!search && (
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Hash size={12} className="text-gray-400" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Subject Areas</p>
                  </div>
                  <div className="space-y-1">
                    {SUBJECTS.map(s => {
                      const isActive = paper?.subjectArea === s;
                      return (
                        <button
                          key={s}
                          onClick={() => onSubjectClick(s)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                            isActive
                              ? `${getSubjectColor(s)} border-2 shadow-sm`
                              : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />}
                            {s}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!search && (
                <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <TrendingUp size={11} />
                    Quick Links
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => navigate('/explore')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-navy dark:hover:text-accent transition flex items-center gap-1.5"
                    >
                      <Sparkles size={11} />
                      Explore All Papers
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-navy dark:hover:text-accent transition flex items-center gap-1.5"
                    >
                      <BookOpen size={11} />
                      My Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

// ── Main Component ──
const ResearchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [paper, setPaper] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [citationCount, setCitationCount] = useState(0);
  const [showCitation, setShowCitation] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showAwardsModal, setShowAwardsModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchPaper();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(true);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showMsg = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 2800);
  };

  const fetchPaper = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/research/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
        const d = await res.json();
        setError(d.error || 'Access denied');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError('Failed to load paper');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setPaper(data.paper);
      setLikeCount(data.paper.likes || 0);
      setCitationCount(data.paper.citations || 0);

      if (data.paper.status === 'approved') {
        checkBookmark();
        checkLike();
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setReviews(d.reviews || []);
      }
    } catch {
    }
  };

  const checkBookmark = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/bookmarks/check/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      setBookmarked(d.bookmarked);
    } catch {
    }
  };

  const checkLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/likes/check/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      setLiked(d.liked);
    } catch {
    }
  };

  const toggleBookmark = async () => {
    if (paper.status !== 'approved') {
      showMsg('Only approved papers can be bookmarked', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/bookmarks/toggle/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      setBookmarked(d.bookmarked);
      setPaper(p => ({
        ...p,
        bookmarks: d.bookmarked
          ? (p.bookmarks || 0) + 1
          : Math.max(0, (p.bookmarks || 0) - 1),
      }));
      showMsg(d.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch {
      showMsg('Failed', 'error');
    }
  };

  const toggleLike = async () => {
    if (paper.status !== 'approved') return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/likes/toggle/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      setLiked(d.liked);
      setLikeCount(c => (d.liked ? c + 1 : Math.max(0, c - 1)));
    } catch {
    }
  };

  const handleCitationCopied = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/research/${id}/track-citation`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setCitationCount(c => c + 1);
      setPaper(p => ({ ...p, citations: (p.citations || 0) + 1 }));
    } catch {
    }
  };

  const handleSubjectClick = subject => {
    navigate(`/explore?subject=${encodeURIComponent(subject)}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-navy dark:border-blue-500" />
      </div>
    );
  }

  const isAuthor = paper?.submittedBy?._id === user?.id;
  const isAdmin = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty';
  const canAccess = paper?.status === 'approved' || isAuthor || isAdmin;
  const canSeeReviews = isAuthor || isAdmin || isFaculty;

  if (error || !canAccess) {
    const cfg = {
      rejected: {
        icon: XCircle,
        title: 'Paper Not Available',
        cls: 'border-red-400',
        icls: 'text-red-500',
      },
      pending: {
        icon: Clock,
        title: 'Under Review',
        cls: 'border-yellow-400',
        icls: 'text-yellow-500',
      },
    }[paper?.status] || {
      icon: Lock,
      title: 'Access Denied',
      cls: 'border-gray-400',
      icls: 'text-gray-500',
    };

    const I = cfg.icon;

    return (
      <div className="px-4 py-10 min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className={`w-full max-w-md bg-white dark:bg-gray-800 border-2 ${cfg.cls} rounded-2xl p-8 text-center shadow-xl`}>
          <I size={56} className={`mx-auto mb-4 ${cfg.icls}`} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{cfg.title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {error || 'Only approved research can be viewed.'}
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="inline-flex items-center gap-2 bg-navy text-white px-6 py-2.5 rounded-xl font-bold hover:bg-navy-800 transition"
          >
            <ArrowLeft size={16} />
            Browse Papers
          </button>
        </div>
      </div>
    );
  }

  const authorNames = paper?.authors?.join(', ') || 'Unknown';
  const submitterName = paper?.submittedBy
    ? (
        paper.submittedBy.isDeleted
          ? '[Deleted User]'
          : `${paper.submittedBy.firstName || ''} ${paper.submittedBy.lastName || ''}`.trim() || 'Unknown'
      )
    : 'Unknown';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      <ResearchSidebar
        paper={paper}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onSubjectClick={handleSubjectClick}
        navigate={navigate}
      />

      {toast.show && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-white text-sm font-semibold animate-slide-up ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          <Check size={15} />
          {toast.message}
        </div>
      )}

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-72' : 'pl-0'}`}>
        <div className="flex items-center gap-3 px-4 md:px-6 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-navy dark:text-blue-400 hover:text-navy-700 font-semibold text-sm group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          {paper?.subjectArea && (
            <>
              <span className="text-gray-300 dark:text-gray-600">/</span>
              <button
                onClick={() => handleSubjectClick(paper.subjectArea)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition hover:shadow-sm ${getSubjectColor(paper.subjectArea)}`}
              >
                <Hash size={10} />
                {paper.subjectArea}
              </button>
            </>
          )}
        </div>

        <div className="px-4 md:px-6 lg:px-8">
          <div className="flex flex-col xl:flex-row gap-6 max-w-7xl mx-auto">
            <div className="flex-1 min-w-0 space-y-5">
              {/* Header Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 md:p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        {paper.awards?.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs font-bold border border-yellow-300">
                            <Award size={12} />
                            Awarded
                          </span>
                        )}
                        {paper.status && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold border border-slate-300">
                            <CheckCircle size={12} />
                            {paper.status}
                          </span>
                        )}
                      </div>

                      <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-4">
                        {paper.title}
                      </h1>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <User size={14} className="flex-shrink-0 mt-0.5 text-gray-400" />
                          <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                            {paper.authors?.map((author, i) => (
                              <span key={i} className="text-sm md:text-base font-medium">
                                <AuthorLink
                                  authorName={author}
                                  submittedBy={paper.submittedBy}
                                  coAuthorLinks={paper.coAuthorLinks}
                                />
                                {i < paper.authors.length - 1 && (
                                  <span className="text-gray-300 mr-0.5">,</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <User size={12} className="text-gray-300 flex-shrink-0" />
                          <span>
                            Submitted by{' '}
                            <AuthorLink
                              authorName={submitterName}
                              submittedBy={paper.submittedBy}
                              coAuthorLinks={paper.coAuthorLinks}
                              className="font-semibold text-xs"
                            />
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pt-1">
                          {paper.yearCompleted && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {paper.yearCompleted}
                            </span>
                          )}
                          {paper.category && (
                            <span className="flex items-center gap-1">
                              <Tag size={12} />
                              {paper.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {paper.status === 'approved' && (
                    <div className="grid grid-cols-4 gap-2 md:gap-3 mb-2">
                      <StatCard icon={Eye} value={paper.views} label="Views" color="blue" />
                      <StatCard icon={Heart} value={likeCount} label="Likes" color="red" />
                      <StatCard icon={Bookmark} value={paper.bookmarks} label="Saved" color="purple" />
                      <StatCard icon={Quote} value={citationCount} label="Cited" color="green" />
                    </div>
                  )}

                  {paper.status === 'approved' && (
                    <div className="space-y-2">
                      <div className={`grid gap-2 ${isFaculty ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        <ActionBtn
                          icon={Heart}
                          label={liked ? 'Liked' : 'Like'}
                          active={liked}
                          activeClass="bg-red-500 border-red-500 text-white shadow-md"
                          onClick={toggleLike}
                          className="hover:border-red-300 hover:text-red-500"
                        />
                        <ActionBtn
                          icon={Bookmark}
                          label={bookmarked ? 'Saved' : 'Save'}
                          active={bookmarked}
                          activeClass="bg-navy border-navy text-white shadow-md"
                          onClick={toggleBookmark}
                          className="hover:border-navy/50 hover:text-navy"
                        />
                        {isFaculty && (
                          <ActionBtn
                            icon={MessageSquare}
                            label="Review"
                            active={false}
                            activeClass=""
                            onClick={() => setShowReviewModal(true)}
                            className="hover:border-blue-400 hover:text-blue-600"
                          />
                        )}
                      </div>

                      <ActionBtn
                        icon={Quote}
                        label="Cite this Paper"
                        active={false}
                        activeClass=""
                        onClick={() => setShowCitation(true)}
                        className="w-full hover:border-green-400 hover:text-green-600"
                      />
                    </div>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => setShowAwardsModal(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 rounded-xl font-bold text-sm hover:from-yellow-500 hover:to-amber-600 transition shadow-md"
                    >
                      <Award size={15} />
                      Manage Awards
                    </button>
                  )}

                  {canSeeReviews && reviews.length > 0 && (
                    <button
                      onClick={() => setShowReviewsModal(true)}
                      className="w-full flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MessageSquare size={15} className="text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                            <CheckCircle size={12} className="text-blue-500" />
                            Faculty Reviews ({reviews.length})
                          </p>
                          <p className="text-xs text-gray-500">Tap to view feedback</p>
                        </div>
                      </div>
                      <span className="text-blue-500 font-bold text-xl group-hover:translate-x-0.5 transition-transform">
                        ›
                      </span>
                    </button>
                  )}

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <BookOpen size={15} className="text-navy dark:text-accent" />
                      Abstract
                    </h2>
                    <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {paper.abstract}
                    </p>
                  </div>

                  {paper.keywords?.length > 0 && (
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-5 mt-5">
                      <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">
                        Keywords
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {paper.keywords.map((k, i) => (
                          <button
                            key={i}
                            onClick={() => navigate(`/explore?search=${encodeURIComponent(k)}`)}
                            className="px-3 py-1.5 bg-navy/8 dark:bg-blue-500/15 text-navy dark:text-blue-400 rounded-full text-xs font-semibold border border-navy/20 dark:border-blue-500/30 hover:bg-navy/15 hover:scale-105 transition"
                          >
                            #{k}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Paper Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold mb-1">Authors</p>
                    <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                      {paper.authors?.map((author, i) => (
                        <span key={i} className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                          <AuthorLink
                            authorName={author}
                            submittedBy={paper.submittedBy}
                            coAuthorLinks={paper.coAuthorLinks}
                          />
                          {i < paper.authors.length - 1 && <span className="text-gray-400">,</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                  {paper.subjectArea && (
                    <div>
                      <p className="text-xs text-gray-400 font-semibold mb-1">Subject Area</p>
                      <button
                        onClick={() => handleSubjectClick(paper.subjectArea)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border hover:scale-105 transition ${getSubjectColor(paper.subjectArea)}`}
                      >
                        <Hash size={10} />
                        {paper.subjectArea}
                      </button>
                    </div>
                  )}

                  {paper.category && (
                    <div>
                      <p className="text-xs text-gray-400 font-semibold mb-1">Category</p>
                      <p className="text-gray-800 dark:text-gray-200">{paper.category}</p>
                    </div>
                  )}

                  {paper.yearCompleted && (
                    <div>
                      <p className="text-xs text-gray-400 font-semibold mb-1">Year</p>
                      <p className="text-gray-800 dark:text-gray-200">{paper.yearCompleted}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PDF Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Full Document</h2>
                  <Tooltip
                    content={
                      <div className="text-left max-w-xs">
                        <p className="font-bold text-xs text-white mb-1">PROTECTED DOCUMENT</p>
                        <p className="text-xs text-gray-200">• Watermarked with your identity</p>
                        <p className="text-xs text-gray-200">• PrintScreen & copy disabled</p>
                        <p className="text-xs text-gray-200">• All activity monitored</p>
                      </div>
                    }
                    position="right"
                  >
                    <Info size={15} className="text-blue-500 cursor-help" />
                  </Tooltip>
                </div>

                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 md:p-12 text-center bg-gray-50 dark:bg-gray-900/50">
                  <div className="w-16 h-16 bg-navy/10 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText size={28} className="text-navy dark:text-accent" />
                  </div>
                  <p className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">
                    View-Only Protected PDF
                  </p>
                  <p className="text-xs text-gray-400 mb-5">
                    Secured under RA 10173 — no download allowed
                  </p>
                  <button
                    onClick={() => {
                      if (!paper?.pdfUrl && !paper?.fileUrl) {
                        showMsg('PDF not available', 'error');
                        return;
                      }
                      setShowPDF(true);
                    }}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-navy dark:bg-blue-600 hover:bg-navy-700 dark:hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-md"
                  >
                    <FileText size={17} />
                    Open Viewer
                  </button>
                </div>
              </div>

              {paper.status === 'approved' && <SimilarPapers paperId={paper._id} />}
            </div>

            {/* Right sidebar */}
            <div className="hidden xl:flex flex-col gap-5 w-72 2xl:w-80 flex-shrink-0">
              {paper.status === 'approved' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sticky top-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Statistics
                  </h3>
                  <div className="space-y-2 mb-5">
                    {[
                      { icon: Eye, val: paper.views, label: 'Total Views', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                      { icon: Heart, val: likeCount, label: 'Likes', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                      { icon: Bookmark, val: paper.bookmarks, label: 'Bookmarks', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                      { icon: Quote, val: citationCount, label: 'Times Cited', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                    ].map(({ icon: Icon, val, label, color, bg }) => (
                      <div key={label} className={`flex items-center justify-between px-4 py-2.5 rounded-xl ${bg}`}>
                        <div className="flex items-center gap-2">
                          <Icon size={14} className={color} />
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                        </div>
                        <span className={`text-xl font-black tabular-nums ${color}`}>{val ?? 0}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={toggleLike}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${
                        liked
                          ? 'bg-red-500 border-red-500 text-white'
                          : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-300 hover:text-red-500'
                      }`}
                    >
                      <Heart size={14} className={liked ? 'fill-current' : ''} />
                      {liked ? 'Liked' : 'Like'}
                    </button>

                    <button
                      onClick={toggleBookmark}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${
                        bookmarked
                          ? 'bg-navy border-navy text-white'
                          : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-navy/50 hover:text-navy'
                      }`}
                    >
                      <Bookmark size={14} className={bookmarked ? 'fill-current' : ''} />
                      {bookmarked ? 'Saved' : 'Save'}
                    </button>

                    <button
                      onClick={() => setShowCitation(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-400 hover:text-green-600 transition-all"
                    >
                      <Quote size={14} />
                      Cite Paper
                    </button>

                    {isFaculty && (
                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border-2 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                      >
                        <MessageSquare size={14} />
                        Write Review
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => setShowAwardsModal(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 hover:from-yellow-500 hover:to-amber-600 transition shadow-sm"
                      >
                        <Award size={14} />
                        Manage Awards
                      </button>
                    )}
                  </div>
                </div>
              )}

              {canSeeReviews && reviews.length > 0 && (
                <button
                  onClick={() => setShowReviewsModal(true)}
                  className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 text-left hover:shadow-md transition group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <MessageSquare size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-white">Faculty Reviews</p>
                        <p className="text-xs text-gray-500">
                          {reviews.length} review{reviews.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-blue-500 font-bold text-xl group-hover:translate-x-0.5 transition-transform">
                      ›
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPDF && (paper.pdfUrl || paper.fileUrl) && (
        <ProtectedPDFViewer
          pdfUrl={paper.pdfUrl || paper.fileUrl}
          paperTitle={paper.title}
          onClose={() => setShowPDF(false)}
        />
      )}

      {showCitation && paper.status === 'approved' && (
        <CitationModal
          paper={paper}
          onClose={() => setShowCitation(false)}
          onCopied={handleCitationCopied}
        />
      )}

      {showReviewModal && isFaculty && (
        <ReviewForm
          paper={paper}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setShowReviewModal(false);
            fetchPaper();
            fetchReviews();
          }}
        />
      )}

      {showReviewsModal && (
        <ReviewsModal
          isOpen={showReviewsModal}
          onClose={() => setShowReviewsModal(false)}
          reviews={reviews}
          onDelete={() => {
            fetchReviews();
            fetchPaper();
          }}
        />
      )}

      {showAwardsModal && isAdmin && (
        <AwardsModal
          paper={paper}
          onClose={() => setShowAwardsModal(false)}
          onSuccess={fetchPaper}
        />
      )}
    </div>
  );
};

export default ResearchDetail;