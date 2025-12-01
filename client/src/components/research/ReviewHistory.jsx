import { useState, useEffect } from 'react';
import { MessageSquare, Star, Calendar, User } from 'lucide-react';

const ReviewHistory = ({ researchId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [researchId]);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/${researchId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Fetch reviews error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto"></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <MessageSquare size={24} />
        Review History ({reviews.length})
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
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                review.decision === 'approved' ? 'bg-green-100 text-green-700' :
                review.decision === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {review.decision.toUpperCase()}
              </span>
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
  );
};

export default ReviewHistory;