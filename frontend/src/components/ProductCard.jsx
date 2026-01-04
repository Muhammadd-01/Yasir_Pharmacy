import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, useAuth, useNotification } from '@/context';

const ProductCard = ({ product }) => {
    const { addToCart, loading } = useCart();
    const { isAuthenticated } = useAuth();
    const { notify } = useNotification();

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            notify.auth('Please register or login to add items to your cart');
            return;
        }

        const result = await addToCart(product._id);
        if (result.success) {
            notify.success(`${product.name} added to cart`);
        } else {
            notify.error(result.error || 'Failed to add to cart');
        }
    };

    const primaryImage = product.images?.[0]?.url || '/placeholder-product.jpg';
    const hasDiscount = product.comparePrice && product.comparePrice > product.price;
    const discountPercent = hasDiscount
        ? Math.round((1 - product.price / product.comparePrice) * 100)
        : 0;

    return (
        <motion.div
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <Link
                to={`/${product.type === 'medicine' ? 'medicines' : 'general-items'}/${product.slug}`}
                className="block group"
            >
                <div className="glass-card rounded-xl overflow-hidden">
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800">
                        <img
                            src={primaryImage}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {hasDiscount && (
                                <span className="px-2 py-1 text-xs font-bold rounded-md bg-red-500 text-white">
                                    -{discountPercent}%
                                </span>
                            )}
                            {product.isFeatured && (
                                <span className="px-2 py-1 text-xs font-semibold rounded-md bg-neon-silver/90 text-black">
                                    Featured
                                </span>
                            )}
                            {product.stock === 0 && (
                                <span className="px-2 py-1 text-xs font-semibold rounded-md bg-zinc-700 text-white">
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        {/* Quick Add Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            className="absolute bottom-3 right-3"
                        >
                            <Button
                                size="icon"
                                variant="glow"
                                onClick={handleAddToCart}
                                disabled={loading || product.stock === 0}
                                className="w-10 h-10 rounded-full shadow-lg"
                            >
                                <Plus className="w-5 h-5" />
                            </Button>
                        </motion.div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {/* Category */}
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                            {product.type === 'medicine' ? 'Medicine' : 'General'}
                        </p>

                        {/* Title */}
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-neon-silver transition-colors">
                            {product.name}
                        </h3>

                        {/* Rating */}
                        {product.ratings?.average > 0 && (
                            <div className="flex items-center gap-1 mb-2">
                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-muted-foreground">
                                    {product.ratings.average.toFixed(1)} ({product.ratings.count})
                                </span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-neon-silver">
                                    Rs. {product.price.toLocaleString()}
                                </span>
                                {hasDiscount && (
                                    <span className="text-sm text-muted-foreground line-through">
                                        Rs. {product.comparePrice.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                            variant="premium"
                            size="sm"
                            className="w-full mt-3"
                            onClick={handleAddToCart}
                            disabled={loading || product.stock === 0}
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
