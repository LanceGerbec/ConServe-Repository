// client/src/components/research/ProtectedPDFViewer.jsx
// NETFLIX-STYLE ULTRA PROTECTION VERSION
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
  const [isBlocked, setIsBlocked] = useState(false); // Netflix-style blocking
  const [blockReason, setBlockReason] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'warning' });
  const [screenRecording, setScreenRecording] = useState(false);
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const overlayCanvasRef = useRef(null); // For dynamic watermark
  const sessionTimerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const screenshotCheckRef = useRef(null);
  const visibilityCheckRef = useRef(null);
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const SESSION_DURATION = 30 * 60 * 1000;
  const MAX_VIOLATIONS = 5;

  const showToast = (msg, type = 'warning') => setToast({ show: true, message: msg, type });

  // 🚨 NETFLIX-STYLE BLOCKING FUNCTION
  const blockContent = (reason) => {
    setIsBlocked(true);
    setBlockReason(reason);
    logViolation(reason);
    showToast(`🚫 ${reason} - Content Blocked`, 'error');
    
    // Auto-close after 5 seconds for serious violations
    if (violations >= MAX_VIOLATIONS - 1) {
      setTimeout(() => {
        showToast('⚠️ Too many violations - Closing viewer', 'error');
        setTimeout(onClose, 2000);
      }, 3000);
    }
  };

  // Get IP
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => setUserIP(d.ip))
      .catch(() => setUserIP('Protected'));
  }, []);

  // Session timer
  useEffect(() => {
    sessionTimerRef.current = setTimeout(() => {
      setSessionExpired(true);
      showToast('⏰ Session expired (30min limit)', 'error');
      setTimeout(onClose, 3000);
    }, SESSION_DURATION);
    return () => clearTimeout(sessionTimerRef.current);
  }, []);

  // 🎬 NETFLIX-STYLE PROTECTION #1: Screenshot Detection
  useEffect(() => {
    let screenshotAttempts = 0;
    
    const detectScreenshot = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        screenshotAttempts++;
        blockContent('Screenshot Attempt Detected');
        
        // Hide content temporarily
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
        navigator.clipboard.writeText(''); // Clear clipboard
        blockContent('Screenshot Blocked');
      }
    };

    document.addEventListener('keyup', detectScreenshot);
    document.addEventListener('keydown', preventPrintScreen);
    
    // Check for screenshot via clipboard monitoring
    screenshotCheckRef.current = setInterval(() => {
      if (document.visibilityState === 'hidden') {
        // Possible screenshot via OS tools
        setTimeout(() => {
          if (document.visibilityState === 'visible') {
            blockContent('Suspicious Activity Detected');
            setTimeout(() => setIsBlocked(false), 2000);
          }
        }, 100);
      }
    }, 500);

    return () => {
      document.removeEventListener('keyup', detectScreenshot);
      document.removeEventListener('keydown', preventPrintScreen);
      if (screenshotCheckRef.current) clearInterval(screenshotCheckRef.current);
    };
  }, [violations]);

  // 🎬 NETFLIX-STYLE PROTECTION #2: Screen Recording Detection
  useEffect(() => {
    const detectRecording = async () => {
      try {
        // Check for screen capture API usage
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true }).catch(() => null);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setScreenRecording(true);
          blockContent('Screen Recording Detected');
          showToast('🎥 Screen recording blocked - Closing in 5s', 'error');
          setTimeout(onClose, 5000);
        }
      } catch (e) {
        // User denied or no recording - good
      }
    };

    // Check every 3 seconds
    const interval = setInterval(detectRecording, 3000);
    return () => clearInterval(interval);
  }, []);

  // 🎬 NETFLIX-STYLE PROTECTION #3: Visibility Change = Instant Block
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        blockContent('Window/Tab Changed');
        // Auto-unblock after 2 seconds if user returns
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

  // 🎬 NETFLIX-STYLE PROTECTION #4: Developer Tools Detection
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

  // NETFLIX-STYLE RENDERING with AGGRESSIVE WATERMARKS
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

        // 🎬 NETFLIX-STYLE: Aggressive Multi-Layer Watermarks
        const now = new Date();
        const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const timestamp = `${now.toLocaleTimeString()}`;
        
        // Layer 1: Dense diagonal grid
        context.save();
        context.globalAlpha = 0.15;
        context.font = 'bold 12px Arial';
        context.fillStyle = '#FF0000';
        
        const line1 = `🔒 ${user?.email?.toUpperCase() || 'PROTECTED'}`;
        const line2 = `IP: ${userIP} | ${timestamp}`;
        const line3 = `SESSION: ${sessionId} | PG ${currentPage}`;

        context.rotate(-35 * Math.PI / 180);
        for (let row = 0; row < 30; row++) {
          for (let col = 0; col < 20; col++) {
            const x = col * 250 - 200;
            const y = row * 80;
            context.shadowColor = 'rgba(0, 0, 0, 0.6)';
            context.shadowBlur = 4;
            context.fillText(line1, x, y);
            context.fillText(line2, x, y + 16);
            context.fillText(line3, x, y + 32);
          }
        }
        context.restore();

        // Layer 2: Random position watermarks (Netflix-style)
        context.globalAlpha = 0.12;
        for (let i = 0; i < 15; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          context.fillText(`🚫 ${user?.email} | ${timestamp}`, x, y);
        }

        // Layer 3: Corner forensic stamps
        context.globalAlpha = 0.2;
        context.fillStyle = '#000000';
        context.font = 'bold 10px monospace';
        const forensic = `${user?.id}-${Date.now()}-${currentPage}`;
        context.fillText(forensic, 10, canvas.height - 10);
        context.fillText(forensic, canvas.width - 250, 20);
        context.fillText(forensic, canvas.width / 2 - 100, canvas.height / 2);

      } catch (err) {
        setError(`Render failed: ${err.message}`);
      }
    };

    renderPage();
  }, [pdf, currentPage, scale, user, userIP]);

  // 🎬 NETFLIX-STYLE PROTECTION #5: Prevent All Interactions
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
    
    // Prevent text selection
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
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-red-500 mb-4 mx-auto"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" size={32} />
          </div>
          <p className="text-white text-xl font-bold">Loading Protected Document</p>
          <p className="text-red-400 text-sm mt-2">🔒 Initializing Netflix-Style Protection...</p>
          <p className="text-gray-500 text-xs mt-1">Screenshot Protection • Recording Detection • Forensic Watermarking</p>
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
        {/* 🎬 NETFLIX-STYLE BLOCKING OVERLAY */}
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
        <div className="bg-black/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b-2 border-red-600 shadow-lg">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Shield className="text-red-500 flex-shrink-0 animate-pulse" size={22} />
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-bold text-sm truncate">🔒 {paperTitle}</h3>
              <p className="text-gray-400 text-xs truncate">{user?.email} | IP: {userIP}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} disabled={scale <= 0.5} className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-white disabled:opacity-50 transition">
              <ZoomOut size={18} />
            </button>
            <span className="text-white text-sm px-3 min-w-[70px] text-center font-mono bg-gray-800 rounded py-1.5 font-bold">
              {Math.round(scale * 100)}%
            </span>
            <button onClick={() => setScale(s => Math.min(3, s + 0.2))} disabled={scale >= 3} className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-white disabled:opacity-50 transition">
              <ZoomIn size={18} />
            </button>
            <button onClick={fitToWidth} className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition">
              <Maximize2 size={18} />
            </button>
            <div className="w-px h-6 bg-gray-700 mx-1"></div>
            <button onClick={onClose} className="p-2 bg-red-600 hover:bg-red-700 rounded text-white transition">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Canvas Container */}
        <div ref={containerRef} className="flex-1 overflow-auto bg-gray-900 p-6 relative" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          <canvas 
            ref={canvasRef} 
            className="shadow-2xl border-2 border-red-600 rounded-lg transition-all duration-300" 
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
        <div className="bg-black/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-t-2 border-red-600 shadow-lg">
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-white disabled:opacity-50 transition">
              <ChevronLeft size={18} />
            </button>
            <span className="text-white text-sm px-4 min-w-[140px] text-center font-mono bg-gray-800 rounded py-1.5 font-bold">
              Page {currentPage} / {totalPages}
            </span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-white disabled:opacity-50 transition">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-3">
            <div className="text-yellow-400 text-xs font-bold bg-yellow-900/30 px-3 py-1 rounded border border-yellow-600">
              ⏱️ {remaining}m
            </div>
            <div className="text-red-400 text-xs font-bold bg-red-900/30 px-3 py-1 rounded border border-red-600 animate-pulse">
              🔒 ULTRA PROTECTED
            </div>
            {violations > 0 && (
              <div className="text-orange-400 text-xs font-bold bg-orange-900/30 px-3 py-1 rounded border border-orange-600 animate-pulse">
                ⚠️ {violations}/{MAX_VIOLATIONS}
              </div>
            )}
            {screenRecording && (
              <div className="text-red-500 text-xs font-bold bg-red-900/50 px-3 py-1 rounded border border-red-500 animate-pulse">
                🎥 RECORDING BLOCKED
              </div>
            )}
          </div>
        </div>

        {/* Bottom Warning Bar */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 px-4 py-2 text-center">
          <p className="text-white text-xs font-bold animate-pulse">
            🚫 PROTECTION ACTIVE • SCREENSHOTS BLOCKED • RECORDING BLOCKED • ALL ACTIONS LOGGED • IP: {userIP} • {remaining}min LEFT
          </p>
        </div>
      </div>
    </>
  );
};

export default ProtectedPDFViewer;