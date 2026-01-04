import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, ShoppingBag } from 'lucide-react';
import { ordersAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await ordersAPI.getMyOrders();
            setOrders(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-500 bg-yellow-500/10';
            case 'processing': return 'text-blue-500 bg-blue-500/10';
            case 'shipped': return 'text-purple-500 bg-purple-500/10';
            case 'delivered': return 'text-green-500 bg-green-500/10';
            case 'cancelled': return 'text-red-500 bg-red-500/10';
            default: return 'text-muted-foreground bg-muted';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return Clock;
            case 'processing': return Package;
            case 'shipped': return Truck;
            case 'delivered': return CheckCircle;
            default: return ShoppingBag;
        }
    };

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="container mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold mb-2">My Orders</h1>
                    <p className="text-muted-foreground">Track and manage your recent orders</p>
                </motion.div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-40 rounded-xl bg-muted/50 animate-pulse" />
                        ))}
                    </div>
                ) : orders.length > 0 ? (
                    <div className="space-y-6">
                        {orders.map((order, idx) => {
                            const StatusIcon = getStatusIcon(order.status);
                            return (
                                <motion.div
                                    key={order._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass-card p-6 rounded-xl neon-border hover:bg-accent/5 transition-colors"
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Placed on {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                                            <p className="text-xl font-bold text-primary">Rs. {order.totalAmount}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                                        {item.product?.images?.[0] ? (
                                                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package className="w-6 h-6 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{item.product?.name || 'Product Removed'}</p>
                                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <p className="font-medium">Rs. {item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                        <p className="text-muted-foreground mb-6">Start shopping to see your orders here.</p>
                        <Link to="/medicines">
                            <Button variant="glow">Start Shopping</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
