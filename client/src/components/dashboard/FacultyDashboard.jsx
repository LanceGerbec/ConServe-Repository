import { useState, useEffect } from 'react';
import { BookOpen, Upload, Heart, MessageSquare, Eye, X, Calendar, Tag, User, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SubmitResearch from '../research/SubmitResearch';
import RecentlyViewed from '../research/RecentlyViewed';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'submissions', 'favorites', 'reviews'
  const [bookmarks, setBookmarks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ submissions: 0, favorites: 0, reviews: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [bookmarksRes, submissionsRes, reviewStatsRes, reviewsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/bookmarks/my-bookmarks`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/research/my-submissions`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/reviews/stats`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/reviews/my-reviews`, { headers })
      ]);

      const bookmarksData = await bookmarksRes.json();
      const submissionsData = await submissionsRes.json();
      const reviewStatsData = await reviewStatsRes.json();
      const reviewsData = await reviewsRes.json();

      setBookmarks(bookmarksData.bookmarks || []);
      setSubmissions(submissionsData.papers || []);
      setReviews(reviewsData.reviews || []);
      setStats({
        submissions: submissionsData.count || 0,
        favorites: bookmarksData.count || 0,
        reviews: reviewStatsData.totalReviews || 0
      });
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
      revision: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const Modal = ({ title, subtitle, children }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Prof. {user?.firstName}! 👋</h1>
        <p className="text-blue-100">Faculty Dashboard</p>
      </div>

      {/* Quick Stats - 2 CLICKABLE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: 'My Submissions', value: stats.submissions, icon: Upload, color: 'text-blue-600', modal: 'submissions' },
          { label: 'Reviewed Papers', value: stats.reviews, icon: MessageSquare, color: 'text-green-600', modal: 'reviews' }
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => setActiveModal(stat.modal)}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={stat.color} size={28} />
              <span className="text-3xl font-bold text-navy dark:text-accent">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {stat.label}
              <span className="ml-2 text-xs text-navy dark:text-accent">• Click to view</span>
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Upload, label: 'Submit Research', color: 'bg-navy', desc: 'Upload your paper', action: () => setShowSubmitModal(true) },
            { icon: BookOpen, label: 'Browse Papers', color: 'bg-blue-500', desc: 'Explore repository', action: () => window.location.href = '/browse' },
            { icon: Heart, label: 'My Favorites', color: 'bg-red-500', desc: 'Saved papers', action: () => setActiveModal('favorites') }
          ].map((action, i) => (
            <button 
              key={i}
              onClick={action.action}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{action.label}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recently Viewed + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentlyViewed />
        <div className="bg-gradient-to-br from-navy to-accent text-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Your Activity</h3>
          <div className="space-y-4">
            {[
              { label: 'Submissions', value: stats.submissions },
              { label: 'Favorites', value: stats.favorites },
              { label: 'Reviews Given', value: stats.reviews }
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span>{item.label}</span>
                <span className="text-3xl font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* Submissions Modal */}
      {activeModal === 'submissions' && (
        <Modal title={`My Submissions (${submissions.length})`} subtitle="All your submitted research papers">
          {submissions.length === 0 ? (
            <div className="text-center py-16">
              <Upload size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">No submissions yet</p>
              <button onClick={() => { setActiveModal(null); setShowSubmitModal(true); }} className="mt-4 text-navy dark:text-accent hover:underline font-semibold">
                Submit Your First Research
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {submissions.map((paper) => (
                <div key={paper._id} onClick={() => window.location.href = `/research/${paper._id}`} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 flex-1 hover:text-navy dark:hover:text-accent">{paper.title}</h3>
                    <span className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(paper.status)}`}>{paper.status.toUpperCase()}</span>
                  </div>
                  <div className="mb-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">AUTHORS:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{paper.authors.join(' • ')}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{paper.abstract}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1"><Calendar size={14} />{new Date(paper.createdAt).toLocaleDateString()}</div>
                    <div className="flex items-center gap-1"><Tag size={14} />{paper.category}</div>
                    {paper.subjectArea && <div className="flex items-center gap-1"><BookOpen size={14} />{paper.subjectArea}</div>}
                    {paper.status === 'approved' && <div className="flex items-center gap-1"><Eye size={14} />{paper.views || 0} views</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Favorites Modal */}
      {activeModal === 'favorites' && (
        <Modal title={`My Favorites (${bookmarks.length})`}>
          {bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <Heart size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No favorites yet</p>
              <button onClick={() => { setActiveModal(null); window.location.href = '/browse'; }} className="mt-4 text-navy hover:underline">Browse Papers</button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarks.map((bookmark) => (
                <a key={bookmark._id} href={`/research/${bookmark.research._id}`} className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{bookmark.research.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{bookmark.research.authors.join(', ')}</p>
                </a>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Reviewed Papers Modal */}
      {activeModal === 'reviews' && (
        <Modal title={`My Reviews (${reviews.length})`} subtitle="Papers you have reviewed">
          {reviews.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">No reviews yet</p>
              <button onClick={() => { setActiveModal(null); window.location.href = '/browse'; }} className="mt-4 text-navy dark:text-accent hover:underline font-semibold">
                Browse Papers to Review
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} onClick={() => window.location.href = `/research/${review.research._id}`} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 hover:text-navy dark:hover:text-accent mb-2">
                        {review.research?.title || 'Untitled Research'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <User size={14} />
                        <span>{review.research?.authors?.join(', ') || 'No authors listed'}</span>
                      </div>
                    </div>
                    <span className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(review.decision || 'pending')}`}>
                      {(review.decision || 'pending').toUpperCase()}
                    </span>
                  </div>

                  {/* Review Ratings */}
                  {review.ratings && (
                    <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      {Object.entries(review.ratings).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-navy dark:text-accent">{value}/5</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{key}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Review Comments Preview */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">YOUR COMMENTS:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{review.comments}</p>
                  </div>

                  {/* Review Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar size={12} />
                    <span>Reviewed on: {new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Click to View */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full flex items-center justify-center gap-2 bg-navy dark:bg-accent text-white px-4 py-2 rounded-lg hover:bg-navy-800 dark:hover:bg-accent-dark transition font-semibold">
                      <Eye size={16} />
                      View Research Paper
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Submit Research Modal */}
      {showSubmitModal && (
        <SubmitResearch 
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => { setShowSubmitModal(false); fetchData(); }}
        />
      )}
    </div>
  );
};

export default FacultyDashboard;