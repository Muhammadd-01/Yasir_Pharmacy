import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Notification from '../models/Notification.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';

/**
 * @desc    Create new order from cart
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res) => {
    const { shippingAddress, billingAddress, paymentMethod = 'cod', notes } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
        .populate('items.product', 'name price images stock isActive');

    if (!cart || cart.items.length === 0) {
        throw new ApiError('Cart is empty', 400);
    }

    // Validate all items are available and in stock
    const orderItems = [];

    for (const item of cart.items) {
        if (!item.product || !item.product.isActive) {
            throw new ApiError(`Product "${item.product?.name || 'Unknown'}" is no longer available`, 400);
        }

        if (item.product.stock < item.quantity) {
            throw new ApiError(
                `Only ${item.product.stock} units of "${item.product.name}" available`,
                400
            );
        }

        orderItems.push({
            product: item.product._id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.images?.[0]?.url || null
        });
    }

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = subtotal > 5000 ? 0 : 250; // Free shipping over Rs. 5000
    const totalAmount = subtotal + shippingCost;

    // Create order
    const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        subtotal,
        shippingCost,
        totalAmount,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        paymentMethod,
        notes: { customer: notes },
        statusHistory: [{
            status: 'pending',
            note: 'Order placed',
            updatedBy: req.user._id
        }]
    });

    // Update product stock
    for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity, soldCount: item.quantity }
        });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: order
    });
});

/**
 * @desc    Get user's orders
 * @route   GET /api/orders
 * @access  Private
 */
export const getMyOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
        Order.find(query)
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        Order.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: {
            orders,
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
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new ApiError('Order not found', 404);
    }

    // Check if order belongs to user (unless admin)
    if (order.user.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        throw new ApiError('Not authorized to view this order', 403);
    }

    res.json({
        success: true,
        data: order
    });
});

/**
 * @desc    Cancel order
 * @route   POST /api/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new ApiError('Order not found', 404);
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
        throw new ApiError('Not authorized', 403);
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
        throw new ApiError(`Cannot cancel order with status: ${order.status}`, 400);
    }

    // Update order status
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.statusHistory.push({
        status: 'cancelled',
        note: 'Cancelled by customer',
        updatedBy: req.user._id
    });

    await order.save();

    // Restore product stock
    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity, soldCount: -item.quantity }
        });
    }

    res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
    });
});

// ============ ADMIN CONTROLLERS ============

/**
 * @desc    Get all orders
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
export const getAllOrders = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        status,
        search,
        startDate,
        endDate,
        sort = '-createdAt'
    } = req.query;

    const query = {};

    if (status) query.status = status;

    if (search) {
        query.$or = [
            { orderNumber: { $regex: search, $options: 'i' } },
            { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
            { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
        ];
    }

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate('user', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        Order.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: {
            orders,
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
 * @desc    Update order status
 * @route   PATCH /api/admin/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

    if (!validStatuses.includes(status)) {
        throw new ApiError('Invalid status', 400);
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new ApiError('Order not found', 404);
    }

    // Handle special status changes
    if (status === 'delivered') {
        order.deliveredAt = new Date();
        if (order.paymentMethod === 'cod') {
            order.paymentStatus = 'paid';
        }
    }

    if (status === 'cancelled' && order.status !== 'cancelled') {
        order.cancelledAt = new Date();
        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity, soldCount: -item.quantity }
            });
        }
    }

    order.status = status;
    order.statusHistory.push({
        status,
        note: note || `Status updated to ${status}`,
        updatedBy: req.user._id
    });

    await order.save();

    // Create notification for user
    await Notification.create({
        user: order.user,
        title: 'Order Status Updated',
        message: `Your order #${order.orderNumber} is now ${status}. ${note || ''}`,
        type: 'order',
        data: { orderId: order._id }
    });

    res.json({
        success: true,
        message: 'Order status updated',
        data: order
    });
});

/**
 * @desc    Get order statistics
 * @route   GET /api/admin/orders/stats
 * @access  Private/Admin
 */
export const getOrderStats = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
        totalOrders,
        pendingOrders,
        todayOrders,
        monthlyOrders,
        totalRevenue,
        monthlyRevenue
    ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ createdAt: { $gte: today } }),
        Order.countDocuments({ createdAt: { $gte: thisMonth } }),
        Order.aggregate([
            { $match: { status: { $nin: ['cancelled', 'returned'] } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thisMonth },
                    status: { $nin: ['cancelled', 'returned'] }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
    ]);

    res.json({
        success: true,
        data: {
            totalOrders,
            pendingOrders,
            todayOrders,
            monthlyOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            monthlyRevenue: monthlyRevenue[0]?.total || 0
        }
    });
});
