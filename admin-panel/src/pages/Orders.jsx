import { useState, useEffect } from 'react';
import { Search, Eye, Package, RefreshCw } from 'lucide-react';
import { ordersAPI } from '@/lib/api';
import { useNotification } from '../context/NotificationContext';

const Orders = () => {
    const { notify } = useNotification();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        try {
            const res = await ordersAPI.getAll({ status: statusFilter });
            setOrders(res.data.data.orders || []);
        } catch (error) {
            console.error('Failed to fetch:', error);
            notify.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await ordersAPI.updateStatus(id, status);
            fetchOrders();
            notify.success(`Order status updated to ${status}`);
        } catch (error) {
            console.error('Failed to update:', error);
            notify.error(error.response?.data?.message || 'Failed to update order status');
        }
    };

    const statusColors = {
        pending: 'bg-yellow-500/20 text-yellow-400',
        confirmed: 'bg-blue-500/20 text-blue-400',
        processing: 'bg-purple-500/20 text-purple-400',
        shipped: 'bg-indigo-500/20 text-indigo-400',
        delivered: 'bg-green-500/20 text-green-400',
        cancelled: 'bg-red-500/20 text-red-400',
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold">Orders</h1>
                    <button
                        onClick={() => fetchOrders()}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-white/5 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-muted-foreground">Manage customer orders</p>
            </div>

            <div className="flex gap-4">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-10 px-4 rounded-lg bg-background/50 border border-border focus:outline-none"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <div className="glass-card rounded-xl overflow-hidden neon-border">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-medium">Order</th>
                                <th className="text-left px-4 py-3 text-sm font-medium">Customer</th>
                                <th className="text-left px-4 py-3 text-sm font-medium">Items</th>
                                <th className="text-left px-4 py-3 text-sm font-medium">Total</th>
                                <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                                <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">No orders found</td></tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-white/5">
                                        <td className="px-4 py-3">
                                            <p className="font-mono text-sm">{order.orderNumber}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm">{order.shippingAddress?.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{order.shippingAddress?.phone}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <Package className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm">{order.items?.length || 0} items</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium">Rs. {order.totalAmount?.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order._id, e.target.value)}
                                                className={`px-2 py-1 rounded-lg text-xs border-0 focus:outline-none ${statusColors[order.status] || ''}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button className="p-2 rounded-lg hover:bg-white/5">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Orders;
