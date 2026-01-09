// client/src/components/review/ReviewsModal.jsx
import { X, User, Star, Calendar, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const ReviewsModal = ({ isOpen, onClose, reviews = [], onDelete }) => {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(null);

  if (!isOpen) return null;

  const handleDelete = async (reviewId) => {
    setDeleting(reviewId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) onDelete?.();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(null);
    }
  };

  const canDelete = (review) => {
    if (!user) return false;
    return user.role === 'admin' || review.reviewer?._id === user.id;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border-2 border-gray-200 dark:border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
              <User size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Faculty Reviews ({reviews?.length || 0})
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 bg-gray-50 dark:bg-gray-950">
          {!reviews || reviews.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <User size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3 opacity-50" />
              <p className="text-gray-600 dark:text-gray-400">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div 
                  key={review._id} 
                  className="bg-white dark:bg-gray-900 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 group shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Reviewer Info */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <User size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                          {review.reviewer?.firstName} {review.reviewer?.lastName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                          {review.reviewer?.role || 'Faculty'}
                        </p>
                      </div>
                    </div>
                    {canDelete(review) && (
                      <button
                        onClick={() => handleDelete(review._id)}
                        disabled={deleting === review._id}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-all"
                        aria-label="Delete review"
                      >
                        {deleting === review._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 dark:border-red-400 border-t-transparent" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Comments */}
                  <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 whitespace-pre-line leading-relaxed">
                    {review.comments}
                  </p>

                  {/* Ratings */}
                  {review.ratings && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {Object.entries(review.ratings).map(([key, value]) => (
                        <div 
                          key={key} 
                          className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">
                            {key}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                              {value}/5
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Calendar size={12} />
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
          <button 
            onClick={onClose} 
            className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 font-semibold transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsModal;