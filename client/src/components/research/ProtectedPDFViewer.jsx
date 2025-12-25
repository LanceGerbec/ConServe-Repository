// client/src/components/research/ProtectedPDFViewer.jsx
// ✨ BEAUTIFUL WATERMARK + MOBILE SECURITY
import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Lock, AlertCircle, Shield } from 'lucide-react';
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

const ProtectedPDFViewer = ({ signedPdfUrl, paperTitle, onClose }) => {
  const { user } = useAuth();
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [violations, setViolations] = useState(0);
  const [userIP, setUserIP] = useState('Unknown');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'warning' });
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const SESSION_DURATION = 30 * 60 * 1000;
  const MAX_VIOLATIONS = 5;

  const showToast = (msg, type = 'warning') => setToast({ show: true, message: msg, type });

  const blockContent = (reason) => {
    setIsBlocked(true);
    setBlockReason(reason);
    logViolation(reason);
    showToast(`🚫 ${reason}`, 'error');
    
    if (violations >= MAX_VIOLATIONS - 1) {
      setTimeout(() => {
        showToast('⚠️ Too many violations - Closing viewer', 'error');
        setTimeout(onClose, 2000);
      }, 3000);
    }
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
      showToast('⏰ Session expired (30min limit)', 'error');
      setTimeout(onClose, 3000);
    }, SESSION_DURATION);
    return () => clearTimeout(sessionTimerRef.current);
  }, []);

  // 📱 MOBILE SCREENSHOT DETECTION
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Detect Android screenshot
      const detectAndroidScreenshot = () => {
        if (document.visibilityState === 'hidden') {
          blockContent('Mobile Screenshot Detected');
          setTimeout(() => setIsBlocked(false), 3000);
        }
      };

      // Detect iOS screenshot (volume up + power button)
      const detectIOSScreenshot = (e) => {
        if (e.key === 'VolumeUp' || e.key === 'Power') {
          blockContent('iOS Screenshot Attempt');
          setTimeout(() => setIsBlocked(false), 2000);
        }
      };

      // Prevent long-press context menu on mobile
      const preventLongPress = (e) => {
        e.preventDefault();
        blockContent('Long Press Blocked');
        setTimeout(() => setIsBlocked(false), 1500);
        return false;
      };

      document.addEventListener('visibilitychange', detectAndroidScreenshot);
      document.addEventListener('keydown', detectIOSScreenshot);
      document.addEventListener('contextmenu', preventLongPress);
      document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
          blockContent('Multi-Touch Blocked');
        }
      });

      return () => {
        document.removeEventListener('visibilitychange', detectAndroidScreenshot);
        document.removeEventListener('keydown', detectIOSScreenshot);
        document.removeEventListener('contextmenu', preventLongPress);
      };
    }
  }, [violations]);

  // Desktop Screenshot Detection
  useEffect(() => {
    let screenshotAttempts = 0;
    
    const detectScreenshot = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        screenshotAttempts++;
        blockContent('Screenshot Attempt Detected');
        setTimeout(() => {
          if (screenshotAttempts < MAX_VIOLATIONS) {
            setIsBlocked(false);
          }
        }, 3000);
      }
    };

    const preventPrintScreen = (e) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        navigator.clipboard.writeText('');
        blockContent('Screenshot Blocked');
      }
    };

    document.addEventListener('keyup', detectScreenshot);
    document.addEventListener('keydown', preventPrintScreen);

    return () => {
      document.removeEventListener('keyup', detectScreenshot);
      document.removeEventListener('keydown', preventPrintScreen);
    };
  }, [violations]);

  // Visibility & Focus Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        blockContent('Window/Tab Changed');
        setTimeout(() => {
          if (!document.hidden && violations < MAX_VIOLATIONS) {
            setIsBlocked(false);
          }
        }, 2000);
      }
    };

    const handleBlur = () => {
      blockContent('Focus Lost');
      setTimeout(() => {
        if (violations < MAX_VIOLATIONS) {
          setIsBlocked(false);
        }
      }, 1500);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [violations]);

  // Developer Tools Detection
  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        blockContent('Developer Tools Detected');
        showToast('⚠️ Dev tools blocked - Closing viewer', 'error');
        setTimeout(onClose, 3000);
      }
    };

    const interval = setInterval(detectDevTools, 2000);
    return () => clearInterval(interval);
  }, []);

  const logViolation = async (type) => {
    setViolations(prev => {
      const newCount = prev + 1;
      if (newCount >= MAX_VIOLATIONS) {
        showToast('🚫 Maximum violations reached - Closing', 'error');
        setTimeout(onClose, 2000);
      }
      return newCount;
    });

    try {
      const token = localStorage.getItem('token');
      const researchId = signedPdfUrl?.split('/')[2];
      if (researchId) {
        await fetch(`${API_BASE}/research/log-violation`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ researchId, violationType: type })
        });
      }
    } catch (err) {
      console.error('⚠️ Log error:', err);
    }
  };

  // Load PDF
  useEffect(() => {
    const loadPDF = async () => {
      try {
        const pdfjs = await initPdfJs();
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');

        const fullUrl = `${API_BASE}${signedPdfUrl}`;
        const response = await fetch(fullUrl, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/pdf' },
          mode: 'cors'
        });

        if (!response.ok) throw new Error(response.status === 401 ? 'Session expired' : `Error ${response.status}`);

        const blob = await response.blob();
        if (blob.size === 0) throw new Error('Empty file');
        
        const arrayBuffer = await blob.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer, verbosity: 0 });
        const pdfDoc = await loadingTask.promise;
        
        setPdf(pdfDoc);
        setTotalPages(pdfDoc.numPages);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load PDF');
        setLoading(false);
      }
    };

    if (signedPdfUrl) loadPDF();
    else { setError('No PDF URL'); setLoading(false); }
  }, [signedPdfUrl, API_BASE]);

  // ✨ RENDER PDF WITH BEAUTIFUL WATERMARK
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { alpha: false });
        
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          enableWebGL: true,
          renderInteractiveForms: false
        }).promise;

        // ✨ BEAUTIFUL WATERMARK DESIGN
        const now = new Date();
        const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Gradient overlay for elegant look
        const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(30, 58, 138, 0.02)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.02)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // ✨ DIAGONAL WATERMARK (Elegant & Minimal)
        context.save();
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(-25 * Math.PI / 180);
        
        // Main watermark text
        context.globalAlpha = 0.08;
        context.font = 'bold 28px Inter, system-ui, sans-serif';
        context.fillStyle = '#1e3a8a';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const mainText = `🔒 ${user?.firstName || 'Protected'} ${user?.lastName || 'Document'}`;
        context.fillText(mainText, 0, -30);
        
        context.font = '18px Inter, system-ui, sans-serif';
        context.globalAlpha = 0.06;
        context.fillText(`${user?.email || 'Confidential'}`, 0, 10);
        context.fillText(`${date} • ${timestamp}`, 0, 40);
        
        context.restore();

        // ✨ CORNER BADGES (Minimal & Professional)
        const drawBadge = (text, x, y, align = 'left') => {
          context.save();
          context.globalAlpha = 0.12;
          context.font = 'bold 9px Inter, system-ui, monospace';
          context.fillStyle = '#1e3a8a';
          context.textAlign = align;
          
          // Badge background
          const metrics = context.measureText(text);
          const padding = 6;
          const bgX = align === 'right' ? x - metrics.width - padding * 2 : x;
          
          context.globalAlpha = 0.08;
          context.fillStyle = '#eff6ff';
          context.fillRect(bgX, y - 10, metrics.width + padding * 2, 16);
          
          // Badge border
          context.globalAlpha = 0.15;
          context.strokeStyle = '#1e3a8a';
          context.lineWidth = 1;
          context.strokeRect(bgX, y - 10, metrics.width + padding * 2, 16);
          
          // Badge text
          context.globalAlpha = 0.25;
          context.fillStyle = '#1e40af';
          context.fillText(text, x + (align === 'right' ? -padding : padding), y);
          
          context.restore();
        };

        // Top-left: User info
        drawBadge(`👤 ${user?.email?.substring(0, 20) || 'User'}`, 15, 25);
        
        // Top-right: Session ID
        drawBadge(`#${sessionId}`, canvas.width - 15, 25, 'right');
        
        // Bottom-left: IP
        drawBadge(`📍 ${userIP}`, 15, canvas.height - 15);
        
        // Bottom-right: Page & Time
        drawBadge(`${date} ${timestamp} • Pg${currentPage}`, canvas.width - 15, canvas.height - 15, 'right');

        // ✨ CENTER FORENSIC WATERMARK (Ultra-Subtle)
        context.save();
        context.globalAlpha = 0.04;
        context.font = 'bold 12px monospace';
        context.fillStyle = '#000000';
        context.textAlign = 'center';
        const forensic = `${user?.id?.substring(0, 8) || 'USER'}-${sessionId}-P${currentPage}`;
        context.fillText(forensic, canvas.width / 2, canvas.height / 2);
        context.restore();

      } catch (err) {
        setError(`Render failed: ${err.message}`);
      }
    };

    renderPage();
  }, [pdf, currentPage, scale, user, userIP]);

  // Prevent All Interactions
  useEffect(() => {
    const preventAll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      logViolation('interaction_attempt');
      showToast('🚫 Action blocked', 'warning');
      return false;
    };

    const preventKeys = (e) => {
      const blocked = [
        e.ctrlKey && ['s', 'p', 'c', 'a', 'u', 'f'].includes(e.key.toLowerCase()),
        e.metaKey && ['s', 'p', 'c', 'a', 'u', 'f'].includes(e.key.toLowerCase()),
        e.key === 'PrintScreen',
        e.key === 'F12',
        e.ctrlKey && e.shiftKey
      ];

      if (blocked.some(Boolean)) {
        e.preventDefault();
        blockContent('Keyboard Shortcut Blocked');
        setTimeout(() => setIsBlocked(false), 1500);
        return false;
      }
    };

    document.addEventListener('contextmenu', preventAll);
    document.addEventListener('keydown', preventKeys);
    document.addEventListener('copy', preventAll);
    document.addEventListener('cut', preventAll);
    document.addEventListener('paste', preventAll);
    document.addEventListener('selectstart', preventAll);
    document.addEventListener('dragstart', preventAll);
    
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.webkitTouchCallout = 'none';

    return () => {
      document.removeEventListener('contextmenu', preventAll);
      document.removeEventListener('keydown', preventKeys);
      document.removeEventListener('copy', preventAll);
      document.removeEventListener('cut', preventAll);
      document.removeEventListener('paste', preventAll);
      document.removeEventListener('selectstart', preventAll);
      document.removeEventListener('dragstart', preventAll);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.webkitTouchCallout = '';
    };
  }, []);

  const fitToWidth = () => {
    if (!pdf || !containerRef.current || !canvasRef.current) return;
    const containerWidth = containerRef.current.clientWidth - 48;
    const pageWidth = canvasRef.current.width / scale;
    const newScale = containerWidth / pageWidth;
    setScale(Math.min(newScale, 2.5));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mb-4 mx-auto"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" size={32} />
          </div>
          <p className="text-white text-xl font-bold">Loading Protected Document</p>
          <p className="text-blue-400 text-sm mt-2">🔒 Initializing Security Features...</p>
          <p className="text-gray-500 text-xs mt-1">Screenshot Protection • Forensic Watermarking • Activity Logging</p>
        </div>
      </div>
    );
  }

  if (error || sessionExpired) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-gray-900 rounded-2xl p-8 border-2 border-red-500">
          <AlertCircle className="mx-auto text-red-500 mb-4 animate-pulse" size={64} />
          <h3 className="text-white text-2xl font-bold mb-3">
            {sessionExpired ? 'Session Expired' : 'Failed to Load'}
          </h3>
          <p className="text-gray-300 mb-6 text-sm">
            {sessionExpired ? 'Viewing sessions expire after 30 minutes for security.' : error}
          </p>
          <button onClick={onClose} className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold">
            ✕ Close
          </button>
        </div>
      </div>
    );
  }

  const elapsed = Math.floor((Date.now() - startTimeRef.current) / 60000);
  const remaining = Math.max(0, 30 - elapsed);

  return (
    <>
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} duration={2000} />
      )}

      <div className="fixed inset-0 bg-black z-50 flex flex-col select-none">
        {/* BLOCKING OVERLAY */}
        {isBlocked && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-[60] animate-fade-in">
            <div className="text-center max-w-lg p-8">
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                  <Shield size={64} className="text-white" />
                </div>
                <div className="absolute inset-0 w-32 h-32 mx-auto border-4 border-red-500 rounded-full animate-ping"></div>
              </div>
              <h2 className="text-white text-3xl font-bold mb-4">CONTENT BLOCKED</h2>
              <p className="text-red-400 text-xl font-semibold mb-3">{blockReason}</p>
              <p className="text-gray-400 text-sm mb-6">
                Violation #{violations} of {MAX_VIOLATIONS}
                {violations >= MAX_VIOLATIONS && ' - CLOSING VIEWER'}
              </p>
              <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 text-sm text-gray-300">
                <p className="font-mono">🚨 All activities are logged</p>
                <p className="font-mono mt-1">📍 IP: {userIP}</p>
                <p className="font-mono mt-1">👤 User: {user?.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-navy to-accent px-4 py-3 flex items-center justify-between border-b border-blue-400/20 shadow-lg">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Shield className="text-blue-300 flex-shrink-0" size={20} />
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-bold text-sm truncate">🔒 {paperTitle}</h3>
              <p className="text-blue-200 text-xs truncate">{user?.email} | IP: {userIP}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} disabled={scale <= 0.5} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-50 transition">
              <ZoomOut size={18} />
            </button>
            <span className="text-white text-sm px-3 min-w-[70px] text-center font-mono bg-white/10 rounded py-1.5 font-bold">
              {Math.round(scale * 100)}%
            </span>
            <button onClick={() => setScale(s => Math.min(3, s + 0.2))} disabled={scale >= 3} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-50 transition">
              <ZoomIn size={18} />
            </button>
            <button onClick={fitToWidth} className="p-2 bg-blue-500 hover:bg-blue-600 rounded text-white transition">
              <Maximize2 size={18} />
            </button>
            <div className="w-px h-6 bg-blue-400/30 mx-1"></div>
            <button onClick={onClose} className="p-2 bg-red-500 hover:bg-red-600 rounded text-white transition">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Canvas Container */}
        <div ref={containerRef} className="flex-1 overflow-auto bg-gray-900 p-6 relative" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          <canvas 
            ref={canvasRef} 
            className="shadow-2xl border border-blue-500/30 rounded-lg transition-all duration-300" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto', 
              imageRendering: 'high-quality',
              filter: isBlocked ? 'blur(50px) brightness(0.3)' : 'none',
              pointerEvents: isBlocked ? 'none' : 'auto'
            }} 
          />
        </div>

        {/* Footer Navigation */}
        <div className="bg-gradient-to-r from-navy to-accent px-4 py-3 flex items-center justify-between border-t border-blue-400/20 shadow-lg">
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-50 transition">
              <ChevronLeft size={18} />
            </button>
            <span className="text-white text-sm px-4 min-w-[140px] text-center font-mono bg-white/10 rounded py-1.5 font-bold">
              Page {currentPage} / {totalPages}
            </span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-50 transition">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-3">
            <div className="text-white text-xs font-bold bg-white/10 px-3 py-1 rounded border border-white/20">
              ⏱️ {remaining}m
            </div>
            <div className="text-white text-xs font-bold bg-blue-500/30 px-3 py-1 rounded border border-blue-400/50">
              🔒 PROTECTED
            </div>
            {violations > 0 && (
              <div className="text-white text-xs font-bold bg-orange-500/30 px-3 py-1 rounded border border-orange-400/50 animate-pulse">
                ⚠️ {violations}/{MAX_VIOLATIONS}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProtectedPDFViewer;