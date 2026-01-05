import Wishlist from '../models/Wishlist.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';

/**
 * @desc    Get user wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
export const getWishlist = asyncHandler(async (req, res) => {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
        .populate({
            path: 'products.product',
            select: 'name price images slug type category isActive stock'
        });

    if (!wishlist) {
        wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    // Filter out inactive products
    wishlist.products = wishlist.products.filter(item => item.product && item.product.isActive);

    res.json({
        success: true,
        data: wishlist
    });
});

/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist/:productId
 * @access  Private
 */
export const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
        wishlist = await Wishlist.create({
            user: req.user._id,
            products: [{ product: productId }]
        });
    } else {
        // Check if product already in wishlist
        const exists = wishlist.products.some(item => item.product.toString() === productId);

        if (exists) {
            throw new ApiError('Product already in wishlist', 400);
        }

        wishlist.products.push({ product: productId });
        await wishlist.save();
    }

    await wishlist.populate({
        path: 'products.product',
        select: 'name price images slug type'
    });

    res.json({
        success: true,
        message: 'Product added to wishlist',
        data: wishlist
    });
});

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
export const removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
        throw new ApiError('Wishlist not found', 404);
    }

    wishlist.products = wishlist.products.filter(
        item => item.product.toString() !== productId
    );

    await wishlist.save();

    res.json({
        success: true,
        message: 'Product removed from wishlist',
        data: wishlist
    });
});

/**
 * @desc    Clear wishlist
 * @route   DELETE /api/wishlist
 * @access  Private
 */
export const clearWishlist = asyncHandler(async (req, res) => {
    await Wishlist.findOneAndUpdate(
        { user: req.user._id },
        { products: [] },
        { new: true }
    );

    res.json({
        success: true,
        message: 'Wishlist cleared'
    });
});
