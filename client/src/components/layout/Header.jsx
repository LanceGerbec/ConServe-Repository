import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logos, setLogos] = useState({ school: null, college: null, conserve: null });
  const location = useLocation();

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
      const data = await res.json();
      if (data.settings?.logos) {
        setLogos(data.settings.logos);
      }
    } catch (error) {
      console.error('Failed to fetch logos:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/browse', label: 'Browse' },
    { path: '/about', label: 'About' },
    { path: '/help', label: 'Help' },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 border-b-4 border-navy dark:border-accent shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Left: School & College Logos */}
          <div className="flex items-center space-x-4">
            {/* School Logo */}
            <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-navy shadow-md hover:scale-110 transition-transform duration-300 overflow-hidden bg-white">
              {logos.school?.url ? (
                <img 
                  src={logos.school.url} 
                  alt="School Logo" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">NEUST</span>
              )}
            </div>
            
            {/* College Logo */}
            <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-navy shadow-md hover:scale-110 transition-transform duration-300 overflow-hidden bg-white">
              {logos.college?.url ? (
                <img 
                  src={logos.college.url} 
                  alt="College Logo" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">CON</span>
              )}
            </div>
            
            {/* ConServe Brand */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 overflow-hidden bg-navy">
                {logos.conserve?.url ? (
                  <img 
                    src={logos.conserve.url} 
                    alt="ConServe Logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-xl">C</span>
                )}
              </div>
              <div className="hidden md:block">
                <span className="text-xl font-bold text-gray-900 dark:text-white block">ConServe</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Research Repository</span>
              </div>
            </Link>
          </div>

          {/* Center/Right: Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? 'bg-navy text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isActive('/dashboard')
                      ? 'bg-navy text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Dashboard
                </Link>

                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <User size={18} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.firstName}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-700' :
                    user.role === 'faculty' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 rounded-lg font-medium bg-navy text-white hover:bg-navy-800 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  Register
                </Link>
              </>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-accent" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 border-t border-gray-200 dark:border-gray-800 pt-4 animate-slide-up">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? 'bg-navy text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg font-medium bg-navy text-white"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg font-medium bg-navy text-white"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;