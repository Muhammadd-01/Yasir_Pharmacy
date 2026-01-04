import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartCount
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addToCartValidation } from '../utils/validators.js';

const router = express.Router();

// All cart routes are protected
router.use(protect);

router.get('/', getCart);
router.get('/count', getCartCount);
router.post('/', addToCartValidation, validate, addToCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

export default router;
