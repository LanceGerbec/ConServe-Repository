import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as pdfjsLib from 'pdfjs-dist';

// CRITICAL: Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

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

  const logViolation = async (type) => {
    try {
      setViolations(prev => prev + 1);
      const token = localStorage.getItem('token');
      const urlParts = signedPdfUrl.split('/');
      const researchId = urlParts[2];
      
      await fetch(`${API_BASE}/research/log-violation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ researchId, violationType: type })
      });
    } catch (err) {
      console.error('Log violation error:', err);
    }
  };

  // Load PDF
  useEffect(() => {
    const loadPDF = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}${signedPdfUrl}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load PDF');

        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;
        
        setPdf(pdfDoc);
        setTotalPages(pdfDoc.numPages);
        setLoading(false);
      } catch (err) {
        console.error('PDF load error:', err);
        setError('Failed to load PDF: ' + err.message);
        setLoading(false);
      }
    };

    loadPDF();
  }, [signedPdfUrl]);

  // Render current page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        // Add watermark overlay
        context.save();
        context.globalAlpha = 0.15;
        context.font = '14px monospace';
        context.fillStyle = '#000000';
        context.rotate(-30 * Math.PI / 180);
        
        const watermarkText = `${user?.email} • ${new Date().toLocaleString()}`;
        for (let i = 0; i < 20; i++) {
          context.fillText(watermarkText, (i % 4) * 300 - 200, Math.floor(i / 4) * 150);
        }
        context.restore();

      } catch (err) {
        console.error('Render error:', err);
      }
    };

    renderPage();
  }, [pdf, currentPage, scale, user]);

  // Protection measures
  useEffect(() => {
    const preventContext = (e) => {
      e.preventDefault();
      logViolation('right_click');
      alert('⚠️ Right-click disabled');
      return false;
    };

    const preventKeys = (e) => {
      const blocked = [
        e.ctrlKey && ['s', 'p', 'S', 'P'].includes(e.key),
        e.key === 'PrintScreen',
        e.key === 'F12',
        e.ctrlKey && e.shiftKey && ['i', 'I', 'c', 'C'].includes(e.key)
      ];

      if (blocked.some(Boolean)) {
        e.preventDefault();
        logViolation('keyboard_shortcut');
        alert('🚫 Action blocked');
        return false;
      }
    };

    const detectScreenshot = () => logViolation('screenshot_attempt');

    document.addEventListener('contextmenu', preventContext);
    document.addEventListener('keydown', preventKeys);
    window.addEventListener('blur', detectScreenshot);
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('contextmenu', preventContext);
      document.removeEventListener('keydown', preventKeys);
      window.removeEventListener('blur', detectScreenshot);
      document.body.style.userSelect = '';
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mb-4 mx-auto"></div>
          <p className="text-white">Loading Protected Document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h3 className="text-white text-xl font-bold mb-2">Failed to Load</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={onClose} className="bg-red-600 text-white px-6 py-2 rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col select-none">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <FileText className="text-white" size={20} />
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-semibold text-sm truncate">{paperTitle}</h3>
            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white" title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <span className="text-white text-sm px-2">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, s + 0.25))} className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white" title="Zoom In">
            <ZoomIn size={18} />
          </button>
          <div className="w-px h-6 bg-gray-600 mx-2"></div>
          <button onClick={onClose} className="p-2 bg-red-600 hover:bg-red-700 rounded text-white" title="Close">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div className="flex-1 overflow-auto bg-gray-800 flex items-center justify-center p-4">
        <canvas ref={canvasRef} className="shadow-2xl" />
      </div>

      {/* Footer Controls */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-700">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-white text-sm px-4">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="text-red-400 text-xs font-semibold">
          🔒 PROTECTED • No Download • No Print
          {violations > 0 && ` • ${violations} Violation(s)`}
        </div>
      </div>
    </div>
  );
};

export default ProtectedPDFViewer;