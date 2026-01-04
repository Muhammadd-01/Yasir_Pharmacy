import { body, param, query } from 'express-validator';

/**
 * Validation schemas for various API endpoints
 */

// Auth validations
export const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

export const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),
    body('password')
        .notEmpty().withMessage('Password is required')
];

// Product validations
export const productValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock')
        .notEmpty().withMessage('Stock is required')
        .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('category')
        .notEmpty().withMessage('Category is required')
        .isMongoId().withMessage('Invalid category ID'),
    body('type')
        .notEmpty().withMessage('Type is required')
        .isIn(['medicine', 'general']).withMessage('Type must be medicine or general')
];

// Category validations
export const categoryValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required')
        .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
    body('type')
        .notEmpty().withMessage('Type is required')
        .isIn(['medicine', 'general']).withMessage('Type must be medicine or general')
];

// Cart validations
export const addToCartValidation = [
    body('productId')
        .notEmpty().withMessage('Product ID is required')
        .isMongoId().withMessage('Invalid product ID'),
    body('quantity')
        .optional()
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

// Order validations
export const createOrderValidation = [
    body('shippingAddress.fullName')
        .trim()
        .notEmpty().withMessage('Full name is required'),
    body('shippingAddress.phone')
        .trim()
        .notEmpty().withMessage('Phone number is required'),
    body('shippingAddress.street')
        .trim()
        .notEmpty().withMessage('Street address is required'),
    body('shippingAddress.city')
        .trim()
        .notEmpty().withMessage('City is required'),
    body('paymentMethod')
        .optional()
        .isIn(['cod', 'card', 'bank_transfer', 'easypaisa', 'jazzcash'])
        .withMessage('Invalid payment method')
];

// MongoDB ID validation
export const mongoIdValidation = [
    param('id')
        .isMongoId().withMessage('Invalid ID format')
];

// Pagination validation
export const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];
