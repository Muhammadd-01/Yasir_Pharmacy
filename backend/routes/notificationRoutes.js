import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getUserNotifications,
    markAsRead,
    deleteNotification
} from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getUserNotifications);

router.route('/:id/read')
    .patch(markAsRead);

router.route('/:id')
    .delete(deleteNotification);

export default router;
