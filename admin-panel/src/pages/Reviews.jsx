import { useState, useEffect } from 'react';
import { MessageSquare, Star, Reply, Trash2, Search, X, Loader2 } from 'lucide-react';
import { reviewsAPI } from '@/lib/api';
import { useNotification } from '../context/NotificationContext';
import { getImageUrl, formatDate } from '@/lib/utils'; // Assuming utils exists

const Reviews = () => {
    const { notify } = useNotification();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Reply Modal State
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [replyComment, setReplyComment] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [page, search]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await reviewsAPI.getAll({ page, search });
            setReviews(res.data.data.reviews || []);
            setTotalPages(res.data.data.pagination?.pages || 1);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            notify.error('Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyComment.trim()) return;

        setReplyLoading(true);
        try {
            await reviewsAPI.reply(selectedReview._id, { comment: replyComment });
            notify.success('Reply added successfully');
            setReplyModalOpen(false);
            setReplyComment('');
            fetchReviews(); // Refresh list
        } catch (error) {
            console.error('Failed to reply:', error);
            notify.error('Failed to send reply');
        } finally {
            setReplyLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        try {
            await reviewsAPI.delete(id);
            fetchReviews();
            notify.success('Review deleted successfully');
        } catch (error) {
            notify.error('Failed to delete review');
        }
    };

    const openReplyModal = (review) => {
        setSelectedReview(review);
        setReplyComment(review.adminReply?.comment || '');
        setReplyModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple">
                    Customer Reviews
                </h1>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search reviews..."
                        className="w-full h-10 pl-9 pr-4 rounded-lg bg-background/50 border border-border focus:border-neon-silver/50 focus:outline-none transition-all"
                    />
                </div>
            </div>

            {/* Reviews Grid */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-20 text-muted-foreground">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">No reviews found</div>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="glass-card rounded-xl p-6 border border-border hover:border-neon-silver/30 transition-all">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex gap-4">
                                    {/* Product Image */}
                                    <div className="w-16 h-16 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                                        <img
                                            src={getImageUrl(review.product?.images?.[0]?.url)}
                                            alt={review.product?.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.src = '/placeholder.png'}
                                        />
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-lg">{review.product?.name}</h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                by {review.user?.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                • {formatDate(review.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-gray-300">{review.comment}</p>

                                        {/* Admin Reply Display */}
                                        {review.adminReply && (
                                            <div className="mt-4 pl-4 border-l-2 border-neon-blue bg-white/5 p-3 rounded-r-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="bg-neon-blue/20 text-neon-blue text-xs px-2 py-0.5 rounded font-bold">Admin Reply</div>
                                                    <span className="text-xs text-muted-foreground">{formatDate(review.adminReply.createdAt)}</span>
                                                </div>
                                                <p className="text-sm text-gray-300">{review.adminReply.comment}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openReplyModal(review)}
                                        className="p-2 rounded-lg hover:bg-white/10 text-blue-400 transition-colors"
                                        title="Reply"
                                    >
                                        <Reply className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(review._id)}
                                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 py-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 rounded-lg bg-white/5 disabled:opacity-50 hover:bg-white/10"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2">Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 rounded-lg bg-white/5 disabled:opacity-50 hover:bg-white/10"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Reply Modal */}
            {replyModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setReplyModalOpen(false)}>
                    <div
                        className="bg-background rounded-xl w-full max-w-lg p-6 border border-border shadow-2xl animate-in zoom-in duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Reply className="w-5 h-5 text-neon-blue" />
                                Reply to Review
                            </h2>
                            <button onClick={() => setReplyModalOpen(false)} className="hover:text-red-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6 bg-white/5 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-2">User's Review:</p>
                            <p className="italic text-gray-300">"{selectedReview?.comment}"</p>
                        </div>

                        <form onSubmit={handleReplySubmit}>
                            <textarea
                                value={replyComment}
                                onChange={(e) => setReplyComment(e.target.value)}
                                placeholder="Write your reply..."
                                className="w-full h-32 px-4 py-3 rounded-lg bg-muted/50 border border-border focus:border-neon-blue focus:outline-none mb-4 resize-none"
                                autoFocus
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setReplyModalOpen(false)}
                                    className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={replyLoading}
                                    className="px-4 py-2 rounded-lg bg-neon-blue text-black font-medium hover:bg-neon-blue/90 transition-colors flex items-center gap-2"
                                >
                                    {replyLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Send Reply
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reviews;
