import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as pdfjsLib from 'pdfjs-dist';

// PRODUCTION FIX: Use JSDelivr CDN (more reliable than unpkg)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const ProtectedPDFViewer = ({ signedPdfUrl, paperTitle, onClose }) => {
  const { user } = useAuth();
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [violations, setViolations] = useState(0);
  const canvasRef = useRef(null);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  console.log('🔧 PDF.js Config:', {
    version: pdfjsLib.version,
    worker: pdfjsLib.GlobalWorkerOptions.workerSrc,
    apiBase: API_BASE,
    signedUrl: signedPdfUrl
  });

  const logViolation = async (type) => {
    try {
      setViolations(prev => prev + 1);
      const token = localStorage.getItem('token');
      const urlParts = signedPdfUrl?.split('/') || [];
      const researchId = urlParts[2];
      
      if (!researchId) return;
      
      await fetch(`${API_BASE}/research/log-violation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ researchId, violationType: type })
      });
    } catch (err) {
      console.error('⚠️ Log violation error:', err);
    }
  };

  // Load PDF with production-ready error handling
  useEffect(() => {
    const loadPDF = async () => {
      try {
        console.log('📄 Loading PDF...');
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required. Please login again.');
        }

        const fullUrl = `${API_BASE}${signedPdfUrl}`;
        console.log('🔗 Fetching from:', fullUrl);
        
        const response = await fetch(fullUrl, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/pdf'
          },
          mode: 'cors',
          credentials: 'omit'
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Server response:', response.status, errorText);
          
          if (response.status === 401) {
            throw new Error('Session expired. Please login again.');
          } else if (response.status === 404) {
            throw new Error('PDF file not found on server.');
          } else {
            throw new Error(`Server error (${response.status}): ${errorText.substring(0, 100)}`);
          }
        }

        const contentType = response.headers.get('content-type');
        console.log('📦 Content-Type:', contentType);
        
        if (!contentType?.includes('pdf')) {
          throw new Error(`Invalid response type: ${contentType}. Expected PDF.`);
        }

        const blob = await response.blob();
        console.log('✅ PDF blob received:', blob.size, 'bytes');
        
        if (blob.size === 0) {
          throw new Error('Received empty PDF file');
        }
        
        const arrayBuffer = await blob.arrayBuffer();
        console.log('🔄 Parsing PDF document...');
        
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
        });

        loadingTask.onProgress = (progress) => {
          if (progress.total > 0) {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            console.log(`⏳ Parsing: ${percent}%`);
          }
        };
        
        const pdfDoc = await loadingTask.promise;
        console.log('✅ PDF loaded successfully:', pdfDoc.numPages, 'pages');
        
        setPdf(pdfDoc);
        setTotalPages(pdfDoc.numPages);
        setError('');
        setLoading(false);
      } catch (err) {
        console.error('❌ PDF Load Error:', err);
        console.error('Error details:', {
          message: err.message,
          name: err.name,
          stack: err.stack
        });
        
        setError(err.message || 'Failed to load PDF. Please try again.');
        setLoading(false);
      }
    };

    if (signedPdfUrl) {
      loadPDF();
    } else {
      setError('No PDF URL provided');
      setLoading(false);
    }
  }, [signedPdfUrl, API_BASE]);

  // Render current page with enhanced watermark
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        console.log(`🎨 Rendering page ${currentPage}...`);
        
        const page = await pdf.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Render PDF page
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;

        // Add multi-layer watermark overlay
        context.save();
        context.globalAlpha = 0.15;
        context.font = 'bold 14px monospace';
        context.fillStyle = '#ff0000';
        context.rotate(-30 * Math.PI / 180);
        
        const watermarkText = `${user?.email || 'PROTECTED'} • ${new Date().toLocaleString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`;
        
        const cols = Math.ceil(canvas.width / 250) + 2;
        const rows = Math.ceil(canvas.height / 120) + 2;
        
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            context.fillText(
              watermarkText,
              col * 280 - 250,
              row * 150 + 30
            );
          }
        }
        context.restore();

        console.log(`✅ Page ${currentPage} rendered successfully`);
      } catch (err) {
        console.error(`❌ Render error on page ${currentPage}:`, err);
        setError(`Failed to render page ${currentPage}: ${err.message}`);
      }
    };

    renderPage();
  }, [pdf, currentPage, scale, user]);

  // Enhanced protection measures
  useEffect(() => {
    const preventContext = (e) => {
      e.preventDefault();
      e.stopPropagation();
      logViolation('right_click');
      alert('⚠️ Right-click is disabled for document protection');
      return false;
    };

    const preventKeys = (e) => {
      const forbidden = [
        e.ctrlKey && ['s', 'p', 'S', 'P'].includes(e.key), // Save/Print
        e.metaKey && ['s', 'p', 'S', 'P'].includes(e.key), // Mac Save/Print
        e.key === 'PrintScreen', // Screenshot
        e.key === 'F12', // DevTools
        e.ctrlKey && e.shiftKey && ['i', 'I', 'c', 'C', 'j', 'J'].includes(e.key), // DevTools
        e.metaKey && e.altKey && ['i', 'I', 'c', 'C', 'j', 'J'].includes(e.key) // Mac DevTools
      ];

      if (forbidden.some(Boolean)) {
        e.preventDefault();
        e.stopPropagation();
        logViolation('keyboard_shortcut');
        alert('🚫 This action is blocked for security reasons');
        return false;
      }
    };

    const detectScreenshot = () => {
      if (document.hidden) {
        logViolation('window_blur_screenshot_attempt');
      }
    };

    const preventCopy = (e) => {
      e.preventDefault();
      logViolation('copy_attempt');
      return false;
    };

    document.addEventListener('contextmenu', preventContext);
    document.addEventListener('keydown', preventKeys);
    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCopy);
    window.addEventListener('blur', detectScreenshot);
    
    // Disable text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    return () => {
      document.removeEventListener('contextmenu', preventContext);
      document.removeEventListener('keydown', preventKeys);
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('cut', preventCopy);
      window.removeEventListener('blur', detectScreenshot);
      
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.mozUserSelect = '';
      document.body.style.msUserSelect = '';
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mb-4 mx-auto"></div>
          <p className="text-white text-xl font-semibold">Loading Protected Document...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait, this may take a moment...</p>
          <div className="mt-4 text-xs text-gray-500">
            <p>• Verifying access permissions</p>
            <p>• Downloading encrypted PDF</p>
            <p>• Applying security watermarks</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-gray-900 rounded-2xl p-8 border-2 border-red-500">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h3 className="text-white text-2xl font-bold mb-3">Failed to Load PDF</h3>
          <p className="text-gray-300 mb-6 text-sm leading-relaxed">{error}</p>
          
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              🔄 Retry Loading
            </button>
            <button 
              onClick={onClose} 
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold"
            >
              ✕ Close
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-6">
            If the problem persists, please contact support
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col select-none">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700 shadow-lg">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <FileText className="text-white flex-shrink-0" size={20} />
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-semibold text-sm truncate">{paperTitle}</h3>
            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setScale(s => Math.max(0.5, s - 0.25))} 
            disabled={scale <= 0.5}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-white text-sm px-3 min-w-[70px] text-center font-mono">
            {Math.round(scale * 100)}%
          </span>
          <button 
            onClick={() => setScale(s => Math.min(3, s + 0.25))} 
            disabled={scale >= 3}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <div className="w-px h-6 bg-gray-600 mx-2"></div>
          <button 
            onClick={onClose} 
            className="p-2 bg-red-600 hover:bg-red-700 rounded text-white transition"
            title="Close Viewer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* PDF Canvas Container */}
      <div className="flex-1 overflow-auto bg-gray-800 flex items-center justify-center p-4">
        <div className="relative">
          <canvas 
            ref={canvasRef} 
            className="shadow-2xl max-w-full border-2 border-gray-700 rounded-lg" 
          />
        </div>
      </div>

      {/* Footer Controls */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-700 shadow-lg">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            title="Previous Page"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-white text-sm px-4 min-w-[140px] text-center font-mono">
            Page {currentPage} / {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            title="Next Page"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-red-400 text-xs font-bold">
            🔒 PROTECTED DOCUMENT
          </div>
          {violations > 0 && (
            <div className="text-orange-400 text-xs font-bold animate-pulse">
              ⚠️ {violations} Violation{violations > 1 ? 's' : ''} Logged
            </div>
          )}
        </div>
      </div>

      {/* Bottom Security Notice */}
      <div className="bg-red-600 px-4 py-2 text-center">
        <p className="text-white text-xs font-bold">
          🚫 NO DOWNLOAD • NO PRINT • NO COPY • All actions are monitored and logged
        </p>
      </div>
    </div>
  );
};

export default ProtectedPDFViewer;