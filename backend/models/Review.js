import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    images: [{
        url: String,
        alt: String
    }],
    helpfulCount: {
        type: Number,
        default: 0
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    adminReply: {
        comment: String,
        createdAt: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });

// Ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
