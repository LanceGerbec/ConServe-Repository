import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, CheckCheck, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notifications?limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('❌ Fetch notifications error:', error);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      intervalRef.current = setInterval(() => {
        fetchNotifications();
      }, 30000);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user]);

  // Mark as read
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      fetchNotifications();
    } catch (error) {
      console.error('❌ Mark read error:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      fetchNotifications();
    } catch (error) {
      console.error('❌ Mark all read error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete notification
  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      fetchNotifications();
    } catch (error) {
      console.error('❌ Delete notification error:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notif) => {
    if (!notif.isRead) markAsRead(notif._id);
    if (notif.link) {
      window.location.href = notif.link;
      setShowDropdown(false);
    }
  };

  // Get icon based on type
  const getTypeIcon = (type) => {
    const icons = {
      RESEARCH_APPROVED: '✅',
      RESEARCH_REJECTED: '❌',
      RESEARCH_REVISION: '📝',
      NEW_RESEARCH_SUBMITTED: '📚',
      REVIEW_RECEIVED: '📋',
      ACCOUNT_APPROVED: '🎉',
      SYSTEM_UPDATE: '🔔',
      NEW_USER_REGISTERED: '👤',
      RESEARCH_VIEWED: '👁️',
      BOOKMARK_MILESTONE: '⭐'
    };
    return icons[type] || '🔔';
  };

  // Get time ago
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        <Bell size={20} className="text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          ></div>
          
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-slide-up max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 rounded-t-xl">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell size={18} />
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                      {unreadCount} new
                    </span>
                    <button
                      onClick={markAllAsRead}
                      disabled={loading}
                      className="text-xs text-blue-600 hover:underline disabled:opacity-50 flex items-center gap-1"
                      title="Mark all as read"
                    >
                      <CheckCheck size={14} />
                      Mark all
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDropdown(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={48} className="mx-auto text-gray-400 mb-3 opacity-50" />
                  <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition group ${
                      !notif.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getTypeIcon(notif.type)}</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                            {notif.title}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(notif.createdAt)}
                          </span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => deleteNotification(notif._id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition"
                        title="Delete"
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 rounded-b-xl">
              <button
                onClick={() => {
                  window.location.href = '/notifications';
                  setShowDropdown(false);
                }}
                className="text-sm text-navy dark:text-accent hover:underline font-semibold"
              >
                View All Notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;