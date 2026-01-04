import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, role, search, status, sort = '-createdAt' } = req.query;

    const query = {};

    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
        User.find(query)
            .select('-refreshToken')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        User.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: {
            users,
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
 * @desc    Get single user
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-refreshToken');

    if (!user) {
        throw new ApiError('User not found', 404);
    }

    res.json({
        success: true,
        data: user
    });
});

/**
 * @desc    Create new user (by admin)
 * @route   POST /api/admin/users
 * @access  Private/Admin
 */
export const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError('Email already registered', 400);
    }

    // Only superadmin can create admin users
    if ((role === 'admin' || role === 'superadmin') && req.user.role !== 'superadmin') {
        throw new ApiError('Only Super Admin can create admin users', 403);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        role: role || 'customer',
        isEmailVerified: true // Admin-created users are pre-verified
    });

    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
});

/**
 * @desc    Update user
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req, res) => {
    const { name, email, phone, role, isActive, address } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError('User not found', 404);
    }

    // Prevent modifying superadmin unless you're superadmin
    if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
        throw new ApiError('Cannot modify Super Admin account', 403);
    }

    // Only superadmin can change roles to admin/superadmin
    if (role && (role === 'admin' || role === 'superadmin') && req.user.role !== 'superadmin') {
        throw new ApiError('Only Super Admin can assign admin roles', 403);
    }

    // Check email uniqueness if changing email
    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ApiError('Email already in use', 400);
        }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    res.json({
        success: true,
        message: 'User updated successfully',
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive
        }
    });
});

/**
 * @desc    Delete user (deactivate)
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError('User not found', 404);
    }

    // Prevent deleting superadmin
    if (user.role === 'superadmin') {
        throw new ApiError('Cannot delete Super Admin account', 403);
    }

    // Only superadmin can delete admin users
    if (user.role === 'admin' && req.user.role !== 'superadmin') {
        throw new ApiError('Only Super Admin can delete admin users', 403);
    }

    user.isActive = false;
    await user.save();

    res.json({
        success: true,
        message: 'User deactivated successfully'
    });
});

/**
 * @desc    Toggle user active status
 * @route   PATCH /api/admin/users/:id/toggle
 * @access  Private/Admin
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError('User not found', 404);
    }

    // Prevent toggling superadmin
    if (user.role === 'superadmin') {
        throw new ApiError('Cannot modify Super Admin account', 403);
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        data: { id: user._id, isActive: user.isActive }
    });
});

/**
 * @desc    Reset user password (by admin)
 * @route   PATCH /api/admin/users/:id/password
 * @access  Private/SuperAdmin
 */
export const resetUserPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError('User not found', 404);
    }

    // Only superadmin can reset passwords
    if (req.user.role !== 'superadmin') {
        throw new ApiError('Only Super Admin can reset passwords', 403);
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
        success: true,
        message: 'Password reset successfully'
    });
});

/**
 * @desc    Get user statistics
 * @route   GET /api/admin/users/stats
 * @access  Private/Admin
 */
export const getUserStats = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalUsers, activeUsers, newUsersToday, newUsersMonth, roleBreakdown] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ createdAt: { $gte: today } }),
        User.countDocuments({ createdAt: { $gte: thisMonth } }),
        User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ])
    ]);

    const roles = roleBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
    }, {});

    res.json({
        success: true,
        data: {
            totalUsers,
            activeUsers,
            newUsersToday,
            newUsersMonth,
            roles
        }
    });
});
