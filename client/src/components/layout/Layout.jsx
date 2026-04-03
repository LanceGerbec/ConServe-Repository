import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, LayoutDashboard, Bell, Menu, X, Moon, Sun, LogOut, Settings, Shield, BookOpen, Info, HelpCircle, ChevronDown, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [logos, setLogos] = useState({ school: null, college: null, conserve: null });

  useEffect(() => {
    if (user) fetchUnread();
    fetchLogos();
  }, [user, location.pathname]);

  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [location.pathname]);

  const fetchUnread = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notifications/unread-count`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setUnreadCount(d.unreadCount || 0); }
    } catch {}
  };

  const fetchLogos = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`);
      const d = await res.json();
      if (d.settings?.logos) setLogos(d.settings.logos);
    } catch {}
  };

  const isActive = (p) => location.pathname === p;

  const navLinks = [
    { to: '/', label: 'Home', icon: Home, public: true },
    { to: '/explore', label: 'Explore', icon: Search, public: false },
    { to: '/about', label: 'About', icon: Info, public: true },
    { to: '/help', label: 'Help', icon: HelpCircle, public: true },
  ];

  // Avatar or initials
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  const AvatarBadge = ({ size = 7 }) => (
    <div className={`w-${size} h-${size} rounded-full overflow-hidden flex-shrink-0 border-2 border-white/30`}>
      {user?.avatar ? (
        <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-navy to-accent flex items-center justify-center">
          <span className="text-white text-xs font-black">{initials}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* ── Navbar ── */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Brand — all 3 logos with correct links */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* NEUST → neust.edu.ph */}
            <a href="https://neust.edu.ph/" target="_blank" rel="noopener noreferrer" title="NEUST"
              className="w-8 h-8 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
              {logos.school?.url
                ? <img src={logos.school.url} alt="NEUST" className="w-full h-full object-cover" />
                : <span className="text-xs font-bold text-gray-500">N</span>}
            </a>
            {/* CON → facebook */}
            <a href="https://www.facebook.com/NEUSTCON" target="_blank" rel="noopener noreferrer" title="College of Nursing"
              className="w-8 h-8 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
              {logos.college?.url
                ? <img src={logos.college.url} alt="CON" className="w-full h-full object-cover" />
                : <span className="text-xs font-bold text-gray-500">C</span>}
            </a>
            {/* CONserve → home */}
            <Link to="/" title="CONserve Home"
              className="flex items-center gap-1.5 group">
              <div className="w-8 h-8 rounded-lg border border-navy shadow-sm hover:scale-110 transition overflow-hidden bg-navy flex items-center justify-center flex-shrink-0">
                {logos.conserve?.url
                  ? <img src={logos.conserve.url} alt="ConServe" className="w-full h-full object-cover" />
                  : <span className="text-white font-bold text-sm">C</span>}
              </div>
              <span className="font-black text-lg hidden sm:block">
                <span className="text-navy dark:text-accent">CON</span><span className="text-gray-900 dark:text-white">serve</span>
              </span>
            </Link>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(link => (link.public || user) && (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${isActive(link.to) ? 'bg-navy text-white dark:bg-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <link.icon size={15} />{link.label}
              </Link>
            ))}
            {user && (
              <Link to="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${isActive('/dashboard') ? 'bg-navy text-white dark:bg-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <LayoutDashboard size={15} />Dashboard
              </Link>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              {theme === 'dark' ? <Sun size={17} className="text-gray-400" /> : <Moon size={17} className="text-gray-600" />}
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

                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition border border-gray-200 dark:border-gray-700">
                    {/* Avatar in navbar */}
                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-navy to-accent flex items-center justify-center">
                          <span className="text-white text-xs font-black">{initials}</span>
                        </div>
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-300 max-w-[80px] truncate">{user.firstName}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fade-in">
                      <div className="p-3 bg-gradient-to-r from-navy/5 to-accent/5 dark:from-navy/20 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                        {/* Avatar in dropdown */}
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-gray-600">
                          {user?.avatar ? (
                            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-navy to-accent flex items-center justify-center">
                              <span className="text-white text-sm font-black">{initials}</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role} Account</p>
                        </div>
                      </div>
                      <div className="p-1.5">
                        {/* Settings → /settings page */}
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition">
                          <Settings size={14} />Settings
                        </button>
                        {/* Admin panel only for admins */}
                        {user.role === 'admin' && (
                          <button
                            onClick={() => { setUserMenuOpen(false); navigate('/dashboard'); }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition">
                            <Shield size={14} />Admin Panel
                          </button>
                        )}
                        <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                        <button onClick={() => { setUserMenuOpen(false); logout(); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 transition">
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

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 space-y-1 animate-fade-in">
            {/* Mobile user info */}
            {user && (
              <div className="flex items-center gap-3 px-4 py-3 mb-1 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-200">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-navy to-accent flex items-center justify-center">
                      <span className="text-white text-sm font-black">{initials}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
            )}
            {navLinks.map(link => (link.public || user) && (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition ${isActive(link.to) ? 'bg-navy text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <link.icon size={16} />{link.label}
              </Link>
            ))}
            {user && (
              <>
                <Link to="/dashboard"
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition ${isActive('/dashboard') ? 'bg-navy text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  <LayoutDashboard size={16} />Dashboard
                </Link>
                <Link to="/settings"
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition ${isActive('/settings') ? 'bg-navy text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  <Settings size={16} />Settings
                </Link>
                <button onClick={() => { setMenuOpen(false); logout(); }}
                  className="w-full text-left flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                  <LogOut size={16} />Sign Out
                </button>
              </>
            )}
            {!user && (
              <Link to="/login" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-navy text-white">
                Sign In
              </Link>
            )}
            <button onClick={toggleTheme} className="w-full text-left flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 transition">
              {theme === 'light' ? <><Moon size={16} /> Dark Mode</> : <><Sun size={16} /> Light Mode</>}
            </button>
          </div>
        )}
      </nav>

      {(userMenuOpen || menuOpen) && <div className="fixed inset-0 z-40" onClick={() => { setUserMenuOpen(false); setMenuOpen(false); }} />}

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="relative mt-auto">
      <div className="overflow-hidden relative">
  <svg
    viewBox="0 0 2880 90" // 🔥 doubled width
    xmlns="http://www.w3.org/2000/svg"
    className="w-[200%] block"
    preserveAspectRatio="none"
    style={{ height: '70px' }}
  >
    <defs>
      <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0a192f" stopOpacity="0.6" />
        <stop offset="50%" stopColor="#112240" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#0f172a" stopOpacity="0.6" />
      </linearGradient>

      <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#081424" stopOpacity="0.7" />
        <stop offset="50%" stopColor="#0b1e3a" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#050f1f" stopOpacity="0.7" />
      </linearGradient>

      <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#050f1f" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
    </defs>

    {/* 🔥 DUPLICATED WAVES FOR LOOPING */}
    
    {/* Back */}
    <g className="wave-loop-slow">
      <path d="M0,60 C240,10 480,80 720,45 C960,10 1200,75 1440,50 L1440,90 L0,90 Z" fill="url(#waveGradient1)" />
      <path d="M1440,60 C1680,10 1920,80 2160,45 C2400,10 2640,75 2880,50 L2880,90 L1440,90 Z" fill="url(#waveGradient1)" />
    </g>

    {/* Mid */}
    <g className="wave-loop-medium">
      <path d="M0,70 C200,30 400,80 600,55 C800,30 1000,75 1200,55 C1320,45 1400,65 1440,60 L1440,90 L0,90 Z" fill="url(#waveGradient2)" />
      <path d="M1440,70 C1640,30 1840,80 2040,55 C2240,30 2440,75 2640,55 C2760,45 2840,65 2880,60 L2880,90 L1440,90 Z" fill="url(#waveGradient2)" />
    </g>

    {/* Front */}
    <g className="wave-loop-fast">
      <path d="M0,75 C180,55 360,85 540,70 C720,55 900,80 1080,68 C1260,56 1380,74 1440,72 L1440,90 L0,90 Z" fill="url(#waveGradient3)" />
      <path d="M1440,75 C1620,55 1800,85 1980,70 C2160,55 2340,80 2520,68 C2700,56 2820,74 2880,72 L2880,90 L1440,90 Z" fill="url(#waveGradient3)" />
    </g>
  </svg>
</div>


        <div className="bg-gradient-to-b from-[#050f1f] via-[#030712] to-black text-white py-10 px-4 backdrop-blur-xl">


          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <a href="https://neust.edu.ph/" target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border-2 border-white/20 overflow-hidden bg-white hover:scale-110 transition flex-shrink-0" title="NEUST">
                    {logos.school?.url
                      ? <img src={logos.school.url} alt="NEUST" className="w-full h-full object-cover" />
                      : <span className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600">N</span>}
                  </a>
                  <a href="https://www.facebook.com/NEUSTCON" target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border-2 border-white/20 overflow-hidden bg-white hover:scale-110 transition flex-shrink-0" title="College of Nursing">
                    {logos.college?.url
                      ? <img src={logos.college.url} alt="CON" className="w-full h-full object-cover" />
                      : <span className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600">C</span>}
                  </a>
                  <Link to="/"
                    className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center flex-shrink-0 hover:scale-110 transition">
                    {logos.conserve?.url
                      ? <img src={logos.conserve.url} alt="ConServe" className="w-full h-full object-cover" />
                      : <BookOpen size={16} className="text-blue-300" />}
                  </Link>
                  <span className="font-black text-xl">
                    <span className="text-blue-300">CON</span><span className="text-white">serve</span>
                  </span>
                </div>
                <p className="text-sm text-blue-200/70 leading-relaxed">NEUST College of Nursing<br />Research Repository</p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Quick Links</h4>
                <div className="space-y-2">
                  {[['/', 'Home'], ['/about', 'About Us'], ['/help', 'Help Center'], ['/terms', 'Terms & Conditions'], ['/privacy', 'Privacy Policy']].map(([to, label]) => (
                    <Link key={to} to={to} className="block text-sm text-blue-200/70 hover:text-white transition font-medium">{label}</Link>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Contact</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 text-sm text-blue-200/70">
                    <MapPin size={15} className="text-blue-300 mt-0.5 flex-shrink-0" />
                    <span>Nueva Ecija University of Science and Technology — College of Nursing</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-blue-200/70">
                    <Mail size={15} className="text-blue-300 flex-shrink-0" />
                    <a href="mailto:conserve2025@gmail.com" className="hover:text-white transition break-all">conserve2025@gmail.com</a>
                  </div>
                </div>
                <Link to="/help" className="inline-block mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-bold text-white transition">
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

export default Layout;