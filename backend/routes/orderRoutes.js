import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrder,
    cancelOrder,
    getAllOrders,
    updateOrderStatus,
    getOrderStats
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createOrderValidation } from '../utils/validators.js';

const router = express.Router();

// Protected user routes
router.use(protect);

router.post('/', createOrderValidation, validate, createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrder);
router.post('/:id/cancel', cancelOrder);

// Admin routes
router.get('/admin/all', adminOnly, getAllOrders);
router.get('/admin/stats', adminOnly, getOrderStats);
router.patch('/admin/:id/status', adminOnly, updateOrderStatus);

export default router;
