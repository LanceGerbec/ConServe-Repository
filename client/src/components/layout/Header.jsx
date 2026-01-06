// client/src/components/layout/Header.jsx - OPTIMIZED COMPACT VERSION
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
      <header className="bg-white dark:bg-gray-900 border-b-2 border-navy dark:border-accent shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-3 md:px-4 py-2 max-w-7xl">
          <div className="flex items-center justify-between gap-2">
            
            {/* Compact Logos + Brand */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <a href="https://neust.edu.ph/" target="_blank" rel="noopener noreferrer" 
                className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center border border-navy shadow-sm hover:scale-110 transition-transform overflow-hidden bg-white" 
                title="NEUST">
                {logos.school?.url ? <img src={logos.school.url} alt="NEUST" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-gray-500">N</span>}
              </a>

              <a href="https://www.facebook.com/NEUSTCON" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center border border-navy shadow-sm hover:scale-110 transition-transform overflow-hidden bg-white"
                title="CON">
                {logos.college?.url ? <img src={logos.college.url} alt="CON" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-gray-500">C</span>}
              </a>

              <Link to="/" className="flex items-center gap-1.5 group">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-md flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all overflow-hidden bg-navy">
                  {logos.conserve?.url ? <img src={logos.conserve.url} alt="ConServe" className="w-full h-full object-cover" /> : <span className="text-white font-bold text-sm">C</span>}
                </div>
                <span className="hidden md:inline text-base font-bold text-gray-900 dark:text-white">CONserve</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} 
                  className={`px-2 lg:px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 text-xs lg:text-sm ${
                    isActive(link.path) ? 'bg-navy text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}>
                  <link.icon size={14} />
                  <span className="hidden lg:inline">{link.label}</span>
                </Link>
              ))}

              {user ? (
                <>
                  <Link to="/dashboard" 
                    className={`px-2 lg:px-3 py-1.5 rounded-md font-medium transition text-xs lg:text-sm ${
                      isActive('/dashboard') ? 'bg-navy text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}>
                    Dashboard
                  </Link>

                  <NotificationBell />

                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">
                    <User size={12} className="text-gray-600 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[60px] truncate">{user.firstName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-700' : 
                      user.role === 'faculty' ? 'bg-blue-100 text-blue-700' : 
                      'bg-green-100 text-green-700'
                    }`}>{user.role}</span>
                  </div>

                  <button 
                    onClick={() => setShowLogoutModal(true)}
                    className="p-1.5 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Logout">
                    <LogOut size={14} />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-2 lg:px-3 py-1.5 rounded-md font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs lg:text-sm">Login</Link>
                  <Link to="/register" className="px-3 lg:px-4 py-1.5 rounded-md font-medium bg-navy text-white hover:bg-navy-800 shadow-sm text-xs lg:text-sm">Register</Link>
                </>
              )}

              <button onClick={toggleTheme} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" title="Toggle theme">
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} className="text-accent" />}
              </button>
            </div>

            {/* Mobile: Bell + Menu */}
            <div className="flex items-center gap-1 md:hidden">
              {user && <NotificationBell />}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-2 pb-2 space-y-1 border-t border-gray-200 dark:border-gray-800 pt-2 animate-slide-up">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm ${
                    isActive(link.path) ? 'bg-navy text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}>
                  <link.icon size={16} />
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md font-medium bg-navy text-white text-sm">Dashboard</Link>
                  <button 
                    onClick={() => { setShowLogoutModal(true); setIsMenuOpen(false); }} 
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm">
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">Login</Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md font-medium bg-navy text-white text-sm">Register</Link>
                </>
              )}
              <button onClick={toggleTheme} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
                {theme === 'light' ? <><Moon size={16} /> Dark Mode</> : <><Sun size={16} /> Light Mode</>}
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