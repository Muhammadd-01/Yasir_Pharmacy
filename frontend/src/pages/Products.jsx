import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Search, Grid, List, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/ProductCard';
import { productsAPI, categoriesAPI } from '@/lib/api';

const Products = ({ type = 'medicine' }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Filter states from URL
    const currentCategory = searchParams.get('category') || '';
    const currentSearch = searchParams.get('search') || '';
    const currentSort = searchParams.get('sort') || '-createdAt';
    const currentPage = parseInt(searchParams.get('page')) || 1;

    useEffect(() => {
        fetchProducts();
    }, [searchParams, type]);

    useEffect(() => {
        fetchCategories();
    }, [type]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {
                type,
                page: currentPage,
                limit: 12,
                sort: currentSort,
                ...(currentCategory && { category: currentCategory }),
                ...(currentSearch && { search: currentSearch }),
            };

            const response = await productsAPI.getAll(params);
            setProducts(response.data.data.products || []);
            setPagination(response.data.data.pagination || { page: 1, pages: 1, total: 0 });
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getByType(type);
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        if (key !== 'page') {
            newParams.set('page', '1');
        }
        setSearchParams(newParams);
    };

    const clearFilters = () => {
        setSearchParams({});
    };

    const sortOptions = [
        { value: '-createdAt', label: 'Newest First' },
        { value: 'createdAt', label: 'Oldest First' },
        { value: 'price', label: 'Price: Low to High' },
        { value: '-price', label: 'Price: High to Low' },
        { value: 'name', label: 'Name: A to Z' },
        { value: '-name', label: 'Name: Z to A' },
    ];

    const title = type === 'medicine' ? 'Medicines' : 'General Items';
    const description = type === 'medicine'
        ? 'Browse our complete range of quality medicines and healthcare products'
        : 'Explore daily essentials and general store products';

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <section className="relative py-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-background" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(192,192,192,0.1)_0%,transparent_50%)]" />

                <div className="container mx-auto px-4 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="chrome-text">{title}</span>
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            {description}
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar - Desktop */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-24 glass-card rounded-xl p-6 neon-border">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Filters
                            </h3>

                            {/* Search */}
                            <div className="mb-6">
                                <label className="text-sm text-muted-foreground mb-2 block">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search products..."
                                        value={currentSearch}
                                        onChange={(e) => updateFilter('search', e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="mb-6">
                                <label className="text-sm text-muted-foreground mb-2 block">Category</label>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => updateFilter('category', '')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!currentCategory ? 'bg-neon-silver/20 text-white' : 'hover:bg-white/5'
                                            }`}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat._id}
                                            onClick={() => updateFilter('category', cat._id)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentCategory === cat._id ? 'bg-neon-silver/20 text-white' : 'hover:bg-white/5'
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort */}
                            <div className="mb-6">
                                <label className="text-sm text-muted-foreground mb-2 block">Sort By</label>
                                <select
                                    value={currentSort}
                                    onChange={(e) => updateFilter('sort', e.target.value)}
                                    className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neon-silver/50"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear Filters */}
                            {(currentCategory || currentSearch) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="w-full"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </aside>

                    {/* Mobile Filters Button */}
                    <div className="lg:hidden flex items-center gap-3 mb-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(true)}
                            className="flex-1"
                        >
                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="icon"
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="icon"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <main className="flex-1">
                        {/* Results Count */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-sm text-muted-foreground">
                                Showing {products.length} of {pagination.total} products
                            </p>
                            <div className="hidden lg:flex gap-2">
                                <Button
                                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Products */}
                        <div className={`grid gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                                : 'grid-cols-1'
                            }`}>
                            {loading ? (
                                Array.from({ length: 12 }).map((_, i) => (
                                    <ProductCardSkeleton key={i} />
                                ))
                            ) : products.length > 0 ? (
                                products.map((product, idx) => (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center">
                                    <p className="text-muted-foreground mb-4">No products found</p>
                                    <Button variant="outline" onClick={clearFilters}>
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 mt-12">
                                <Button
                                    variant="outline"
                                    disabled={currentPage <= 1}
                                    onClick={() => updateFilter('page', currentPage - 1)}
                                >
                                    Previous
                                </Button>
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: Math.min(5, pagination.pages) }).map((_, i) => {
                                        const page = i + 1;
                                        return (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? 'glow' : 'ghost'}
                                                size="icon"
                                                onClick={() => updateFilter('page', page)}
                                            >
                                                {page}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    disabled={currentPage >= pagination.pages}
                                    onClick={() => updateFilter('page', currentPage + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filters Modal */}
            {showFilters && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-50 bg-black/80 lg:hidden"
                    onClick={() => setShowFilters(false)}
                >
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        className="absolute left-0 top-0 bottom-0 w-80 bg-background p-6 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold">Filters</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Same filter content as sidebar */}
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Search</label>
                                <Input
                                    placeholder="Search products..."
                                    value={currentSearch}
                                    onChange={(e) => updateFilter('search', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Category</label>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => { updateFilter('category', ''); setShowFilters(false); }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${!currentCategory ? 'bg-neon-silver/20' : 'hover:bg-white/5'
                                            }`}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat._id}
                                            onClick={() => { updateFilter('category', cat._id); setShowFilters(false); }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${currentCategory === cat._id ? 'bg-neon-silver/20' : 'hover:bg-white/5'
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Sort By</label>
                                <select
                                    value={currentSort}
                                    onChange={(e) => { updateFilter('sort', e.target.value); setShowFilters(false); }}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default Products;
