// client/src/pages/ResearchDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Calendar, User, Tag, FileText, Bookmark, Quote, Check, AlertTriangle, XCircle, Lock, MessageSquare, Award, CheckCircle, Clock, Heart, Info, BookOpen, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CitationModal from '../components/research/CitationModal';
import ProtectedPDFViewer from '../components/research/ProtectedPDFViewer';
import ReviewForm from '../components/review/ReviewForm';
import ReviewsModal from '../components/review/ReviewsModal';
import SimilarPapers from '../components/research/SimilarPapers';
import AwardsModal from '../components/admin/AwardsModal';
import Tooltip from '../components/common/Tooltip';

// ── Compact animated stat card ──
const StatCard = ({ icon: Icon, value, label, color }) => {
  const colorMap = {
    blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
    red:    'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-red-100 dark:border-red-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800',
    green:  'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800',
  };
  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 min-w-[72px] flex-1 transition-all hover:scale-105 ${colorMap[color]}`}>
      <Icon size={18} className="mb-1 opacity-80" />
      <span className="text-xl font-black leading-none tabular-nums">{value ?? 0}</span>
      <span className="text-[10px] font-bold mt-0.5 uppercase tracking-wide opacity-60">{label}</span>
    </div>
  );
};

// ── Pill action button ──
const ActionBtn = ({ icon: Icon, label, active, activeClass, onClick, className = '' }) => (
  <button onClick={onClick}
    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
      active ? activeClass : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
    } ${className}`}>
    <Icon size={16} className={active ? '' : ''} />{label}
  </button>
);

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
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => { fetchPaper(); fetchReviews(); }, [id]);

  const showMsg = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 2800);
  };

  const fetchPaper = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/research/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 403) { const d = await res.json(); setError(d.error || 'Access denied'); setLoading(false); return; }
      if (!res.ok) { setError('Failed to load paper'); setLoading(false); return; }
      const data = await res.json();
      setPaper(data.paper);
      setLikeCount(data.paper.likes || 0);
      setCitationCount(data.paper.citations || 0);
      if (data.paper.status === 'approved') { checkBookmark(); checkLike(); }
    } catch { setError('Connection error'); }
    finally { setLoading(false); }
  };

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/reviews/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setReviews(d.reviews || []); }
    } catch {}
  };

  const checkBookmark = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/bookmarks/check/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json(); setBookmarked(d.bookmarked);
    } catch {}
  };

  const checkLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/likes/check/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json(); setLiked(d.liked);
    } catch {}
  };

  const toggleBookmark = async () => {
    if (paper.status !== 'approved') { showMsg('Only approved papers can be bookmarked', 'error'); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/bookmarks/toggle/${id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      setBookmarked(d.bookmarked);
      setPaper(p => ({ ...p, bookmarks: d.bookmarked ? (p.bookmarks || 0) + 1 : Math.max(0, (p.bookmarks || 0) - 1) }));
      showMsg(d.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch { showMsg('Failed', 'error'); }
  };

  const toggleLike = async () => {
    if (paper.status !== 'approved') return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/likes/toggle/${id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      setLiked(d.liked);
      setLikeCount(c => d.liked ? c + 1 : Math.max(0, c - 1));
    } catch {}
  };

  // ── FIX: Track citation when user copies ──
  const handleCitationCopied = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/research/${id}/track-citation`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      setCitationCount(c => c + 1);
      setPaper(p => ({ ...p, citations: (p.citations || 0) + 1 }));
    } catch {}
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-navy dark:border-blue-500" />
    </div>
  );

  const isAuthor = paper?.submittedBy?._id === user?.id;
  const isAdmin = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty';
  const canAccess = paper?.status === 'approved' || isAuthor || isAdmin;
  const canSeeReviews = isAuthor || isAdmin || isFaculty;

  if (error || !canAccess) {
    const cfg = {
      rejected: { icon: XCircle, title: 'Paper Not Available', cls: 'border-red-400', iconCls: 'text-red-500' },
      pending:  { icon: Clock, title: 'Under Review', cls: 'border-yellow-400', iconCls: 'text-yellow-500' },
      default:  { icon: Lock, title: 'Access Denied', cls: 'border-gray-400', iconCls: 'text-gray-500' }
    }[paper?.status] || { icon: Lock, title: 'Access Denied', cls: 'border-gray-400', iconCls: 'text-gray-500' };
    const I = cfg.icon;
    return (
      <div className="px-4 py-10 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className={`max-w-md mx-auto bg-white dark:bg-gray-800 border-2 ${cfg.cls} rounded-2xl p-8 text-center shadow-xl`}>
          <I size={56} className={`mx-auto mb-4 ${cfg.iconCls}`} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{cfg.title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{error || 'Only approved research can be viewed.'}</p>
          <button onClick={() => navigate('/explore')} className="inline-flex items-center gap-2 bg-navy text-white px-6 py-2.5 rounded-xl font-bold hover:bg-navy-800 transition">
            <ArrowLeft size={16} /> Browse Papers
          </button>
        </div>
      </div>
    );
  }

  const authorNames = paper?.authors?.join(', ') || 'Unknown';
  const submitterName = paper?.submittedBy
    ? (paper.submittedBy.isDeleted ? '[Deleted User]' : `${paper.submittedBy.firstName || ''} ${paper.submittedBy.lastName || ''}`.trim() || 'Unknown')
    : 'Unknown';

  return (
    <div className="min-h-screen pb-10 bg-gray-50 dark:bg-gray-950">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-20 right-4 left-4 md:left-auto md:w-72 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-white text-sm font-semibold animate-slide-up ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          <Check size={16} />{toast.message}
        </div>
      )}

      {/* Back nav */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-navy dark:text-blue-400 hover:text-navy-700 mb-4 px-4 py-3 font-semibold text-sm group">
        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" /> Back
      </button>

      <div className="px-4 space-y-4 max-w-3xl mx-auto">

        {/* ── MAIN PAPER CARD ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Status banner */}
          {paper.status !== 'approved' && (
            <div className={`px-4 py-2 flex items-center gap-2 text-xs font-bold ${paper.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'}`}>
              <AlertTriangle size={13} />{paper.status.toUpperCase()} — This paper is not yet publicly visible
            </div>
          )}

          {/* Awards strip */}
          {paper.awards?.length > 0 && (
            <div className="px-4 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-b border-yellow-200 dark:border-yellow-800 flex flex-wrap gap-2">
              {paper.awards.map((award, i) => {
                const cls = { gold: 'bg-yellow-100 text-yellow-800 border-yellow-400', silver: 'bg-gray-100 text-gray-800 border-gray-400', bronze: 'bg-orange-100 text-orange-800 border-orange-400', blue: 'bg-blue-100 text-blue-800 border-blue-400', green: 'bg-green-100 text-green-800 border-green-400', purple: 'bg-purple-100 text-purple-800 border-purple-400' };
                return (
                  <span key={i} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border-2 text-xs font-bold ${cls[award.color] || cls.gold}`}>
                    <Award size={11} />{award.name}
                  </span>
                );
              })}
            </div>
          )}

          <div className="p-5">
            {/* Title */}
            <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight mb-4">
              {paper.title}
            </h1>

            {/* Meta pills row */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-navy/10 dark:bg-blue-900/30 text-navy dark:text-blue-300 rounded-full text-xs font-bold">
                <Tag size={11} />{paper.category}
              </span>
              {paper.yearCompleted && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-semibold">
                  <Calendar size={11} />{paper.yearCompleted}
                </span>
              )}
              {paper.subjectArea && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold border border-purple-200 dark:border-purple-800">
                  {paper.subjectArea}
                </span>
              )}
            </div>

            {/* Author info */}
            <div className="space-y-1 mb-5 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <User size={14} className="flex-shrink-0 mt-0.5 text-gray-400" />
                <span className="break-words font-medium text-gray-800 dark:text-gray-200">{authorNames}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <User size={12} className="text-gray-300 flex-shrink-0" />
                <span>Submitted by <span className="font-semibold">{submitterName}</span></span>
              </div>
            </div>

            {/* ── STATS ROW ── */}
            {paper.status === 'approved' && (
              <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
                <StatCard icon={Eye}      value={paper.views}     label="Views"  color="blue"   />
                <StatCard icon={Heart}    value={likeCount}       label="Likes"  color="red"    />
                <StatCard icon={Bookmark} value={paper.bookmarks} label="Saved"  color="purple" />
                <StatCard icon={Quote}    value={citationCount}   label="Cited"  color="green"  />
              </div>
            )}

            {/* ── ACTION BUTTONS ── */}
            {paper.status === 'approved' && (
              <div className="space-y-2 mb-5">
                <div className="grid grid-cols-2 gap-2">
                  <ActionBtn icon={Heart} label={liked ? 'Liked' : 'Like'} active={liked}
                    activeClass="bg-red-500 border-red-500 text-white shadow-md shadow-red-200"
                    onClick={toggleLike}
                    className={liked ? '' : 'hover:border-red-300 hover:text-red-500'} />
                  <ActionBtn icon={Bookmark} label={bookmarked ? 'Saved' : 'Save'} active={bookmarked}
                    activeClass="bg-navy border-navy text-white shadow-md shadow-blue-200"
                    onClick={toggleBookmark}
                    className={bookmarked ? '' : 'hover:border-navy hover:text-navy'} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ActionBtn icon={Quote} label="Cite" active={false}
                    activeClass="" onClick={() => setShowCitation(true)}
                    className="hover:border-green-400 hover:text-green-600" />
                  {isFaculty && (
                    <ActionBtn icon={MessageSquare} label="Review" active={false}
                      activeClass="" onClick={() => setShowReviewModal(true)}
                      className="hover:border-blue-400 hover:text-blue-600" />
                  )}
                  {!isFaculty && (
                    <button onClick={() => {
                      if (navigator.share && paper) {
                        navigator.share({ title: paper.title, url: window.location.href }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        showMsg('Link copied!');
                      }
                    }} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 transition-all">
                      <Share2 size={16} /> Share
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Admin: Manage Awards */}
            {isAdmin && (
              <button onClick={() => setShowAwardsModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 rounded-xl font-bold text-sm hover:from-yellow-500 hover:to-amber-600 transition shadow-md shadow-yellow-200 dark:shadow-none mb-4">
                <Award size={16} /> Manage Awards
              </button>
            )}

            {/* Faculty Reviews button */}
            {canSeeReviews && reviews.length > 0 && (
              <button onClick={() => setShowReviewsModal(true)}
                className="w-full flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition group mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={16} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle size={13} className="text-blue-500" /> Faculty Reviews ({reviews.length})
                    </p>
                    <p className="text-xs text-gray-500">Tap to view feedback</p>
                  </div>
                </div>
                <span className="text-blue-500 font-bold text-lg group-hover:translate-x-0.5 transition-transform">›</span>
              </button>
            )}

            {/* Abstract */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <BookOpen size={16} className="text-navy dark:text-accent" /> Abstract
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{paper.abstract}</p>
            </div>

            {/* Keywords */}
            {paper.keywords?.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Keywords</h2>
                <div className="flex flex-wrap gap-1.5">
                  {paper.keywords.map((k, i) => (
                    <span key={i} className="px-2.5 py-1 bg-navy/8 dark:bg-blue-500/15 text-navy dark:text-blue-400 rounded-full text-xs font-semibold border border-navy/20 dark:border-blue-500/30">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── PDF VIEWER CARD ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Full Document</h2>
            <Tooltip content={
              <div className="text-left space-y-1 max-w-xs">
                <p className="font-bold text-xs text-white mb-1">PROTECTED DOCUMENT</p>
                <p className="text-xs text-gray-200">• Watermarked with your identity</p>
                <p className="text-xs text-gray-200">• PrintScreen & copy disabled</p>
                <p className="text-xs text-gray-200">• All activity monitored</p>
              </div>
            } position="right">
              <Info size={16} className="text-blue-500 cursor-help" />
            </Tooltip>
          </div>
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center bg-gray-50 dark:bg-gray-900/50">
            <div className="w-14 h-14 bg-navy/10 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FileText size={28} className="text-navy dark:text-accent" />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">View-Only Protected PDF</p>
            <p className="text-xs text-gray-400 mb-4">Secured under RA 10173 — no download</p>
            <button onClick={() => {
              if (!paper?.pdfUrl && !paper?.fileUrl) { showMsg('PDF not available', 'error'); return; }
              setShowPDF(true);
            }} className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy dark:bg-blue-600 hover:bg-navy-700 dark:hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition shadow-md">
              <FileText size={16} /> Open Viewer
            </button>
          </div>
        </div>

        {/* Similar Papers */}
        {paper.status === 'approved' && <SimilarPapers paperId={paper._id} />}
      </div>

      {/* Modals */}
      {showPDF && (paper.pdfUrl || paper.fileUrl) && (
        <ProtectedPDFViewer pdfUrl={paper.pdfUrl || paper.fileUrl} paperTitle={paper.title} onClose={() => setShowPDF(false)} />
      )}
      {showCitation && paper.status === 'approved' && (
        <CitationModal paper={paper} onClose={() => setShowCitation(false)} onCopied={handleCitationCopied} />
      )}
      {showReviewModal && isFaculty && (
        <ReviewForm paper={paper} onClose={() => setShowReviewModal(false)} onSuccess={() => { setShowReviewModal(false); fetchPaper(); fetchReviews(); }} />
      )}
      {showReviewsModal && (
        <ReviewsModal isOpen={showReviewsModal} onClose={() => setShowReviewsModal(false)} reviews={reviews} onDelete={() => { fetchReviews(); fetchPaper(); }} />
      )}
      {showAwardsModal && isAdmin && (
        <AwardsModal paper={paper} onClose={() => setShowAwardsModal(false)} onSuccess={fetchPaper} />
      )}
    </div>
  );
};

export default ResearchDetail;