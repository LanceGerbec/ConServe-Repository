import { useState } from 'react';
import { MessageSquare, Star, Calendar, User, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../common/ConfirmModal';
import Toast from '../common/Toast';

const ReviewHistory = ({ reviews, onDelete }) => {
  const { user } = useAuth();
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, reviewId: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (msg, type) => setToast({ show: true, message: msg, type });

  const handleDelete = async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showToast('✅ Review deleted', 'success');
        onDelete?.();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
    setConfirmModal({ isOpen: false, reviewId: null });
  };

  const canDelete = (review) => {
    if (!user) return false;
    const isAdmin = user.role === 'admin';
    const isReviewer = review.reviewer._id === user.id;
    return isAdmin || isReviewer;
  };

  return (
    <>
      {toast.show && <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />}
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, reviewId: null })}
        onConfirm={() => handleDelete(confirmModal.reviewId)}
        title="Delete Review?"
        message="This will permanently delete this review. This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare size={24} />
          Faculty Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No reviews yet</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {review.reviewer.firstName} {review.reviewer.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{review.reviewer.role}</p>
                  </div>
                </div>
                {canDelete(review) && (
                  <button
                    onClick={() => setConfirmModal({ isOpen: true, reviewId: review._id })}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition text-red-600"
                    title="Delete review"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">{review.comments}</p>

              {review.ratings && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {Object.entries(review.ratings).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 capitalize mb-1">{key}</p>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-gray-900 dark:text-white">{value}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
                {review.revisionDeadline && (
                  <span className="flex items-center gap-1 text-orange-600">
                    ⏰ Deadline: {new Date(review.revisionDeadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default ReviewHistory;