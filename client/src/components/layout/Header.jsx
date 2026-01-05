// client/src/components/layout/Header.jsx
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, LogOut, User, BookOpen, Home, HelpCircle, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import LogoutModal from '../common/LogoutModal';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logos, setLogos] = useState({ school: null, college: null, conserve: null });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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
    logout();
    setShowLogoutModal(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/explore', label: 'Explore', icon: BookOpen },
    { path: '/about', label: 'About', icon: Info },
    { path: '/help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b-4 border-navy dark:border-accent shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4 md:px-6 py-3 md:py-4 max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            {/* Logos */}
            <div className="flex items-center gap-2 md:gap-4">
              <a href="https://neust.edu.ph/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 border-navy shadow-md hover:scale-110 transition-transform overflow-hidden bg-white" title="Visit NEUST">
                {logos.school?.url ? <img src={logos.school.url} alt="NEUST" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-gray-500">NU</span>}
              </a>

              <a href="https://www.facebook.com/NEUSTCON" target="_blank" rel="noopener noreferrer" className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 border-navy shadow-md hover:scale-110 transition-transform overflow-hidden bg-white" title="College of Nursing">
                {logos.college?.url ? <img src={logos.college.url} alt="CON" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-gray-500">CN</span>}
              </a>

              <Link to="/" className="flex items-center gap-2 md:gap-3 group">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all overflow-hidden bg-navy">
                  {logos.conserve?.url ? <img src={logos.conserve.url} alt="ConServe" className="w-full h-full object-cover" /> : <span className="text-white font-bold text-lg md:text-xl">C</span>}
                </div>
                <div className="hidden lg:block">
                  <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">CONserve</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">Repository</span>
                </div>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 text-sm lg:text-base ${isActive(link.path) ? 'bg-navy text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  <link.icon size={16} />
                  <span className="hidden lg:inline">{link.label}</span>
                </Link>
              ))}

              {user ? (
                <>
                  <Link to="/dashboard" className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition text-sm lg:text-base ${isActive('/dashboard') ? 'bg-navy text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    Dashboard
                  </Link>

                  <NotificationBell />

                  <div className="flex items-center gap-2 px-2 lg:px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <User size={16} className="text-gray-600 dark:text-gray-400" />
                    <span className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[80px] truncate">{user.firstName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-700' : user.role === 'faculty' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{user.role}</span>
                  </div>
                  <button 
                    onClick={() => setShowLogoutModal(true)}
                    className="flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 lg:px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm lg:text-base">Login</Link>
                  <Link to="/register" className="px-4 lg:px-6 py-2 rounded-lg font-medium bg-navy text-white hover:bg-navy-800 shadow-md text-sm lg:text-base">Register</Link>
                </>
              )}

              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-accent" />}
              </button>
            </div>

            {/* 🚀 MOBILE: NOTIFICATION BELL + BURGER MENU */}
            <div className="flex items-center gap-2 md:hidden">
              {user && <NotificationBell />}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2 border-t border-gray-200 dark:border-gray-800 pt-4 animate-slide-up">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium ${isActive(link.path) ? 'bg-navy text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  <link.icon size={18} />
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium bg-navy text-white">Dashboard</Link>
                  <button 
                    onClick={() => { setShowLogoutModal(true); setIsMenuOpen(false); }} 
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Login</Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium bg-navy text-white">Register</Link>
                </>
              )}
              <button onClick={toggleTheme} className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                {theme === 'light' ? <><Moon size={18} /> Dark Mode</> : <><Sun size={18} /> Light Mode</>}
              </button>
            </div>
          )}
        </nav>
      </header>

      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
};

export default Header;