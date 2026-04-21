import { useState, useEffect, useRef } from 'react';
import {
  Bell, Check, Trash2, CheckCheck, X,
  CheckCircle, XCircle, FileEdit, BookOpen, ClipboardList,
  UserPlus, Eye, Star, Users, Shield, ShieldAlert,
  AlertTriangle, UserCheck, Lock, LogIn, FileText,
  Bookmark, Quote, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Strip all emoji/unicode symbols from text
const clean = (text = '') =>
  text.replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[✅⚠️❌✓✔✗✘⬆️⬇️]/gu, '')
      .replace(/\s+/g, ' ').trim();

// Determine icon + colors from notification type & title
const getConfig = (type = '', title = '') => {
  const t = clean(title).toLowerCase();

  const map = {
    RESEARCH_APPROVED:            { I: CheckCircle,  c: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/30' },
    RESEARCH_APPROVED_FOR_REVIEW: { I: CheckCircle,  c: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/30' },
    RESEARCH_REJECTED:            { I: XCircle,      c: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/30' },
    RESEARCH_REVISION:            { I: FileEdit,     c: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    NEW_RESEARCH_SUBMITTED:       { I: FileText,     c: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/30' },
    REVIEW_RECEIVED:              { I: ClipboardList,c: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    ACCOUNT_APPROVED:             { I: UserCheck,    c: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/30' },
    NEW_USER_REGISTERED:          { I: UserPlus,     c: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    RESEARCH_VIEWED:              { I: Eye,          c: 'text-gray-500',   bg: 'bg-gray-100 dark:bg-gray-800' },
    BOOKMARK_MILESTONE:           { I: Bookmark,     c: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    NEW_FOLLOWER:                 { I: UserPlus,     c: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/30' },
    CO_AUTHOR_TAGGED:             { I: Users,        c: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    LOGIN_SUCCESS:                { I: Shield,       c: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/30' },
    LOGIN_FAILED:                 { I: ShieldAlert,  c: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/30' },
  };

  if (map[type]) return map[type];

  // Smart fallback: infer from cleaned title keywords
  if (t.includes('login') || t.includes('sign in') || t.includes('logged in')) {
    if (t.includes('fail') || t.includes('attempt') || t.includes('block') || t.includes('lock'))
      return { I: ShieldAlert, c: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/30' };
    return   { I: Shield,     c: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/30' };
  }
  if (t.includes('fail') || t.includes('lock') || t.includes('block'))
    return { I: Lock,        c: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' };
  if (t.includes('follow'))
    return { I: UserPlus,    c: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/30' };
  if (t.includes('approv') || t.includes('success'))
    return { I: CheckCircle, c: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/30' };
  if (t.includes('reject') || t.includes('denied'))
    return { I: XCircle,     c: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/30' };
  if (t.includes('warn') || t.includes('alert') || t.includes('caution'))
    return { I: AlertTriangle, c: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
  if (t.includes('review'))
    return { I: ClipboardList, c: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' };
  if (t.includes('research') || t.includes('paper') || t.includes('submission'))
    return { I: FileText,    c: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/30' };
  if (t.includes('account') || t.includes('register'))
    return { I: UserCheck,   c: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/30' };

  return { I: Bell, c: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' };
};

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)       return 'Just now';
  if (s < 3600)     return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)    return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800)   return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
};

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filter, setFilter] = useState('all');
  const dropdownRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notifications?limit=20`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const t = setInterval(fetchNotifications, 30000);
      return () => clearInterval(t);
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      fetchNotifications();
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/notifications/mark-all-read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      fetchNotifications();
    } catch {}
  };

  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchNotifications();
    } catch {}
  };

  const handleClick = (notif) => {
    if (!notif.isRead) markAsRead(notif._id);
    if (notif.link) { navigate(notif.link); setShowDropdown(false); }
  };

  const filtered = notifications.filter(n =>
    filter === 'all' ? true : filter === 'unread' ? !n.isRead : n.isRead
  );

  if (!user) return null;

  return (
    <>
      {showDropdown && (
        <div className="fixed inset-0 z-[90] bg-black/20 md:hidden" onClick={() => setShowDropdown(false)} />
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Bell button */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="Notifications"
        >
          <Bell size={20} className="text-gray-700 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div
            className="z-[100] bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in rounded-2xl fixed left-2 right-2 top-[64px] md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:w-[390px]"
            style={{ maxHeight: 'calc(100vh - 80px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap">
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
                <button onClick={() => setShowDropdown(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <X size={15} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 px-3 pt-2 pb-1">
              {['all', 'unread'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    filter === f
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {f === 'all' ? 'All' : 'Unread'}
                  {f === 'unread' && unreadCount > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-[10px] px-1 rounded-full">{unreadCount}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
              {filtered.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No {filter !== 'all' ? filter : ''} notifications</p>
                </div>
              ) : (
                filtered.slice(0, 15).map(notif => {
                  const { I: Icon, c: iconColor, bg: iconBg } = getConfig(notif.type, notif.title);
                  return (
                    <div
                      key={notif._id}
                      onClick={() => handleClick(notif)}
                      className={`group flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition relative ${!notif.isRead ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''}`}
                    >
                      {/* Icon circle */}
                      <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon size={16} className={iconColor} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 pr-2">
                          {clean(notif.title)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {clean(notif.message)}
                        </p>
                        <p className={`text-xs font-semibold mt-1 ${!notif.isRead ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                          {timeAgo(notif.createdAt)}
                        </p>
                      </div>

                      {/* Unread dot + delete */}
                      <div className="flex flex-col items-center gap-2 flex-shrink-0">
                        {!notif.isRead && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1" />}
                        <button
                          onClick={(e) => deleteNotif(notif._id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition"
                        >
                          <Trash2 size={12} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => { navigate('/notifications'); setShowDropdown(false); }}
                className="w-full py-3 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                See All Notifications
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationBell;