import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, LayoutDashboard, Bell, Menu, X, Moon, Sun, LogOut, Settings, Shield, BookOpen, Info, HelpCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    if (user) fetchUnread();
    fetchLogo();
  }, [user, location.pathname]);

  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [location.pathname]);

  const fetchUnread = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications/unread-count`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setUnreadCount(d.unreadCount || 0); }
    } catch {}
  };

  const fetchLogo = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
      const d = await res.json();
      if (d.settings?.logos?.conserve?.url) setLogo(d.settings.logos.conserve.url);
    } catch {}
  };

  const isActive = (p) => location.pathname === p;

  const navLinks = [
    { to: '/',        label: 'Home',      icon: Home,             public: true },
    { to: '/explore', label: 'Explore',   icon: Search,           public: false },
    { to: '/about',   label: 'About',     icon: Info,             public: true },
    { to: '/help',    label: 'Help',      icon: HelpCircle,       public: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* ── Navbar ── */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            {logo
              ? <img src={logo} alt="ConServe" className="w-8 h-8 rounded-lg object-cover" />
              : <div className="w-8 h-8 bg-navy dark:bg-blue-600 rounded-lg flex items-center justify-center"><span className="text-white font-black text-sm">C</span></div>}
            <span className="font-black text-lg hidden sm:block">
              <span className="text-navy dark:text-accent">CON</span><span className="text-gray-900 dark:text-white">serve</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(link => (link.public || user) && (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${isActive(link.to) ? 'bg-navy text-white dark:bg-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}>
                <link.icon size={15} />{link.label}
              </Link>
            ))}
            {user && (
              <Link to="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${isActive('/dashboard') ? 'bg-navy text-white dark:bg-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}>
                <LayoutDashboard size={15} />Dashboard
              </Link>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Toggle theme">
              {theme === 'dark' ? <Sun size={17} className="text-gray-500 dark:text-gray-400" /> : <Moon size={17} className="text-gray-600" />}
            </button>

            {user ? (
              <>
                <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <Bell size={17} className="text-gray-600 dark:text-gray-400" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User dropdown */}
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition border border-gray-200 dark:border-gray-700">
                    <div className="w-7 h-7 bg-gradient-to-br from-navy to-accent dark:from-blue-600 dark:to-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-black">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-300 max-w-[100px] truncate">{user.firstName}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fade-in">
                      <div className="p-3 bg-gradient-to-r from-navy/5 to-accent/5 dark:from-navy/20 border-b border-gray-100 dark:border-gray-700">
                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role} Account</p>
                      </div>
                      <div className="p-1.5">
                        <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition">
                          <Settings size={14} />Settings
                        </Link>
                        {user.role === 'admin' && (
                          <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition">
                            <Shield size={14} />Admin Panel
                          </Link>
                        )}
                        <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                        <button onClick={() => { setUserMenuOpen(false); logout(); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400 transition">
                          <LogOut size={14} />Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-navy dark:bg-blue-600 text-white rounded-xl text-sm font-bold hover:opacity-90 transition shadow-md">
                Sign In
              </Link>
            )}

            {/* Mobile toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              {menuOpen ? <X size={20} className="text-gray-700 dark:text-gray-300" /> : <Menu size={20} className="text-gray-700 dark:text-gray-300" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 space-y-1 animate-fade-in">
            {navLinks.map(link => (link.public || user) && (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition ${isActive(link.to) ? 'bg-navy text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <link.icon size={16} />{link.label}
              </Link>
            ))}
            {user && (
              <Link to="/dashboard"
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition ${isActive('/dashboard') ? 'bg-navy text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <LayoutDashboard size={16} />Dashboard
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Overlay */}
      {(userMenuOpen || menuOpen) && <div className="fixed inset-0 z-40" onClick={() => { setUserMenuOpen(false); setMenuOpen(false); }} />}

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>

      {/* ── Wavy Footer ── */}
      <footer className="relative mt-auto">
        {/* Wave SVG */}
        <div className="overflow-hidden leading-none">
          <svg viewBox="0 0 1440 90" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none" style={{ height: '70px' }}>
            {/* Back wave - lighter */}
            <path d="M0,60 C240,10 480,80 720,45 C960,10 1200,75 1440,50 L1440,90 L0,90 Z"
              className="fill-navy/40 dark:fill-gray-800/60" />
            {/* Mid wave */}
            <path d="M0,70 C200,30 400,80 600,55 C800,30 1000,75 1200,55 C1320,45 1400,65 1440,60 L1440,90 L0,90 Z"
              className="fill-navy/70 dark:fill-gray-900/80" />
            {/* Front wave - solid */}
            <path d="M0,75 C180,55 360,85 540,70 C720,55 900,80 1080,68 C1260,56 1380,74 1440,72 L1440,90 L0,90 Z"
              className="fill-navy dark:fill-gray-950" />
          </svg>
        </div>

        {/* Footer body */}
        <div className="bg-navy dark:bg-gray-950 text-white py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Brand */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <BookOpen size={16} className="text-blue-300" />
              </div>
              <span className="font-black text-lg">
                <span className="text-blue-300">CON</span><span className="text-white">serve</span>
              </span>
            </div>

            <p className="text-sm text-blue-200 dark:text-gray-400 mb-4 leading-relaxed">
              NEUST College of Nursing Research Repository
            </p>

            {/* Links */}
            <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
              {[['/', 'Home'], ['/about', 'About'], ['/help', 'Help'], ['/terms', 'Terms'], ['/privacy', 'Privacy']].map(([to, label]) => (
                <Link key={to} to={to} className="text-xs text-blue-300 dark:text-gray-500 hover:text-white transition font-medium">
                  {label}
                </Link>
              ))}
            </div>

            <div className="w-24 h-px bg-white/20 mx-auto mb-4" />

            <p className="text-xs text-blue-300/70 dark:text-gray-600">
              Copyright &copy; {new Date().getFullYear()} University Library, NEUST College of Nursing. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;