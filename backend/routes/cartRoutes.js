import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartCount,
    getAllCarts
} from '../controllers/cartController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addToCartValidation } from '../utils/validators.js';

const router = express.Router();

// All cart routes are protected
router.use(protect);

// Admin routes
router.get('/admin/all', adminOnly, getAllCarts);

router.get('/', getCart);
router.get('/count', getCartCount);
router.post('/', addToCartValidation, validate, addToCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

export default router;
