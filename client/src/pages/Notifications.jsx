import { useState, useEffect } from 'react';
import {
  Bell, Check, Trash2, CheckCheck, X, Filter,
  CheckCircle, XCircle, FileEdit, BookOpen, ClipboardList,
  UserPlus, Eye, Star, Users, Shield, ShieldAlert,
  AlertTriangle, UserCheck, Lock, FileText, Bookmark, Info
} from 'lucide-react';
import NotificationConfirmModal from '../components/common/NotificationConfirmModal';

// Strip emojis/unicode symbols from text
const clean = (text = '') =>
  text.replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[✅⚠️❌✓✔✗✘⬆️⬇️]/gu, '')
      .replace(/\s+/g, ' ').trim();

const getConfig = (type = '', title = '') => {
  const t = clean(title).toLowerCase();
  const map = {
    RESEARCH_APPROVED:            { I: CheckCircle,   c: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/20' },
    RESEARCH_APPROVED_FOR_REVIEW: { I: CheckCircle,   c: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/20' },
    RESEARCH_REJECTED:            { I: XCircle,       c: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/20' },
    RESEARCH_REVISION:            { I: FileEdit,      c: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
    NEW_RESEARCH_SUBMITTED:       { I: FileText,      c: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/20' },
    REVIEW_RECEIVED:              { I: ClipboardList, c: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
    ACCOUNT_APPROVED:             { I: UserCheck,     c: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/20' },
    SYSTEM_UPDATE:                { I: Info,          c: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-900/20' },
    NEW_USER_REGISTERED:          { I: UserPlus,      c: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/20' },
    RESEARCH_VIEWED:              { I: Eye,           c: 'text-gray-500',   bg: 'bg-gray-100 dark:bg-gray-800' },
    BOOKMARK_MILESTONE:           { I: Bookmark,      c: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
    NEW_FOLLOWER:                 { I: UserPlus,      c: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/20' },
    CO_AUTHOR_TAGGED:             { I: Users,         c: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
    LOGIN_SUCCESS:                { I: Shield,        c: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/20' },
    LOGIN_FAILED:                 { I: ShieldAlert,   c: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/20' },
  };

  if (map[type]) return map[type];

  // Title keyword fallback
  if (t.includes('login') || t.includes('sign in') || t.includes('logged in')) {
    if (t.includes('fail') || t.includes('attempt') || t.includes('lock'))
      return { I: ShieldAlert, c: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/20' };
    return   { I: Shield,     c: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/20' };
  }
  if (t.includes('fail') || t.includes('lock'))    return { I: Lock,          c: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20' };
  if (t.includes('follow'))                        return { I: UserPlus,      c: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/20' };
  if (t.includes('approv') || t.includes('success'))return { I: CheckCircle, c: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/20' };
  if (t.includes('reject') || t.includes('denied'))return { I: XCircle,      c: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/20' };
  if (t.includes('warn') || t.includes('alert'))   return { I: AlertTriangle, c: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
  if (t.includes('review'))                        return { I: ClipboardList, c: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' };
  if (t.includes('research') || t.includes('paper'))return { I: FileText,    c: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/20' };
  if (t.includes('account') || t.includes('register'))return { I: UserCheck, c: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/20' };
  return { I: Bell, c: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' };
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [showActions, setShowActions] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, type: '', action: null });
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notifications?limit=100`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch {}
    finally { setLoading(false); }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      fetchNotifications();
    } catch {}
  };

  const markAllAsRead = () => setModalState({ isOpen: true, type: 'markRead', action: async () => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/notifications/mark-all-read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    fetchNotifications();
  }});

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchNotifications();
    } catch {}
  };

  const bulkDelete = () => setModalState({ isOpen: true, type: 'delete', action: async () => {
    const token = localStorage.getItem('token');
    await Promise.all([...selected].map(id =>
      fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    ));
    setSelected(new Set());
    fetchNotifications();
  }});

  const clearAll = () => setModalState({ isOpen: true, type: 'warning', action: async () => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/notifications/clear-read/all`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchNotifications();
  }});

  const toggleSelect = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const selectAll = () => {
    const allIds = new Set(filteredNotifications.map(n => n._id));
    setSelected(selected.size === allIds.size ? new Set() : allIds);
  };

  const getModalContent = () => {
    if (modalState.type === 'delete')   return { title: `Delete ${selected.size} Notification(s)`, message: `Are you sure you want to delete ${selected.size} selected notification(s)? This cannot be undone.` };
    if (modalState.type === 'markRead') return { title: 'Mark All as Read', message: `This will mark all ${unreadCount} unread notification(s) as read.` };
    return { title: 'Clear Read Notifications', message: 'This will permanently delete all read notifications.' };
  };

  const filteredNotifications = notifications.filter(n =>
    filter === 'all' ? true : filter === 'unread' ? !n.isRead : n.isRead
  );
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const modalContent = getModalContent();

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy" />
    </div>
  );

  return (
    <>
      <NotificationConfirmModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, type: '', action: null })}
        onConfirm={modalState.action}
        title={modalContent.title}
        message={modalContent.message}
        type={modalState.type}
      />

      <div className="pb-6 space-y-4">
        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell size={24} className="text-navy flex-shrink-0" />
                Notifications
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {filteredNotifications.length} total{unreadCount > 0 && ` · ${unreadCount} unread`}
              </p>
            </div>
            <button onClick={() => setShowActions(!showActions)} className="p-2 bg-navy text-white rounded-lg hover:bg-navy-800 transition flex-shrink-0">
              <Filter size={18} />
            </button>
          </div>

          {showActions && (
            <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700 animate-slide-up">
              {selected.size > 0 && (
                <button onClick={bulkDelete} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold">
                  <Trash2 size={16} />Delete ({selected.size})
                </button>
              )}
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                  <CheckCheck size={16} />Mark all as read
                </button>
              )}
              <button onClick={clearAll} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-semibold">
                <X size={16} />Clear read
              </button>
            </div>
          )}

          <div className={`flex gap-2 ${showActions ? 'mt-3 pt-3 border-t border-gray-200 dark:border-gray-700' : ''}`}>
            {['all', 'unread', 'read'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition ${filter === f ? 'bg-navy text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {filteredNotifications.length > 0 && (
            <button onClick={selectAll} className="w-full mt-2 text-xs text-navy dark:text-accent hover:underline font-semibold">
              {selected.size === filteredNotifications.length ? 'Deselect all' : 'Select all'}
            </button>
          )}
        </div>

        {/* List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Bell size={48} className="mx-auto text-gray-400 mb-3 opacity-30" />
              <p className="text-gray-500 text-sm">No {filter !== 'all' ? filter : ''} notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map(notif => {
                const { I: Icon, c: iconColor, bg: iconBg } = getConfig(notif.type, notif.title);
                return (
                  <div key={notif._id} className={`p-4 transition ${!notif.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${selected.has(notif._id) ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}>
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={selected.has(notif._id)} onChange={() => toggleSelect(notif._id)}
                        className="w-5 h-5 text-navy border-gray-300 rounded focus:ring-navy mt-0.5 flex-shrink-0 cursor-pointer" />

                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon size={16} className={iconColor} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-white break-words leading-tight">
                            {clean(notif.title)}
                          </h3>
                          {!notif.isRead && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 break-words leading-relaxed">
                          {clean(notif.message)}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                          {!notif.isRead && (
                            <button onClick={() => markAsRead(notif._id)} className="text-xs text-blue-600 hover:underline whitespace-nowrap flex items-center gap-1">
                              <Check size={12} />Mark read
                            </button>
                          )}
                          {notif.link && <a href={notif.link} className="text-xs text-navy dark:text-accent hover:underline whitespace-nowrap">View</a>}
                          <button onClick={() => deleteNotification(notif._id)} className="text-xs text-red-600 hover:underline whitespace-nowrap ml-auto">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;