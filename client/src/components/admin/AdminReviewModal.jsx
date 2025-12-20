import { useState } from 'react';
import { X, CheckCircle, XCircle, FileText, User, Calendar } from 'lucide-react';
import ProtectedPDFViewer from '../research/ProtectedPDFViewer';

const AdminReviewModal = ({ paper, onClose, onSuccess }) => {
  const [decision, setDecision] = useState('approved');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [signedUrl, setSignedUrl] = useState(null);

  const handleOpenPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/research/${paper._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        alert('Failed to load PDF');
        return;
      }

      const data = await res.json();
      setSignedUrl(data.paper.signedPdfUrl);
      setShowPDF(true);
    } catch (error) {
      console.error('PDF load error:', error);
      alert('Failed to load PDF: ' + error.message);
    }
  };

const handleSubmit = async () => {
  if (!notes.trim()) {
    alert('Please provide review notes');
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
      const successMessages = {
        approved: '✅ Research approved successfully! Author has been notified.',
        rejected: '❌ Research rejected. Author has been notified.',
        revision: '📝 Revisions requested. Author has been notified.'
      };
      alert(successMessages[decision] || 'Status updated successfully');
      onSuccess();
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to update status');
    }
  } catch (error) {
    alert('Connection error: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  if (showPDF && signedUrl) {
    return (
      <ProtectedPDFViewer 
        signedPdfUrl={signedUrl}
        paperTitle={paper.title}
        onClose={() => setShowPDF(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review Research Paper</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4">{paper.title}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  {paper.submittedBy?.firstName} {paper.submittedBy?.lastName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  {new Date(paper.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Abstract</h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {paper.abstract}
            </p>
          </div>

          {paper.keywords?.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {paper.keywords.map((keyword, i) => (
                  <span key={i} className="px-3 py-1 bg-navy/10 text-navy rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">View Full Document</h4>
            <button 
              onClick={handleOpenPDF}
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              <FileText size={18} />
              Open PDF Viewer
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Decision <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="decision"
                  value="approved"
                  checked={decision === 'approved'}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Approve</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="decision"
                  value="revision"
                  checked={decision === 'revision'}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-4 h-4 text-yellow-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Request Revision</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="decision"
                  value="rejected"
                  checked={decision === 'rejected'}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Reject</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Review Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 resize-none"
              placeholder="Provide detailed feedback..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !notes.trim()}
              className={`flex-1 px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50 ${
                decision === 'approved' ? 'bg-green-500 hover:bg-green-600' :
                decision === 'rejected' ? 'bg-red-500 hover:bg-red-600' :
                'bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              {loading ? 'Submitting...' : `${decision === 'approved' ? 'Approve' : decision === 'rejected' ? 'Reject' : 'Request Revision'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReviewModal;