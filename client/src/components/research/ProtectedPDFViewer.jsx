// client/src/components/research/ProtectedPDFViewer.jsx - FIXED AUTO-RECOVERY + COUNTDOWN
import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Shield, AlertCircle, Clock, MapPin, User, XCircle } from 'lucide-react';
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
  const [scale, setScale] = useState(0.5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [violations, setViolations] = useState(0);
  const [userIP, setUserIP] = useState('Unknown');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockCountdown, setBlockCountdown] = useState(3); // 🆕 NEW
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
  const lastTap = useRef(0);
  const renderLockRef = useRef(false);
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const SESSION_DURATION = 30 * 60 * 1000;
  const MAX_VIOLATIONS = 3;
  const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
  const BASE_SCALE = isMobile ? 1.5 : 1.3;

  const showToast = (msg, type = 'warning') => setToast({ show: true, message: msg, type });

  const instantBlur = () => {
    if (canvasRef.current) {
      canvasRef.current.style.transition = 'none';
      canvasRef.current.style.filter = 'blur(50px) brightness(0.1)';
      canvasRef.current.style.opacity = '0';
    }
    if (wrapperRef.current) {
      wrapperRef.current.style.transition = 'none';
      wrapperRef.current.style.opacity = '0';
      wrapperRef.current.style.filter = 'blur(50px)';
    }
  };

  // 🆕 UPDATED - Auto-recovery logic
  const blockContent = (reason) => {
    // Step 1: Instant blur
    instantBlur();
    
    // Step 2: Log and notify
    logViolation(reason);
    showToast(`Screenshot Attempt Blocked`, 'error');
    screenshotAttempts.current++;
    
    // Step 3: Update violations and handle recovery
    setViolations(prev => {
      const newCount = prev + 1;
      
      // Always block first
      setIsBlocked(true);
      
      if (newCount >= MAX_VIOLATIONS) {
        // FINAL VIOLATION - Permanent block
        showToast('⚠️ Maximum violations - Closing viewer', 'error');
        setTimeout(onClose, 2000);
      } else {
        // TEMPORARY BLOCK - Auto-recovery with countdown
        
        // Start countdown from 3
        setBlockCountdown(3);
        
        // Countdown interval: 3 -> 2 -> 1
        const countdownInterval = setInterval(() => {
          setBlockCountdown(c => {
            if (c <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return c - 1;
          });
        }, 1000);
        
        // Auto-resume after 3 seconds
        setTimeout(() => {
          clearInterval(countdownInterval);
          
          // Restore canvas
          if (canvasRef.current) {
            canvasRef.current.style.transition = 'all 0.3s ease';
            canvasRef.current.style.filter = 'none';
            canvasRef.current.style.opacity = '1';
          }
          
          // Restore wrapper
          if (wrapperRef.current) {
            wrapperRef.current.style.transition = 'all 0.3s ease';
            wrapperRef.current.style.filter = 'none';
            wrapperRef.current.style.opacity = '1';
          }
          
          // Unblock
          setIsBlocked(false);
        }, 3000); // 3 second block
      }
      
      return newCount;
    });
  };

  const logViolation = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const researchId = pdfUrl?.split('/').pop();
      if (researchId) {
        await fetch(`${API_BASE}/research/log-violation`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ researchId, violationType: type })
        });
      }
    } catch (err) {
      console.error('Log error:', err);
    }
  };

  // ============================================
  // ENHANCED MACOS PROTECTION
  // ============================================
  useEffect(() => {
    if (!isMac) return;

    const blockMacScreenshot = (e) => {
      const isCmdShift3 = (e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '3';
      const isCmdShift4 = (e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '4';
      const isCmdShift5 = (e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '5';
      const isCtrlCmdShift3 = e.ctrlKey && e.metaKey && e.shiftKey && e.key === '3';
      const isCtrlCmdShift4 = e.ctrlKey && e.metaKey && e.shiftKey && e.key === '4';

      if (isCmdShift3 || isCmdShift4 || isCmdShift5 || isCtrlCmdShift3 || isCtrlCmdShift4) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        instantBlur();
        navigator.clipboard.writeText(`🔒 PROTECTED - ${user?.email} - ${new Date().toLocaleString()}`).catch(() => {});
        blockContent('Screenshot Attempt Blocked');
        screenshotAttempts.current += 2;
        return false;
      }
    };

    const detectShareDialog = () => {
      if (document.hidden) {
        instantBlur();
        blockContent('Content Protection Activated');
        screenshotAttempts.current++;
      }
    };

    document.addEventListener('keydown', blockMacScreenshot, { capture: true, passive: false });
    document.addEventListener('keyup', blockMacScreenshot, { capture: true, passive: false });
    document.addEventListener('visibilitychange', detectShareDialog);

    return () => {
      document.removeEventListener('keydown', blockMacScreenshot, { capture: true });
      document.removeEventListener('keyup', blockMacScreenshot, { capture: true });
      document.removeEventListener('visibilitychange', detectShareDialog);
    };
  }, [violations, user, isMac]);

  // ============================================
  // ENHANCED iOS PROTECTION
  // ============================================
  useEffect(() => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isIOS) return;

    let lastVisibilityTime = 0;

    const detectHardwareScreenshot = () => {
      const now = Date.now();
      const timeSinceLastVisibility = now - lastVisibilityTime;

      if (document.hidden && timeSinceLastVisibility > 100 && timeSinceLastVisibility < 500) {
        instantBlur();
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;inset:0;background:black;z-index:9999;';
        document.body.appendChild(flash);
        blockContent('Content Protection Activated');
        setTimeout(() => flash.remove(), 500);
      }

      lastVisibilityTime = now;
    };

    const detectPageHide = (e) => {
      if (e.persisted === false) {
        instantBlur();
        blockContent('Content Protection Activated');
      }
    };

    const poisonClipboard = () => {
      navigator.clipboard.writeText(`🔒 CONFIDENTIAL - ${user?.email} - ${new Date().toLocaleString()}`).catch(() => {});
    };

    document.addEventListener('visibilitychange', detectHardwareScreenshot);
    window.addEventListener('pagehide', detectPageHide);
    const clipboardInterval = setInterval(poisonClipboard, 2000);

    return () => {
      document.removeEventListener('visibilitychange', detectHardwareScreenshot);
      window.removeEventListener('pagehide', detectPageHide);
      clearInterval(clipboardInterval);
    };
  }, [violations, user, isMobile]);

  // PrintScreen & DevTools detection
  useEffect(() => {
    const blockPrintScreen = (e) => {
      if (['PrintScreen', 44].includes(e.key || e.keyCode)) {
        e.preventDefault();
        e.stopPropagation();
        instantBlur();
        blockContent('Screenshot Attempt Blocked');
      }
    };

    const preventKeys = (e) => {
      if (['PrintScreen'].includes(e.key)) {
        e.preventDefault();
        navigator.clipboard.writeText('');
        instantBlur();
        blockContent('PrintScreen Blocked');
      }
    };

    const detectDevTools = () => {
      if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
        instantBlur();
        blockContent('DevTools Detected');
        setTimeout(onClose, 2000);
      }
    };

    document.addEventListener('keyup', blockPrintScreen, { capture: true });
    document.addEventListener('keydown', preventKeys, { capture: true, passive: false });
    const devInterval = setInterval(detectDevTools, 2000);

    return () => {
      document.removeEventListener('keyup', blockPrintScreen, { capture: true });
      document.removeEventListener('keydown', preventKeys, { capture: true });
      clearInterval(devInterval);
    };
  }, [violations]);

  // Double-tap zoom (mobile)
  useEffect(() => {
    if (!isMobile || !wrapperRef.current) return;

    const handleDoubleTap = (e) => {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        e.preventDefault();
        const currentIndex = ZOOM_LEVELS.indexOf(scale);
        const targetScale = currentIndex <= 2 ? ZOOM_LEVELS[5] : ZOOM_LEVELS[2];
        setScale(targetScale);
        showToast(`${Math.round(newScale * 100)}%`, 'success');
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
      showToast(`${Math.round(newScale * 100)}%`, 'success');
      if (navigator.vibrate) navigator.vibrate(20);
    } else showToast(`Max zoom`, 'warning');
  };

  const zoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(scale);
    if (currentIndex > 0) {
      const newScale = ZOOM_LEVELS[currentIndex - 1];
      setScale(newScale);
      showToast(`${Math.round(newScale * 100)}%`, 'success');
      if (navigator.vibrate) navigator.vibrate(20);
    } else showToast(`Min zoom`, 'warning');
  };

  const resetZoom = () => {
    setScale(1);
    showToast(`Reset`, 'success');
  };

  const fitToWidth = () => {
    if (!pdf || !containerRef.current || !canvasRef.current) return;
    const containerWidth = containerRef.current.clientWidth - 48;
    const canvasWidth = canvasRef.current.offsetWidth;
    const newScale = containerWidth / canvasWidth;
    setScale(Math.min(Math.max(newScale, ZOOM_LEVELS[0]), ZOOM_LEVELS[ZOOM_LEVELS.length - 1]));
    showToast(`Fit to Width`, 'success');
  };

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => setUserIP(d.ip))
      .catch(() => setUserIP('Protected'));
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
        if (newTime === 300) showToast(`5 minutes remaining`, 'warning');
        if (newTime === 120) showToast(`2 minutes remaining`, 'warning');
        if (newTime === 60) showToast(`1 minute remaining`, 'error');
        return newTime;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, []);

  // Load PDF
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

        if (isMobile) {
          setTimeout(() => {
            if (containerRef.current && canvasRef.current) {
              const containerWidth = containerRef.current.clientWidth - 48;
              const canvasWidth = canvasRef.current.offsetWidth;
              const fitScale = containerWidth / canvasWidth;
              const autoScale = Math.min(Math.max(fitScale, 0.5), 1.5);
              setScale(autoScale);
            }
          }, 200);
        }
      } catch (err) {
        setError(err.message || 'Load failed');
        setLoading(false);
      }
    };
    if (pdfUrl) loadPDF();
  }, [pdfUrl, API_BASE, isMobile]);

 // Render page with watermarks
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

      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const sid = Math.random().toString(36).substring(2, 10).toUpperCase();

      const displayWidth = vp.width;
      const displayHeight = vp.height;

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
      ctx.font = `bold ${badgeFont1}px Inter`;
      ctx.fillText(`PROTECTED`, 8, 22);
      ctx.font = `${badgeFont2}px Inter`;
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
      ctx.font = `bold ${badgeFont1}px Inter`;
      ctx.fillText(`Page ${currentPage}/${totalPages}`, displayWidth - 8, 22);
      ctx.font = `${badgeFont2}px Inter`;
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
      ctx.font = `bold ${badgeFont2}px Inter`;
      ctx.fillText(`CONserve Repository`, 8, displayHeight - 48);
      ctx.font = `${badgeFont2 * 0.9}px Inter`;
      ctx.fillText(`NEUST College of Nursing`, 8, displayHeight - 32);
      ctx.fillText(`© ${now.getFullYear()}`, 8, displayHeight - 16);
      ctx.restore();

      // Bottom-right badge
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(displayWidth - badgeW, displayHeight - badgeH, badgeW, badgeH);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'right';
      ctx.font = `bold ${badgeFont2}px Inter`;
      ctx.fillText(`${user?.firstName || ''} ${user?.lastName || ''}`, displayWidth - 8, displayHeight - 48);
      ctx.font = `${badgeFont2 * 0.9}px Inter`;
      ctx.fillText(`${user?.email || ''}`, displayWidth - 8, displayHeight - 32);
      ctx.fillText(`Unauthorized copy prohibited`, displayWidth - 8, displayHeight - 16);
      ctx.restore();

      // Center watermark
      const centerFont1 = Math.max(28, Math.min(displayWidth, displayHeight) * 0.08);
      const centerFont2 = Math.max(24, Math.min(displayWidth, displayHeight) * 0.07);
      const centerFont3 = Math.max(20, Math.min(displayWidth, displayHeight) * 0.06);
      const centerFont4 = Math.max(18, Math.min(displayWidth, displayHeight) * 0.05);
      const centerFont5 = Math.max(16, Math.min(displayWidth, displayHeight) * 0.045);
      const centerFont6 = Math.max(14, Math.min(displayWidth, displayHeight) * 0.04);

      ctx.save();
      ctx.translate(displayWidth / 2, displayHeight / 2);
      ctx.rotate(-35 * Math.PI / 180);

      ctx.globalAlpha = 0.28;
      ctx.font = `bold ${centerFont1}px Inter`;
      ctx.fillStyle = '#1e3a8a';
      ctx.textAlign = 'center';
      ctx.fillText(`${user?.firstName || 'PROTECTED'}`, 0, -120);

      ctx.font = `bold ${centerFont2}px Inter`;
      ctx.globalAlpha = 0.26;
      ctx.fillText(`ID: ${user?.studentId || 'N/A'}`, 0, -40);

      ctx.font = `bold ${centerFont3}px Inter`;
      ctx.globalAlpha = 0.24;
      ctx.fillText(`${user?.email || 'CONFIDENTIAL'}`, 0, 50);

      ctx.font = `${centerFont4}px Inter`;
      ctx.globalAlpha = 0.22;
      ctx.fillText(`${date} • ${time}`, 0, 120);

      ctx.font = `bold ${centerFont5}px Inter`;
      ctx.globalAlpha = 0.20;
      ctx.fillText(`Session: ${sid}`, 0, 180);

      ctx.font = `${centerFont6}px Inter`;
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

  // Prevent context menu, copy, etc
  useEffect(() => {
    const prevent = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    const preventKeys = (e) => {
      const blocked = [
        e.ctrlKey && ['s', 'p', 'c', 'a', 'u', 'f'].includes(e.key.toLowerCase()),
        e.metaKey && ['s', 'p', 'c', 'a', 'u', 'f'].includes(e.key.toLowerCase()),
        e.key === 'F12',
        e.ctrlKey && e.shiftKey && !['3', '4', '5'].includes(e.key)
      ];
      if (blocked.some(Boolean)) {
        e.preventDefault();
        return false;
      }
    };
    ['contextmenu', 'copy', 'cut', 'paste', 'selectstart', 'dragstart'].forEach(ev =>
      document.addEventListener(ev, prevent, { passive: false })
    );
    document.addEventListener('keydown', preventKeys, { passive: false });
    return () => {
      ['contextmenu', 'copy', 'cut', 'paste', 'selectstart', 'dragstart'].forEach(ev =>
        document.removeEventListener(ev, prevent)
      );
      document.removeEventListener('keydown', preventKeys);
    };
  }, []);

  // Keyboard shortcuts (desktop only)
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
          <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" size={32} />
        </div>
        <p className="text-white text-xl font-bold">Loading Protected Document</p>
