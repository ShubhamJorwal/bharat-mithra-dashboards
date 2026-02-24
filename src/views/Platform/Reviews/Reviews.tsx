import { useState, useEffect, useCallback } from 'react';
import { HiOutlineStar, HiOutlineSearch, HiOutlineCheck, HiOutlineX, HiOutlineUser } from 'react-icons/hi';
import platformApi from '../../../services/api/platform.api';
import type { ServiceReview, ServiceReviewSummary } from '../../../types/api.types';
import '../FieldTemplates/FieldTemplates.scss';
import './Reviews.scss';

const Reviews = () => {
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [summary, setSummary] = useState<ServiceReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await platformApi.getServiceReviews('', { approved: statusFilter !== 'all' ? statusFilter : undefined });
      if (response.success && response.data) {
        setReviews(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await platformApi.getReviewSummary('');
      if (response.success && response.data) {
        setSummary(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch review summary:', err);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
    fetchSummary();
  }, [fetchReviews, fetchSummary]);

  const handleApprove = async (reviewId: string) => {
    try {
      await platformApi.approveReview(reviewId);
      fetchReviews();
      fetchSummary();
    } catch (err) {
      console.error('Failed to approve review:', err);
    }
  };

  const filtered = reviews.filter(r =>
    (r.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.service_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.review_text || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusFilters = ['all', 'approved', 'pending', 'rejected'];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <HiOutlineStar
        key={i}
        className={`bm-review-star ${i < rating ? 'bm-review-star--filled' : ''}`}
      />
    ));
  };

  return (
    <div className="bm-reviews">
      <div className="bm-page-header">
        <div className="bm-page-header-left">
          <HiOutlineStar className="bm-page-icon" />
          <div>
            <h1 className="bm-page-title">Service Reviews</h1>
            <p className="bm-page-subtitle">User ratings and feedback for services</p>
          </div>
        </div>
      </div>

      <div className="bm-filters-bar">
        <div className="bm-search-box">
          <HiOutlineSearch />
          <input placeholder="Search by user, service or comment..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="bm-chip-group">
          {statusFilters.map(s => (
            <button
              key={s}
              className={`bm-chip ${statusFilter === s ? 'bm-chip--active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {summary && (
        <div className="bm-stats-row">
          <div className="bm-stat-mini">
            <span className="bm-stat-mini-value">{summary.total_reviews}</span>
            <span className="bm-stat-mini-label">Total Reviews</span>
          </div>
          <div className="bm-stat-mini">
            <span className="bm-stat-mini-value">{summary.average_rating?.toFixed(1) || '0.0'}</span>
            <span className="bm-stat-mini-label">Avg Rating</span>
          </div>
          <div className="bm-stat-mini">
            <span className="bm-stat-mini-value">{summary.five_star_count}</span>
            <span className="bm-stat-mini-label">5-Star</span>
          </div>
          <div className="bm-stat-mini">
            <span className="bm-stat-mini-value">{summary.pending_count}</span>
            <span className="bm-stat-mini-label">Pending</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bm-loading-state">Loading reviews...</div>
      ) : (
        <div className="bm-reviews-list">
          {filtered.map(review => (
            <div key={review.id} className="bm-review-card">
              <div className="bm-review-card-header">
                <div className="bm-review-user">
                  <div className="bm-review-avatar">
                    <HiOutlineUser />
                  </div>
                  <div>
                    <div className="bm-review-user-name">{review.user_name || 'Anonymous'}</div>
                    <div className="bm-review-service-name">{review.service_name || 'Unknown Service'}</div>
                  </div>
                </div>
                <div className="bm-review-rating">
                  {renderStars(review.rating)}
                  <span className="bm-review-rating-num">{review.rating}/5</span>
                </div>
              </div>

              {review.review_text && (
                <p className="bm-review-comment">{review.review_text}</p>
              )}

              <div className="bm-review-footer">
                <span className="bm-review-date">
                  {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className={`bm-review-status bm-review-status--${review.is_approved ? 'approved' : 'pending'}`}>
                  {review.is_approved ? 'Approved' : 'Pending'}
                </span>
                {!review.is_approved && (
                  <div className="bm-review-actions">
                    <button className="bm-btn-icon bm-btn-icon--success" title="Approve" onClick={() => handleApprove(review.id)}>
                      <HiOutlineCheck />
                    </button>
                    <button className="bm-btn-icon bm-btn-icon--danger" title="Reject">
                      <HiOutlineX />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="bm-empty-state">No reviews found. Reviews will appear here once users submit feedback.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reviews;
