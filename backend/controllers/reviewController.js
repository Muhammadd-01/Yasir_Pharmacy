import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';

/**
 * @desc    Create a review
 * @route   POST /api/reviews
 * @access  Private
 */
export const createReview = asyncHandler(async (req, res) => {
    const { product, rating, comment } = req.body;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ user: req.user._id, product });
    if (existingReview) {
        throw new ApiError('You have already reviewed this product', 400);
    }

    const review = await Review.create({
        user: req.user._id,
        product,
        rating,
        comment
    });

    // Update product rating
    await updateProductRating(product);

    res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: review
    });
});

/**
 * @desc    Get product reviews
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 */
export const getProductReviews = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
        Review.find({ product: req.params.productId })
            .populate('user', 'name profileImage')
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        Review.countDocuments({ product: req.params.productId })
    ]);

    res.json({
        success: true,
        data: {
            reviews,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }
    });
});

/**
 * @desc    Update review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
export const updateReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    const review = await Review.findOne({ _id: req.params.id, user: req.user._id });

    if (!review) {
        throw new ApiError('Review not found or unauthorized', 404);
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    // Update product rating
    await updateProductRating(review.product);

    res.json({
        success: true,
        message: 'Review updated successfully',
        data: review
    });
});

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
export const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!review) {
        throw new ApiError('Review not found or unauthorized', 404);
    }

    // Update product rating
    await updateProductRating(review.product);

    res.json({
        success: true,
        message: 'Review deleted successfully'
    });
});

/**
 * Helper function to update product rating
 */
async function updateProductRating(productId) {
    const stats = await Review.aggregate([
        { $match: { product: productId } },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            'ratings.average': Math.round(stats[0].averageRating * 10) / 10,
            'ratings.count': stats[0].count
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            'ratings.average': 0,
            'ratings.count': 0
        });
    }
}

/**
 * @desc    Reply to a review (Admin only)
 * @route   POST /api/reviews/:id/reply
 * @access  Private/Admin
 */
export const replyToReview = asyncHandler(async (req, res) => {
    const { comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
        throw new ApiError('Review not found', 404);
    }

    review.adminReply = {
        comment,
        createdAt: new Date()
    };
    await review.save();

    res.json({
        success: true,
        message: 'Reply added successfully',
        data: review
    });
});

/**
 * @desc    Get all reviews (Admin only)
 * @route   GET /api/reviews/admin/all
 * @access  Private/Admin
 */
export const getAllReviews = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = {};
    if (search) {
        query.comment = { $regex: search, $options: 'i' };
    }

    const [reviews, total] = await Promise.all([
        Review.find(query)
            .populate('user', 'name email profileImage')
            .populate('product', 'name images')
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        Review.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: {
            reviews,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }
    });
});