<p className="text-blue-400 text-sm mt-2">Initializing Security...</p>
      </div>
    </div>
  );

  if (error || sessionExpired) return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md bg-gray-900 rounded-2xl p-8 border-2 border-red-500">
        <AlertCircle className="mx-auto text-red-500 mb-4 animate-pulse" size={64} />
        <h3 className="text-white text-2xl font-bold mb-3">
          {sessionExpired ? 'Session Expired' : 'Failed to Load'}
        </h3>
        <p className="text-gray-300 mb-6 text-sm">
          {sessionExpired ? 'Sessions expire after 30min' : error}
        </p>
        <button onClick={onClose} className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold">
          ✕ Close
        </button>
      </div>
    </div>
  );

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} duration={2000} />}

      <div className="fixed top-20 right-4 z-[60] bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold border-2 border-blue-400 shadow-lg flex items-center gap-1">
  <ZoomIn size={12} />
  {Math.round(scale * 100)}%
</div>
<div className="fixed inset-0 bg-black z-50 flex flex-col select-none">
    {/* 🆕 UPDATED BLOCK SCREEN WITH COUNTDOWN */}
    {isBlocked && (
      <div className="absolute inset-0 bg-black flex items-center justify-center z-[60]">
        <div className="text-center max-w-lg p-8">
          {/* Animated Shield Icon */}
          <div className="relative mb-6">
  <div className="w-32 h-32 mx-auto bg-red-600 rounded-full flex items-center justify-center animate-pulse">
    <Shield size={64} className="text-white" />
  </div>
  <div className="absolute inset-0 w-32 h-32 mx-auto border-4 border-red-500 rounded-full animate-ping"></div>
</div>

<h2 className="text-white text-3xl font-bold mb-4">CONTENT BLOCKED</h2>

<p className="text-red-400 text-xl font-semibold mb-3">
  Violation #{violations} of {MAX_VIOLATIONS}
</p>
          
          {/* Countdown OR Closing Message */}
          {violations < MAX_VIOLATIONS ? (
            <>
              {/* Countdown Timer */}
              <div className="text-white text-6xl font-bold mt-8 mb-4 animate-pulse">
                {blockCountdown}
              </div>
              <p className="text-gray-400 text-lg mb-6">
                Resuming in {blockCountdown} second{blockCountdown !== 1 ? 's' : ''}...
              </p>
            </>
          ) : (
            <>
              {/* Final Violation Message */}
              <div className="text-red-400 text-6xl font-bold mt-8 mb-4 animate-bounce flex items-center justify-center">
  <XCircle size={64} />
</div>
<p className="text-red-400 text-lg mb-6 font-bold">
  Closing viewer...
</p>
            </>
          )}
          
          {/* User Info */}
     <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 text-sm text-gray-300">
  <p className="font-mono flex items-center gap-2">
    <AlertCircle size={14} />
    Action Logged
  </p>
  <p className="font-mono mt-1 flex items-center gap-2">
    <MapPin size={14} />
    {userIP}
  </p>
  <p className="font-mono mt-1 flex items-center gap-2">
    <User size={14} />
    {user?.email}
  </p>
</div>
        </div>
      </div>
    )}

 <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-3 py-2 flex items-center justify-between border-b-2 border-blue-700">
  <div className="flex items-center gap-2 flex-1 min-w-0">
    <Shield className="text-blue-200 flex-shrink-0" size={18} />
    <div className="min-w-0 flex-1">
      <h3 className="text-white font-bold text-xs md:text-sm truncate">PROTECTED: {paperTitle}</h3>
      <p className="text-blue-200 text-xs truncate hidden md:block">{user?.email} | {userIP}</p>
    </div>
  </div>
      <div className="flex items-center gap-2">
        {!isMobile && (
          <button onClick={fitToWidth} className="hidden md:flex p-2 bg-blue-500 hover:bg-blue-600 rounded text-white items-center gap-1" title="Fit (F)">
            <Maximize2 size={16} />
          </button>
        )}
        <div className="w-px h-6 bg-blue-400/30"></div>
        <button onClick={onClose} className="p-1.5 md:p-2 bg-red-500 hover:bg-red-600 rounded text-white">
          <X size={16} />
        </button>
      </div>
    </div>

    <div ref={containerRef} className="flex-1 overflow-auto bg-gray-900 p-4 md:p-6 flex items-start justify-center">
      <div
        ref={wrapperRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: isBlocked ? 'none' : 'transform 0.2s ease-out',
          filter: isBlocked ? 'blur(50px) brightness(0.3)' : 'none',
          opacity: rendered && !isBlocked ? 1 : 0,
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
              <ZoomOut size={18} />
            </button>
            <button onClick={resetZoom} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-xs font-bold active:scale-95 transition">
              Reset
            </button>
            <button onClick={zoomIn} disabled={ZOOM_LEVELS.indexOf(scale) === ZOOM_LEVELS.length - 1} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-30 active:scale-95 transition">
              <ZoomIn size={18} />
            </button>
          </div>
          <div className="text-white text-xs bg-blue-500/30 px-2 py-1 rounded border border-blue-400/50">
            💡 Double-tap to zoom
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 md:gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 md:p-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-50">
            <ChevronLeft size={16} />
          </button>
          <span className="text-white text-xs md:text-sm px-2 md:px-4 py-1 min-w-[100px] md:min-w-[140px] text-center font-mono bg-white/10 rounded font-bold">
            Page {currentPage}/{totalPages}
          </span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 md:p-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-50">
            <ChevronRight size={16} />
          </button>
        </div>
  <div className="flex items-center gap-2">
  <div className={`text-white text-xs md:text-sm font-bold px-2 md:px-3 py-1 rounded border-2 ${getTimerColor()} flex items-center gap-1`}>
    <Clock size={14} />
    {formatTime(timeRemaining)}
  </div>
  {violations > 0 && (
    <div className="text-white text-xs font-bold bg-red-500/30 px-2 py-1 rounded border border-red-400/50 animate-pulse flex items-center gap-1">
      <AlertCircle size={14} />
      {violations}/{MAX_VIOLATIONS}
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