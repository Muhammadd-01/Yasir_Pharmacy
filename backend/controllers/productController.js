import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Notification from '../models/Notification.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';

/**
 * @desc    Get all products with filtering, sorting, pagination
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 12,
        type,
        category,
        subcategory,
        minPrice,
        maxPrice,
        search,
        sort = '-createdAt',
        featured,
        inStock
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (type) query.type = type;
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (featured === 'true') query.isFeatured = true;
    if (inStock === 'true') query.stock = { $gt: 0 };

    // Price range
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Text search
    if (search) {
        query.$text = { $search: search };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    const [products, total] = await Promise.all([
        Product.find(query)
            .populate('category', 'name slug')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        Product.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: {
            products,
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
 * @desc    Get single product by ID or slug
 * @route   GET /api/products/:idOrSlug
 * @access  Public
 */
export const getProduct = asyncHandler(async (req, res) => {
    const { idOrSlug } = req.params;

    let product;

    // Try to find by ID first, then by slug
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(idOrSlug).populate('category', 'name slug type');
    }

    if (!product) {
        product = await Product.findOne({ slug: idOrSlug, isActive: true }).populate('category', 'name slug type');
    }

    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    // Increment view count
    await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

    res.json({
        success: true,
        data: product
    });
});

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
export const getFeaturedProducts = asyncHandler(async (req, res) => {
    const { limit = 8 } = req.query;

    const products = await Product.find({ isActive: true, isFeatured: true })
        .populate('category', 'name slug')
        .limit(Number(limit))
        .lean();

    res.json({
        success: true,
        data: products
    });
});

/**
 * @desc    Get new arrivals
 * @route   GET /api/products/new-arrivals
 * @access  Public
 */
export const getNewArrivals = asyncHandler(async (req, res) => {
    const { limit = 8 } = req.query;

    const products = await Product.find({ isActive: true })
        .populate('category', 'name slug')
        .sort('-createdAt')
        .limit(Number(limit))
        .lean();

    res.json({
        success: true,
        data: products
    });
});

/**
 * @desc    Get related products
 * @route   GET /api/products/:id/related
 * @access  Public
 */
export const getRelatedProducts = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    const product = await Product.findById(id);
    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    const related = await Product.find({
        _id: { $ne: id },
        category: product.category,
        isActive: true
    })
        .limit(Number(limit))
        .lean();

    res.json({
        success: true,
        data: related
    });
});

// ============ ADMIN CONTROLLERS ============

/**
 * @desc    Create new product
 * @route   POST /api/admin/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(async (req, res) => {
    try {
        let images = [];

        // Handle uploaded files
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => ({ url: `/uploads/${file.filename}` }));
        }

        // Add images to body
        req.body.images = images;

        console.log('Creating product with body:', JSON.stringify(req.body, null, 2));

        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error('Create Product Error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            throw new ApiError(messages.join(', '), 400);
        }
        throw error;
    }
});

/**
 * @desc    Update product
 * @route   PUT /api/admin/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res) => {
    let images = [];

    // Handle existing images (sent as strings)
    if (req.body.images) {
        if (typeof req.body.images === 'string') {
            images = [req.body.images];
        } else if (Array.isArray(req.body.images)) {
            images = req.body.images;
        }
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => ({ url: `/uploads/${file.filename}` }));
        images = [...images, ...newImages];
    }

    if (images.length > 0) {
        req.body.images = images;
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
    });
});

/**
 * @desc    Delete product (soft delete)
 * @route   DELETE /api/admin/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );

    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    // 1. Find all carts containing this product
    const carts = await Cart.find({ 'items.product': req.params.id });

    // 2. Iterate through carts to remove item and notify user
    const notifications = [];
    for (const cart of carts) {
        // Remove item from cart
        cart.items = cart.items.filter(item => item.product.toString() !== req.params.id);
        await cart.save();

        // Prepare notification
        notifications.push({
            user: cart.user,
            title: 'Item Removed from Cart',
            message: `The item "${product.name}" has been removed from your cart because it is no longer available.`,
            type: 'product',
            data: { productId: product._id }
        });
    }

    // 3. Send notifications
    if (notifications.length > 0) {
        await Notification.insertMany(notifications);
    }

    res.json({
        success: true,
        message: 'Product deleted successfully. Users notified and carts updated.',
        removedFromCarts: carts.length
    });
});

/**
 * @desc    Get all products for admin (including inactive)
 * @route   GET /api/admin/products
 * @access  Private/Admin
 */
export const getAdminProducts = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        type,
        category,
        search,
        sort = '-createdAt',
        status
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (category) query.category = category;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
        Product.find(query)
            .populate('category', 'name')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        Product.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: {
            products,
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
 * @desc    Update product stock
 * @route   PATCH /api/admin/products/:id/stock
 * @access  Private/Admin
 */
export const updateStock = asyncHandler(async (req, res) => {
    const { stock } = req.body;

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        { stock },
        { new: true }
    );

    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    res.json({
        success: true,
        message: 'Stock updated successfully',
        data: { id: product._id, stock: product.stock }
    });
});

/**
 * @desc    Toggle product active status
 * @route   PATCH /api/admin/products/:id/toggle
 * @access  Private/Admin
 */
export const toggleProductStatus = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
        success: true,
        message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
        data: { id: product._id, isActive: product.isActive }
    });
});
