import { useState, useEffect } from 'react';
import { BookOpen, Upload, Heart, MessageSquare, Eye, X, Calendar, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SubmitResearch from '../research/SubmitResearch';
import RecentlyViewed from '../research/RecentlyViewed';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ submissions: 0, favorites: 0, reviews: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [bookmarksRes, submissionsRes, reviewStatsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/bookmarks/my-bookmarks`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/research/my-submissions`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/reviews/stats`, { headers })
      ]);

      const bookmarksData = await bookmarksRes.json();
      const submissionsData = await submissionsRes.json();
      const reviewStatsData = await reviewStatsRes.json();

      setBookmarks(bookmarksData.bookmarks || []);
      setSubmissions(submissionsData.papers || []);
      setStats({
        submissions: submissionsData.count || 0,
        favorites: bookmarksData.count || 0,
        reviews: reviewStatsData.totalReviews || 0
      });
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const handleQuickAction = (action) => {
    if (action === 'submit') setShowSubmitModal(true);
    else if (action === 'browse') window.location.href = '/browse';
    else if (action === 'favorites') setShowFavorites(true);
  };

  const quickActions = [
    { icon: Upload, label: 'Submit Research', color: 'bg-navy', desc: 'Upload your research paper', action: 'submit' },
    { icon: BookOpen, label: 'Browse Papers', color: 'bg-blue-500', desc: 'Explore the repository', action: 'browse' },
    { icon: Heart, label: 'My Favorites', color: 'bg-red-500', desc: 'Saved research papers', action: 'favorites' }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
      revision: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Prof. {user?.firstName}! 👋</h1>
        <p className="text-blue-100">Faculty Dashboard - Manage your research journey</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            label: 'My Submissions', 
            value: stats.submissions, 
            icon: Upload, 
            color: 'text-blue-600',
            clickable: true,
            onClick: () => setShowSubmissions(true)
          },
          { 
            label: 'Favorites', 
            value: stats.favorites, 
            icon: Heart, 
            color: 'text-red-600',
            clickable: false
          },
          { 
            label: 'Reviewed Papers', 
            value: stats.reviews, 
            icon: MessageSquare, 
            color: 'text-green-600',
            clickable: false
          }
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={stat.clickable ? stat.onClick : undefined}
            className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 ${
              stat.clickable ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={stat.color} size={28} />
              <span className="text-3xl font-bold text-navy dark:text-accent">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {stat.label}
              {stat.clickable && <span className="ml-2 text-xs text-navy dark:text-accent">• Click to view</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <button 
              key={i}
              onClick={() => handleQuickAction(action.action)}
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

      {/* Recently Viewed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentlyViewed />
        
        <div className="bg-gradient-to-br from-navy to-accent text-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Your Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Submissions</span>
              <span className="text-3xl font-bold">{stats.submissions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Favorites Added</span>
              <span className="text-3xl font-bold">{stats.favorites}</span>
            </div>
            <div className="flex justify-between items-center border-t border-white/20 pt-4">
              <span>Papers Reviewed</span>
              <span className="text-3xl font-bold">{stats.reviews}</span>
            </div>
          </div>
        </div>
      </div>

      {/* My Submissions Modal */}
      {showSubmissions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Submissions ({submissions.length})</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">All your submitted research papers</p>
              </div>
              <button 
                onClick={() => setShowSubmissions(false)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {submissions.length === 0 ? (
                <div className="text-center py-16">
                  <Upload size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No submissions yet</p>
                  <button 
                    onClick={() => { setShowSubmissions(false); setShowSubmitModal(true); }} 
                    className="mt-4 text-navy dark:text-accent hover:underline font-semibold"
                  >
                    Submit Your First Research
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {submissions.map((paper) => (
                    <div 
                      key={paper._id} 
                      className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => window.location.href = `/research/${paper._id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-navy dark:hover:text-accent transition">
                            {paper.title}
                          </h3>
                        </div>
                        <span className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(paper.status)}`}>
                          {paper.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Authors */}
                      <div className="mb-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">AUTHORS:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                          {paper.authors.join(' • ')}
                        </p>
                      </div>

                      {/* Abstract Preview */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {paper.abstract}
                      </p>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>Submitted: {new Date(paper.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag size={14} />
                          <span>{paper.category}</span>
                        </div>
                        {paper.subjectArea && (
                          <div className="flex items-center gap-1">
                            <BookOpen size={14} />
                            <span>{paper.subjectArea}</span>
                          </div>
                        )}
                        {paper.status === 'approved' && (
                          <div className="flex items-center gap-1">
                            <Eye size={14} />
                            <span>{paper.views || 0} views</span>
                          </div>
                        )}
                      </div>

                      {/* Keywords */}
                      {paper.keywords?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {paper.keywords.slice(0, 5).map((keyword, i) => (
                            <span 
                              key={i} 
                              className="text-xs bg-navy/10 dark:bg-accent/10 text-navy dark:text-accent px-2 py-1 rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                          {paper.keywords.length > 5 && (
                            <span className="text-xs text-gray-500">+{paper.keywords.length - 5} more</span>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button 
                          className="w-full flex items-center justify-center gap-2 bg-navy dark:bg-accent text-white px-4 py-2 rounded-lg hover:bg-navy-800 dark:hover:bg-accent-dark transition font-semibold"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Favorites Modal */}
      {showFavorites && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Favorites ({bookmarks.length})</h2>
              <button onClick={() => setShowFavorites(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {bookmarks.length === 0 ? (
                <div className="text-center py-12">
                  <Heart size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No favorites yet</p>
                  <button onClick={() => { setShowFavorites(false); window.location.href = '/browse'; }} className="mt-4 text-navy hover:underline">
                    Browse Papers
                  </button>
                </div>
              ) : (
                bookmarks.map((bookmark) => (
                  <a key={bookmark._id} href={`/research/${bookmark.research._id}`} className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{bookmark.research.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{bookmark.research.authors.join(', ')}</p>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
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