// client/src/components/research/ProtectedPDFViewer.jsx
import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

let pdfjsLib = null;

const initPdfJs = async () => {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  return pdfjsLib;
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
  const [isBlocked, setIsBlocked] = useState(false);
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const blockContent = (reason) => {
    setIsBlocked(true);
    setViolations(prev => prev + 1);
    setTimeout(() => setIsBlocked(false), 1500);
    if (violations >= 4) setTimeout(onClose, 2000);
  };

  useEffect(() => {
    const loadPDF = async () => {
  try {
    const API_URL = import.meta.env.VITE_API_URL; // e.g., https://backend.com/api
    
    let url;
    if (pdfUrl.startsWith('http')) {
      url = pdfUrl; // Direct Cloudinary URL
    } else if (pdfUrl.startsWith('/api/')) {
      // Already has /api, use base URL without /api
      const baseURL = API_URL.replace(/\/api$/, '');
      url = `${baseURL}${pdfUrl}`;
    } else {
      // No /api prefix, add it
      url = `${API_URL}${pdfUrl.startsWith('/') ? '' : '/'}${pdfUrl}`;
    }
    
    console.log('📄 Full URL:', url);
        
        const pdfjs = await initPdfJs();
        const token = localStorage.getItem('token');
        
        if (!token) throw new Error('Auth required');
        
        const res = await fetch(url, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/pdf'
          },
          redirect: 'follow'
        });
        
        console.log('📄 Response:', res.status, res.statusText);
        
        if (!res.ok) {
          if (res.status === 404) throw new Error('PDF not found');
          if (res.status === 403) throw new Error('Access denied');
          throw new Error(`Error ${res.status}`);
        }
        
        const blob = await res.blob();
        console.log('📄 Blob size:', blob.size);
        
        if (blob.size < 100) throw new Error('Invalid PDF file');
        
        const arr = await blob.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: arr }).promise;
        
        console.log('✅ PDF loaded, pages:', doc.numPages);
        
        setPdf(doc);
        setTotalPages(doc.numPages);
        setLoading(false);
      } catch (err) {
        console.error('❌ PDF Error:', err);
        setError(err.message || 'Failed to load');
        setLoading(false);
      }
    };
    
    if (pdfUrl) loadPDF();
  }, [pdfUrl]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    
    const render = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const vp = page.getViewport({ scale });
        
        canvas.height = vp.height;
        canvas.width = vp.width;
        
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        
        // Watermark
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(-35 * Math.PI/180);
        ctx.globalAlpha = 0.12;
        ctx.font = 'bold 48px Inter';
        ctx.fillStyle = '#1e3a8a';
        ctx.textAlign = 'center';
        ctx.fillText(user?.email || 'Protected', 0, 0);
        ctx.restore();
      } catch (err) {
        console.error('Render error:', err);
      }
    };
    
    render();
  }, [pdf, currentPage, scale, user]);

  useEffect(() => {
    const prevent = (e) => { e.preventDefault(); blockContent('Blocked'); };
    const preventKeys = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['s','p','c'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        blockContent('Shortcut Blocked');
      }
    };
    
    ['contextmenu','copy','cut','selectstart','dragstart'].forEach(ev => 
      document.addEventListener(ev, prevent, { passive: false })
    );
    document.addEventListener('keydown', preventKeys);
    
    return () => {
      ['contextmenu','copy','cut','selectstart','dragstart'].forEach(ev => 
        document.removeEventListener(ev, prevent)
      );
      document.removeEventListener('keydown', preventKeys);
    };
  }, [violations]);

  const fitToWidth = () => {
    if (!containerRef.current || !canvasRef.current) return;
    const w = containerRef.current.clientWidth - 48;
    const pw = canvasRef.current.width / scale;
    setScale(Math.min(w/pw, 2.5));
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mb-4 mx-auto"></div>
        <p className="text-white text-xl font-bold">Loading PDF...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md bg-gray-900 rounded-2xl p-8 border-2 border-red-500">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={64}/>
        <h3 className="text-white text-2xl font-bold mb-3">Failed to Load PDF</h3>
        <p className="text-gray-300 mb-6 text-sm">{error}</p>
        <button onClick={onClose} className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold">
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col select-none">
      {isBlocked && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-[60]">
          <div className="text-center">
            <Shield size={64} className="text-red-500 mx-auto mb-4 animate-pulse"/>
            <h2 className="text-white text-2xl font-bold">BLOCKED</h2>
            <p className="text-red-400 mt-2">Violation #{violations}/5</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-navy to-accent px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Shield className="text-blue-300 flex-shrink-0" size={20}/>
          <h3 className="text-white font-bold text-sm truncate">🔒 {paperTitle}</h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={()=>setScale(s=>Math.max(0.5,s-0.2))} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white">
            <ZoomOut size={18}/>
          </button>
          <span className="text-white text-sm px-3 bg-white/10 rounded py-1.5">{Math.round(scale*100)}%</span>
          <button onClick={()=>setScale(s=>Math.min(3,s+0.2))} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white">
            <ZoomIn size={18}/>
          </button>
          <button onClick={fitToWidth} className="p-2 bg-blue-500 hover:bg-blue-600 rounded text-white">
            <Maximize2 size={18}/>
          </button>
          <button onClick={onClose} className="p-2 bg-red-500 hover:bg-red-600 rounded text-white">
            <X size={18}/>
          </button>
        </div>
      </div>
      
      {/* PDF Canvas */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-gray-900 p-6 flex items-start justify-center">
        <canvas ref={canvasRef} className="shadow-2xl border border-blue-500/30 rounded-lg" style={{maxWidth:'100%',height:'auto'}}/>
      </div>
      
      {/* Footer */}
      <div className="bg-gradient-to-r from-navy to-accent px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronLeft size={18}/>
          </button>
          <span className="text-white text-sm px-4 bg-white/10 rounded py-1.5">Page {currentPage}/{totalPages}</span>
          <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronRight size={18}/>
          </button>
        </div>
        <div className="text-white text-xs bg-blue-500/30 px-3 py-1 rounded">🔒 PROTECTED</div>
      </div>
    </div>
  );
};

export default ProtectedPDFViewer;