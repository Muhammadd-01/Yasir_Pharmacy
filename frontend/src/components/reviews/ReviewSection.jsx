import { useState, useEffect } from 'react';
import { Star, User, ThumbsUp, Trash2, Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { reviewsAPI } from '@/lib/api';
import { useAuth, useNotification } from '@/context';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/utils';

const ReviewSection = ({ productId }) => {
    const { isAuthenticated, user } = useAuth();
    const { notify } = useNotification();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (productId) {
            fetchReviews();
        }
    }, [productId, page]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await reviewsAPI.getProductReviews(productId, { page, limit: 5 });
            setReviews(res.data.data.reviews || []);
            setTotalPages(res.data.data.pagination?.pages || 1);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            notify.error('Please write a comment');
            return;
        }

        setSubmitting(true);
        try {
            await reviewsAPI.create({ product: productId, rating, comment });
            notify.success('Review submitted successfully');
            setComment('');
            setRating(5);
            fetchReviews(); // Refresh reviews
        } catch (error) {
            notify.error(error.response?.data?.message || 'Failed to submit review');
            if (error.response?.data?.message?.includes('already reviewed')) {
                // Optional: handle duplicate review UI state
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            await reviewsAPI.delete(reviewId);
            notify.success('Review deleted');
            fetchReviews();
        } catch (error) {
            notify.error('Failed to delete review');
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>

            {/* Write Review */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-4">
                    <h3 className="font-semibold mb-4">Write a Review</h3>

                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-medium mr-2">Your Rating:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        className="w-full bg-background/50 border border-border rounded-lg p-3 min-h-[100px] focus:outline-none focus:border-primary transition-colors resize-none"
                    />

                    <div className="flex justify-end">
                        <Button type="submit" variant="glow" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Review
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="glass-card rounded-xl p-6 text-center">
                    <p className="text-muted-foreground mb-4">Please login to write a review</p>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review._id} className="glass-card rounded-xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                                        {review.user?.profileImage ? (
                                            <img
                                                src={getImageUrl(review.user.profileImage)}
                                                alt={review.user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{review.user?.name || 'Anonymous'}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
                                            {review.isVerifiedPurchase && (
                                                <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">Verified Purchase</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {user?._id === review.user?._id && (
                                    <button
                                        onClick={() => handleDelete(review._id)}
                                        className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="flex mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                                            }`}
                                    />
                                ))}
                            </div>

                            <p className="text-muted-foreground leading-relaxed">{review.comment}</p>

                            {/* Helpful Button - Placeholder logic for now */}
                            <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
                                <ThumbsUp className="w-3 h-3" />
                                <span>{review.helpfulCount || 0} found this helpful</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        No reviews yet. Be the first to review!
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-4 font-medium">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
