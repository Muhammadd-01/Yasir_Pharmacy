import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { wishlistAPI, cartAPI } from '@/lib/api';
import { useAuth, useNotification } from '@/context';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/utils';

const Wishlist = () => {
    const { isAuthenticated } = useAuth();
    const { notify } = useNotification();
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        }
    }, [isAuthenticated]);

    const fetchWishlist = async () => {
        try {
            const res = await wishlistAPI.get();
            setWishlist(res.data.data);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            await wishlistAPI.remove(productId);
            fetchWishlist();
            notify.success('Removed from wishlist');
        } catch (error) {
            notify.error('Failed to remove from wishlist');
        }
    };

    const handleMoveToCart = async (product) => {
        try {
            await cartAPI.add({ productId: product._id, quantity: 1 });
            await wishlistAPI.remove(product._id);
            fetchWishlist();
            notify.success('Moved to cart');
        } catch (error) {
            notify.error('Failed to move to cart');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Heart className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
                    <h1 className="text-2xl font-bold mb-2">Please Login First</h1>
                    <p className="text-muted-foreground mb-6">Login to view your wishlist</p>
                    <Link to="/login">
                        <Button variant="glow" size="lg">Login to Continue</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading wishlist...</p>
                </div>
            </div>
        );
    }

    if (!wishlist || wishlist.products.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <Heart className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
                    <h1 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h1>
                    <p className="text-muted-foreground mb-6">Add products you love to your wishlist</p>
                    <Link to="/medicines">
                        <Button variant="glow" size="lg">Start Shopping</Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="container mx-auto max-w-6xl">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold mb-8"
                >
                    My <span className="chrome-text">Wishlist</span>
                </motion.h1>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.products.map((item, idx) => (
                        <motion.div
                            key={item.product._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card rounded-xl p-4 neon-border"
                        >
                            <Link to={`/${item.product.type === 'medicine' ? 'medicines' : 'general-items'}/${item.product.slug}`}>
                                <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
                                    {item.product.images?.[0] && (
                                        <img
                                            src={getImageUrl(item.product.images[0].url || item.product.images[0])}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                        />
                                    )}
                                </div>
                            </Link>

                            <h3 className="font-semibold mb-2 truncate">{item.product.name}</h3>
                            <p className="text-lg font-bold text-primary mb-4">
                                Rs. {item.product.price?.toLocaleString()}
                            </p>

                            {item.product.stock > 0 ? (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleMoveToCart(item.product)}
                                        variant="glow"
                                        size="sm"
                                        className="flex-1"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Add to Cart
                                    </Button>
                                    <Button
                                        onClick={() => handleRemove(item.product._id)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" disabled className="flex-1">
                                        <Package className="w-4 h-4 mr-2" />
                                        Out of Stock
                                    </Button>
                                    <Button
                                        onClick={() => handleRemove(item.product._id)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
