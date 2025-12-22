import { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import Toast from '../common/Toast';

const ReviewForm = ({ paper, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    comments: '',
    ratings: { methodology: 5, clarity: 5, contribution: 5, overall: 5 }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.comments.trim()) {
      setError('Comments are required');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ researchId: paper._id, ...formData })
      });

      if (res.ok) {
        showToast('✅ Review submitted successfully! The author has been notified.', 'success');
        
        // Close after 2 seconds
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit review');
        showToast(data.error || 'Failed to submit review', 'error');
      }
    } catch (err) {
      setError('Connection error');
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
          duration={3000}
        />
      )}

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Submit Faculty Review</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              📝 Provide suggestions and feedback. Admin will make the final decision.
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded flex items-start">
              <AlertCircle className="text-red-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{paper.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">By: {paper.authors.join(', ')}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ratings
              </label>
              <div className="grid grid-cols-2 gap-4">
                {['methodology', 'clarity', 'contribution', 'overall'].map((criterion) => (
                  <div key={criterion}>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 capitalize">
                      {criterion}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.ratings[criterion]}
                      onChange={(e) => setFormData({
                        ...formData,
                        ratings: { ...formData.ratings, [criterion]: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1</span>
                      <span className="font-bold">{formData.ratings[criterion]}</span>
                      <span>5</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Comments & Suggestions <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-navy focus:outline-none bg-white dark:bg-gray-700 resize-none"
                placeholder="Provide detailed feedback and suggestions for improvement..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy text-white px-6 py-4 rounded-xl hover:bg-navy-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ReviewForm;