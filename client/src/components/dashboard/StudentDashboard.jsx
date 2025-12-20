import { useState, useEffect } from 'react';
import { BookOpen, Upload, Heart, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SubmitResearch from '../research/SubmitResearch';
import RecentlyViewed from '../research/RecentlyViewed';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [stats, setStats] = useState({ submissions: 0, favorites: 0, pending: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [bookmarksRes, submissionsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/bookmarks/my-bookmarks`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/research/my-submissions`, { headers })
      ]);

      const bookmarksData = await bookmarksRes.json();
      const submissionsData = await submissionsRes.json();

      setBookmarks(bookmarksData.bookmarks || []);
      setStats({
        submissions: submissionsData.count || 0,
        favorites: bookmarksData.count || 0,
        pending: submissionsData.papers?.filter(p => p.status === 'pending').length || 0
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy to-accent text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}! 👋</h1>
        <p className="text-blue-100">Student Dashboard - Manage your research journey</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'My Submissions', value: stats.submissions, icon: Upload, color: 'text-blue-600' },
          { label: 'Favorites', value: stats.favorites, icon: Heart, color: 'text-red-600' },
          { label: 'Pending Reviews', value: stats.pending, icon: Clock, color: 'text-orange-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={stat.color} size={28} />
              <span className="text-3xl font-bold text-navy">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
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
            <div className="flex justify-between items-center">
              <span>Pending Reviews</span>
              <span className="text-3xl font-bold">{stats.pending}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSubmitModal && (
        <SubmitResearch 
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => { setShowSubmitModal(false); fetchData(); }}
        />
      )}

      {/* Favorites Modal */}
      {showFavorites && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Favorites ({bookmarks.length})</h2>
              <button onClick={() => setShowFavorites(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                ✕
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
    </div>
  );
};

export default StudentDashboard;