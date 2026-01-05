import Notification from '../models/Notification.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getUserNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const query = { user: req.user._id };
    if (unreadOnly === 'true') {
        query.isRead = false;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Notification.countDocuments(query),
        Notification.countDocuments({ user: req.user._id, isRead: false })
    ]);

    res.json({
        success: true,
        data: {
            notifications,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            },
            unreadCount
        }
    });
});

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (id === 'all') {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );
        return res.json({ success: true, message: 'All notifications marked as read' });
    }

    const notification = await Notification.findOneAndUpdate(
        { _id: id, user: req.user._id },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        throw new ApiError('Notification not found', 404);
    }

    res.json({ success: true, data: notification });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
    });

    if (!notification) {
        throw new ApiError('Notification not found', 404);
    }

    res.json({ success: true, message: 'Notification removed' });
});
