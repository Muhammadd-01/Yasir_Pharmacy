import express from 'express';
import {
    getCategories,
    getCategory,
    getCategoriesByType,
    createCategory,
    updateCategory,
    deleteCategory,
    getAdminCategories,
    addSubcategory,
    removeSubcategory
} from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import { categoryValidation } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/type/:type', getCategoriesByType);
router.get('/:idOrSlug', getCategory);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAdminCategories);
router.post('/', protect, adminOnly, upload.single('image'), categoryValidation, validate, createCategory);
router.put('/:id', protect, adminOnly, upload.single('image'), updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);
router.post('/:id/subcategories', protect, adminOnly, addSubcategory);
router.delete('/:id/subcategories/:subId', protect, adminOnly, removeSubcategory);

export default router;
