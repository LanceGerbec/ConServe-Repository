import { useState, useCallback, memo } from 'react';
import { X, FileText, User, Calendar, Tag, CheckCircle, XCircle, FileEdit } from 'lucide-react';
import ProtectedPDFViewer from '../research/ProtectedPDFViewer';
import Toast from '../common/Toast';

const AdminReviewModal = memo(({ paper, onClose, onSuccess }) => {
  const [decision, setDecision] = useState('approved');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const pdfUrl = `${import.meta.env.VITE_API_URL}/research/${paper._id}/pdf`;

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
  }, []);

  const handleOpenPDF = useCallback(() => setShowPDF(true), []);
  const closePDF = useCallback(() => setShowPDF(false), []);

  const handleSubmit = useCallback(async () => {
    if (!notes.trim()) {
      showToast('Please provide review notes', 'warning');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/research/${paper._id}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: decision, revisionNotes: notes })
      });

      if (res.ok) {
        const messages = {
          approved: 'Research approved successfully',
          rejected: 'Research rejected',
          revision: 'Revisions requested'
        };
        showToast(messages[decision] || 'Status updated successfully', 'success');
        
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [decision, notes, paper._id, onSuccess, showToast]);

  if (showPDF) {
    return <ProtectedPDFViewer pdfUrl={pdfUrl} paperTitle={paper.title} onClose={closePDF} />;
  }

  const decisionOptions = [
    { value: 'approved', label: 'Approve', Icon: CheckCircle, color: 'text-green-600' },
    { value: 'revision', label: 'Request Revision', Icon: FileEdit, color: 'text-yellow-600' },
    { value: 'rejected', label: 'Reject', Icon: XCircle, color: 'text-red-600' }
  ];

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

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review Research Paper</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition" aria-label="Close">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Paper Info */}
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4">{paper.title}</h3>
              
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 truncate">
                    {paper.submittedBy?.firstName} {paper.submittedBy?.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {new Date(paper.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Year: {paper.yearCompleted || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 truncate">{paper.subjectArea || 'Not specified'}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-1">
                  <FileText size={14} />Authors:
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{paper.authors.join(' • ')}</p>
              </div>
            </div>

            {/* Abstract */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Abstract</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4">{paper.abstract}</p>
            </div>

            {/* Keywords */}
            {paper.keywords?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {paper.keywords.slice(0, 6).map((kw, i) => (
                    <span key={i} className="px-2 py-1 bg-navy/10 text-navy dark:bg-accent/10 dark:text-accent rounded-full text-xs">
                      {kw}
                    </span>
                  ))}
                  {paper.keywords.length > 6 && (
                    <span className="px-2 py-1 text-gray-500 text-xs">+{paper.keywords.length - 6} more</span>
                  )}
                </div>
              </div>
            )}

            {/* PDF Button */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">View Full Document</h4>
              <button type="button" onClick={handleOpenPDF} className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold shadow-lg active:scale-95">
                <FileText size={18} />Open PDF Viewer
              </button>
            </div>

            {/* Decision */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Decision <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4 flex-wrap">
                {decisionOptions.map(({ value, label, Icon, color }) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="decision" value={value} checked={decision === value} onChange={(e) => setDecision(e.target.value)} className="w-4 h-4" />
                    <Icon size={16} className={color} />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Review Notes <span className="text-red-500">*</span>
              </label>
              <textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm" placeholder="Provide detailed feedback..." />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold">
                Cancel
              </button>
              <button type="button" onClick={handleSubmit} disabled={loading || !notes.trim()} className={`flex-1 px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50 transition shadow-lg ${
                decision === 'approved' ? 'bg-green-500 hover:bg-green-600' :
                decision === 'rejected' ? 'bg-red-500 hover:bg-red-600' :
                'bg-yellow-500 hover:bg-yellow-600'
              }`}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <>
                    {decision === 'approved' ? (
                      <span className="flex items-center justify-center gap-2"><CheckCircle size={16} /> Approve</span>
                    ) : decision === 'rejected' ? (
                      <span className="flex items-center justify-center gap-2"><XCircle size={16} /> Reject</span>
                    ) : (
                      <span className="flex items-center justify-center gap-2"><FileEdit size={16} /> Request Revision</span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

AdminReviewModal.displayName = 'AdminReviewModal';
export default AdminReviewModal;