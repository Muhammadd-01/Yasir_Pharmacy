import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Package, X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { useNotification } from '../context/NotificationContext';

const Products = () => {
    const { notify } = useNotification();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('active');

    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        type: 'medicine',
        isActive: true,
        images: []
    });
    const [imagePreview, setImagePreview] = useState([]);

    useEffect(() => {
        fetchData();
    }, [search, typeFilter, statusFilter]);

    // ...

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                productsAPI.getAll({ search, type: typeFilter, status: statusFilter }),
                categoriesAPI.getAll()
            ]);
            setProducts(productsRes.data.data.products || []);
            setCategories(categoriesRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch:', error);
            notify('error', 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            await productsAPI.toggle(id);
            fetchData();
            notify('success', 'Product status updated successfully');
        } catch (error) {
            console.error('Failed to toggle:', error);
            notify('error', 'Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await productsAPI.delete(id);
            fetchData();
            notify('success', 'Product deleted successfully');
        } catch (error) {
            console.error('Failed to delete:', error);
            notify('error', 'Failed to delete product');
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({ ...prev, images: files }));

        // Crate previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreview(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('stock', formData.stock);
            data.append('category', formData.category);
            data.append('type', formData.type);
            data.append('isActive', formData.isActive);

            // Append images
            formData.images.forEach(image => {
                data.append('images', image);
            });

            if (editingProduct) {
                await productsAPI.update(editingProduct._id, data);
            } else {
                await productsAPI.create(data);
            }

            setShowModal(false);
            setEditingProduct(null);
            fetchData();
        } catch (error) {
            console.error('Failed to save product:', error);
            alert(error.response?.data?.message || 'Failed to save product');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Products</h1>
                    <p className="text-muted-foreground">Manage your product inventory</p>
                </div>
                <button
                    onClick={() => { setEditingProduct(null); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-silver text-black font-medium hover:shadow-lg transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full h-10 pl-9 pr-4 rounded-lg bg-background/50 border border-border focus:border-neon-silver/50 focus:outline-none transition-all"
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="h-10 px-4 rounded-lg bg-background/50 border border-border focus:outline-none text-foreground"
                >
                    <option value="">All Types</option>
                    <option value="medicine">Medicine</option>
                    <option value="general">General</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-10 px-4 rounded-lg bg-background/50 border border-border focus:outline-none text-foreground"
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="">All Status</option>
                </select>
            </div>

            {/* Products Table */}
            <div className="glass-card rounded-xl overflow-hidden neon-border">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-medium">Product</th>
                                <th className="text-left px-4 py-3 text-sm font-medium">Type</th>
                                <th className="text-left px-4 py-3 text-sm font-medium">Price</th>
                                <th className="text-left px-4 py-3 text-sm font-medium">Stock</th>
                                <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                                <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">No products found</td></tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden flex items-center justify-center border border-border">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-5 h-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{product.name}</p>
                                                    <p className="text-xs text-muted-foreground">{product.category?.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${product.type === 'medicine' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                                                }`}>
                                                {product.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium">Rs. {product.price?.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={product.stock <= 10 ? 'text-red-400 font-medium' : ''}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${product.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggle(product._id)}
                                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                                    title={product.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {product.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => { setEditingProduct(product); setShowModal(true); }}
                                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors text-blue-400"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div
                        className="bg-background rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border shadow-2xl animate-in fade-in zoom-in duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-background/95 backdrop-blur z-10 px-6 py-4 border-b border-border flex justify-between items-center">
                            <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Product Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full h-10 px-4 rounded-lg bg-muted/50 border border-border focus:border-neon-silver focus:outline-none"
                                        placeholder="e.g. Panadol Extra"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full h-10 px-4 rounded-lg bg-muted/50 border border-border focus:border-neon-silver focus:outline-none text-foreground"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
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
                                    <label className="text-sm font-medium">Price (Rs.)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full h-10 px-4 rounded-lg bg-muted/50 border border-border focus:border-neon-silver focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Stock Quantity</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full h-10 px-4 rounded-lg bg-muted/50 border border-border focus:border-neon-silver focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-2 flex items-center pt-8">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-5 h-5 rounded border-border text-neon-silver focus:ring-neon-silver"
                                        />
                                        <span className="font-medium">Active Status</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows="4"
                                    className="w-full p-4 rounded-lg bg-muted/50 border border-border focus:border-neon-silver focus:outline-none resize-none"
                                    placeholder="Product description..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Product Images</label>
                                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-neon-silver/50 transition-colors">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                        <Upload className="w-8 h-8 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground font-medium">Click to upload images</span>
                                    </label>
                                </div>
                                {imagePreview.length > 0 && (
                                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                        {imagePreview.map((src, idx) => (
                                            <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-border">
                                                <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className="px-6 py-2.5 rounded-lg bg-neon-silver text-black font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                                >
                                    {submitLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingProduct ? 'Update Product' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
