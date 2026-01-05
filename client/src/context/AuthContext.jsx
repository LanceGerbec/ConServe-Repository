// client/src/context/AuthContext.jsx - AUTO-LOGOUT AFTER 20 MIN INACTIVITY
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState({ show: false, message: '', type: 'info' });
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-logout refs
  const inactivityTimerRef = useRef(null);
  const warningShownRef = useRef({ fiveMin: false, twoMin: false, oneMin: false });
  const lastActivityRef = useRef(Date.now());

  const INACTIVITY_LIMIT = 20 * 60 * 1000; // 20 minutes
  const WARNING_5MIN = 15 * 60 * 1000; // 15 min (5 min warning)
  const WARNING_2MIN = 18 * 60 * 1000; // 18 min (2 min warning)
  const WARNING_1MIN = 19 * 60 * 1000; // 19 min (1 min warning)

  // Toast helper
  const toast = useCallback((message, type = 'info') => {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: '', type: 'info' }), 3000);
  }, []);

  // Auto-logout function
  const autoLogout = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      toast('🔒 Logged out due to inactivity', 'error');
      setTimeout(() => {
        navigate('/login', { state: { message: '🔒 Session expired due to inactivity' } });
      }, 500);
    }
  }, [navigate, toast]);

  // Check inactivity
  const checkInactivity = useCallback(() => {
    if (!user) return;

    const now = Date.now();
    const elapsed = now - lastActivityRef.current;

    // Auto-logout at 20 min
    if (elapsed >= INACTIVITY_LIMIT) {
      autoLogout();
      return;
    }

    // Warnings
    if (elapsed >= WARNING_1MIN && !warningShownRef.current.oneMin) {
      toast('⚠️ You will be logged out in 1 minute!', 'error');
      warningShownRef.current.oneMin = true;
    } else if (elapsed >= WARNING_2MIN && !warningShownRef.current.twoMin) {
      toast('⏰ You will be logged out in 2 minutes due to inactivity', 'warning');
      warningShownRef.current.twoMin = true;
    } else if (elapsed >= WARNING_5MIN && !warningShownRef.current.fiveMin) {
      toast('⏰ You will be logged out in 5 minutes due to inactivity', 'warning');
      warningShownRef.current.fiveMin = true;
    }
  }, [user, autoLogout, toast, INACTIVITY_LIMIT, WARNING_5MIN, WARNING_2MIN, WARNING_1MIN]);

  // Reset activity timer
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = { fiveMin: false, twoMin: false, oneMin: false };
  }, []);

  // Debounced activity handler
  const handleActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current > 1000) {
      resetInactivityTimer();
    }
  }, [resetInactivityTimer]);

  // Initialize user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Setup inactivity detection
  useEffect(() => {
    if (!user) return;

    // Activity events
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));

    // Check inactivity every 10 seconds
    inactivityTimerRef.current = setInterval(checkInactivity, 10000);

    // Reset timer on route change
    resetInactivityTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    };
  }, [user, handleActivity, checkInactivity, resetInactivityTimer, location.pathname]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        resetInactivityTimer();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Connection error' };
    }
  };

  const register = async (formData) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Connection error' };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear timers
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login', { state: { message: '✓ Logged out successfully' } });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
      
      {/* Toast Notification */}
      {showToast.show && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className={`px-6 py-3 rounded-lg shadow-2xl border-2 ${
            showToast.type === 'error' ? 'bg-red-500 border-red-700' :
            showToast.type === 'warning' ? 'bg-yellow-500 border-yellow-700' :
            'bg-blue-500 border-blue-700'
          } text-white font-semibold`}>
            {showToast.message}
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;