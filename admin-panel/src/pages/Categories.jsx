import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FolderTree, X, Upload, Loader2, Search, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { categoriesAPI } from '@/lib/api';
import { useNotification } from '../context/NotificationContext';

const Categories = () => {
    const { notify } = useNotification();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'medicine',
        description: '',
        image: null,
        subcategories: []
    });
    const [subcategoryInput, setSubcategoryInput] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [suggestedSubcategories, setSuggestedSubcategories] = useState([]);

    useEffect(() => {
        // Extract unique subcategories from existing categories of the selected type
        if (categories.length > 0) {
            const typeCategories = categories.filter(c => c.type === formData.type);
            const subs = new Set();
            typeCategories.forEach(c => {
                c.subcategories?.forEach(s => subs.add(typeof s === 'string' ? s : s.name));
            });
            // Always add common defaults for Medicine
            if (formData.type === 'medicine') {
                ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Surgical', 'Devices', 'Hygine'].forEach(s => subs.add(s));
            } else if (formData.type === 'general') {
                ['Personal Care', 'Baby Care', 'Skin Care', 'Snacks', 'Beverages', 'Household'].forEach(s => subs.add(s));
            }
            // Filter out already added ones
            const currentSubs = new Set(formData.subcategories.map(s => typeof s === 'string' ? s : s.name));
            setSuggestedSubcategories([...subs].filter(s => !currentSubs.has(s)).sort());
        } else {
            // If no existing categories, still show defaults
            const subs = new Set();
            if (formData.type === 'medicine') {
                ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Surgical', 'Devices', 'Hygine'].forEach(s => subs.add(s));
            } else if (formData.type === 'general') {
                ['Personal Care', 'Baby Care', 'Skin Care', 'Snacks', 'Beverages', 'Household'].forEach(s => subs.add(s));
            }
            const currentSubs = new Set(formData.subcategories.map(s => typeof s === 'string' ? s : s.name));
            setSuggestedSubcategories([...subs].filter(s => !currentSubs.has(s)).sort());
        }
    }, [formData.type, categories, formData.subcategories]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (editingCategory) {
            setFormData({
                name: editingCategory.name,
                type: editingCategory.type,
                description: editingCategory.description || '',
                image: null, // Only for new uploads
                subcategories: editingCategory.subcategories || []
            });
            setImagePreview(editingCategory.image);
        } else {
            resetForm();
        }
    }, [editingCategory]);

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'medicine',
            description: '',
            image: null,
            subcategories: []
        });
        setSubcategoryInput('');
        setImagePreview(null);
    };

    const fetchCategories = async () => {
        try {
            const res = await categoriesAPI.getAll({ status: 'active' });
            setCategories(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch:', error);
            notify.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (cat) => {
        setCategoryToDelete(cat);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;
        setSubmitLoading(true);
        try {
            await categoriesAPI.delete(categoryToDelete._id);
            await fetchCategories();
            notify.success('Category deleted successfully');
            setShowDeleteModal(false);
            setCategoryToDelete(null);
        } catch (error) {
            console.error('Delete failed:', error);
            const message = error.response?.data?.message || 'Failed to delete category';
            notify.error(message);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };



    const handleAddSubcategory = (e, value) => {
        if (e) e.preventDefault();
        const valToAdd = value || subcategoryInput.trim();

        if (valToAdd) {
            if (!formData.subcategories.some(sub => (typeof sub === 'string' ? sub : sub.name) === valToAdd)) {
                setFormData(prev => ({
                    ...prev,
                    subcategories: [...prev.subcategories, valToAdd]
                }));
            }
            if (!value) setSubcategoryInput('');
        }
    };

    const handleRemoveSubcategory = (index) => {
        const newSubs = [...formData.subcategories];
        newSubs.splice(index, 1);
        setFormData({ ...formData, subcategories: newSubs });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('type', formData.type);
            data.append('description', formData.description);
            // Send subcategories as JSON string
            data.append('subcategories', JSON.stringify(formData.subcategories));

            if (formData.image) {
                data.append('image', formData.image);
            }

            if (editingCategory) {
                await categoriesAPI.update(editingCategory._id, data);
                notify.success('Category updated successfully');
            } else {
                await categoriesAPI.create(data);
                notify.success('Category created successfully');
            }

            setShowModal(false);
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            console.error('Failed to save category:', error);
            notify.error(error.response?.data?.message || 'Failed to save category');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <p className="text-muted-foreground">Manage product categories</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchCategories()}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-white/5 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => { setEditingCategory(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-silver text-black font-medium hover:shadow-lg transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add Category
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <p className="col-span-full text-center py-8 text-muted-foreground">Loading...</p>
                ) : categories.length === 0 ? (
                    <p className="col-span-full text-center py-8 text-muted-foreground">No categories found</p>
                ) : (
                    categories.map((cat) => (
                        <div key={cat._id} className="glass-card rounded-xl p-5 neon-border group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 rounded-lg bg-neon-silver/10 overflow-hidden flex items-center justify-center border border-transparent group-hover:border-neon-silver/30 transition-all">
                                    {cat.image ? (
                                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <FolderTree className="w-6 h-6 text-neon-silver" />
                                    )}
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs ${cat.type === 'medicine' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                                    }`}>
                                    {cat.type}
                                </span>
                            </div>
                            <h3 className="font-semibold mb-1">{cat.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{cat.description || 'No description'}</p>
                            <p className="text-xs text-muted-foreground mb-4">
                                {cat.subcategories?.length || 0} subcategories • {cat.productCount || 0} products
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setEditingCategory(cat); setShowModal(true); }}
                                    className="flex-1 py-2 rounded-lg border border-border hover:bg-white/5 text-sm flex items-center justify-center gap-1 transition-colors"
                                >
                                    <Edit className="w-3 h-3" /> Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(cat)}
                                    className="py-2 px-3 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Category Form Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-background rounded-xl w-full max-w-lg overflow-hidden border border-border shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20">
                                <h2 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Category Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full h-10 px-4 rounded-lg bg-muted/50 border border-border focus:border-neon-silver focus:outline-none"
                                            placeholder="e.g. Antibiotics"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full h-10 px-4 rounded-lg bg-muted/50 border border-border focus:border-neon-silver focus:outline-none text-foreground"
                                        >
                                            <option value="medicine">Medicine</option>
                                            <option value="general">General Item</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            rows="3"
                                            className="w-full p-4 rounded-lg bg-muted/50 border border-border focus:border-neon-silver focus:outline-none resize-none"
                                            placeholder="Category description..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Subcategories</label>
                                        <div className="flex gap-2">
                                            {/* Manual input removed as per request */}
                                        </div>

                                        {/* Selected Subcategories */}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.subcategories.map((sub, index) => (
                                                <span key={index} className="px-3 py-1 rounded-full bg-neon-silver/10 text-xs flex items-center gap-2 border border-neon-silver/20 animate-in zoom-in duration-200">
                                                    {typeof sub === 'string' ? sub : sub.name}
                                                    <button type="button" onClick={() => handleRemoveSubcategory(index)} className="hover:text-red-400">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>

                                        {/* Suggested Subcategories */}
                                        {suggestedSubcategories.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-xs text-muted-foreground mb-2">Suggestions (click to add):</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {suggestedSubcategories.slice(0, 10).map((sub, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => handleAddSubcategory(null, sub)}
                                                            className="px-2 py-1 rounded-md bg-muted border border-border text-xs hover:bg-neon-silver/20 hover:border-neon-silver/50 transition-colors"
                                                        >
                                                            + {sub}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Category Image</label>
                                        <div className="flex items-start gap-4">
                                            <div className="border-2 border-dashed border-border rounded-xl p-4 flex-1 text-center hover:border-neon-silver/50 transition-colors cursor-pointer relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                                <div className="flex flex-col items-center gap-2 py-2">
                                                    <Upload className="w-6 h-6 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground">Click to upload</span>
                                                </div>
                                            </div>
                                            {imagePreview && (
                                                <div className="w-20 h-20 rounded-lg overflow-hidden border border-border bg-muted">
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitLoading}
                                        className="px-4 py-2 rounded-lg bg-neon-silver text-black font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
                                    >
                                        {submitLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                        {editingCategory ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.2 } }}
                            className="bg-background rounded-xl w-full max-w-md overflow-hidden border border-border shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 text-center space-y-4">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 className="w-8 h-8 text-red-500" />
                                </div>
                                <h2 className="text-xl font-bold">Delete Category?</h2>
                                <p className="text-muted-foreground">
                                    Are you sure you want to delete <span className="text-foreground font-semibold">"{categoryToDelete?.name}"</span>?
                                    This action cannot be undone and will fail if products are still assigned to this category.
                                </p>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmDelete}
                                        disabled={submitLoading}
                                        className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Categories;
