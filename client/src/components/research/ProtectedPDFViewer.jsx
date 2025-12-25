// client/src/components/research/ProtectedPDFViewer.jsx
// ENHANCED SECURITY VERSION with Canvas Fingerprinting, Blur-on-Focus, Enhanced Watermarks, Session Limits
import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText, AlertCircle, Maximize2, Lock } from 'lucide-react';
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
  const [isBlurred, setIsBlurred] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'warning' });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

  const showToast = (msg, type = 'warning') => {
    setToast({ show: true, message: msg, type });
  };

  // Get user IP
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => setUserIP(d.ip))
      .catch(() => setUserIP('IP unavailable'));
  }, []);

  // SESSION TIME LIMIT (Enhancement #4)
  useEffect(() => {
    sessionTimerRef.current = setTimeout(() => {
      setSessionExpired(true);
      showToast('⏰ Session expired for security. Please re-open the document.', 'error');
      setTimeout(onClose, 3000);
    }, SESSION_DURATION);

    return () => clearTimeout(sessionTimerRef.current);
  }, []);

  // BLUR ON FOCUS LOSS (Enhancement #3)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
        logViolation('window_blur');
        showToast('🔒 Document blurred for security', 'warning');
      }
    };

    const handleBlur = () => {
      setIsBlurred(true);
      logViolation('focus_loss');
    };

    const handleFocus = () => {
      setTimeout(() => setIsBlurred(false), 500);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const logViolation = async (type) => {
    setViolations(prev => prev + 1);
    try {
      const token = localStorage.getItem('token');
      const urlParts = signedPdfUrl?.split('/') || [];
      const researchId = urlParts[2];
      if (researchId) {
        await fetch(`${API_BASE}/research/log-violation`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ researchId, violationType: type })
        });
      }
    } catch (err) {
      console.error('⚠️ Log violation error:', err);
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

        if (!response.ok) {
          if (response.status === 401) throw new Error('Session expired');
          if (response.status === 404) throw new Error('PDF not found');
          throw new Error(`Server error (${response.status})`);
        }

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

  // ENHANCED RENDERING with Canvas Fingerprinting (Enhancement #1)
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

        // CANVAS FINGERPRINTING PROTECTION (Enhancement #1)
        // Add imperceptible noise to prevent pixel-perfect copying
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        for (let i = 0; i < pixels.length; i += 4) {
          if (Math.random() > 0.995) { // 0.5% of pixels
            const noise = Math.floor(Math.random() * 3) - 1;
            pixels[i] = Math.max(0, Math.min(255, pixels[i] + noise));
            pixels[i+1] = Math.max(0, Math.min(255, pixels[i+1] + noise));
            pixels[i+2] = Math.max(0, Math.min(255, pixels[i+2] + noise));
          }
        }
        context.putImageData(imageData, 0, 0);

        // ENHANCED DYNAMIC WATERMARKING (Enhancement #4)
        context.save();
        context.globalAlpha = 0.12;
        context.font = 'bold 11px Arial';
        context.fillStyle = '#FF0000';
        
        const now = new Date();
        const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        
        const line1 = `${user?.email || 'PROTECTED'} | ID: ${user?.studentId || 'N/A'}`;
        const line2 = `IP: ${userIP} | Session: ${sessionId}`;
        const line3 = `${timestamp} | Page ${currentPage}/${totalPages}`;

        const textWidth = 300;
        const textHeight = 65;
        const cols = Math.ceil(canvas.width / textWidth) + 1;
        const rows = Math.ceil(canvas.height / textHeight) + 1;
        
        // Add random offset for each render (makes removal harder)
        const offsetX = Math.random() * 50;
        const offsetY = Math.random() * 50;

        context.rotate(-35 * Math.PI / 180);

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = col * textWidth * 1.5 - 200 + offsetX;
            const y = row * textHeight * 1.5 + offsetY;
            
            context.shadowColor = 'rgba(0, 0, 0, 0.4)';
            context.shadowBlur = 3;
            context.shadowOffsetX = 1;
            context.shadowOffsetY = 1;
            
            context.fillText(line1, x, y);
            context.fillText(line2, x, y + 14);
            context.fillText(line3, x, y + 28);
          }
        }
        
        context.restore();

        // Add invisible forensic watermark in corner (steganography-style)
        context.globalAlpha = 0.01;
        context.fillStyle = '#000000';
        context.font = '8px monospace';
        const forensicId = `${user?.id}-${Date.now()}-${currentPage}`;
        context.fillText(forensicId, 10, canvas.height - 10);

      } catch (err) {
        setError(`Render failed: ${err.message}`);
      }
    };

    renderPage();
  }, [pdf, currentPage, scale, user, userIP]);

  // ENHANCED SECURITY LISTENERS with Toast Notifications
  useEffect(() => {
    const preventContext = (e) => {
      e.preventDefault();
      logViolation('right_click');
      showToast('🚫 Right-click is disabled for security', 'warning');
      return false;
    };

    const preventKeys = (e) => {
      const blocked = [
        e.ctrlKey && ['s', 'p', 'c', 'a', 'u'].includes(e.key.toLowerCase()),
        e.metaKey && ['s', 'p', 'c', 'a', 'u'].includes(e.key.toLowerCase()),
        e.key === 'PrintScreen' || e.key === 'Print',
        e.key === 'F12',
        e.ctrlKey && e.shiftKey && ['i', 'c', 'j', 'k'].includes(e.key.toLowerCase())
      ];

      if (blocked.some(Boolean)) {
        e.preventDefault();
        logViolation('keyboard_shortcut');
        showToast('🚫 This action is blocked for security', 'warning');
        return false;
      }
    };

    // Screenshot detection attempt
    const detectScreenshot = () => {
      logViolation('screenshot_attempt');
      showToast('📸 Screenshot detected - All activity is logged', 'error');
    };

    document.addEventListener('contextmenu', preventContext);
    document.addEventListener('keydown', preventKeys);
    document.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen') detectScreenshot();
    });
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    return () => {
      document.removeEventListener('contextmenu', preventContext);
      document.removeEventListener('keydown', preventKeys);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mb-4 mx-auto"></div>
          <p className="text-white text-xl font-semibold">Loading Protected Document...</p>
          <p className="text-gray-400 text-sm mt-2">Initializing security layers...</p>
        </div>
      </div>
    );
  }

  if (error || sessionExpired) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-gray-900 rounded-2xl p-8 border-2 border-red-500">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h3 className="text-white text-2xl font-bold mb-3">
            {sessionExpired ? 'Session Expired' : 'Failed to Load PDF'}
          </h3>
          <p className="text-gray-300 mb-6 text-sm leading-relaxed">
            {sessionExpired ? 'For security, viewing sessions expire after 30 minutes.' : error}
          </p>
          
          <div className="space-y-3">
            {!sessionExpired && (
              <button 
                onClick={() => window.location.reload()} 
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                🔄 Retry
              </button>
            )}
            <button 
              onClick={onClose} 
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold"
            >
              ✕ Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const elapsed = Math.floor((Date.now() - startTimeRef.current) / 60000);
  const remaining = Math.max(0, 30 - elapsed);

  return (
    <>
      {toast.show && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
          duration={3000}
        />
      )}

      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col select-none">
        {/* Header */}
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700 shadow-lg">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Lock className="text-red-500 flex-shrink-0 animate-pulse" size={20} />
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-semibold text-sm truncate">{paperTitle}</h3>
              <p className="text-gray-400 text-xs truncate">{user?.email} | IP: {userIP}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setScale(s => Math.max(0.5, s - 0.2))} 
              disabled={scale <= 0.5}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition disabled:opacity-50"
            >
              <ZoomOut size={18} />
            </button>
            <span className="text-white text-sm px-3 min-w-[70px] text-center font-mono bg-gray-700 rounded py-1">
              {Math.round(scale * 100)}%
            </span>
            <button 
              onClick={() => setScale(s => Math.min(3, s + 0.2))} 
              disabled={scale >= 3}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition disabled:opacity-50"
            >
              <ZoomIn size={18} />
            </button>
            <button 
              onClick={fitToWidth}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition"
            >
              <Maximize2 size={18} />
            </button>
            <div className="w-px h-6 bg-gray-600 mx-2"></div>
            <button onClick={onClose} className="p-2 bg-red-600 hover:bg-red-700 rounded text-white transition">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Canvas with Blur Effect */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto bg-gray-800 p-6 relative"
          style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}
        >
          <canvas 
            ref={canvasRef} 
            className="shadow-2xl border-2 border-gray-700 rounded-lg transition-all duration-300" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              imageRendering: 'high-quality',
              filter: isBlurred ? 'blur(20px)' : 'none',
              pointerEvents: isBlurred ? 'none' : 'auto'
            }}
          />
          
          {isBlurred && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-gray-900 rounded-2xl p-8 text-center border-2 border-red-500 max-w-md">
                <Lock className="mx-auto text-red-500 mb-4" size={64} />
                <h3 className="text-white text-xl font-bold mb-2">Document Locked</h3>
                <p className="text-gray-400 text-sm mb-4">Click here to resume viewing</p>
                <button
                  onClick={() => {
                    setIsBlurred(false);
                    window.focus();
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Resume Viewing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-700 shadow-lg">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white disabled:opacity-50 transition"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-white text-sm px-4 min-w-[140px] text-center font-mono bg-gray-700 rounded py-1">
              Page {currentPage} / {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white disabled:opacity-50 transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-yellow-400 text-xs font-bold">
              ⏱️ {remaining}m remaining
            </div>
            <div className="text-red-400 text-xs font-bold">🔒 PROTECTED</div>
            {violations > 0 && (
              <div className="text-orange-400 text-xs font-bold animate-pulse">
                ⚠️ {violations} Violation{violations > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        <div className="bg-red-600 px-4 py-2 text-center">
          <p className="text-white text-xs font-bold">
            🚫 NO DOWNLOAD • NO PRINT • NO COPY • SCREENSHOTS LOGGED • Session expires: {remaining}min • IP: {userIP}
          </p>
        </div>
      </div>
    </>
  );
};

export default ProtectedPDFViewer;