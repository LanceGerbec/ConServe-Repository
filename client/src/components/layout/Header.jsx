import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, LogOut, User, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [logos, setLogos] = useState({ school: null, college: null, conserve: null });
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Your research was approved', time: '2h ago', read: false },
    { id: 2, text: 'New research in your field', time: '1d ago', read: false },
    { id: 3, text: 'System maintenance scheduled', time: '3d ago', read: true }
  ]);
  const location = useLocation();

  useEffect(() => {
    fetchLogos();
    const handleLogosUpdated = () => fetchLogos();
    window.addEventListener('logosUpdated', handleLogosUpdated);
    return () => window.removeEventListener('logosUpdated', handleLogosUpdated);
  }, []);

  const fetchLogos = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
      const data = await res.json();
      if (data.settings?.logos) setLogos(data.settings.logos);
    } catch (error) {
      console.error('Failed to fetch logos:', error);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/browse', label: 'Browse' },
    { path: '/about', label: 'About' },
    { path: '/help', label: 'Help' },
  ];

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b-4 border-navy dark:border-accent shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logos */}
          <div className="flex items-center space-x-4">
            <a href="https://neust.edu.ph/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-navy shadow-md hover:scale-110 transition-transform duration-300 overflow-hidden bg-white cursor-pointer" title="Visit NEUST Website">
              {logos.school?.url ? <img src={logos.school.url} alt="NEUST" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-500 font-bold">NEUST</span>}
            </a>

            <a href="https://www.facebook.com/NEUSTCON" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-navy shadow-md hover:scale-110 transition-transform duration-300 overflow-hidden bg-white cursor-pointer" title="Visit College of Nursing Facebook">
              {logos.college?.url ? <img src={logos.college.url} alt="College of Nursing" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-500 font-bold">CON</span>}
            </a>

            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 overflow-hidden bg-navy">
                {logos.conserve?.url ? <img src={logos.conserve.url} alt="ConServe" className="w-full h-full object-cover" /> : <span className="text-white font-bold text-xl">C</span>}
              </div>
              <div className="hidden md:block">
                <span className="text-xl font-bold text-gray-900 dark:text-white">ConServe</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Research Repository</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={`px-4 py-2 rounded-lg font-medium transition ${isActive(link.path) ? 'bg-navy text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link to="/dashboard" className={`px-4 py-2 rounded-lg font-medium transition ${isActive('/dashboard') ? 'bg-navy text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  Dashboard
                </Link>

                {/* NOTIFICATION BELL */}
                <div className="relative">
                  <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    <Bell size={20} className="text-gray-700 dark:text-gray-300" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-slide-up">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                          <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                          {unreadCount > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">{unreadCount} new</span>}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map((notif) => (
                            <div key={notif.id} onClick={() => markAsRead(notif.id)} className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                              <div className="flex items-start justify-between">
                                <p className="text-sm text-gray-900 dark:text-white flex-1">{notif.text}</p>
                                {!notif.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-2 flex-shrink-0"></span>}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
                          <button onClick={() => setShowNotifications(false)} className="text-sm text-navy hover:underline">View All</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <User size={18} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.firstName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-700' : user.role === 'faculty' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{user.role}</span>
                </div>
                <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Login</Link>
                <Link to="/register" className="px-6 py-2 rounded-lg font-medium bg-navy text-white hover:bg-navy-800 shadow-md">Register</Link>
              </>
            )}

            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-accent" />}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 border-t border-gray-200 dark:border-gray-800 pt-4 animate-slide-up">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)} className={`block px-4 py-2 rounded-lg font-medium ${isActive(link.path) ? 'bg-navy text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 rounded-lg font-medium bg-navy text-white">Dashboard</Link>
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Login</Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 rounded-lg font-medium bg-navy text-white">Register</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;