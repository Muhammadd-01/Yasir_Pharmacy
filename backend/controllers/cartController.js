import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id })
        .populate('items.product', 'name price images stock isActive');

    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out inactive or deleted products
    const validItems = cart.items.filter(item =>
        item.product && item.product.isActive
    );

    // Update cart if items were removed
    if (validItems.length !== cart.items.length) {
        cart.items = validItems;
        await cart.save();
    }

    res.json({
        success: true,
        data: cart
    });
});

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
export const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity = 1 } = req.body;

    // Check product exists and is active
    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    if (!product.isActive) {
        throw new ApiError('Product is not available', 400);
    }

    if (product.stock < quantity) {
        throw new ApiError(`Only ${product.stock} items available in stock`, 400);
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
        // Update quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;

        if (newQuantity > product.stock) {
            throw new ApiError(`Cannot add more. Only ${product.stock} items in stock`, 400);
        }

        cart.items[existingItemIndex].quantity = newQuantity;
        cart.items[existingItemIndex].price = product.price;
    } else {
        // Add new item
        cart.items.push({
            product: productId,
            quantity,
            price: product.price
        });
    }

    await cart.save();

    // Populate and return
    await cart.populate('items.product', 'name price images stock');

    res.json({
        success: true,
        message: 'Item added to cart',
        data: cart
    });
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:productId
 * @access  Private
 */
export const updateCartItem = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
        throw new ApiError('Quantity must be at least 1', 400);
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        throw new ApiError('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
        throw new ApiError('Item not found in cart', 404);
    }

    // Check stock
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
        throw new ApiError('Product is not available', 400);
    }

    if (quantity > product.stock) {
        throw new ApiError(`Only ${product.stock} items available in stock`, 400);
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price;
    await cart.save();

    await cart.populate('items.product', 'name price images stock');

    res.json({
        success: true,
        message: 'Cart updated',
        data: cart
    });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:productId
 * @access  Private
 */
export const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        throw new ApiError('Cart not found', 404);
    }

    cart.items = cart.items.filter(
        item => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.product', 'name price images stock');

    res.json({
        success: true,
        message: 'Item removed from cart',
        data: cart
    });
});

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        cart.items = [];
        await cart.save();
    }

    res.json({
        success: true,
        message: 'Cart cleared',
        data: cart || { items: [], totalItems: 0, totalAmount: 0 }
    });
});

/**
 * @desc    Get cart count
 * @route   GET /api/cart/count
 * @access  Private
 */
export const getCartCount = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    res.json({
        success: true,
        data: {
            count: cart ? cart.totalItems : 0
        }
    });
});
