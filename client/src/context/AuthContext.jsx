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

  const INACTIVITY_LIMIT = 20 * 60 * 1000;
  const WARNING_5MIN = 15 * 60 * 1000;
  const WARNING_2MIN = 18 * 60 * 1000;
  const WARNING_1MIN = 19 * 60 * 1000;

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Toast helper
  const toast = useCallback((message, type = 'info') => {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: '', type: 'info' }), 3000);
  }, []);

  // ✅ NEW: updateUser helper (instant UI update)
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Auto-logout
  const autoLogout = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      toast('Session expired due to inactivity', 'error');
      setTimeout(() => {
        navigate('/login', { state: { message: 'Session expired due to inactivity' } });
      }, 500);
    }
  }, [navigate, toast]);

  // Check inactivity
  const checkInactivity = useCallback(() => {
    if (!user) return;

    const now = Date.now();
    const elapsed = now - lastActivityRef.current;

    if (elapsed >= INACTIVITY_LIMIT) {
      autoLogout();
      return;
    }

    if (elapsed >= WARNING_1MIN && !warningShownRef.current.oneMin) {
      toast('You will be logged out in 1 minute!', 'error');
      warningShownRef.current.oneMin = true;
    } else if (elapsed >= WARNING_2MIN && !warningShownRef.current.twoMin) {
      toast('You will be logged out in 2 minutes due to inactivity', 'warning');
      warningShownRef.current.twoMin = true;
    } else if (elapsed >= WARNING_5MIN && !warningShownRef.current.fiveMin) {
      toast('You will be logged out in 5 minutes due to inactivity', 'warning');
      warningShownRef.current.fiveMin = true;
    }
  }, [user, autoLogout, toast]);

  // Reset timer
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = { fiveMin: false, twoMin: false, oneMin: false };
  }, []);

  // Activity handler
  const handleActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current > 1000) {
      resetInactivityTimer();
    }
  }, [resetInactivityTimer]);

  // Fetch current user
  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (Date.now() >= payload.exp * 1000) {
        localStorage.clear();
        setUser(null);
        setLoading(false);
        return;
      }
    } catch {
      localStorage.clear();
      setUser(null);
      setLoading(false);
      return;
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setLoading(false);
        return;
      } catch {}
    }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        localStorage.clear();
        setUser(null);
      }
    } catch {
      localStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Inactivity setup
  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));

    inactivityTimerRef.current = setInterval(checkInactivity, 10000);
    resetInactivityTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      clearInterval(inactivityTimerRef.current);
    };
  }, [user, handleActivity, checkInactivity, resetInactivityTimer, location.pathname]);

  // Login
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
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
      }

      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Connection error' };
    }
  };

  // Logout
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch {}

    clearInterval(inactivityTimerRef.current);
    localStorage.clear();
    setUser(null);
    navigate('/login', { state: { message: 'Logged out successfully' } });
  };

  // Global 401 handler
  useEffect(() => {
    const handle401 = () => {
      localStorage.clear();
      setUser(null);
      toast('Session expired. Please login again.', 'error');
      setTimeout(() => navigate('/login'), 1000);
    };

    window.addEventListener('auth:unauthorized', handle401);
    return () => window.removeEventListener('auth:unauthorized', handle401);
  }, [navigate, toast]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        refetch: fetchCurrentUser,
        updateUser, // ✅ exposed here
      }}
    >
      {children}

      {showToast.show && (
        <div className="fixed top-20 right-4 z-[200]">
          <div className="px-6 py-3 rounded-lg shadow-2xl bg-black text-white">
            {showToast.message}
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;