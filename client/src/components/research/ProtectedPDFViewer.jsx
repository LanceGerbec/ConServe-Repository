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
  const screenshotAttempts = useRef(0);
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const SESSION_DURATION = 30 * 60 * 1000;
  const MAX_VIOLATIONS = 5;

  const showToast = (msg, type = 'warning') => setToast({ show: true, message: msg, type });

  const blockContent = (reason) => {
    setIsBlocked(true);
    setBlockReason(reason);
    logViolation(reason);
    showToast(`🚫 ${reason}`, 'error');
    screenshotAttempts.current++;
    
    if (violations >= MAX_VIOLATIONS - 1 || screenshotAttempts.current >= 3) {
      setTimeout(() => {
        showToast('⚠️ Too many violations - Closing', 'error');
        setTimeout(onClose, 2000);
      }, 3000);
    }
  };

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
      if (e.key === 'PrintScreen' || e.keyCode === 44) { 
        screenshotAttempts.current++; 
        blockContent('💻 Screenshot Blocked'); 
        setTimeout(() => { if (screenshotAttempts.current < 3) setIsBlocked(false); }, 3000); 
      } 
    };
    document.addEventListener('keyup', detect);
    return () => document.removeEventListener('keyup', detect);
  }, [violations]);

  const logViolation = async (type) => {
    setViolations(prev => { 
      const n = prev + 1; 
      if (n >= MAX_VIOLATIONS) setTimeout(onClose, 2000); 
      return n; 
    });
    try {
      const token = localStorage.getItem('token');
      const researchId = signedPdfUrl?.split('/')[2]?.split('?')[0];
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
        
        const res = await fetch(`${API_BASE}${signedPdfUrl}`, { 
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Accept': 'application/pdf' 
          }, 
          mode: 'cors',
          redirect: 'follow'
        });
        
        if (!res.ok) throw new Error(res.status === 401 ? 'Session expired' : `Error ${res.status}`);
        
        const blob = await res.blob();
        if (blob.size === 0) throw new Error('Empty file');
        const arr = await blob.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: arr, verbosity: 0 }).promise;
        setPdf(doc);
        setTotalPages(doc.numPages);
        setLoading(false);
      } catch (err) { 
        console.error('❌ PDF Load Error:', err);
        setError(err.message || 'Load failed'); 
        setLoading(false); 
      }
    };
    if (signedPdfUrl) loadPDF(); 
    else { 
      setError('No URL'); 
      setLoading(false); 
    }
  }, [signedPdfUrl, API_BASE]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    const render = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false });
        const vp = page.getViewport({ scale });
        canvas.height = vp.height; 
        canvas.width = vp.width;
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(-35 * Math.PI/180);
        ctx.globalAlpha = 0.12;
        ctx.font = 'bold 64px Inter, sans-serif';
        ctx.fillStyle = '#1e3a8a';
        ctx.textAlign = 'center';
        ctx.fillText(`${user?.firstName || 'Protected'} ${user?.lastName || 'Document'}`, 0, -40);
        ctx.font = 'bold 42px Inter, sans-serif';
        ctx.globalAlpha = 0.10;
        ctx.fillText(`${user?.email || 'Confidential'}`, 0, 20);
        ctx.font = 'bold 36px Inter, sans-serif';
        ctx.globalAlpha = 0.12;
        ctx.fillText(`ID: ${user?.studentId || 'N/A'}`, 0, 70);
        ctx.font = '32px Inter, sans-serif';
        ctx.globalAlpha = 0.10;
        ctx.fillText(`${date} • ${time}`, 0, 115);
        ctx.restore();

        const badge = (txt, x, y, align='left') => {
          ctx.save();
          ctx.font = 'bold 11px Inter, monospace';
          ctx.fillStyle = '#1e3a8a';
          ctx.textAlign = align;
          const m = ctx.measureText(txt);
          const pad = 8;
          const bgX = align === 'right' ? x - m.width - pad*2 : x;
          ctx.globalAlpha = 0.12;
          ctx.fillStyle = '#eff6ff';
          ctx.fillRect(bgX, y-12, m.width+pad*2, 22);
          ctx.globalAlpha = 0.18;
          ctx.strokeStyle = '#1e3a8a';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bgX, y-12, m.width+pad*2, 22);
          ctx.globalAlpha = 0.30;
          ctx.fillStyle = '#1e40af';
          ctx.fillText(txt, x+(align==='right'?-pad:pad), y);
          ctx.restore();
        };

        badge(`👤 ${user?.email?.substring(0,25)||'User'}`, 15, 25);
        badge(`📍 ${userIP}`, 15, canvas.height-15);
        badge(`${date} ${time} • Pg${currentPage}/${totalPages}`, canvas.width-15, canvas.height-15, 'right');
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
    ['contextmenu','keydown','copy','cut','paste','selectstart','dragstart','drag','drop'].forEach(ev => 
      document.addEventListener(ev, ev==='keydown'?preventKeys:prevent, { passive: false })
    );
    return () => ['contextmenu','keydown','copy','cut','paste','selectstart','dragstart','drag','drop'].forEach(ev => 
      document.removeEventListener(ev, ev==='keydown'?preventKeys:prevent)
    );
  }, []);

  const fitToWidth = () => { 
    if (!pdf || !containerRef.current || !canvasRef.current) return; 
    const w = containerRef.current.clientWidth - 48; 
    const pw = canvasRef.current.width / scale; 
    setScale(Math.min(w/pw, 2.5)); 
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
                <p className="font-mono mt-1">👤 {user?.email}</p>
                <p className="font-mono mt-1">🆔 {user?.studentId}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-gradient-to-r from-navy to-accent px-4 py-3 flex items-center justify-between border-b border-blue-400/20">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Shield className="text-blue-300" size={20}/>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-bold text-sm truncate">🔒 {paperTitle}</h3>
              <p className="text-blue-200 text-xs truncate">{user?.email} | ID: {user?.studentId} | {userIP}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setScale(s=>Math.max(0.5,s-0.2))} disabled={scale<=0.5} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-50">
              <ZoomOut size={18}/>
            </button>
            <span className="text-white text-sm px-3 min-w-[70px] text-center font-mono bg-white/10 rounded py-1.5 font-bold">
              {Math.round(scale*100)}%
            </span>
            <button onClick={()=>setScale(s=>Math.min(3,s+0.2))} disabled={scale>=3} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-50">
              <ZoomIn size={18}/>
            </button>
            <button onClick={fitToWidth} className="p-2 bg-blue-500 hover:bg-blue-600 rounded text-white">
              <Maximize2 size={18}/>
            </button>
            <div className="w-px h-6 bg-blue-400/30 mx-1"></div>
            <button onClick={onClose} className="p-2 bg-red-500 hover:bg-red-600 rounded text-white">
              <X size={18}/>
            </button>
          </div>
        </div>
        
        <div ref={containerRef} className="flex-1 overflow-auto bg-gray-900 p-6" style={{display:'flex',alignItems:'flex-start',justifyContent:'center'}}>
          <canvas 
            ref={canvasRef} 
            className="shadow-2xl border border-blue-500/30 rounded-lg" 
            style={{
              maxWidth:'100%',
              height:'auto',
              imageRendering:'high-quality',
              filter:isBlocked?'blur(50px) brightness(0.3)':'none',
              pointerEvents:isBlocked?'none':'auto',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
          />
        </div>
        
        <div className="bg-gradient-to-r from-navy to-accent px-4 py-3 flex items-center justify-between border-t border-blue-400/20">
          <div className="flex items-center gap-2">
            <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-50">
              <ChevronLeft size={18}/>
            </button>
            <span className="text-white text-sm px-4 min-w-[140px] text-center font-mono bg-white/10 rounded py-1.5 font-bold">
              Page {currentPage}/{totalPages}
            </span>
            <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-50">
              <ChevronRight size={18}/>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-white text-xs font-bold bg-white/10 px-3 py-1 rounded border border-white/20">
              ⏱️ {remaining}m
            </div>
            <div className="text-white text-xs font-bold bg-blue-500/30 px-3 py-1 rounded border border-blue-400/50">
              🔒 PROTECTED
            </div>
            {violations>0&&(
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