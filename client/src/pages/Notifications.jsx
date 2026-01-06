// client/src/pages/Notifications.jsx - CLEAN TITLES
import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, CheckCheck, X, Filter, CheckCircle, XCircle, FileEdit, BookOpen, ClipboardList, UserPlus, Eye, Star, AlertCircle } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [showActions, setShowActions] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => { fetchNotifications(); }, []);

  const removeEmojis = (text) => {
    return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notifications?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Mark read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Mark all error:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} notification(s)?`)) return;
    try {
      const token = localStorage.getItem('token');
      await Promise.all([...selected].map(id =>
        fetch(`${API_URL}/notifications/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ));
      setSelected(new Set());
      fetchNotifications();
    } catch (error) {
      console.error('Bulk delete error:', error);
    }
  };

  const clearAll = async () => {
    if (!confirm('Clear all read notifications?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/notifications/clear-read/all`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Clear all error:', error);
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selected);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelected(newSelected);
  };

  const selectAll = () => {
    const allIds = new Set(filteredNotifications.map(n => n._id));
    setSelected(selected.size === allIds.size ? new Set() : allIds);
  };

  const getTypeIcon = (type) => {
    const iconMap = {
      RESEARCH_APPROVED: { Icon: CheckCircle, color: 'text-green-600' },
      RESEARCH_REJECTED: { Icon: XCircle, color: 'text-red-600' },
      RESEARCH_REVISION: { Icon: FileEdit, color: 'text-yellow-600' },
      NEW_RESEARCH_SUBMITTED: { Icon: BookOpen, color: 'text-blue-600' },
      REVIEW_RECEIVED: { Icon: ClipboardList, color: 'text-purple-600' },
      ACCOUNT_APPROVED: { Icon: CheckCircle, color: 'text-green-600' },
      SYSTEM_UPDATE: { Icon: Bell, color: 'text-blue-600' },
      NEW_USER_REGISTERED: { Icon: UserPlus, color: 'text-indigo-600' },
      RESEARCH_VIEWED: { Icon: Eye, color: 'text-gray-600' },
      BOOKMARK_MILESTONE: { Icon: Star, color: 'text-yellow-600' }
    };
    
    const config = iconMap[type] || { Icon: AlertCircle, color: 'text-gray-600' };
    const { Icon, color } = config;
    
    return <Icon size={20} className={color} />;
  };

  const filteredNotifications = notifications.filter(n =>
    filter === 'all' ? true : filter === 'unread' ? !n.isRead : n.isRead
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="pb-6 space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell size={24} className="text-navy flex-shrink-0" />
              <span className="truncate">Notifications</span>
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {filteredNotifications.length} total{unreadCount > 0 && ` • ${unreadCount} unread`}
            </p>
          </div>
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 bg-navy text-white rounded-lg hover:bg-navy-800 transition flex-shrink-0"
          >
            <Filter size={18} />
          </button>
        </div>

        {showActions && (
          <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700 animate-slide-up">
            {selected.size > 0 && (
              <button
                onClick={bulkDelete}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
              >
                <Trash2 size={16} />Delete ({selected.size})
              </button>
            )}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
              >
                <CheckCheck size={16} />Mark all read
              </button>
            )}
            <button
              onClick={clearAll}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-semibold"
            >
              <X size={16} />Clear read
            </button>
          </div>
        )}

        <div className={`flex gap-2 ${showActions ? 'mt-3 pt-3 border-t border-gray-200 dark:border-gray-700' : ''}`}>
          {['all', 'unread', 'read'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                filter === f
                  ? 'bg-navy text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {filteredNotifications.length > 0 && (
          <button
            onClick={selectAll}
            className="w-full mt-2 text-xs text-navy dark:text-accent hover:underline font-semibold"
          >
            {selected.size === filteredNotifications.length ? 'Deselect all' : 'Select all'}
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Bell size={48} className="mx-auto text-gray-400 mb-3 opacity-30" />
            <p className="text-gray-500 text-sm">No {filter !== 'all' ? filter : ''} notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map(notif => (
              <div
                key={notif._id}
                className={`p-4 transition ${!notif.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${selected.has(notif._id) ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(notif._id)}
                    onChange={() => toggleSelect(notif._id)}
                    className="w-5 h-5 text-navy border-gray-300 rounded focus:ring-navy mt-0.5 flex-shrink-0 cursor-pointer"
                  />
                  <div className="flex-shrink-0 mt-0.5">{getTypeIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white break-words leading-tight">
                        {removeEmojis(notif.title)}
                      </h3>
                      {!notif.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 break-words leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                      {!notif.isRead && (
                        <button
                          onClick={() => markAsRead(notif._id)}
                          className="text-xs text-blue-600 hover:underline whitespace-nowrap flex items-center gap-1"
                        >
                          <Check size={12} />Mark read
                        </button>
                      )}
                      {notif.link && (
                        <a href={notif.link} className="text-xs text-navy dark:text-accent hover:underline whitespace-nowrap">
                          View
                        </a>
                      )}
                      <button
                        onClick={() => deleteNotification(notif._id)}
                        className="text-xs text-red-600 hover:underline whitespace-nowrap ml-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;