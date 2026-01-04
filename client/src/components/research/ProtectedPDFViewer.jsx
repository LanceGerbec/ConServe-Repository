// client/src/components/research/ProtectedPDFViewer.jsx
import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../common/Toast';

let pdfjsLib = null;
let workerInitialized = false;

const initPdfJs = async () => {
  if (workerInitialized) return pdfjsLib;
  try {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    workerInitialized = true;
    return pdfjsLib;
  } catch (err) {
    throw new Error('PDF viewer initialization failed');
  }
};

const ProtectedPDFViewer = ({ pdfUrl, paperTitle, onClose }) => {
  const { user } = useAuth();
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [violations, setViolations] = useState(0);
  const [userIP, setUserIP] = useState('Unknown');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60);
  const [toast, setToast] = useState({ show: false, message: '', type: 'warning' });
  const [rendered, setRendered] = useState(false);
  
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const containerRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const screenshotAttempts = useRef(0);
  const lastHideTime = useRef(0);
  const visibilityCount = useRef(0);
  const lastTap = useRef(0);
  const renderLockRef = useRef(false);
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const SESSION_DURATION = 30 * 60 * 1000;
  const MAX_VIOLATIONS = 5;
  const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const BASE_SCALE = isMobile ? 1.5 : 1.3; // Fixed render scale

  const showToast = (msg, type = 'warning') => setToast({ show: true, message: msg, type });

  const blockContent = (reason) => {
    setIsBlocked(true);
    setBlockReason(reason);
    logViolation(reason);
    showToast(`🚫 ${reason}`, 'error');
    screenshotAttempts.current++;
    
    if (isMobile) {
      document.body.style.opacity = '0';
      setTimeout(() => {
        document.body.style.opacity = '1';
        if (violations < MAX_VIOLATIONS) setIsBlocked(false);
      }, 3000);
    }
    
    if (violations >= MAX_VIOLATIONS - 1 || screenshotAttempts.current >= 3) {
      setTimeout(() => {
        showToast('⚠️ Too many violations - Closing', 'error');
        setTimeout(onClose, 2000);
      }, 3000);
    }
  };

  // Double-tap zoom
  useEffect(() => {
    if (!isMobile || !wrapperRef.current) return;

    const handleDoubleTap = (e) => {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        e.preventDefault();
        const currentIndex = ZOOM_LEVELS.indexOf(scale);
        const targetScale = currentIndex <= 2 ? ZOOM_LEVELS[5] : ZOOM_LEVELS[2];
        setScale(targetScale);
        showToast(`🔍 ${Math.round(targetScale * 100)}%`, 'success');
        if (navigator.vibrate) navigator.vibrate(30);
      }
      lastTap.current = now;
    };

    const wrapper = wrapperRef.current;
    wrapper.addEventListener('touchend', handleDoubleTap);
    return () => wrapper?.removeEventListener('touchend', handleDoubleTap);
  }, [scale, isMobile]);

  const zoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(scale);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      const newScale = ZOOM_LEVELS[currentIndex + 1];
      setScale(newScale);
      showToast(`🔍 ${Math.round(newScale * 100)}%`, 'success');
      if (navigator.vibrate) navigator.vibrate(20);
    } else {
      showToast('🔍 Max zoom reached', 'warning');
    }
  };

  const zoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(scale);
    if (currentIndex > 0) {
      const newScale = ZOOM_LEVELS[currentIndex - 1];
      setScale(newScale);
      showToast(`🔍 ${Math.round(newScale * 100)}%`, 'success');
      if (navigator.vibrate) navigator.vibrate(20);
    } else {
      showToast('🔍 Min zoom reached', 'warning');
    }
  };

  const resetZoom = () => {
    setScale(1);
    showToast('🔄 Reset', 'success');
  };

  const fitToWidth = () => {
    if (!pdf || !containerRef.current || !canvasRef.current) return;
    const containerWidth = containerRef.current.clientWidth - 48;
    const canvasWidth = canvasRef.current.offsetWidth;
    const newScale = containerWidth / canvasWidth;
    setScale(Math.min(Math.max(newScale, ZOOM_LEVELS[0]), ZOOM_LEVELS[ZOOM_LEVELS.length - 1]));
    showToast(`🔄 Fit to Width`, 'success');
  };

  // Mobile screenshot detection
  useEffect(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    const hideContent = () => {
      if (wrapperRef.current) {
        wrapperRef.current.style.opacity = '0';
        wrapperRef.current.style.filter = 'blur(50px)';
        setTimeout(() => {
          if (wrapperRef.current) {
            wrapperRef.current.style.opacity = '1';
            wrapperRef.current.style.filter = 'none';
          }
        }, 2000);
      }
    };

    if (isAndroid) {
      const detectVisibility = () => {
        const now = Date.now();
        visibilityCount.current++;
        if (document.hidden) {
          hideContent();
          blockContent('📱 Screenshot Blocked');
          lastHideTime.current = now;
          if (now - lastHideTime.current < 1000) screenshotAttempts.current += 2;
        }
      };

      const detectBlur = () => {
        hideContent();
        blockContent('📱 Screenshot Blocked');
      };

      const detectTouch = (e) => {
        if (e.touches?.length > 2) {
          e.preventDefault();
          e.stopPropagation();
          hideContent();
          blockContent('📱 3+ Fingers Blocked');
          return false;
        }
      };

      let powerPressed = false, volumePressed = false, volumeTime = 0;
      const detectKeys = (e) => {
        const key = e.keyCode || e.key;
        const now = Date.now();
        
        if ([26, 'Power', 116, 223].includes(key)) powerPressed = true;
        if ([25, 'VolumeDown', 114, 175, 'AudioVolumeDown'].includes(key)) {
          volumePressed = true;
          volumeTime = now;
        }
        
        if (powerPressed && volumePressed && now - volumeTime < 500) {
          e.preventDefault();
          e.stopPropagation();
          hideContent();
          blockContent('📱 Hardware Screenshot BLOCKED');
          screenshotAttempts.current += 2;
          document.body.style.opacity = '0';
          setTimeout(() => {
            document.body.style.opacity = '1';
            powerPressed = volumePressed = false;
          }, 3000);
          return false;
        }
        
        setTimeout(() => { powerPressed = volumePressed = false; }, 600);
      };

      document.addEventListener('visibilitychange', detectVisibility);
      window.addEventListener('blur', detectBlur);
      window.addEventListener('pagehide', detectBlur);
      document.addEventListener('keydown', detectKeys, { passive: false });
      document.addEventListener('keyup', detectKeys, { passive: false });
      document.addEventListener('touchstart', detectTouch, { passive: false });

      return () => {
        document.removeEventListener('visibilitychange', detectVisibility);
        window.removeEventListener('blur', detectBlur);
        window.removeEventListener('pagehide', detectBlur);
        document.removeEventListener('keydown', detectKeys);
        document.removeEventListener('keyup', detectKeys);
        document.removeEventListener('touchstart', detectTouch);
      };
    }

    const preventAll = (e) => { 
      e.preventDefault();
      e.stopPropagation();
      hideContent();
      blockContent('📱 Action Blocked');
      return false;
    };

    ['contextmenu', 'selectstart', 'select', 'dragstart', 'copy'].forEach(ev => 
      document.addEventListener(ev, preventAll, { passive: false })
    );

    return () => {
      ['contextmenu', 'selectstart', 'select', 'dragstart', 'copy'].forEach(ev => 
        document.removeEventListener(ev, preventAll)
      );
    };
  }, [violations, isMobile]);

  useEffect(() => { 
    fetch('https://api.ipify.org?format=json')
      .then(r=>r.json())
      .then(d=>setUserIP(d.ip))
      .catch(()=>setUserIP('Protected')); 
  }, []);

  useEffect(() => { 
    sessionTimerRef.current = setTimeout(() => { 
      setSessionExpired(true); 
      setTimeout(onClose, 3000); 
    }, SESSION_DURATION);
    return () => clearTimeout(sessionTimerRef.current); 
  }, []);

  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = Math.max(0, prev - 1);
        if (newTime === 300) showToast('⏰ 5 minutes remaining', 'warning');
        if (newTime === 120) showToast('⏰ 2 minutes remaining', 'warning');
        if (newTime === 60) showToast('⏰ 1 minute remaining', 'error');
        return newTime;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, []);

  useEffect(() => {
    const detect = (e) => { 
      if (['PrintScreen', 44].includes(e.key || e.keyCode)) { 
        screenshotAttempts.current++; 
        blockContent('💻 Screenshot Blocked'); 
        setTimeout(() => { if (screenshotAttempts.current < 3) setIsBlocked(false); }, 3000); 
      } 
    };
    const prevent = (e) => { 
      if (['PrintScreen'].includes(e.key)) { 
        e.preventDefault(); 
        navigator.clipboard.writeText(''); 
        blockContent('💻 Blocked'); 
      } 
    };
    document.addEventListener('keyup', detect);
    document.addEventListener('keydown', prevent);
    return () => { 
      document.removeEventListener('keyup', detect); 
      document.removeEventListener('keydown', prevent); 
    };
  }, [violations]);

  useEffect(() => {
    const handleVis = () => { 
      if (document.hidden) { 
        blockContent('⚠️ Tab Changed'); 
        setTimeout(() => { if (!document.hidden && violations < MAX_VIOLATIONS) setIsBlocked(false); }, 2000); 
      } 
    };
    const handleBlur = () => { 
      blockContent('⚠️ Focus Lost'); 
      setTimeout(() => { if (violations < MAX_VIOLATIONS) setIsBlocked(false); }, 1500); 
    };
    document.addEventListener('visibilitychange', handleVis);
    window.addEventListener('blur', handleBlur);
    return () => { 
      document.removeEventListener('visibilitychange', handleVis); 
      window.removeEventListener('blur', handleBlur); 
    };
  }, [violations]);

  useEffect(() => {
    const detectDev = () => { 
      if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) { 
        blockContent('🛠️ DevTools Detected'); 
        setTimeout(onClose, 3000); 
      } 
    };
    const interval = setInterval(detectDev, 2000);
    return () => clearInterval(interval);
  }, []);

  const logViolation = async (type) => {
    setViolations(prev => { 
      const n = prev + 1; 
      if (n >= MAX_VIOLATIONS) setTimeout(onClose, 2000); 
      return n; 
    });
    try {
      const token = localStorage.getItem('token');
      const researchId = pdfUrl?.split('/').pop();
      if (researchId) await fetch(`${API_BASE}/research/log-violation`, { 
        method: 'POST', 
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        }, 
        body: JSON.stringify({ researchId, violationType: type }) 
      });
    } catch (err) { 
      console.error('Log error:', err); 
    }
  };

  useEffect(() => {
    const loadPDF = async () => {
      try {
        const pdfjs = await initPdfJs();
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Auth required');
        
        const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : `${API_BASE}${pdfUrl}`;
        const res = await fetch(fullUrl, { 
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Accept': 'application/pdf' 
          } 
        });
        
        if (!res.ok) {
          if (res.status === 401) throw new Error('Session expired');
          if (res.status === 404) throw new Error('PDF not found');
          throw new Error(`Error ${res.status}`);
        }
        
        const blob = await res.blob();
        if (blob.size === 0) throw new Error('Empty file');
        
        const arr = await blob.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: arr, verbosity: 0 }).promise;
        setPdf(doc);
        setTotalPages(doc.numPages);
        setLoading(false);
      } catch (err) { 
        setError(err.message || 'Load failed'); 
        setLoading(false); 
      }
    };
    if (pdfUrl) loadPDF();
  }, [pdfUrl, API_BASE]);

  // 🔥 FIXED: Render PDF ONCE at native resolution, zoom via CSS
  useEffect(() => {
    if (!pdf || !canvasRef.current || renderLockRef.current) return;
    
    setRendered(false);
    renderLockRef.current = true;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false });
        
        const dpr = window.devicePixelRatio || 1;
        
        // 🎯 KEY FIX: Always render at BASE_SCALE (fixed quality)
        const vp = page.getViewport({ scale: BASE_SCALE });
        
        canvas.width = vp.width * dpr;
        canvas.height = vp.height * dpr;
        canvas.style.width = vp.width + 'px';
        canvas.style.height = vp.height + 'px';
        
        ctx.scale(dpr, dpr);
        
        await page.render({ 
          canvasContext: ctx, 
          viewport: vp,
          intent: 'display'
        }).promise;
        
        // Draw watermarks at FIXED sizes
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const sid = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        const displayWidth = vp.width;
        const displayHeight = vp.height;
        
        // Fixed badge sizes
        const badgeW = isMobile ? 180 : 280;
        const badgeH = isMobile ? 65 : 100;
        const badgeFont1 = isMobile ? 10 : 14;
        const badgeFont2 = isMobile ? 8 : 12;
        
        // Top-left badge
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, 0, badgeW, badgeH);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${badgeFont1}px Inter, monospace`;
        ctx.fillText(`🔒 PROTECTED`, 8, 22);
        ctx.font = `${badgeFont2}px Inter, monospace`;
        ctx.fillText(`ID: ${user?.studentId || 'N/A'}`, 8, 40);
        ctx.fillText(`${time}`, 8, 55);
        ctx.restore();

        // Top-right badge
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(displayWidth - badgeW, 0, badgeW, badgeH);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.font = `bold ${badgeFont1}px Inter, monospace`;
        ctx.fillText(`Page ${currentPage}/${totalPages}`, displayWidth - 8, 22);
        ctx.font = `${badgeFont2}px Inter, monospace`;
        ctx.fillText(`IP: ${userIP}`, displayWidth - 8, 40);
        ctx.fillText(`${date}`, displayWidth - 8, 55);
        ctx.restore();

        // Bottom-left badge
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, displayHeight - badgeH, badgeW, badgeH);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.font = `bold ${badgeFont2}px Inter, monospace`;
        ctx.fillText(`ConServe Repository`, 8, displayHeight - 48);
        ctx.font = `${badgeFont2 * 0.9}px Inter, monospace`;
        ctx.fillText(`NEUST College of Nursing`, 8, displayHeight - 32);
        ctx.fillText(`© ${now.getFullYear()} - All Rights`, 8, displayHeight - 16);
        ctx.restore();

        // Bottom-right badge
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(displayWidth - badgeW, displayHeight - badgeH, badgeW, badgeH);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.font = `bold ${badgeFont2}px Inter, monospace`;
        ctx.fillText(`${user?.firstName || ''} ${user?.lastName || ''}`, displayWidth - 8, displayHeight - 48);
        ctx.font = `${badgeFont2 * 0.9}px Inter, monospace`;
        ctx.fillText(`${user?.email || 'Confidential'}`, displayWidth - 8, displayHeight - 32);
        ctx.fillText(`Unauthorized copy prohibited`, displayWidth - 8, displayHeight - 16);
        ctx.restore();
        
        // Center watermark (scales with canvas)
         const centerFont1 = Math.max(28, Math.min(displayWidth, displayHeight) * 0.08);  // Was 0.04, now 0.08 (2x larger)
        const centerFont2 = Math.max(24, Math.min(displayWidth, displayHeight) * 0.07);  // Was 0.035, now 0.07 (2x larger)
        const centerFont3 = Math.max(20, Math.min(displayWidth, displayHeight) * 0.06);  // Was 0.03, now 0.06 (2x larger)
        const centerFont4 = Math.max(18, Math.min(displayWidth, displayHeight) * 0.05);  // Was 0.025, now 0.05 (2x larger)
        const centerFont5 = Math.max(16, Math.min(displayWidth, displayHeight) * 0.045); // Was 0.022, now 0.045 (2x larger)
        const centerFont6 = Math.max(14, Math.min(displayWidth, displayHeight) * 0.04);  // Was 0.02, now 0.04 (2x larger)
        
        ctx.save();
        ctx.translate(displayWidth / 2, displayHeight / 2);
        ctx.rotate(-35 * Math.PI / 180);
        
        ctx.globalAlpha = 0.28; // More visible
        ctx.font = `bold ${centerFont1}px Inter, sans-serif`;
        ctx.fillStyle = '#1e3a8a';
        ctx.textAlign = 'center';
        ctx.fillText(`🔒 ${user?.firstName || 'PROTECTED'}`, 0, -120); // Increased spacing
        
        ctx.font = `bold ${centerFont2}px Inter, monospace`;
        ctx.globalAlpha = 0.26;
        ctx.fillText(`ID: ${user?.studentId || 'N/A'}`, 0, -40);
        
        ctx.font = `bold ${centerFont3}px Inter, sans-serif`;
        ctx.globalAlpha = 0.24;
        ctx.fillText(`${user?.email || 'CONFIDENTIAL'}`, 0, 50);
        
        ctx.font = `${centerFont4}px Inter, sans-serif`;
        ctx.globalAlpha = 0.22;
        ctx.fillText(`${date} • ${time}`, 0, 120);
        
        ctx.font = `bold ${centerFont5}px Inter, monospace`;
        ctx.globalAlpha = 0.20;
        ctx.fillText(`Session: ${sid}`, 0, 180);
        
        ctx.font = `${centerFont6}px Inter, sans-serif`;
        ctx.globalAlpha = 0.18;
        ctx.fillText(`Page ${currentPage}/${totalPages}`, 0, 230);
        
        ctx.restore();
        
        setRendered(true);
        renderLockRef.current = false;
      } catch (err) {
        console.error('Render error:', err);
        setError(`Render failed: ${err.message}`);
        renderLockRef.current = false;
      }
    };
    
    renderPage();
  }, [pdf, currentPage, user, userIP, totalPages, isMobile]);

  useEffect(() => {
    const prevent = (e) => { 
      e.preventDefault(); 
      e.stopPropagation(); 
      logViolation('interaction'); 
      showToast('🚫 Blocked', 'warning'); 
      return false; 
    };
    const preventKeys = (e) => {
      const blocked = [
        e.ctrlKey && ['s','p','c','a','u','f'].includes(e.key.toLowerCase()), 
        e.metaKey && ['s','p','c','a','u','f'].includes(e.key.toLowerCase()),
        e.key === 'PrintScreen',
        e.key === 'F12',
        e.ctrlKey && e.shiftKey
      ];
      if (blocked.some(Boolean)) {
        e.preventDefault();
        blockContent('⌨️ Shortcut Blocked');
        setTimeout(() => setIsBlocked(false), 1500);
        return false;
      }
    };
    ['contextmenu','keydown','copy','cut','paste','selectstart','dragstart'].forEach(ev =>
      document.addEventListener(ev, ev==='keydown'?preventKeys:prevent, { passive: false })
    );
    return () => ['contextmenu','keydown','copy','cut','paste','selectstart','dragstart'].forEach(ev =>
      document.removeEventListener(ev, ev==='keydown'?preventKeys:prevent)
    );
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const handleKey = (e) => {
      if (e.key === '[') zoomOut();
      if (e.key === ']') zoomIn();
      if (e.key === '0') resetZoom();
      if (e.key === 'f' || e.key === 'F') fitToWidth();
    };

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const currentIndex = ZOOM_LEVELS.findIndex(z => Math.abs(z - scale) < 0.01);
        if (delta > 0 && currentIndex < ZOOM_LEVELS.length - 1) {
          setScale(ZOOM_LEVELS[currentIndex + 1]);
        } else if (delta < 0 && currentIndex > 0) {
          setScale(ZOOM_LEVELS[currentIndex - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isMobile, scale]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeRemaining > 600) return 'bg-green-500/30 border-green-400/50';
    if (timeRemaining > 300) return 'bg-yellow-500/30 border-yellow-400/50';
    return 'bg-red-500/30 border-red-400/50 animate-pulse';
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mb-4 mx-auto"></div>
          <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" size={32}/>
        </div>
        <p className="text-white text-xl font-bold">Loading Protected Document</p>
        <p className="text-blue-400 text-sm mt-2">🔒 Initializing Security...</p>
      </div>
    </div>
  );

  if (error || sessionExpired) return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md bg-gray-900 rounded-2xl p-8 border-2 border-red-500">
        <AlertCircle className="mx-auto text-red-500 mb-4 animate-pulse" size={64}/>
        <h3 className="text-white text-2xl font-bold mb-3">
          {sessionExpired?'Session Expired':'Failed to Load'}
        </h3>
        <p className="text-gray-300 mb-6 text-sm">
          {sessionExpired?'Sessions expire after 30min':error}
        </p>
        <button onClick={onClose} className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold">
          ✕ Close
        </button>
      </div>
    </div>
  );

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={()=>setToast({...toast,show:false})} duration={2000}/>}
      
      <div className="fixed top-20 right-4 z-[60] bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold border-2 border-blue-400 shadow-lg animate-fade-in">
        🔍 {Math.round(scale * 100)}%
      </div>

      <div className="fixed inset-0 bg-black z-50 flex flex-col select-none">
        {isBlocked && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-[60]">
            <div className="text-center max-w-lg p-8">
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                  <Shield size={64} className="text-white"/>
                </div>
                <div className="absolute inset-0 w-32 h-32 mx-auto border-4 border-red-500 rounded-full animate-ping"></div>
              </div>
              <h2 className="text-white text-3xl font-bold mb-4">CONTENT BLOCKED</h2>
              <p className="text-red-400 text-xl font-semibold mb-3">{blockReason}</p>
              <p className="text-gray-400 text-sm mb-6">
                Violation #{violations} of {MAX_VIOLATIONS}
                {violations>=MAX_VIOLATIONS&&' - CLOSING'}
              </p>
              <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 text-sm text-gray-300">
<p className="font-mono">🚨 Logged</p>
<p className="font-mono mt-1">📍 {userIP}</p>
<p className="font-mono mt-1">👤 {user?.email}</p>
</div>
</div>
</div>
)}
<div className="bg-gradient-to-r from-blue-900 to-blue-700 px-3 py-2 flex items-center justify-between border-b-2 border-blue-700">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Shield className="text-blue-200 flex-shrink-0" size={18}/>
        <div className="min-w-0 flex-1">
          <h3 className="text-white font-bold text-xs md:text-sm truncate">🔒 {paperTitle}</h3>
          <p className="text-blue-200 text-xs truncate hidden md:block">{user?.email} | {userIP}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!isMobile && (
          <button onClick={fitToWidth} className="hidden md:flex p-2 bg-blue-500 hover:bg-blue-600 rounded text-white items-center gap-1" title="Fit (F)">
            <Maximize2 size={16}/>
          </button>
        )}
        <div className="w-px h-6 bg-blue-400/30"></div>
        <button onClick={onClose} className="p-1.5 md:p-2 bg-red-500 hover:bg-red-600 rounded text-white">
          <X size={16}/>
        </button>
      </div>
    </div>

    {/* 🔥 KEY FIX: Wrapper applies CSS transform for zoom */}
    <div ref={containerRef} className="flex-1 overflow-auto bg-gray-900 p-4 md:p-6 flex items-start justify-center">
      <div 
        ref={wrapperRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease-out',
          filter: isBlocked ? 'blur(50px) brightness(0.3)' : 'none',
          opacity: rendered ? 1 : 0,
          pointerEvents: isBlocked ? 'none' : 'auto'
        }}
      >
        <canvas 
          ref={canvasRef}
          className="shadow-2xl border-2 border-blue-700 rounded-lg" 
          style={{
            display: 'block',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none'
          }}
        />
      </div>
    </div>
    
    <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-3 py-2 border-t-2 border-blue-700">
      {isMobile && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <button onClick={zoomOut} disabled={ZOOM_LEVELS.indexOf(scale) === 0} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-30 active:scale-95 transition">
              <ZoomOut size={18}/>
            </button>
            <button onClick={resetZoom} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-xs font-bold active:scale-95 transition">
              Reset
            </button>
            <button onClick={zoomIn} disabled={ZOOM_LEVELS.indexOf(scale) === ZOOM_LEVELS.length - 1} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-30 active:scale-95 transition">
              <ZoomIn size={18}/>
            </button>
          </div>
          <div className="text-white text-xs bg-blue-500/30 px-2 py-1 rounded border border-blue-400/50">
            💡 Double-tap to zoom
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 md:gap-2">
          <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} className="p-1.5 md:p-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-50">
            <ChevronLeft size={16}/>
          </button>
          <span className="text-white text-xs md:text-sm px-2 md:px-4 py-1 min-w-[100px] md:min-w-[140px] text-center font-mono bg-white/10 rounded font-bold">
            Page {currentPage}/{totalPages}
          </span>
          <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} className="p-1.5 md:p-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-50">
            <ChevronRight size={16}/>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-white text-xs md:text-sm font-bold px-2 md:px-3 py-1 rounded border-2 ${getTimerColor()}`}>
            ⏱️ {formatTime(timeRemaining)}
          </div>
          {violations>0&&(
            <div className="text-white text-xs font-bold bg-orange-500/30 px-2 py-1 rounded border border-orange-400/50 animate-pulse">
              ⚠️ {violations}/{MAX_VIOLATIONS}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</>
);
};
export default ProtectedPDFViewer;
