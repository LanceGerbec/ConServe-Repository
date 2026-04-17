// client/src/pages/ResearchDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Eye, Calendar, User, Tag, FileText, Bookmark, Quote,
  Check, AlertTriangle, XCircle, Lock, MessageSquare, Award,
  CheckCircle, Clock, Heart, Info, BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CitationModal from '../components/research/CitationModal';
import ProtectedPDFViewer from '../components/research/ProtectedPDFViewer';
import ReviewForm from '../components/review/ReviewForm';
import ReviewsModal from '../components/review/ReviewsModal';
import SimilarPapers from '../components/research/SimilarPapers';
import AwardsModal from '../components/admin/AwardsModal';
import Tooltip from '../components/common/Tooltip';

const ResearchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

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
    if (paper?.status !== 'approved') { showMsg('Only approved papers can be bookmarked', 'error'); return; }
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
    if (paper?.status !== 'approved') return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/likes/toggle/${id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      setLiked(d.liked);
      setLikeCount(c => d.liked ? c + 1 : Math.max(0, c - 1));
    } catch {}
  };

  const handleCitationCopied = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/research/${id}/track-citation`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
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

  if (error || !paper || !canAccess) {
    const cfg = {
      rejected: { icon: XCircle, title: 'Paper Not Available', cls: 'border-red-400', icls: 'text-red-500' },
      pending: { icon: Clock, title: 'Under Review', cls: 'border-yellow-400', icls: 'text-yellow-500' },
    }[paper?.status] || { icon: Lock, title: 'Access Denied', cls: 'border-gray-400', icls: 'text-gray-500' };
    const I = cfg.icon;
    return (
      <div className="px-4 py-10 min-h-screen flex items-center justify-center">
        <div className={`w-full max-w-md bg-white dark:bg-gray-800 border-2 ${cfg.cls} rounded-2xl p-8 text-center shadow-xl`}>
          <I size={56} className={`mx-auto mb-4 ${cfg.icls}`} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{cfg.title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{error || 'Only approved research can be viewed.'}</p>
          <button onClick={() => navigate('/explore')} className="inline-flex items-center gap-2 bg-navy text-white px-6 py-2.5 rounded-xl font-bold hover:bg-navy-800 transition">
            <ArrowLeft size={16} /> Browse Papers
          </button>
        </div>
      </div>
    );
  }

  const authorNames = paper.authors?.join(', ') || 'Unknown';
  const submitterName = paper.submittedBy
    ? (paper.submittedBy.isDeleted ? '[Deleted User]' : `${paper.submittedBy.firstName || ''} ${paper.submittedBy.lastName || ''}`.trim() || 'Unknown')
    : 'Unknown';

  const awardColorMap = {
    gold: 'bg-yellow-100 text-yellow-800 border-yellow-400',
    silver: 'bg-gray-100 text-gray-800 border-gray-400',
    bronze: 'bg-orange-100 text-orange-800 border-orange-400',
    blue: 'bg-blue-100 text-blue-800 border-blue-400',
    green: 'bg-green-100 text-green-800 border-green-400',
    purple: 'bg-purple-100 text-purple-800 border-purple-400',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-20 right-4 left-4 md:left-auto md:w-72 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-white text-sm font-semibold animate-slide-up ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          <Check size={16} />{toast.message}
        </div>
      )}

      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-navy dark:text-blue-400 hover:text-navy-700 px-4 md:px-6 py-3 font-semibold text-sm group">
        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" /> Back
      </button>

      <div className="px-4 md:px-6 lg:px-8 max-w-4xl mx-auto space-y-5">
        {/* Status banner */}
        {paper.status !== 'approved' && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${paper.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'}`}>
            <AlertTriangle size={13} />{paper.status.toUpperCase()} — Not yet publicly visible
          </div>
        )}

        {/* Awards */}
        {paper.awards?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {paper.awards.map((a, i) => (
              <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 text-xs font-bold ${awardColorMap[a.color] || awardColorMap.gold}`}>
                <Award size={11} />{a.name}
              </span>
            ))}
          </div>
        )}

        {/* Main card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight mb-4">{paper.title}</h1>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy/10 dark:bg-blue-900/30 text-navy dark:text-blue-300 rounded-full text-xs font-bold">
              <Tag size={11} />{paper.category}
            </span>
            {paper.yearCompleted && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-semibold">
                <Calendar size={11} />{paper.yearCompleted}
              </span>
            )}
            {paper.subjectArea && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold border border-purple-200 dark:border-purple-800">
                {paper.subjectArea}
              </span>
            )}
          </div>

          {/* Authors */}
          <div className="space-y-1 mb-6 text-sm">
            <div className="flex items-start gap-2 text-gray-700 dark:text-gray-200">
              <User size={14} className="flex-shrink-0 mt-0.5 text-gray-400" />
              <span className="font-medium">{authorNames}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <User size={12} className="text-gray-300 flex-shrink-0" />
              <span>Submitted by <span className="font-semibold">{submitterName}</span></span>
            </div>
          </div>

          {/* Stats row — compact horizontal */}
          {paper.status === 'approved' && (
            <div className="grid grid-cols-4 gap-2 mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              {[
                { icon: Eye, value: paper.views, label: 'Views', color: 'text-blue-500' },
                { icon: Heart, value: likeCount, label: 'Likes', color: 'text-red-500' },
                { icon: Bookmark, value: paper.bookmarks, label: 'Saved', color: 'text-purple-500' },
                { icon: Quote, value: citationCount, label: 'Cited', color: 'text-green-600' },
              ].map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="flex flex-col items-center">
                  <Icon size={16} className={`${color} mb-1`} />
                  <span className={`text-xl font-black ${color}`}>{value ?? 0}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          {paper.status === 'approved' && (
            <div className="space-y-2 mb-6">
              <div className={`grid gap-2 ${isFaculty ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <button onClick={toggleLike}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${liked ? 'bg-red-500 border-red-500 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-300 hover:text-red-500'}`}>
                  <Heart size={15} className={liked ? 'fill-current' : ''} />{liked ? 'Liked' : 'Like'}
                </button>
                <button onClick={toggleBookmark}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${bookmarked ? 'bg-navy border-navy text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-navy/50 hover:text-navy'}`}>
                  <Bookmark size={15} className={bookmarked ? 'fill-current' : ''} />{bookmarked ? 'Saved' : 'Save'}
                </button>
                {isFaculty && (
                  <button onClick={() => setShowReviewModal(true)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 transition-all">
                    <MessageSquare size={15} /> Review
                  </button>
                )}
              </div>
              <button onClick={() => setShowCitation(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-400 hover:text-green-600 transition-all">
                <Quote size={15} /> Cite this Paper
              </button>
            </div>
          )}

          {/* Admin: manage awards */}
          {isAdmin && (
            <button onClick={() => setShowAwardsModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-sm mb-5">
              <Award size={16} /> Manage Awards
            </button>
          )}

          {/* Faculty reviews button */}
          {canSeeReviews && reviews.length > 0 && (
            <button onClick={() => setShowReviewsModal(true)}
              className="w-full flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition group mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={15} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">Faculty Reviews ({reviews.length})</p>
                  <p className="text-xs text-gray-500">Tap to view feedback</p>
                </div>
              </div>
              <span className="text-blue-500 font-bold text-xl group-hover:translate-x-0.5 transition-transform">›</span>
            </button>
          )}

          {/* Abstract */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-6 mb-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-navy dark:text-accent" /> Abstract
            </h2>
            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{paper.abstract}</p>
          </div>

          {/* Keywords */}
          {paper.keywords?.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-5 mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Keywords</p>
              <div className="flex flex-wrap gap-2">
                {paper.keywords.map((k, i) => (
                  <span key={i} className="px-3 py-1.5 bg-navy/8 dark:bg-blue-500/15 text-navy dark:text-blue-400 rounded-full text-xs font-semibold border border-navy/20 dark:border-blue-500/30">{k}</span>
                ))}
              </div>
            </div>
          )}

          {/* Paper details summary */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Details</p>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {paper.category && (
                <div><dt className="text-xs text-gray-400 font-semibold mb-0.5">Category</dt><dd className="text-gray-800 dark:text-gray-200 font-medium">{paper.category}</dd></div>
              )}
              {paper.yearCompleted && (
                <div><dt className="text-xs text-gray-400 font-semibold mb-0.5">Year</dt><dd className="text-gray-800 dark:text-gray-200 font-medium">{paper.yearCompleted}</dd></div>
              )}
              {paper.subjectArea && (
                <div className="col-span-2"><dt className="text-xs text-gray-400 font-semibold mb-0.5">Subject Area</dt><dd className="text-gray-800 dark:text-gray-200">{paper.subjectArea}</dd></div>
              )}
              <div className="col-span-2"><dt className="text-xs text-gray-400 font-semibold mb-0.5">Authors</dt><dd className="text-gray-800 dark:text-gray-200">{authorNames}</dd></div>
            </dl>
          </div>
        </div>

        {/* PDF Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Full Document</h2>
            <Tooltip content={
              <div className="text-left max-w-xs">
                <p className="font-bold text-xs text-white mb-1">PROTECTED DOCUMENT</p>
                <p className="text-xs text-gray-200">• Watermarked with your identity</p>
                <p className="text-xs text-gray-200">• PrintScreen & copy disabled</p>
              </div>
            } position="right">
              <Info size={15} className="text-blue-500 cursor-help" />
            </Tooltip>
          </div>
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center bg-gray-50 dark:bg-gray-900/50">
            <div className="w-14 h-14 bg-navy/10 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FileText size={26} className="text-navy dark:text-accent" />
            </div>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">View-Only Protected PDF</p>
            <p className="text-xs text-gray-400 mb-4">Secured under RA 10173 — no download allowed</p>
            <button onClick={() => {
              if (!paper?.pdfUrl && !paper?.fileUrl) { showMsg('PDF not available', 'error'); return; }
              setShowPDF(true);
            }} className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy dark:bg-blue-600 hover:bg-navy-700 dark:hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-md text-sm">
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