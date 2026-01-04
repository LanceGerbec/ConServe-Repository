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
  const screenshotAttempts = useRef(0);
  const lastHideTime = useRef(0);
  const visibilityCount = useRef(0);
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const SESSION_DURATION = 30 * 60 * 1000;
  const MAX_VIOLATIONS = 5;

  // 🔥 ZOOM PRESETS
  const ZOOM_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  const showToast = (msg, type = 'warning') => setToast({ show: true, message: msg, type });

  const blockContent = (reason) => {
    setIsBlocked(true);
    setBlockReason(reason);
    logViolation(reason);
    showToast(`🚫 ${reason}`, 'error');
    screenshotAttempts.current++;
    
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
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

  // Mobile Screenshot Detection
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (!isMobile) return;

    const hideContent = () => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = '0';
        canvasRef.current.style.filter = 'blur(50px)';
        setTimeout(() => {
          if (canvasRef.current) {
            canvasRef.current.style.opacity = '1';
            canvasRef.current.style.filter = 'none';
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
        if (e.touches?.length > 2 || e.touches?.length === 3) {
          e.preventDefault();
          e.stopPropagation();
          hideContent();
          blockContent('📱 Multi-Touch Blocked');
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

      const detectRecording = () => {
        if (!document.hasFocus() || document.hidden) {
          hideContent();
          blockContent('📱 Recording Detected');
        }
      };

      const detectGestures = (e) => {
        if (e.touches?.length >= 3) {
          e.preventDefault();
          hideContent();
          blockContent('📱 Gesture Blocked');
        }
      };

      document.addEventListener('visibilitychange', detectVisibility);
      window.addEventListener('blur', detectBlur);
      window.addEventListener('pagehide', detectBlur);
      document.addEventListener('keydown', detectKeys, { passive: false });
      document.addEventListener('keyup', detectKeys, { passive: false });
      document.addEventListener('touchstart', detectTouch, { passive: false });
      document.addEventListener('touchmove', detectGestures, { passive: false });
      
      const recordInterval = setInterval(detectRecording, 300);

      return () => {
        document.removeEventListener('visibilitychange', detectVisibility);
        window.removeEventListener('blur', detectBlur);
        window.removeEventListener('pagehide', detectBlur);
        document.removeEventListener('keydown', detectKeys);
        document.removeEventListener('keyup', detectKeys);
        document.removeEventListener('touchstart', detectTouch);
        document.removeEventListener('touchmove', detectGestures);
        clearInterval(recordInterval);
      };
    }

    if (isIOS) {
      let volumeUp = false, power = false, buttonTime = 0;
      
      const detectIOS = (e) => {
        const key = e.key || e.keyCode;
        const now = Date.now();
        
        if (['VolumeUp', 175, 'AudioVolumeUp'].includes(key)) {
          volumeUp = true;
          buttonTime = now;
        }
        if (['Power', 116, 223].includes(key)) power = true;
        
        if ((volumeUp && power) || (now - buttonTime < 300 && volumeUp)) {
          e.preventDefault();
          e.stopPropagation();
          hideContent();
          blockContent('📱 iOS Screenshot BLOCKED');
          document.body.style.opacity = '0';
          screenshotAttempts.current += 2;
          setTimeout(() => {
            document.body.style.opacity = '1';
            volumeUp = power = false;
          }, 3000);
          return false;
        }
        
        setTimeout(() => { volumeUp = power = false; }, 500);
      };

      const detectIOSVisibility = () => {
        const now = Date.now();
        if (document.hidden) {
          hideContent();
          if (now - lastHideTime.current < 800) blockContent('📱 iOS Screenshot Detected');
          lastHideTime.current = now;
        }
      };

      document.addEventListener('keydown', detectIOS, { passive: false });
      document.addEventListener('keyup', detectIOS, { passive: false });
      document.addEventListener('visibilitychange', detectIOSVisibility);
      window.addEventListener('blur', () => { hideContent(); blockContent('📱 Screenshot Blocked'); });

      return () => {
        document.removeEventListener('keydown', detectIOS);
        document.removeEventListener('keyup', detectIOS);
        document.removeEventListener('visibilitychange', detectIOSVisibility);
      };
    }

    const preventAll = (e) => { 
      e.preventDefault();
      e.stopPropagation();
      hideContent();
      blockContent('📱 Action Blocked');
      return false;
    };
    
    const preventMulti = (e) => { 
      if (e.touches?.length > 1) { 
        e.preventDefault();
        e.stopPropagation();
        hideContent();
        blockContent('📱 Multi-Touch Blocked');
        return false;
      } 
    };

    ['contextmenu', 'selectstart', 'select', 'dragstart', 'copy'].forEach(ev => 
      document.addEventListener(ev, preventAll, { passive: false })
    );
    
    document.addEventListener('touchstart', preventMulti, { passive: false });
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.webkitTouchCallout = 'none';

    return () => {
      ['contextmenu', 'selectstart', 'select', 'dragstart', 'copy'].forEach(ev => 
        document.removeEventListener(ev, preventAll)
      );
      document.removeEventListener('touchstart', preventMulti);
    };
  }, [violations]);

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

  // 🔥 ENHANCED RENDERING WITH HIGH-DPI + SCALE-RESPONSIVE WATERMARKS
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    const render = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false });
        
        // 🔥 HIGH-DPI RENDERING
        const dpr = window.devicePixelRatio || 1;
        const vp = page.getViewport({ scale: scale * dpr });
        
        canvas.width = vp.width;
        canvas.height = vp.height;
        canvas.style.width = (vp.width / dpr) + 'px';
        canvas.style.height = (vp.height / dpr) + 'px';
        
        await page.render({ 
          canvasContext: ctx, 
          viewport: vp,
          intent: 'display'
        }).promise;
        
        // Scale context for watermark drawing
        ctx.scale(dpr, dpr);
        
        const displayWidth = vp.width / dpr;
        const displayHeight = vp.height / dpr;
        
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const sid = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        // 🔥 SCALE-RESPONSIVE WATERMARK SIZES
        const badgeW = Math.min(280 * scale, displayWidth * 0.4);
        const badgeH = Math.min(100 * scale, displayHeight * 0.15);
        const badgeFont1 = Math.max(10, 14 * scale);
        const badgeFont2 = Math.max(8, 12 * scale);
        
        // 🔥 SOLUTION 4: EXTRA WATERMARK DENSITY AT LOW ZOOM
        const useMultiWatermark = scale < 1.0;
        
        // Top-Left Badge
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, 0, badgeW, badgeH);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${badgeFont1}px Inter, monospace`;
        ctx.fillText(`🔒 PROTECTED DOCUMENT`, 10 * scale, 25 * scale);
        ctx.font = `${badgeFont2}px Inter, monospace`;
        ctx.fillText(`ID: ${user?.studentId || 'N/A'}`, 10 * scale, 45 * scale);
        ctx.fillText(`${time}`, 10 * scale, 65 * scale);
        ctx.fillText(`Session: ${sid}`, 10 * scale, 85 * scale);
        ctx.restore();

        // Top-Right Badge
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(displayWidth - badgeW * 0.8, 0, badgeW * 0.8, badgeH);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.font = `bold ${badgeFont1}px Inter, monospace`;
        ctx.fillText(`Page ${currentPage}/${totalPages}`, displayWidth - 10 * scale, 25 * scale);
        ctx.font = `${badgeFont2}px Inter, monospace`;
        ctx.fillText(`IP: ${userIP}`, displayWidth - 10 * scale, 45 * scale);
        ctx.fillText(`${date}`, displayWidth - 10 * scale, 65 * scale);
        ctx.fillText(`View Only`, displayWidth - 10 * scale, 85 * scale);
        ctx.restore();

        // Bottom-Left Badge
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, displayHeight - badgeH * 0.8, badgeW * 0.9, badgeH * 0.8);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.font = `bold ${badgeFont2}px Inter, monospace`;
        ctx.fillText(`ConServe Repository`, 10 * scale, displayHeight - 55 * scale);
        ctx.font = `${badgeFont2 * 0.9}px Inter, monospace`;
        ctx.fillText(`NEUST College of Nursing`, 10 * scale, displayHeight - 35 * scale);
        ctx.fillText(`© ${now.getFullYear()} - All Rights Reserved`, 10 * scale, displayHeight - 15 * scale);
        ctx.restore();

        // Bottom-Right Badge
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(displayWidth - badgeW * 0.9, displayHeight - badgeH * 0.8, badgeW * 0.9, badgeH * 0.8);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.font = `bold ${badgeFont2}px Inter, monospace`;
        ctx.fillText(`${user?.firstName || ''} ${user?.lastName || ''}`, displayWidth - 10 * scale, displayHeight - 55 * scale);
        ctx.font = `${badgeFont2 * 0.9}px Inter, monospace`;
        ctx.fillText(`${user?.email || 'Confidential'}`, displayWidth - 10 * scale, displayHeight - 35 * scale);
        ctx.fillText(`Unauthorized copy prohibited`, displayWidth - 10 * scale, displayHeight - 15 * scale);
        ctx.restore();
        
        // 🔥 DIAGONAL WATERMARKS - SCALE RESPONSIVE
        const drawDiagonalWatermark = (offsetX = 0, offsetY = 0) => {
          ctx.save();
          ctx.translate(displayWidth / 2 + offsetX, displayHeight / 2 + offsetY);
          ctx.rotate(-35 * Math.PI / 180);
          
          const centerFont1 = Math.max(24, 72 * scale);
          const centerFont2 = Math.max(20, 56 * scale);
          const centerFont3 = Math.max(16, 48 * scale);
          const centerFont4 = Math.max(14, 40 * scale);
          const centerFont5 = Math.max(12, 32 * scale);
          const centerFont6 = Math.max(10, 28 * scale);
          
          ctx.globalAlpha = 0.22;
          ctx.font = `bold ${centerFont1}px Inter, sans-serif`;
          ctx.fillStyle = '#1e3a8a';
          ctx.textAlign = 'center';
          ctx.fillText(`🔒 ${user?.firstName || 'PROTECTED'} ${user?.lastName || 'DOCUMENT'}`, 0, -100 * scale);
          
          ctx.font = `bold ${centerFont2}px Inter, monospace`;
          ctx.globalAlpha = 0.20;
          ctx.fillText(`ID: ${user?.studentId || 'N/A'}`, 0, -30 * scale);
          
          ctx.font = `bold ${centerFont3}px Inter, sans-serif`;
          ctx.globalAlpha = 0.18;
          ctx.fillText(`${user?.email || 'CONFIDENTIAL'}`, 0, 35 * scale);
          
          ctx.font = `${centerFont4}px Inter, sans-serif`;
          ctx.globalAlpha = 0.16;
          ctx.fillText(`${date} • ${time}`, 0, 90 * scale);
          
          ctx.font = `bold ${centerFont5}px Inter, monospace`;
          ctx.globalAlpha = 0.14;
          ctx.fillText(`Session: ${sid} | IP: ${userIP}`, 0, 140 * scale);
          
          ctx.font = `${centerFont6}px Inter, sans-serif`;
          ctx.globalAlpha = 0.12;
          ctx.fillText(`Page ${currentPage} of ${totalPages}`, 0, 185 * scale);
          
          ctx.restore();
        };
        
        // 🔥 SOLUTION 4: Multiple watermarks at low zoom for complete coverage
        if (useMultiWatermark) {
          const offsetX = displayWidth / 4;
          const offsetY = displayHeight / 4;
          drawDiagonalWatermark(-offsetX, -offsetY);
          drawDiagonalWatermark(offsetX, -offsetY);
          drawDiagonalWatermark(-offsetX, offsetY);
          drawDiagonalWatermark(offsetX, offsetY);
        } else {
          drawDiagonalWatermark();
        }
        
      } catch (err) { 
        setError(`Render failed: ${err.message}`); 
      }
    };
    render();
  }, [pdf, currentPage, scale, user, userIP, totalPages]);

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

  // 🔥 FIT TO WIDTH WITH PROPER SCALING
  const fitToWidth = () => {
    if (!pdf || !containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth - 48;
    const pageWidth = 612; // Standard PDF page width at scale 1
    const newScale = Math.min(containerWidth / pageWidth, 2.5);
    setScale(newScale);
  };

  // 🔥 DOUBLE-TAP TO RESET ZOOM (Mobile UX)
  const lastTap = useRef(0);
  const handleCanvasTouch = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setScale(1.0); // Reset to 100%
      showToast('🔄 Reset to 100%', 'success');
    }
    lastTap.current = now;
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

  const elapsed = Math.floor((Date.now() - startTimeRef.current) / 60000);
  const remaining = Math.max(0, 30 - elapsed);

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={()=>setToast({...toast,show:false})} duration={2000}/>}
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
                <p className="font-mono mt-1">👤{user?.email}</p>
</div>
</div>
</div>
)}
{/* 🔥 ENHANCED HEADER WITH ZOOM PRESETS */}
    <div className="bg-gradient-to-r from-navy to-accent px-3 py-2 flex items-center justify-between border-b border-blue-400/20">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Shield className="text-blue-300 flex-shrink-0" size={18}/>
        <div className="min-w-0 flex-1">
          <h3 className="text-white font-bold text-xs md:text-sm truncate">🔒 {paperTitle}</h3>
          <p className="text-blue-200 text-xs truncate hidden md:block">{user?.email} | {userIP}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {/* Mobile: Compact Zoom */}
        <div className="flex md:hidden items-center gap-1">
          <button onClick={()=>setScale(s=>Math.max(0.5,s-0.2))} disabled={scale<=0.5} className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-50">
            <ZoomOut size={14}/>
          </button>
          <span className="text-white text-xs px-2 py-1 min-w-[50px] text-center font-mono bg-white/10 rounded font-bold">
            {Math.round(scale*100)}%
          </span>
          <button onClick={()=>setScale(s=>Math.min(3,s+0.2))} disabled={scale>=3} className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-50">
            <ZoomIn size={14}/>
          </button>
        </div>

        {/* Desktop: Zoom Presets */}
        <div className="hidden md:flex items-center gap-1">
          {ZOOM_PRESETS.map(z => (
            <button 
              key={z}
              onClick={() => setScale(z)}
              className={`px-2 py-1 text-xs font-bold rounded transition ${
                Math.abs(scale - z) < 0.1 
                  ? 'bg-white text-navy' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {Math.round(z*100)}%
            </button>
          ))}
        </div>
        
        <button onClick={fitToWidth} className="p-1.5 md:p-2 bg-blue-500 hover:bg-blue-600 rounded text-white" title="Fit to Width">
          <Maximize2 size={16}/>
        </button>
        <div className="w-px h-4 md:h-6 bg-blue-400/30 mx-1"></div>
        <button onClick={onClose} className="p-1.5 md:p-2 bg-red-500 hover:bg-red-600 rounded text-white">
          <X size={16}/>
        </button>
      </div>
    </div>
    
    {/* 🔥 ENHANCED CANVAS CONTAINER */}
    <div ref={containerRef} className="flex-1 overflow-auto bg-gray-900 p-4 md:p-6" style={{display:'flex',alignItems:'flex-start',justifyContent:'center'}}>
      <canvas 
        ref={canvasRef} 
        onTouchStart={handleCanvasTouch}
        className="shadow-2xl border border-blue-500/30 rounded-lg" 
        style={{
          maxWidth:'100%',
          height:'auto',
          imageRendering:'crisp-edges',
          filter:isBlocked?'blur(50px) brightness(0.3)':'none',
          pointerEvents:isBlocked?'none':'auto',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none'
        }}
      />
    </div>
    
    {/* 🔥 ENHANCED FOOTER */}
    <div className="bg-gradient-to-r from-navy to-accent px-3 py-2 flex items-center justify-between border-t border-blue-400/20">
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
        <div className="text-white text-xs font-bold bg-white/10 px-2 py-1 rounded border border-white/20">
          ⏱️ {remaining}m
        </div>
        <div className="hidden md:block text-white text-xs font-bold bg-blue-500/30 px-2 py-1 rounded border border-blue-400/50">
          🔒 PROTECTED
        </div>
        {violations>0&&(
          <div className="text-white text-xs font-bold bg-orange-500/30 px-2 py-1 rounded border border-orange-400/50 animate-pulse">
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