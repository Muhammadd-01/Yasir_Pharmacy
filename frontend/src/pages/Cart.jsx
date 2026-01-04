import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, useAuth, useNotification } from '@/context';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, loading } = useCart();
    const { isAuthenticated } = useAuth();
    const { notify } = useNotification();

    const handleUpdateQuantity = async (productId, newQuantity) => {
        const result = await updateQuantity(productId, newQuantity);
        if (!result.success) {
            notify.error(result.error);
        }
    };

    const handleRemove = async (productId, productName) => {
        const result = await removeFromCart(productId);
        if (result.success) {
            notify.success(`${productName} removed from cart`);
        } else {
            notify.error(result.error);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
                    <h1 className="text-2xl font-bold mb-2">Please Login First</h1>
                    <p className="text-muted-foreground mb-6">Login to view and manage your cart</p>
                    <Link to="/login">
                        <Button variant="glow" size="lg">
                            Login to Continue
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (cart.items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <ShoppingCart className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
                    <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
                    <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet</p>
                    <Link to="/medicines">
                        <Button variant="glow" size="lg">
                            Start Shopping
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            <div className="container mx-auto px-4 py-8">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold mb-8"
                >
                    Shopping <span className="chrome-text">Cart</span>
                </motion.h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.items.map((item, idx) => (
                            <motion.div
                                key={item.product?._id || idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card rounded-xl p-4 flex gap-4"
                            >
                                {/* Image */}
                                <div className="w-24 h-24 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                                    <img
                                        src={item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
                                        alt={item.product?.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate">{item.product?.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Rs. {item.price?.toLocaleString()} each
                                    </p>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="flex items-center bg-background/50 rounded-lg border border-border">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                                                disabled={item.quantity <= 1 || loading}
                                                className="p-2 hover:bg-white/5 transition-colors disabled:opacity-50"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-10 text-center text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                                                disabled={item.quantity >= (item.product?.stock || 10) || loading}
                                                className="p-2 hover:bg-white/5 transition-colors disabled:opacity-50"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleRemove(item.product._id, item.product.name)}
                                            disabled={loading}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Item Total */}
                                <div className="text-right">
                                    <p className="font-bold text-neon-silver">
                                        Rs. {(item.price * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-card rounded-xl p-6 neon-border sticky top-24"
                        >
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal ({cart.totalItems} items)</span>
                                    <span>Rs. {cart.totalAmount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className={cart.totalAmount >= 5000 ? 'text-green-400' : ''}>
                                        {cart.totalAmount >= 5000 ? 'FREE' : 'Rs. 250'}
                                    </span>
                                </div>
                                {cart.totalAmount < 5000 && (
                                    <p className="text-xs text-muted-foreground">
                                        Add Rs. {(5000 - cart.totalAmount).toLocaleString()} more for free shipping!
                                    </p>
                                )}
                            </div>

                            <div className="section-divider mb-6" />

                            <div className="flex justify-between text-lg font-bold mb-6">
                                <span>Total</span>
                                <span className="chrome-text">
                                    Rs. {(cart.totalAmount + (cart.totalAmount >= 5000 ? 0 : 250)).toLocaleString()}
                                </span>
                            </div>

                            <Link to="/checkout">
                                <Button variant="glow" size="lg" className="w-full">
                                    Proceed to Checkout
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>

                            <Link to="/medicines" className="block mt-4">
                                <Button variant="outline" className="w-full">
                                    Continue Shopping
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
