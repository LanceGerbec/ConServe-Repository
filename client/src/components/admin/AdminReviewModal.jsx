import { useState } from 'react';
import { X, CheckCircle, XCircle, FileText, User, Calendar, Tag } from 'lucide-react';
import ProtectedPDFViewer from '../research/ProtectedPDFViewer';

const AdminReviewModal = ({ paper, onClose, onSuccess }) => {
  const [decision, setDecision] = useState('approved');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState('');

  const handleOpenPDF = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      
      // Direct URL construction
      const url = `${import.meta.env.VITE_API_URL}/research/${paper._id}/pdf`;
      
      console.log('📄 Opening PDF:', url);
      
      // Test the URL
      const testRes = await fetch(url, {
        method: 'HEAD',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!testRes.ok) {
        throw new Error(`PDF not accessible (${testRes.status})`);
      }

      setPdfUrl(url);
      setShowPDF(true);
    } catch (err) {
      console.error('❌ PDF Error:', err);
      setError(err.message || 'Failed to load PDF');
      alert(`Failed to open PDF: ${err.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!notes.trim()) {
      alert('Please provide review notes');
      return;
    }

    setLoading(true);
    setError('');
    
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
        const msg = {
          approved: '✅ Research approved successfully!',
          rejected: '❌ Research rejected.',
          revision: '📝 Revisions requested.'
        }[decision] || 'Status updated';
        
        alert(msg);
        onSuccess();
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (showPDF && pdfUrl) {
    return (
      <ProtectedPDFViewer 
        pdfUrl={pdfUrl}
        paperTitle={paper.title}
        onClose={() => {
          setShowPDF(false);
          setPdfUrl(null);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review Research Paper</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg text-red-700 dark:text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Paper Info */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4">{paper.title}</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>Submitted by:</strong> {paper.submittedBy?.firstName} {paper.submittedBy?.lastName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>Date:</strong> {new Date(paper.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>Year Completed:</strong> {paper.yearCompleted || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>Subject:</strong> {paper.subjectArea || 'Not specified'}
                </span>
              </div>
            </div>

            {/* Authors */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">📝 Authors:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {paper.authors.join(' • ')}
              </p>
            </div>
          </div>

          {/* Abstract */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Abstract</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {paper.abstract}
            </p>
          </div>

          {/* Keywords */}
          {paper.keywords?.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {paper.keywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-navy/10 text-navy dark:bg-accent/10 dark:text-accent rounded-full text-sm">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PDF Viewer Button */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">View Full Document</h4>
            <button 
              type="button"
              onClick={handleOpenPDF}
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              <FileText size={18} />
              Open PDF Viewer
            </button>
          </div>

          {/* Decision */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Decision <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              {[
                { value: 'approved', label: 'Approve', color: 'green' },
                { value: 'revision', label: 'Request Revision', color: 'yellow' },
                { value: 'rejected', label: 'Reject', color: 'red' }
              ].map(({ value, label, color }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    value={value}
                    checked={decision === value}
                    onChange={(e) => setDecision(e.target.value)}
                    className={`w-4 h-4 text-${color}-600`}
                  />
                  <span className="text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Review Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Review Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Provide detailed feedback..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !notes.trim()}
              className={`flex-1 px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50 transition ${
                decision === 'approved' ? 'bg-green-500 hover:bg-green-600' :
                decision === 'rejected' ? 'bg-red-500 hover:bg-red-600' :
                'bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              {loading ? 'Submitting...' : (
                decision === 'approved' ? '✓ Approve' :
                decision === 'rejected' ? '✗ Reject' :
                '📝 Request Revision'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReviewModal;