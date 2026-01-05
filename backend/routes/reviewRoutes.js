import express from 'express';
import {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
    replyToReview,
    getAllReviews
} from '../controllers/reviewController.js';
import { protect, adminOnly as admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Admin routes
router.get('/admin/all', protect, admin, getAllReviews);
router.post('/:id/reply', protect, admin, replyToReview);

// Protected routes
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;
