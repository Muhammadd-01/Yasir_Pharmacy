import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ordersAPI, usersAPI, productsAPI } from '@/lib/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0, pendingOrders: 0, todayOrders: 0,
        monthlyOrders: 0, totalRevenue: 0, monthlyRevenue: 0
    });
    const [userStats, setUserStats] = useState({ totalUsers: 0, newUsersMonth: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [orderRes, userRes] = await Promise.all([
                ordersAPI.getStats(),
                usersAPI.getStats()
            ]);
            setStats(orderRes.data.data);
            setUserStats(userRes.data.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Revenue', value: `Rs. ${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'from-green-500/20' },
        { label: 'Total Orders', value: stats.totalOrders || 0, icon: ShoppingCart, color: 'from-blue-500/20' },
        { label: 'Pending Orders', value: stats.pendingOrders || 0, icon: Clock, color: 'from-amber-500/20' },
        { label: 'Total Users', value: userStats.totalUsers || 0, icon: Users, color: 'from-purple-500/20' },
    ];

    // Mock chart data
    const chartData = [
        { name: 'Jan', orders: 45, revenue: 24000 },
        { name: 'Feb', orders: 52, revenue: 28000 },
        { name: 'Mar', orders: 61, revenue: 35000 },
        { name: 'Apr', orders: 58, revenue: 32000 },
        { name: 'May', orders: 72, revenue: 42000 },
        { name: 'Jun', orders: 85, revenue: 51000 },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back to Yasir Pharmacy Admin</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`glass-card rounded-xl p-5 bg-gradient-to-br ${stat.color} to-transparent neon-border`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <stat.icon className="w-8 h-8 text-neon-silver" />
                            <TrendingUp className="w-4 h-4 text-green-400" />
                        </div>
                        <p className="text-2xl font-bold">{loading ? '...' : stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-xl p-6 neon-border">
                    <h3 className="font-semibold mb-4">Revenue Overview</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#C0C0C0" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#C0C0C0" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="name" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip
                                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#C0C0C0" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-6 neon-border">
                    <h3 className="font-semibold mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                            <span className="text-muted-foreground">Orders Today</span>
                            <span className="font-bold">{stats.todayOrders || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                            <span className="text-muted-foreground">Orders This Month</span>
                            <span className="font-bold">{stats.monthlyOrders || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                            <span className="text-muted-foreground">Revenue This Month</span>
                            <span className="font-bold text-green-400">Rs. {(stats.monthlyRevenue || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                            <span className="text-muted-foreground">New Users This Month</span>
                            <span className="font-bold">{userStats.newUsersMonth || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
