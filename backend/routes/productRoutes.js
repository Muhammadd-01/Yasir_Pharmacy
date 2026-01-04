import express from 'express';
import {
    getProducts,
    getProduct,
    getFeaturedProducts,
    getNewArrivals,
    getRelatedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getAdminProducts,
    updateStock,
    toggleProductStatus
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import { productValidation, mongoIdValidation } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/:idOrSlug', getProduct);
router.get('/:id/related', getRelatedProducts);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAdminProducts);
router.post('/', protect, adminOnly, upload.array('images', 5), productValidation, validate, createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.patch('/:id/stock', protect, adminOnly, updateStock);
router.patch('/:id/toggle', protect, adminOnly, toggleProductStatus);

export default router;
