import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
    const { type, includeCount } = req.query;

    const query = { isActive: true };
    if (type) query.type = type;

    let categories = await Category.find(query)
        .sort('sortOrder name')
        .lean();

    // Include product count if requested
    if (includeCount === 'true') {
        const counts = await Product.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        const countMap = counts.reduce((acc, item) => {
            acc[item._id.toString()] = item.count;
            return acc;
        }, {});

        categories = categories.map(cat => ({
            ...cat,
            productCount: countMap[cat._id.toString()] || 0
        }));
    }

    res.json({
        success: true,
        data: categories
    });
});

/**
 * @desc    Get single category by ID or slug
 * @route   GET /api/categories/:idOrSlug
 * @access  Public
 */
export const getCategory = asyncHandler(async (req, res) => {
    const { idOrSlug } = req.params;

    let category;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
        category = await Category.findById(idOrSlug);
    }

    if (!category) {
        category = await Category.findOne({ slug: idOrSlug, isActive: true });
    }

    if (!category) {
        throw new ApiError('Category not found', 404);
    }

    res.json({
        success: true,
        data: category
    });
});

/**
 * @desc    Get categories by type with subcategories
 * @route   GET /api/categories/type/:type
 * @access  Public
 */
export const getCategoriesByType = asyncHandler(async (req, res) => {
    const { type } = req.params;

    if (!['medicine', 'general'].includes(type)) {
        throw new ApiError('Invalid category type', 400);
    }

    const categories = await Category.find({ type, isActive: true })
        .sort('sortOrder name')
        .lean();

    res.json({
        success: true,
        data: categories
    });
});

// ============ ADMIN CONTROLLERS ============

/**
 * @desc    Create new category
 * @route   POST /api/admin/categories
 * @access  Private/Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
    if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
    }

    const category = await Category.create(req.body);

    res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
    });
});

/**
 * @desc    Update category
 * @route   PUT /api/admin/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = asyncHandler(async (req, res) => {
    if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
    }

    const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!category) {
        throw new ApiError('Category not found', 404);
    }

    res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
    });
});

/**
 * @desc    Delete category (soft delete)
 * @route   DELETE /api/admin/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
    // Check if category has products
    const productCount = await Product.countDocuments({ category: req.params.id });

    if (productCount > 0) {
        throw new ApiError(`Cannot delete category with ${productCount} products. Move or delete products first.`, 400);
    }

    const category = await Category.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );

    if (!category) {
        throw new ApiError('Category not found', 404);
    }

    res.json({
        success: true,
        message: 'Category deleted successfully'
    });
});

/**
 * @desc    Get all categories for admin (including inactive)
 * @route   GET /api/admin/categories
 * @access  Private/Admin
 */
export const getAdminCategories = asyncHandler(async (req, res) => {
    const { type, status } = req.query;

    const query = {};
    if (type) query.type = type;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const categories = await Category.find(query)
        .sort('type sortOrder name')
        .lean();

    // Get product counts
    const counts = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = counts.reduce((acc, item) => {
        acc[item._id.toString()] = item.count;
        return acc;
    }, {});

    const categoriesWithCount = categories.map(cat => ({
        ...cat,
        productCount: countMap[cat._id.toString()] || 0
    }));

    res.json({
        success: true,
        data: categoriesWithCount
    });
});

/**
 * @desc    Add subcategory to category
 * @route   POST /api/admin/categories/:id/subcategories
 * @access  Private/Admin
 */
export const addSubcategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
        throw new ApiError('Category not found', 404);
    }

    category.subcategories.push({ name, description });
    await category.save();

    res.status(201).json({
        success: true,
        message: 'Subcategory added successfully',
        data: category
    });
});

/**
 * @desc    Remove subcategory from category
 * @route   DELETE /api/admin/categories/:id/subcategories/:subId
 * @access  Private/Admin
 */
export const removeSubcategory = asyncHandler(async (req, res) => {
    const { id, subId } = req.params;

    const category = await Category.findById(id);

    if (!category) {
        throw new ApiError('Category not found', 404);
    }

    category.subcategories = category.subcategories.filter(
        sub => sub._id.toString() !== subId
    );
    await category.save();

    res.json({
        success: true,
        message: 'Subcategory removed successfully',
        data: category
    });
});
