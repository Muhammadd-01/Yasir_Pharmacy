import { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { cartsAPI } from '@/lib/api';
import { useNotification } from '../context/NotificationContext';
import { getImageUrl } from '@/lib/utils'; // Assuming you added this to utils

const Carts = () => {
    const { notify } = useNotification();
    const [carts, setCarts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCart, setExpandedCart] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchCarts();
    }, []);

    const fetchCarts = async () => {
        try {
            const res = await cartsAPI.getAll();
            setCarts(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch carts:', error);
            notify.error('Failed to fetch carts');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (cartId) => {
        if (expandedCart === cartId) {
            setExpandedCart(null);
        } else {
            setExpandedCart(cartId);
        }
    };

    const filteredCarts = carts.filter(cart =>
        cart.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        cart.user?.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Active Carts</h1>
                    <p className="text-muted-foreground">View what users are planning to buy</p>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by user name or email..."
                    className="w-full max-w-sm h-10 pl-9 pr-4 rounded-lg bg-background/50 border border-border focus:border-neon-silver/50 focus:outline-none"
                />
            </div>

            <div className="space-y-4">
                {loading ? (
                    <p className="text-center py-8 text-muted-foreground">Loading carts...</p>
                ) : filteredCarts.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No active carts found</p>
                ) : (
                    filteredCarts.map((cart) => (
                        <div key={cart._id} className="glass-card rounded-xl overflow-hidden neon-border">
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                onClick={() => toggleExpand(cart._id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-neon-silver/10 flex items-center justify-center text-neon-silver">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{cart.user?.name || 'Unknown User'}</h3>
                                        <p className="text-sm text-muted-foreground">{cart.user?.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="font-medium text-sm">{cart.totalItems} Items</p>
                                        <p className="text-sm text-muted-foreground">Rs. {cart.totalAmount?.toLocaleString()}</p>
                                    </div>
                                    <button className="p-2 hover:bg-white/10 rounded-full">
                                        {expandedCart === cart._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {expandedCart === cart._id && (
                                <div className="border-t border-border bg-black/20 p-4">
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4" /> Cart Items
                                    </h4>
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {cart.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 bg-background/50 p-3 rounded-lg border border-border">
                                                <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                                                    {item.product?.images?.[0] ? (
                                                        <img
                                                            src={getImageUrl(item.product.images[0]?.url || item.product.images[0])}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Package className="w-6 h-6 m-auto text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm truncate">{item.product?.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.quantity} x Rs. {item.price?.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Carts;
