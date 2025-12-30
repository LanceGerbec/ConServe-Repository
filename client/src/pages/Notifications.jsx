// client/src/pages/Notifications.jsx
import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, CheckCheck, Filter, X } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => { fetchNotifications(); }, []);

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
    const icons = {
      RESEARCH_APPROVED: '✅', RESEARCH_REJECTED: '❌', RESEARCH_REVISION: '📝',
      NEW_RESEARCH_SUBMITTED: '📚', REVIEW_RECEIVED: '📋', ACCOUNT_APPROVED: '🎉',
      SYSTEM_UPDATE: '🔔', NEW_USER_REGISTERED: '👤', RESEARCH_VIEWED: '👁️',
      BOOKMARK_MILESTONE: '⭐'
    };
    return icons[type] || '🔔';
  };

  const filteredNotifications = notifications.filter(n =>
    filter === 'all' ? true : filter === 'unread' ? !n.isRead : n.isRead
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell size={28} className="text-navy" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredNotifications.length} total
                  {unreadCount > 0 && ` • ${unreadCount} unread`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {selected.size > 0 && (
                <button
                  onClick={bulkDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                >
                  <Trash2 size={16} />
                  Delete ({selected.size})
                </button>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                >
                  <CheckCheck size={16} />
                  Mark all read
                </button>
              )}
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-semibold"
              >
                <X size={16} />
                Clear read
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            {['all', 'unread', 'read'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? 'bg-navy text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            {filteredNotifications.length > 0 && (
              <button
                onClick={selectAll}
                className="ml-auto text-sm text-navy dark:text-accent hover:underline font-semibold"
              >
                {selected.size === filteredNotifications.length ? 'Deselect all' : 'Select all'}
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[70vh] overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell size={64} className="mx-auto text-gray-400 mb-3 opacity-50" />
              <p className="text-gray-500">No {filter !== 'all' ? filter : ''} notifications</p>
            </div>
          ) : (
            filteredNotifications.map(notif => (
              <div
                key={notif._id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition group ${
                  !notif.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                } ${selected.has(notif._id) ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selected.has(notif._id)}
                    onChange={() => toggleSelect(notif._id)}
                    className="w-5 h-5 text-navy border-gray-300 rounded focus:ring-navy mt-1 cursor-pointer"
                  />

                  {/* Icon */}
                  <span className="text-2xl flex-shrink-0">{getTypeIcon(notif.type)}</span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {notif.title}
                      </h3>
                      {!notif.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        {!notif.isRead && (
                          <button
                            onClick={() => markAsRead(notif._id)}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Check size={14} /> Mark read
                          </button>
                        )}
                        {notif.link && (
                          
                           <a href={notif.link}
                            className="text-xs text-navy hover:underline"
                          >
                            View →
                          </a>
                        )}
                        <button
                          onClick={() => deleteNotification(notif._id)}
                          className="text-xs text-red-600 hover:underline flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;