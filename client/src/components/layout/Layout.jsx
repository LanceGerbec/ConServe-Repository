import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  LayoutDashboard,
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  Settings,
  Shield,
  BookOpen,
  Info,
  HelpCircle,
  ChevronDown,
  Mail,
  MapPin,
  Users,
  User,
  FileText,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';
import TourGuideButton from '../common/TourGuideButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logos, setLogos] = useState({ school: null, college: null, conserve: null });

  useEffect(() => {
    fetchLogos();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const fetchLogos = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`);
      const d = await res.json();

      if (d.settings?.logos) {
        setLogos(d.settings.logos);
      }
    } catch {
      // Keep layout stable if public settings fail to load
    }
  };

  const isActive = (p) => location.pathname === p;

  const goTo = (path) => {
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    setMenuOpen(false);
    logout();
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home, public: true },
    { to: '/explore', label: 'Explore', icon: Search, public: false },
    { to: '/researchers', label: 'Researchers', icon: Users, public: false },
    { to: '/about', label: 'About', icon: Info, public: true },
    { to: '/help', label: 'Help', icon: HelpCircle, public: true },
  ];

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="https://neust.edu.ph/"
              target="_blank"
              rel="noopener noreferrer"
              title="NEUST"
              className="w-8 h-8 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition overflow-hidden bg-white flex items-center justify-center flex-shrink-0"
            >
              {logos.school?.url ? (
                <img src={logos.school.url} alt="NEUST" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-gray-500">N</span>
              )}
            </a>

            <a
              href="https://www.facebook.com/NEUSTCON"
              target="_blank"
              rel="noopener noreferrer"
              title="College of Nursing"
              className="w-8 h-8 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition overflow-hidden bg-white flex items-center justify-center flex-shrink-0"
            >
              {logos.college?.url ? (
                <img src={logos.college.url} alt="CON" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-gray-500">C</span>
              )}
            </a>

            <Link to="/" title="CONserve Home" className="flex items-center gap-1.5 group">
              <div className="w-8 h-8 rounded-lg border border-navy shadow-sm hover:scale-110 transition overflow-hidden bg-navy flex items-center justify-center flex-shrink-0">
                {logos.conserve?.url ? (
                  <img src={logos.conserve.url} alt="ConServe" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-sm">C</span>
                )}
              </div>
              <span className="font-black text-lg hidden sm:block">
                <span className="text-navy dark:text-accent">CON</span>
                <span className="text-gray-900 dark:text-white">serve</span>
              </span>
            </Link>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(link => (link.public || user) && (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive(link.to)
                    ? 'bg-navy text-white dark:bg-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <link.icon size={15} />
                {link.label}
              </Link>
            ))}

            {user && (
              <Link
                to="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive('/dashboard')
                    ? 'bg-navy text-white dark:bg-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun size={17} className="text-gray-400" />
              ) : (
                <Moon size={17} className="text-gray-600" />
              )}
            </button>

            {user ? (
              <>
                <NotificationBell />

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition border border-gray-200 dark:border-gray-700"
                    aria-label="Account menu"
                    aria-expanded={userMenuOpen}
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-navy to-accent flex items-center justify-center">
                          <span className="text-white text-xs font-black">{initials}</span>
                        </div>
                      )}
                    </div>

                    <span className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-300 max-w-[90px] truncate">
                      {user.firstName}
                    </span>

                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fade-in">
                      {/* User summary */}
                      <div className="p-3 bg-gradient-to-r from-navy/5 to-accent/5 dark:from-navy/20 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-gray-600">
                          {user?.avatar ? (
                            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-navy to-accent flex items-center justify-center">
                              <span className="text-white text-sm font-black">{initials}</span>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                            {fullName || user.email || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {user.role} Account
                          </p>
                        </div>
                      </div>

                      {/* Menu actions */}
                      <div className="p-1.5">
                        <button
                          onClick={() => goTo('/profile')}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition text-left"
                        >
                          <User size={15} />
                          Profile
                        </button>

                        <button
                          onClick={() => goTo('/dashboard?tab=submissions')}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition text-left"
                        >
                          <FileText size={15} />
                          My Submissions
                        </button>

                        <button
                          onClick={() => goTo('/dashboard?tab=bookmarks')}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition text-left"
                        >
                          <Bookmark size={15} />
                          Bookmarks
                        </button>

                        <button
                          onClick={() => goTo('/settings')}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition text-left"
                        >
                          <Settings size={15} />
                          Settings
                        </button>

                        {user.role === 'admin' && (
                          <button
                            onClick={() => goTo('/dashboard')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition text-left"
                          >
                            <Shield size={15} />
                            Admin Panel
                          </button>
                        )}

                        <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 transition text-left"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-navy dark:bg-blue-600 text-white rounded-xl text-sm font-bold hover:opacity-90 transition shadow-md"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Open menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 space-y-1 animate-fade-in">
            {user && (
              <div className="flex items-center gap-3 px-4 py-3 mb-1 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-gray-700">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-navy to-accent flex items-center justify-center">
                      <span className="text-white text-sm font-black">{initials}</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                    {fullName || user.email || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
            )}

            {navLinks.map(link => (link.public || user) && (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive(link.to)
                    ? 'bg-navy text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}

            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive('/dashboard')
                      ? 'bg-navy text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>

                <button
                  onClick={() => goTo('/profile')}
                  className="w-full text-left flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <User size={16} />
                  Profile
                </button>

                <button
                  onClick={() => goTo('/dashboard?tab=submissions')}
                  className="w-full text-left flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <FileText size={16} />
                  My Submissions
                </button>

                <button
                  onClick={() => goTo('/dashboard?tab=bookmarks')}
                  className="w-full text-left flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <Bookmark size={16} />
                  Bookmarks
                </button>

                <Link
                  to="/settings"
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive('/settings')
                      ? 'bg-navy text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Settings size={16} />
                  Settings
                </Link>

                <Link
                  to="/notifications"
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive('/notifications')
                      ? 'bg-navy text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <BellIcon />
                  Notifications
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <Shield size={16} />
                    Admin Panel
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            )}

            {!user && (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-navy text-white"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={toggleTheme}
              className="w-full text-left flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 transition"
            >
              {theme === 'light' ? (
                <>
                  <Moon size={16} />
                  Dark Mode
                </>
              ) : (
                <>
                  <Sun size={16} />
                  Light Mode
                </>
              )}
            </button>
          </div>
        )}
      </nav>

      {(userMenuOpen || menuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setUserMenuOpen(false);
            setMenuOpen(false);
          }}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>

      <TourGuideButton />

      {/* Footer */}
      <footer className="relative mt-auto">
        <div className="overflow-hidden relative">
          <svg
            viewBox="0 0 1440 90"
            className="w-[200%] h-[70px] block wave-container -mb-[2px]"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#03142b" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#020617" stopOpacity="1" />
              </linearGradient>
            </defs>

            <path
              d="M0,60 C240,30 480,90 720,60 C960,30 1200,90 1440,60 L1440,90 L0,90 Z M1440,60 C1680,30 1920,90 2160,60 C2400,30 2640,90 2880,60 L2880,90 L1440,90 Z"
              fill="#020c1b"
              className="wave wave-back"
            />
            <path
              d="M0,65 C240,35 480,95 720,65 C960,35 1200,95 1440,65 L1440,90 L0,90 Z M1440,65 C1680,35 1920,95 2160,65 C2400,35 2640,95 2880,65 L2880,90 L1440,90 Z"
              fill="#03142b"
              className="wave wave-mid"
            />
            <path
              d="M0,70 C240,40 480,100 720,70 C960,40 1200,100 1440,70 L1440,90 L0,90 Z M1440,70 C1680,40 1920,100 2160,70 C2400,40 2640,100 2880,70 L2880,90 L1440,90 Z"
              fill="url(#waveGradient)"
              className="wave wave-front"
            />
          </svg>
        </div>

        <div className="bg-[#020617] text-white py-10 px-4 -mt-1">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <a
                    href="https://neust.edu.ph/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border-2 border-white/20 overflow-hidden bg-white hover:scale-110 transition flex-shrink-0"
                  >
                    {logos.school?.url ? (
                      <img src={logos.school.url} alt="NEUST" className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600">
                        N
                      </span>
                    )}
                  </a>

                  <a
                    href="https://www.facebook.com/NEUSTCON"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border-2 border-white/20 overflow-hidden bg-white hover:scale-110 transition flex-shrink-0"
                  >
                    {logos.college?.url ? (
                      <img src={logos.college.url} alt="CON" className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600">
                        C
                      </span>
                    )}
                  </a>

                  <Link
                    to="/"
                    className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center flex-shrink-0 hover:scale-110 transition"
                  >
                    {logos.conserve?.url ? (
                      <img src={logos.conserve.url} alt="ConServe" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen size={16} className="text-blue-300" />
                    )}
                  </Link>

                  <span className="font-black text-xl">
                    <span className="text-blue-400">CON</span>
                    <span className="text-white">serve</span>
                  </span>
                </div>

                <p className="text-sm text-blue-300/70 leading-relaxed">
                  NEUST College of Nursing
                  <br />
                  Research Repository
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">
                  Quick Links
                </h4>

                <div className="space-y-2">
                  {[
                    ['/', 'Home'],
                    ['/about', 'About Us'],
                    ['/help', 'Help Center'],
                    ['/terms', 'Terms & Conditions'],
                    ['/privacy', 'Privacy Policy'],
                  ].map(([to, label]) => (
                    <Link
                      key={to}
                      to={to}
                      className="block text-sm text-blue-300/70 hover:text-white transition font-medium"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">
                  Contact
                </h4>

                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 text-sm text-blue-300/70">
                    <MapPin size={15} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>
                      Nueva Ecija University of Science and Technology — College of Nursing
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-sm text-blue-300/70">
                    <Mail size={15} className="text-blue-400 flex-shrink-0" />
                    <a
                      href="mailto:conserve2025@gmail.com"
                      className="hover:text-white transition break-all"
                    >
                      conserve2025@gmail.com
                    </a>
                  </div>
                </div>

                <Link
                  to="/help"
                  className="inline-block mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-bold text-white transition"
                >
                  Get Help →
                </Link>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-blue-300/60">
              <p>© {new Date().getFullYear()} NEUST College of Nursing. All Rights Reserved.</p>
              <p>Secured under RA 10173 (Data Privacy Act)</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const BellIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.268 21a2 2 0 0 0 3.464 0" />
    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8a6 6 0 0 0-12 0c0 4.499-1.411 5.956-2.738 7.326" />
  </svg>
);

export default Layout;